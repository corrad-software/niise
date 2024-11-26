import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { elibraryId, images } = body;

    if (!elibraryId || !images || images.length === 0) {
      return {
        statusCode: 400,
        message: "Missing required fields",
      };
    }

    if (images.length > 100) {
      return {
        statusCode: 400,
        message: "Maximum 100 images allowed",
      };
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    // Process each image
    const savedDocuments = [];
    for (const image of images) {
      try {
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
            elibraryID: parseInt(elibraryId),
            isElibraryImage: true,
            documentStatus: "ACTIVE",
            documentCreatedDate: new Date().toISOString(),
          },
        });

        savedDocuments.push(savedDocument);
      } catch (error) {
        console.error(`Error saving image ${image.name}:`, error);
        throw new Error(`Failed to save image ${image.name}: ${error.message}`);
      }
    }

    return {
      statusCode: 200,
      message: "Images uploaded successfully",
      data: savedDocuments,
    };
  } catch (error) {
    console.error("Error uploading images:", error);
    return {
      statusCode: 500,
      message: "Error uploading images",
      error: error.message,
    };
  }
});
