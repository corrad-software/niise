import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const temujanjiID = parseInt(event.context.params.temujanjiID);
    const body = await readBody(event);
    const { userID } = event.context.user;

    // Get existing temujanji
    const existingTemujanji = await prisma.temujanji.findUnique({
      where: { temujanjiID },
      include: {
        document_temujanji_gambarSubjekTodocument: true,
        document_temujanji_gambarCapJariTodocument: true,
      },
    });

    if (!existingTemujanji) {
      return {
        statusCode: 404,
        message: "Temujanji tidak dijumpai.",
      };
    }

    const updateData = {
      jenisSemakan: body.jenisSemakan,
      tarikh: new Date(body.tarikh),
      masa: new Date(`${body.tarikh}T${body.masa}:00`),
      modified_at: new Date(),
      pemohon: {
        update: {
          nama_pemohon: body.pemohon.nama,
          pangkat_pemohon: body.pemohon.jawatan,
          no_pegawai_pemohon: body.pemohon.noPegawai,
        },
      },
    };

    // Handle image updates only if jenisSemakan is "Subjek Hadir"
    if (existingTemujanji.jenisSemakan === "Subjek Hadir") {
      const savedDocuments = {};

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), "public", "uploads");
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
      }

      // Handle gambarSubjek update
      if (body.gambarSubjek) {
        try {
          const base64Data = body.gambarSubjek.split(";base64,").pop();
          const extension = body.gambarSubjek.split(";")[0].split("/")[1];
          const filename = `gambarSubjek_${Date.now()}.${extension}`;
          const filepath = join(uploadsDir, filename);

          await writeFile(filepath, Buffer.from(base64Data, "base64"));

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

      // Handle gambarCapJari update
      if (body.gambarCapJari) {
        try {
          const base64Data = body.gambarCapJari.split(";base64,").pop();
          const extension = body.gambarCapJari.split(";")[0].split("/")[1];
          const filename = `gambarCapJari_${Date.now()}.${extension}`;
          const filepath = join(uploadsDir, filename);

          await writeFile(filepath, Buffer.from(base64Data, "base64"));

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

      // Add document connections to update data if files were uploaded
      if (savedDocuments.gambarSubjek) {
        updateData.document_temujanji_gambarSubjekTodocument = {
          connect: { documentID: savedDocuments.gambarSubjek },
        };
      }
      if (savedDocuments.gambarCapJari) {
        updateData.document_temujanji_gambarCapJariTodocument = {
          connect: { documentID: savedDocuments.gambarCapJari },
        };
      }
    }

    // Update temujanji record
    const updatedTemujanji = await prisma.temujanji.update({
      where: { temujanjiID },
      data: {
        ...updateData,
        user_temujanji_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
      },
      include: {
        pemohon: true,
        document_temujanji_gambarSubjekTodocument: true,
        document_temujanji_gambarCapJariTodocument: true,
      },
    });

    return {
      statusCode: 200,
      message: "Temujanji berjaya dikemaskini.",
      data: updatedTemujanji,
    };
  } catch (error) {
    console.error("Error updating temujanji:", error);
    return {
      statusCode: 500,
      message: "Terdapat ralat semasa mengemaskini temujanji.",
      error: error.message,
    };
  }
});
