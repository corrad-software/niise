import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const id = event.context.params.id;

    if (!id) {
      return {
        statusCode: 400,
        message: "ID dokumen library diperlukan",
      };
    }

    // Validate required fields
    if (
      !body.negaraPengeluaran ||
      !body.tahunPengeluaran ||
      !body.mukaSurat ||
      !body.noDocument ||
      !body.namaPemilik ||
      !body.peralatanDigunakan ||
      !body.caraSemakan ||
      !body.dapatan
    ) {
      return {
        statusCode: 400,
        message: "Sila isi semua medan yang diperlukan",
      };
    }

    // Check if dokumen library exists
    const existingDokumenLibrary = await prisma.dokumen_library.findUnique({
      where: {
        dokumenLibraryID: parseInt(id),
      },
    });

    // Create or update dokumen library record first
    let dokumenLibraryData;

    if (!existingDokumenLibrary) {
      // Create new record
      dokumenLibraryData = await prisma.dokumen_library.create({
        data: {
          dokumenLibraryID: parseInt(id),
          negaraPengeluaran: body.negaraPengeluaran,
          tahunPengeluaran: body.tahunPengeluaran,
          mukaSurat: body.mukaSurat,
          noDocument: body.noDocument,
          namaPemilik: body.namaPemilik,
          peralatanDigunakan: body.peralatanDigunakan,
          caraSemakan: body.caraSemakan,
          dapatan: body.dapatan,
          ulasan: body.ulasan,
          create_by: body.modified_by || null,
          create_at: new Date(),
          reportID: body.reportID || null,
        },
      });
    } else {
      // Update existing record
      dokumenLibraryData = await prisma.dokumen_library.update({
        where: {
          dokumenLibraryID: parseInt(id),
        },
        data: {
          negaraPengeluaran: body.negaraPengeluaran,
          tahunPengeluaran: body.tahunPengeluaran,
          mukaSurat: body.mukaSurat,
          noDocument: body.noDocument,
          namaPemilik: body.namaPemilik,
          peralatanDigunakan: body.peralatanDigunakan,
          caraSemakan: body.caraSemakan,
          dapatan: body.dapatan,
          ulasan: body.ulasan,
          modified_by: body.modified_by || null,
          modified_at: new Date(),
        },
      });
    }

    // Handle file uploads if any
    const savedDocuments = [];
    if (body.images && body.images.length > 0) {
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

      // Process each image
      for (const image of body.images) {
        const base64Data = image.base64.split(";base64,").pop();
        const extension = image.type.split("/")[1];
        const filename = `dokumen_library_${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${extension}`;
        const filepath = join(uploadsDir, filename);

        // Save file to disk
        await writeFile(filepath, Buffer.from(base64Data, "base64"));

        // Save document record in database
        const savedDocument = await prisma.document.create({
          data: {
            documentName: filename,
            documentURL: `/uploads/${filename}`,
            documentType: "IMAGE",
            documentExtension: extension,
            imageMIMEType: image.type,
            documentSize: image.size,
            dokumenLibraryID: dokumenLibraryData.dokumenLibraryID,
            isDokumenLibraryImage: true,
            documentStatus: "ACTIVE",
            documentCreatedDate: new Date().toISOString(),
          },
        });

        savedDocuments.push(savedDocument);
      }
    }

    // Fetch the complete data with relations
    const completeData = await prisma.dokumen_library.findUnique({
      where: {
        dokumenLibraryID: dokumenLibraryData.dokumenLibraryID,
      },
      include: {
        document: true,
        report: true,
      },
    });

    const action = existingDokumenLibrary ? "dikemaskini" : "ditambah";

    return {
      statusCode: 200,
      message: `Dokumen library berjaya ${action}`,
      data: {
        dokumenLibrary: completeData,
        newDocuments: savedDocuments,
      },
    };
  } catch (error) {
    console.error("Error updating dokumen library:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa mengemaskini dokumen library",
      error: error.message,
    };
  }
});
