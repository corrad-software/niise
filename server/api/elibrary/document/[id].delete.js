import { unlink } from 'fs/promises';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  try {
    const documentId = event.context.params.id;

    // Get document details before deletion
    const document = await prisma.document.findUnique({
      where: {
        documentID: parseInt(documentId),
      },
      select: {
        documentURL: true,
        documentID: true,
      },
    });

    if (!document) {
      return {
        statusCode: 404,
        message: "Document not found",
      };
    }

    // Delete the physical file
    try {
      const filePath = join(
        process.env.SERVER == "true"
          ? join(process.cwd(), "../public")
          : join(process.cwd(), "public"),
        document.documentURL
      );
      await unlink(filePath);
    } catch (error) {
      console.error("Error deleting physical file:", error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: {
        documentID: parseInt(documentId),
      },
    });

    return {
      statusCode: 200,
      message: "Document deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting document:", error);
    return {
      statusCode: 500,
      message: "Error deleting document",
      error: error.message,
    };
  }
}); 