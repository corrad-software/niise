import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const elibraryID = event.context.params.elibraryID;

    if (!elibraryID) {
      return {
        statusCode: 400,
        message: "ID e-library diperlukan",
      };
    }

    // Validate required fields
    if (
      !body.elibrary_jenisDokumen ||
      !body.elibrary_negaraPengeluaran ||
      !body.elibrary_tahunPengeluaran ||
      !body.elibrary_ketulenan ||
      !body.elibrary_maklumatTerperinci ||
      !body.elibrary_ulasan
    ) {
      return {
        statusCode: 400,
        message: "Sila isi semua medan yang diperlukan",
      };
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
        const filename = `elibrary_${Date.now()}_${Math.random()
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
            elibraryID: parseInt(elibraryID),
            isElibraryImage: true,
            documentStatus: "ACTIVE",
            documentCreatedDate: new Date().toISOString(),
          },
        });

        savedDocuments.push(savedDocument);
      }
    }

    // Update elibrary record
    const updatedElibrary = await prisma.elibrary.update({
      where: {
        elibraryID: parseInt(elibraryID),
      },
      data: {
        elibrary_jenisDokumen: body.elibrary_jenisDokumen,
        elibrary_negaraPengeluaran: body.elibrary_negaraPengeluaran,
        elibrary_tahunPengeluaran: parseInt(body.elibrary_tahunPengeluaran),
        elibrary_ketulenan: body.elibrary_ketulenan,
        elibrary_maklumatTerperinci: body.elibrary_maklumatTerperinci,
        elibrary_ulasan: body.elibrary_ulasan,
        updated_at: new Date(),
      },
      include: {
        document: true,
      },
    });

    return {
      statusCode: 200,
      message: "E-library berjaya dikemaskini",
      data: {
        elibrary: updatedElibrary,
        newDocuments: savedDocuments,
      },
    };
  } catch (error) {
    console.error("Error updating e-library:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa mengemaskini e-library",
      error: error.message,
    };
  }
});
