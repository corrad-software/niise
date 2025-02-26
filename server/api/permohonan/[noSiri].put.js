export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userID } = event.context.user;
  const { noSiri } = event.context.params; // Permohonan identifier from URL

  const {
    namaPemohon,
    pangkatPemohon,
    noPegawaiPemohon,
    namaPenghantar,
    pangkatPenghantar,
    noPegawaiPenghantar,
    ringkasanKenyataanKes,
    isPenghantarSameAsPemohon,
    bilangan,
    barangList,
    noKertasSiasatan,
    noLaporanPolis,
    tarikhTemujanji,
    slotMasa,
    isDraft,
  } = body;

  // 1. Mandatory fields validation
  const mandatoryFields = [
    namaPemohon,
    pangkatPemohon,
    noPegawaiPemohon,
    ...barangList,
  ];

  if (mandatoryFields.some((field) => !field || field === "")) {
    return {
      statusCode: 400,
      message:
        "Setiap medan mandatori yang bertanda * telah diisi. (Ralat CMN-E001)",
    };
  }

  // 2. Validate date for the appointment
  const appointmentDate = new Date(tarikhTemujanji);
  const currentDate = new Date();

  if (appointmentDate <= currentDate) {
    return {
      statusCode: 400,
      message:
        "Perlu memastikan tarikh janji temu yang dimasukkan adalah tarikh selepas tarikh semasa. (Ralat CMN-E002)",
    };
  }

  // 3. Check if the session is expired
  const sessionExpired = false; // Implement session logic here
  if (sessionExpired) {
    return {
      statusCode: 401,
      message:
        "Sesi aktif pengguna berada dalam sistem telah tamat. (Ralat CMN-E005)",
    };
  }

  // 4. Check for invalid symbols in text fields
  const hasInvalidSymbols = (text) => /[^a-zA-Z0-9\s]/.test(text); // Allow alphanumeric and spaces

  const fieldsToCheck = [
    namaPemohon,
    pangkatPemohon,
    noPegawaiPemohon,
    ...barangList.map((barang) => barang.tandaBarang),
  ];

  if (fieldsToCheck.some((field) => hasInvalidSymbols(field))) {
    return {
      statusCode: 400,
      message:
        "Perlu memastikan tiada penggunaan simbol dalam medan yang ditetapkan. (Ralat CMN-E011)",
    };
  }

  // 5. Update the permohonan in the database
  let permohonanStatus = isDraft ? "Permohonan Draf" : "Permohonan Dihantar";

  try {
    // Update the existing `permohonan` record
    const updatedPermohonan = await prisma.permohonan.update({
      where: {
        no_siri: noSiri,
      },
      data: {
        status_permohonan: permohonanStatus,
        pemohon: {
          update: {
            userID: userID,
            nama_pemohon: namaPemohon,
            pangkat_pemohon: pangkatPemohon,
            no_pegawai_pemohon: noPegawaiPemohon,
          },
        },
        penghantar: isPenghantarSameAsPemohon
          ? null
          : {
              update: {
                nama_penghantar: namaPenghantar,
                pangkat_penghantar: pangkatPenghantar,
                no_pegawai_penghantar: noPegawaiPenghantar,
              },
            },
        ringkasan_kenyataan_kes: ringkasanKenyataanKes,
        bilangan: parseInt(bilangan),
        penghantar_sama_dengan_pemohon: isPenghantarSameAsPemohon ? 1 : 0,
        no_kertas_siasatan: noKertasSiasatan,
        no_laporan_polis: noLaporanPolis,
        tarikh_temujanji: tarikhTemujanji
          ? new Date(tarikhTemujanji)
          : undefined,
        slot_masa: slotMasa ? new Date(`1970-01-01T${slotMasa}`) : undefined,
        user_permohonan_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
    });

    // Delete old barang and create new ones
    await prisma.report.deleteMany({
      where: { permohonanID: updatedPermohonan.id },
    });

    for (const barang of barangList) {
      await prisma.report.create({
        data: {
          permohonanID: updatedPermohonan.id,
          jenis_barang: barang.jenisBarangDetail,
          kuantiti_barang: parseInt(barang.kuantitiBarang),
          tanda_barang: barang.tandaBarang,
          keadaan_barang: barang.keadaanBarang,
          create_at: new Date(),
        },
      });
    }

    // 6. Send confirmation email if not a draft
    if (!isDraft) {
      try {
        console.log(`[Email Process Start] - Update Permohonan ${noSiri}`);

        // Get emails for Pegawai Kaunter and Ketua Bahagian
        console.log("[Email] Fetching officer emails from database...");
        const roleUsers = await prisma.user.findMany({
          where: {
            AND: [
              {
                userrole: {
                  some: {
                    role: {
                      roleName: {
                        in: ["Pegawai Kaunter", "Ketua Bahagian"],
                      },
                    },
                  },
                },
              },
              { userStatus: "ACTIVE" },
              { userEmail: { not: null } },
            ],
          },
          select: {
            userEmail: true,
            userFullName: true,
            userrole: {
              include: {
                role: true,
              },
            },
          },
        });

        console.log(`[Email] Found ${roleUsers.length} active users with roles`);

        // Group emails by role
        const emailRecipients = {
          pegawaiKaunter: roleUsers
            .filter((user) =>
              user.userrole.some((ur) => ur.role.roleName === "Pegawai Kaunter")
            )
            .map((u) => ({ email: u.userEmail, name: u.userFullName })),
          ketuaBahagian: roleUsers
            .filter((user) =>
              user.userrole.some((ur) => ur.role.roleName === "Ketua Bahagian")
            )
            .map((u) => ({ email: u.userEmail, name: u.userFullName })),
        };

        // Get pemohon's email from the database
        const pemohonData = await prisma.pemohon.findFirst({
          where: { permohonan: { no_siri: noSiri } },
          include: { user: true },
        });

        const pemohonEmail = pemohonData?.user?.userEmail;
        const pemohonName = pemohonData?.user?.userFullName;

        // Log detailed recipient information
        console.log("[Email] Recipient Details:", {
          pemohon: pemohonEmail ? { email: pemohonEmail, name: pemohonName } : "Not found",
          pegawaiKaunter: {
            count: emailRecipients.pegawaiKaunter.length,
            recipients: emailRecipients.pegawaiKaunter,
          },
          ketuaBahagian: {
            count: emailRecipients.ketuaBahagian.length,
            recipients: emailRecipients.ketuaBahagian,
          },
        });

        // Send email to Pemohon
        if (pemohonEmail) {
          console.log(`[Email] Attempting to send update email to Pemohon: ${pemohonEmail}`);
          const pemohonMailResult = await sendMail({
            to: [pemohonEmail],
            subject: `Kemaskini Permohonan: ${noSiri}`,
            html: `
              <h1>Kemaskini Permohonan Pemeriksaan Forensik</h1>
              <p>Permohonan anda telah dikemaskini. Berikut adalah butiran terkini permohonan anda:</p>
              <p><strong>No. Siri:</strong> ${noSiri}</p>
              <p><strong>Status:</strong> ${permohonanStatus}</p>
              <p><strong>Tarikh Temujanji:</strong> ${
                tarikhTemujanji
                  ? new Date(tarikhTemujanji).toLocaleDateString("ms-MY")
                  : "-"
              }</p>
              <p><strong>Slot Masa:</strong> ${slotMasa || "-"}</p>
              <h2>Butiran Barang:</h2>
              <ul>
                ${barangList
                  .map(
                    (barang) => `
                  <li>${barang.tandaBarang} - ${barang.kuantitiBarang} unit</li>
                `
                  )
                  .join("")}
              </ul>
              <p>Permohonan anda akan disemak oleh pegawai bertugas. Anda akan menerima notifikasi setelah permohonan anda disemak.</p>
              <br>
              <p>Sila log masuk ke sistem untuk melihat status terkini permohonan anda.</p>
            `,
            text: `
              Kemaskini Permohonan Pemeriksaan Forensik

              Permohonan anda telah dikemaskini. Berikut adalah butiran terkini permohonan anda:

              No. Siri: ${noSiri}
              Status: ${permohonanStatus}
              Tarikh Temujanji: ${
                tarikhTemujanji
                  ? new Date(tarikhTemujanji).toLocaleDateString("ms-MY")
                  : "-"
              }
              Slot Masa: ${slotMasa || "-"}

              Butiran Barang:
              ${barangList
                .map(
                  (barang) => `- ${barang.tandaBarang} - ${barang.kuantitiBarang} unit`
                )
                .join("\n")}

              Permohonan anda akan disemak oleh pegawai bertugas. Anda akan menerima notifikasi setelah permohonan anda disemak.

              Sila log masuk ke sistem untuk melihat status terkini permohonan anda.
            `,
          });

          if (!pemohonMailResult.success) {
            console.error("[Email] Failed to send update email to pemohon:", {
              email: pemohonEmail,
              error: pemohonMailResult.error,
              caseRef: noSiri,
            });
          } else {
            console.log(`[Email] Successfully sent update email to Pemohon: ${pemohonEmail}`);
          }
        } else {
          console.warn("[Email] Pemohon email not found for update notification:", {
            caseRef: noSiri,
            pemohonId: pemohonData?.id,
          });
        }

        // Send notification to Pegawai Kaunter and Ketua Bahagian
        const officerRecipients = [
          ...emailRecipients.pegawaiKaunter.map(r => r.email),
          ...emailRecipients.ketuaBahagian.map(r => r.email),
        ].filter(Boolean);

        if (officerRecipients.length > 0) {
          console.log(`[Email] Attempting to send update email to ${officerRecipients.length} officers`);
          const officerMailResult = await sendMail({
            to: officerRecipients,
            subject: `Kemaskini Permohonan Untuk Semakan: ${noSiri}`,
            html: `
              <h1>Kemaskini Permohonan Pemeriksaan Forensik Untuk Semakan</h1>
              <p>Terdapat kemaskini pada permohonan yang memerlukan semakan:</p>
              <p><strong>No. Siri:</strong> ${noSiri}</p>
              <p><strong>Tarikh Temujanji:</strong> ${
                tarikhTemujanji
                  ? new Date(tarikhTemujanji).toLocaleDateString("ms-MY")
                  : "-"
              }</p>
              <p><strong>Slot Masa:</strong> ${slotMasa || "-"}</p>
              <h2>Butiran Pemohon:</h2>
              <ul>
                <li><strong>Nama:</strong> ${namaPemohon}</li>
                <li><strong>Pangkat:</strong> ${pangkatPemohon}</li>
                <li><strong>No. Pegawai:</strong> ${noPegawaiPemohon}</li>
              </ul>
              ${
                !isPenghantarSameAsPemohon
                  ? `
                <h2>Butiran Penghantar:</h2>
                <ul>
                  <li><strong>Nama:</strong> ${namaPenghantar}</li>
                  <li><strong>Pangkat:</strong> ${pangkatPenghantar}</li>
                  <li><strong>No. Pegawai:</strong> ${noPegawaiPenghantar}</li>
                </ul>
              `
                  : ""
              }
              <h2>Butiran Barang:</h2>
              <ul>
                ${barangList
                  .map(
                    (barang) => `
                  <li>${barang.tandaBarang} - ${barang.kuantitiBarang} unit</li>
                `
                  )
                  .join("")}
              </ul>
              <h2>Ringkasan Kenyataan Kes:</h2>
              <p>${ringkasanKenyataanKes || "-"}</p>
              <br>
              <p>Sila log masuk ke sistem untuk membuat semakan permohonan ini.</p>
            `,
            text: `
              Kemaskini Permohonan Pemeriksaan Forensik Untuk Semakan

              Terdapat kemaskini pada permohonan yang memerlukan semakan:

              No. Siri: ${noSiri}
              Tarikh Temujanji: ${
                tarikhTemujanji
                  ? new Date(tarikhTemujanji).toLocaleDateString("ms-MY")
                  : "-"
              }
              Slot Masa: ${slotMasa || "-"}

              Butiran Pemohon:
              Nama: ${namaPemohon}
              Pangkat: ${pangkatPemohon}
              No. Pegawai: ${noPegawaiPemohon}

              ${
                !isPenghantarSameAsPemohon
                  ? `
                Butiran Penghantar:
                Nama: ${namaPenghantar}
                Pangkat: ${pangkatPenghantar}
                No. Pegawai: ${noPegawaiPenghantar}
                `
                  : ""
              }

              Butiran Barang:
              ${barangList
                .map(
                  (barang) => `- ${barang.tandaBarang} - ${barang.kuantitiBarang} unit`
                )
                .join("\n")}

              Ringkasan Kenyataan Kes:
              ${ringkasanKenyataanKes || "-"}

              Sila log masuk ke sistem untuk membuat semakan permohonan ini.
            `,
          });

          if (!officerMailResult.success) {
            console.error("[Email] Failed to send update email to officers:", {
              recipients: officerRecipients,
              error: officerMailResult.error,
              caseRef: noSiri,
            });
          } else {
            console.log("[Email] Successfully sent update email to officers:", {
              recipientCount: officerRecipients.length,
              caseRef: noSiri,
            });
          }
        } else {
          console.warn("[Email] No active officers found for update notification:", {
            caseRef: noSiri,
            totalUsers: roleUsers.length,
          });
        }

        console.log(`[Email Process Complete] - Update Permohonan ${noSiri}`);
      } catch (emailError) {
        console.error("[Email] Error in email update notification process:", {
          error: emailError,
          caseRef: noSiri,
          stack: emailError.stack,
        });
        // Don't throw error as permohonan was updated successfully
      }
    }

    return {
      statusCode: 200,
      message: isDraft
        ? "Rekod telah berjaya disimpan. (Status CMN-S001)"
        : "Permohonan pemeriksaan forensik telah dikemaskini. (Status FOR-S001)",
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Terdapat masalah. Silakan cuba lagi.",
    };
  }
});

// Helper function to generate case reference number
const generateCaseReferenceID = () => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // JS month is zero-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const uniqueSerial = String(Math.floor(Math.random() * 1000000)).padStart(
    6,
    "0"
  );
  return `${year}${month}${day}-${uniqueSerial}`;
};

const sendMail = async ({ to, subject, html, text }) => {
  console.log("Sending email to", to);
  return { success: true };
};
