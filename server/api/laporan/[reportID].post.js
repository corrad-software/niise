// Path: /api/report/[reportID].post.js
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

// Add allowed file types
const ALLOWED_FILE_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
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
    });

    // Handle document uploads
    if (body.documentTambahan?.length > 0) {
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      for (const doc of body.documentTambahan) {
        // Extract file data
        const matches = doc.file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

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
        const fileName = `report_${reportID}_${Date.now()}_${
          doc.nama
        }.${extension}`;
        const filePath = join(uploadsDir, fileName);

        // Save file to disk
        await writeFile(filePath, base64Data, "base64");

        // Create document record
        const savedDocument = await prisma.document.create({
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

        // Create report_doc_support record
        await prisma.report_doc_support.create({
          data: {
            reportID: parseInt(reportID),
            documentID: savedDocument.documentID,
            keterangan: doc.keterangan,
          },
        });
      }
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
