// Path: /api/report/[reportID].post.js
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

// Separate allowed file types for images and documents
const ALLOWED_FILE_TYPES = {
  IMAGES: {
    "image/jpeg": "jpg",
  },
  DOCUMENTS: {
    "application/pdf": "pdf",
  },
};

export default defineEventHandler(async (event) => {
  const { reportID } = event.context.params;
  const { userID } = event.context.user;
  const body = await readBody(event);

  try {
    // Update the report basic info
    const updatedReport = await prisma.report.update({
      where: { reportID: parseInt(reportID) },
      data: {
        peralatan: body.peralatan,
        langkah_langkah: body.langkah2,
        lookup_report_dapatanTolookup: {
          connect: {
            lookupID: parseInt(body.dapatan),
          },
        },
        user_report_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
      include: {
        permohonan: {
          include: {
            pemohon: {
              include: {
                user: true,
              },
            },
          },
        },
        report_doc_support: {
          include: {
            document: true,
          },
        },
      },
    });

    // Ensure uploads directory exists
    const uploadsDir = join(
      process.env.SERVER == "true"
        ? join(process.cwd(), "../public/uploads")
        : join(process.cwd(), "public/uploads")
    );
    await mkdir(uploadsDir, { recursive: true });

    // First, handle deletion of removed files only if we have existing IDs arrays
    if (Array.isArray(body.existingImageIds) || Array.isArray(body.existingDocIds)) {
      // Get all existing documents for this report
      const existingDocs = await prisma.report_doc_support.findMany({
        where: { 
          reportID: parseInt(reportID),
          document: {
            documentStatus: "ACTIVE"
          }
        },
        include: {
          document: true
        }
      });

      // Process deletions for both images and documents
      const existingIds = [...(body.existingImageIds || []), ...(body.existingDocIds || [])];
      
      // Delete documents not in existingIds
      for (const doc of existingDocs) {
        if (!existingIds.includes(doc.documentID)) {
          await prisma.$transaction([
            // Mark document as deleted
            prisma.document.update({
              where: { documentID: doc.document.documentID },
              data: { documentStatus: "DELETED" }
            }),
            // Remove report_doc_support relationship
            prisma.report_doc_support.delete({
              where: { report_attachID: doc.report_attachID }
            })
          ]);
        }
      }
    }

    // Handle new image uploads (gambar)
    if (body.gambar?.length > 0) {
      // Create all images and their supporting relationships
      await Promise.all(body.gambar.map(async (image) => {
        const matches = image.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error("Invalid image base64 string");
        }

        const fileType = matches[1];
        const base64Data = matches[2];

        // Validate image type
        if (!ALLOWED_FILE_TYPES.IMAGES[fileType]) {
          throw new Error("Jenis gambar tidak dibenarkan. Sila muat naik fail JPG sahaja.");
        }

        const extension = ALLOWED_FILE_TYPES.IMAGES[fileType];
        const fileName = `report_image_${reportID}_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
        const filePath = join(uploadsDir, fileName);

        // Save image to disk
        await writeFile(filePath, base64Data, "base64");

        // Create document record and supporting relationship in a transaction
        await prisma.$transaction(async (prisma) => {
          // Create document record
          const newDoc = await prisma.document.create({
            data: {
              documentName: image.name,
              documentURL: `/uploads/${fileName}`,
              documentType: "LAPORAN_GAMBAR",
              documentExtension: extension,
              imageMIMEType: fileType,
              documentSize: Math.round(base64Data.length * 0.75),
              documentStatus: "ACTIVE",
              documentCreatedDate: new Date().toISOString(),
              user: {
                connect: {
                  userID: userID,
                },
              },
            },
          });

          // Create supporting relationship
          await prisma.report_doc_support.create({
            data: {
              reportID: parseInt(reportID),
              documentID: newDoc.documentID,
              keterangan: "Report Image"
            }
          });
        });
      }));
    }

    // Handle new document uploads (documentTambahan)
    if (body.documentTambahan?.length > 0) {
      // Create all documents and their supporting relationships
      await Promise.all(body.documentTambahan.map(async (doc) => {
        const matches = doc.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
          throw new Error("Invalid document base64 string");
        }

        const fileType = matches[1];
        const base64Data = matches[2];

        // Validate document type
        if (!ALLOWED_FILE_TYPES.DOCUMENTS[fileType]) {
          throw new Error("Jenis dokumen tidak dibenarkan. Sila muat naik fail PDF sahaja.");
        }

        const extension = ALLOWED_FILE_TYPES.DOCUMENTS[fileType];
        const fileName = `report_doc_${reportID}_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
        const filePath = join(uploadsDir, fileName);

        // Save document to disk
        await writeFile(filePath, base64Data, "base64");

        // Create document record and supporting relationship in a transaction
        await prisma.$transaction(async (prisma) => {
          // Create document record
          const newDoc = await prisma.document.create({
            data: {
              documentName: doc.nama,
              documentURL: `/uploads/${fileName}`,
              documentType: "LAPORAN_SOKONGAN",
              documentExtension: extension,
              imageMIMEType: fileType,
              documentSize: Math.round(base64Data.length * 0.75),
              documentStatus: "ACTIVE",
              documentCreatedDate: new Date().toISOString(),
              user: {
                connect: {
                  userID: userID,
                },
              },
            },
          });

          // Create supporting relationship
          await prisma.report_doc_support.create({
            data: {
              reportID: parseInt(reportID),
              documentID: newDoc.documentID,
              keterangan: doc.keterangan || null
            }
          });
        });
      }));
    }

    // Send email notification
    if (updatedReport.permohonan?.pemohon?.user?.userEmail) {
      await sendMail({
        to: updatedReport.permohonan.pemohon.user.userEmail,
        subject: `Laporan Forensik Telah Dikemaskini`,
        html: `
          <h1>Laporan Bahan Bukti Telah Dikemaskini</h1>
          <p>No. Siri Permohonan: ${updatedReport.permohonan.no_siri}</p>
          <p>Status: Laporan Dikemaskini</p>
          <br>
          <p>Sila log masuk ke sistem untuk melihat butiran lanjut.</p>
        `,
        text: `
          Laporan Bahan Bukti Telah Dikemaskini
          No. Siri Permohonan: ${updatedReport.permohonan.no_siri}
          Status: Laporan Dikemaskini
          
          Sila log masuk ke sistem untuk melihat butiran lanjut.
        `,
      });
    }

    return {
      statusCode: 200,
      message: "Laporan berjaya dikemaskini",
    };
  } catch (error) {
    console.error("Error updating report:", error);
    return {
      statusCode: 500,
      message: error.message || "Gagal mengemaskini laporan",
    };
  }
});
