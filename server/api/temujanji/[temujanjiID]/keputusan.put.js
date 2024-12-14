import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const reportID = parseInt(event.context.params.temujanjiID);
    const body = await readBody(event);
    const { userID } = event.context.user;

    // Get existing report with specific field selection
    const existingReport = await prisma.report.findUnique({
      where: {
        reportID,
        pengesanan_penyamaran: true,
      },
      include: {
        permohonan: {
          include: {
            pemohon: true,
          },
        },
        permohonan_detail: {
          include: {
            document_permohonan_detail_gambarSubjekTodocument: {
              select: {
                documentID: true,
                documentURL: true,
              },
            },
            document_permohonan_detail_gambarCapJariTodocument: {
              select: {
                documentID: true,
                documentURL: true,
              },
            },
          },
        },
      },
    });

    if (!existingReport) {
      return {
        statusCode: 404,
        message: "Report tidak dijumpai.",
      };
    }

    // Update pemohon through permohonan
    await prisma.pemohon.update({
      where: {
        id: existingReport.permohonan.pemohon.id,
      },
      data: {
        nama_pemohon: body.pemohon.nama,
        pangkat_pemohon: body.pemohon.jawatan,
        no_pegawai_pemohon: body.pemohon.noPegawai,
      },
    });

    // const updateData = {
    //   jenisSemakan: body.jenisSemakan,
    //   tarikh: new Date(body.tarikh),
    //   masa: new Date(`${body.tarikh}T${body.masa}:00`),
    //   modified_at: new Date(),
    // };

    // Handle image updates only if jenisSemakan is "Subjek Hadir"
    if (existingReport.jenisSemakan === "Subjek Hadir") {
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

      // Update permohonan_detail if documents were uploaded
      if (savedDocuments.gambarSubjek || savedDocuments.gambarCapJari) {
        await prisma.permohonan_detail.update({
          where: {
            permohonanDetailID:
              existingReport.permohonan_detail.permohonanDetailID,
          },
          data: {
            ...(savedDocuments.gambarSubjek && {
              document_permohonan_detail_gambarSubjekTodocument: {
                connect: { documentID: savedDocuments.gambarSubjek },
              },
            }),
            ...(savedDocuments.gambarCapJari && {
              document_permohonan_detail_gambarCapJariTodocument: {
                connect: { documentID: savedDocuments.gambarCapJari },
              },
            }),
          },
        });
      }
    }

    // Update report record with specific include
    const updatedReport = await prisma.report.update({
      where: { reportID },
      data: {
        user_report_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
      },
      include: {
        permohonan: {
          include: {
            pemohon: true,
          },
        },
        permohonan_detail: {
          include: {
            document_permohonan_detail_gambarSubjekTodocument: {
              select: {
                documentID: true,
                documentURL: true,
                documentName: true,
                documentType: true,
                documentSize: true,
                documentCreatedDate: true,
              },
            },
            document_permohonan_detail_gambarCapJariTodocument: {
              select: {
                documentID: true,
                documentURL: true,
                documentName: true,
                documentType: true,
                documentSize: true,
                documentCreatedDate: true,
              },
            },
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: "Report berjaya dikemaskini.",
      data: updatedReport,
    };
  } catch (error) {
    console.error("Error updating report:", error);
    return {
      statusCode: 500,
      message: "Terdapat ralat semasa mengemaskini report.",
      error: error.message,
    };
  }
});
