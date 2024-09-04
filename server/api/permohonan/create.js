// File: server/api/permohonan/index.post.js

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  // Step 1: Validation for required fields
  if (
    !body.namaPemohon ||
    !body.tarikhTemujanji ||
    !body.noLaporanPolis ||
    !body.slotMasa ||
    !body.barangList.length
  ) {
    return {
      statusCode: 400,
      message:
        "Setiap medan mandatori yang bertanda * telah diisi. (Ralat CMN-E001)",
    };
  }

  // Step 2: Validate appointment date must be in the future
  const currentDate = new Date();
  const appointmentDate = new Date(body.tarikhTemujanji);
  if (appointmentDate <= currentDate) {
    return {
      statusCode: 400,
      message:
        "Perlu memastikan tarikh janji temu yang dimasukkan adalah tarikh selepas tarikh semasa. (Ralat CMN-E002)",
    };
  }

  // Step 3: Generate Case ID
  const caseID = generateCaseID();

  // Step 4: Determine status (Draft or Submitted)
  const status = body.isDraft ? "Permohonan Draf" : "Permohonan Dihantar";

  try {
    // Step 5: Insert data into the permohonan table
    const newPermohonan = await prisma.permohonan.create({
      data: {
        no_siri: caseID,
        pemohonID: body.pemohonID,
        penghantarID: body.penghantarID || null, // If same as pemohon, this can be null
        penghantar_sama_dengan_pemohon: body.penghantarSamaDenganPemohon
          ? 1
          : 0,
        status_permohonan: status, // Draf or Dihantar
        ringkasan_kenyataan_kes: body.ringkasanKenyataanKes,
        bilangan: body.bilangan?.toString(),
        no_laporan_polis: body.noLaporanPolis,
        tarikh_temujanji: new Date(body.tarikhTemujanji),
        create_at: currentDate,
      },
    });

    // Step 6: Insert `barang` details into the `permohonan_jenis_barang` table
    const barangList = body.barangList.map((barang) => ({
      permohonanID: newPermohonan.id, // Foreign key to permohonan
      jenis_barang: barang.jenisBarang, // Foreign key to lookup(jenis_barang)
      barang_status: "ACTIVE", // Static value for now
    }));
    await prisma.permohonan_jenis_barang.createMany({ data: barangList });

    // Step 7: Insert data into the `report` table
    const newReport = await prisma.report.create({
      data: {
        permohonanID: newPermohonan.id,
        jenis_barang: body.barangList[0].jenisBarang, // The first barang's jenis_barang
        peralatan: body.peralatan || null, // Optional, based on frontend input
        langkah_langkah: body.langkahLangkah || null, // Optional, based on frontend input
        gambarID: body.gambarID || null, // Optional document ID, if any
        ulasan: body.ulasan || null, // Optional notes
        dapatan: body.dapatan || null, // Optional foreign key lookup(dapatan)
        create_at: currentDate,
        create_by: body.userID, // The user who created the report
      },
    });

    // Step 8: Send confirmation email (pseudocode)
    sendEmail({
      case_id: caseID,
      selected_appointment_date: body.tarikhTemujanji,
      time_slot: body.slotMasa,
      barang_list: body.barangList
        .map((barang) => barang.jenisBarang)
        .join(", "),
    });

    // Step 9: Return response depending on the action (draft or submit)
    if (body.isDraft) {
      return {
        statusCode: 200,
        message: "Rekod telah berjaya disimpan. (Status CMN-S001)",
        data: { newPermohonan, newReport },
      };
    } else {
      return {
        statusCode: 200,
        message:
          "Permohonan pemeriksaan forensik telah dihantar. (Status FOR-S001)",
        data: { newPermohonan, newReport },
      };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Failed to create permohonan and report. Please try again.",
    };
  }
});

// Helper function to generate unique case ID
function generateCaseID() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const uniqueSerialNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${year}${month}${day}-${uniqueSerialNumber}`;
}

// Pseudocode function for sending email
function sendEmail(data) {
  // Email logic goes here
  console.log("Email sent with the following data: ", data);
}
