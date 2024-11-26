import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

// Add allowed file types
const ALLOWED_FILE_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
};

export default defineEventHandler(async (event) => {
  const { temujanjiID } = event.context.params;
  const { userID } = event.context.user;
  const body = await readBody(event);

  try {
    // Handle file upload if laporanTdb exists and is a base64 string
    let laporanSystemTdb = null;
    if (body.laporanTdb && body.laporanTdb.startsWith("data:")) {
      // Extract file extension and base64 data
      const matches = body.laporanTdb.match(
        /^data:([A-Za-z-+\/]+);base64,(.+)$/
      );

      if (!matches || matches.length !== 3) {
        throw new Error("Invalid base64 string");
      }

      const fileType = matches[1];
      const base64Data = matches[2];

      // Validate file type
      if (!ALLOWED_FILE_TYPES[fileType]) {
        throw new Error(
          "Jenis fail tidak dibenarkan. Sila muat naik fail PDF atau JPG sahaja."
        );
      }

      const extension = ALLOWED_FILE_TYPES[fileType];

      // Create unique filename
      const fileName = `laporan_${temujanjiID}_${Date.now()}.${extension}`;

      // Ensure uploads directory exists
      const uploadDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      // Write file
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, base64Data, "base64");

      // Create document record
      const document = await prisma.document.create({
        data: {
          documentName: fileName,
          documentURL: `/uploads/${fileName}`,
          documentType: "LAPORAN",
          documentExtension: extension,
          imageMIMEType: fileType,
          documentSize: Math.round(base64Data.length * 0.75), // Approximate size in bytes
          documentStatus: "ACTIVE",
          documentCreatedDate: new Date().toISOString(),
        },
      });

      laporanSystemTdb = document.documentID;
    }

    // Get temujanji details ID
    const temujanjiDetailsID = await prisma.temujanji.findFirst({
      where: { temujanjiID: parseInt(temujanjiID) },
      select: {
        pemohonID: true,
        temujanjiID: true,
        temujanjiDetailID: true,
        noSiri: true,
        jenisSemakan: true,
        tarikh: true,
        masa: true,
        status: true,
      },
    });

    // Update the temujanji_detail table
    await prisma.temujanji_detail.update({
      where: {
        temujanjiDetailID: temujanjiDetailsID.temujanjiDetailID,
      },
      data: {
        negara: body.negara,
        namaPemilik: body.namaPemilik,
        noDokumen: body.noDokumen,
        kewarganegaraan: body.kewarganegaraan,
        tarikhLahir: new Date(body.tarikhLahir),
        jantina: body.jantina,
        tarikhLuputDokumen: new Date(body.tarikhLuputDokumen),
        skorPersamaanMuka: parseFloat(body.skorPersamaanMuka),
        skorPersamaanCapJari: parseFloat(body.skorPersamaanCapJari),
        umur: body.umur ? parseInt(body.umur) : null,
        tinggi: body.tinggi ? parseFloat(body.tinggi) : null,
        warnaRambut: body.warnaRambut || null,
        bangsa: body.bangsa || null,
        etnik: body.etnik || null,
        bentukKepala: body.bentukKepala || null,
        mata: body.mata || null,
        telinga: body.telinga || null,
        hidung: body.hidung || null,
        mulut: body.mulut || null,
        parut: body.parut || null,
        sejarahPerjalanan: body.sejarahPerjalanan || null,
        persamaanTandaTangan: body.persamaanTandaTangan || null,
        pemeriksaanLain: body.pemeriksaanLain || null,
        dapatan: body.dapatan,
        ...(laporanSystemTdb && {
          document: {
            connect: {
              documentID: laporanSystemTdb,
            },
          },
        }),
        user_temujanji_detail_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
    });

    // insert temujanji_log
    await prisma.temujanji_log.create({
      data: {
        temujanjiID: parseInt(temujanjiID),
        pemohonID: temujanjiDetailsID.pemohonID,
        jenisSemakan: temujanjiDetailsID.jenisSemakan,
        tarikh: temujanjiDetailsID.tarikh,
        masa: temujanjiDetailsID.masa,
        negara: body.negara,
        namaPemilik: body.namaPemilik,
        noDokumen: body.noDokumen,
        kewarganegaraan: body.kewarganegaraan,
        tarikhLahir: new Date(body.tarikhLahir),
        jantina: body.jantina,
        tarikhLuputDokumen: new Date(body.tarikhLuputDokumen),
        skorPersamaanMuka: parseFloat(body.skorPersamaanMuka),
        skorPersamaanCapJari: parseFloat(body.skorPersamaanCapJari),
        umur: body.umur ? parseInt(body.umur) : null,
        tinggi: body.tinggi ? parseFloat(body.tinggi) : null,
        warnaRambut: body.warnaRambut || null,
        bangsa: body.bangsa || null,
        etnik: body.etnik || null,
        bentukKepala: body.bentukKepala || null,
        mata: body.mata || null,
        telinga: body.telinga || null,
        hidung: body.hidung || null,
        mulut: body.mulut || null,
        parut: body.parut || null,
        sejarahPerjalanan: body.sejarahPerjalanan || null,
        persamaanTandaTangan: body.persamaanTandaTangan || null,
        pemeriksaanLain: body.pemeriksaanLain || null,
        dapatan: body.dapatan,
        create_at: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: "Temujanji berjaya dikemaskini.",
    };
  } catch (error) {
    console.error("Error updating temujanji:", error);
    return {
      statusCode: 500,
      message: error.message || "Gagal mengemaskini temujanji.",
    };
  }
});
