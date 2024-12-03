import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

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

        // Prepare document data for database
        savedDocuments.push({
          documentName: filename,
          documentURL: `/uploads/${filename}`,
          documentType: "IMAGE",
          documentExtension: extension,
          imageMIMEType: image.type,
          documentSize: image.size,
          isElibraryImage: true,
          documentStatus: "ACTIVE",
          documentCreatedDate: new Date().toISOString(),
        });
      }
    }

    // Create elibrary record with documents
    const newElibrary = await prisma.elibrary.create({
      data: {
        elibrary_jenisDokumen: body.elibrary_jenisDokumen,
        elibrary_negaraPengeluaran: body.elibrary_negaraPengeluaran,
        elibrary_tahunPengeluaran: parseInt(body.elibrary_tahunPengeluaran),
        elibrary_ketulenan: body.elibrary_ketulenan,
        elibrary_maklumatTerperinci: body.elibrary_maklumatTerperinci,
        elibrary_ulasan: body.elibrary_ulasan,
        created_at: new Date(),
        updated_at: new Date(),
        document: {
          create: savedDocuments,
        },
      },
      include: {
        document: true,
      },
    });

    return {
      statusCode: 200,
      message: "E-library berjaya ditambah",
      data: newElibrary,
    };
  } catch (error) {
    console.error("Error adding e-library:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa menambah e-library",
      error: error.message,
    };
  }
});
