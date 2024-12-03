import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { userID } = event.context.user;

    // Debug log
    console.log("Received body:", body);

    const { pemohon, jenisSemakan, tarikh, masa, gambarSubjek, gambarCapJari } =
      body;

    // Validate required fields
    if (
      !pemohon.nama ||
      !pemohon.jawatan ||
      !pemohon.noPegawai ||
      !jenisSemakan ||
      !tarikh ||
      !masa
    ) {
      return {
        statusCode: 400,
        message: "Sila isi semua medan yang diperlukan.",
      };
    }

    // Handle file uploads and save documents
    const savedDocuments = {};

    // Ensure uploads directory exists
    const uploadsDir = join(
      process.env.SERVER == "true"
        ? join(process.cwd(), "../public/uploads")
        : join(process.cwd(), "public/uploads")
    );
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    // Handle gambarSubjek
    if (gambarSubjek) {
      try {
        const base64Data = gambarSubjek.split(";base64,").pop();
        const extension = gambarSubjek.split(";")[0].split("/")[1];
        const filename = `gambarSubjek_${Date.now()}.${extension}`;
        const filepath = join(uploadsDir, filename);

        // Save file to disk
        await writeFile(filepath, Buffer.from(base64Data, "base64"));

        // Save document record in database
        const savedDocument = await prisma.document.create({
          data: {
            documentName: filename,
            documentURL: `/uploads/${filename}`,
            documentType: "Subjek",
            documentExtension: extension,
            imageMIMEType: `image/${extension}`,
            documentSize: base64Data.length,
            documentStatus: "ACTIVE",
            documentCreatedDate: new Date().toISOString(),
          },
        });

        savedDocuments.gambarSubjek = savedDocument.documentID;
      } catch (error) {
        console.error("Error saving gambarSubjek:", error);
        throw new Error(`Failed to save gambarSubjek: ${error.message}`);
      }
    }

    // Handle gambarCapJari
    if (gambarCapJari) {
      try {
        const base64Data = gambarCapJari.split(";base64,").pop();
        const extension = gambarCapJari.split(";")[0].split("/")[1];
        const filename = `gambarCapJari_${Date.now()}.${extension}`;
        const filepath = join(uploadsDir, filename);

        // Save file to disk
        await writeFile(filepath, Buffer.from(base64Data, "base64"));

        // Save document record in database
        const savedDocument = await prisma.document.create({
          data: {
            documentName: filename,
            documentURL: `/uploads/${filename}`,
            documentType: "Cap Jari",
            documentExtension: extension,
            imageMIMEType: `image/${extension}`,
            documentSize: base64Data.length,
            documentStatus: "ACTIVE",
            documentCreatedDate: new Date().toISOString(),
          },
        });

        savedDocuments.gambarCapJari = savedDocument.documentID;
      } catch (error) {
        console.error("Error saving gambarCapJari:", error);
        throw new Error(`Failed to save gambarCapJari: ${error.message}`);
      }
    }

    // Create temujanji record
    const temujanjiBaru = await prisma.temujanji.create({
      data: {
        jenisSemakan: jenisSemakan,
        tarikh: new Date(tarikh),
        masa: new Date(`${tarikh}T${masa}:00`),
        status: "Temujanji Diterima",
        ...(savedDocuments.gambarSubjek && {
          document_temujanji_gambarSubjekTodocument: {
            connect: {
              documentID: savedDocuments.gambarSubjek,
            },
          },
        }),
        ...(savedDocuments.gambarCapJari && {
          document_temujanji_gambarCapJariTodocument: {
            connect: {
              documentID: savedDocuments.gambarCapJari,
            },
          },
        }),
        pemohon: {
          create: {
            userID: userID,
            nama_pemohon: pemohon.nama,
            pangkat_pemohon: pemohon.jawatan,
            no_pegawai_pemohon: pemohon.noPegawai,
          },
        },
        temujanji_detail: {
          create: {
            create_by: userID,
            create_at: new Date(),
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: "Temujanji berjaya ditambah.",
      data: temujanjiBaru,
    };
  } catch (error) {
    console.error("Error adding appointment:", error);
    return {
      statusCode: 500,
      message: "Terdapat ralat semasa menambah temujanji.",
      error: error.message,
      stack: error.stack,
    };
  }
});
