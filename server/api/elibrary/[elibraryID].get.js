export default defineEventHandler(async (event) => {
  try {
    const elibraryID = event.context.params.elibraryID;

    if (!elibraryID) {
      return {
        statusCode: 400,
        message: "ID e-library diperlukan",
      };
    }

    // Fetch elibrary data including related documents
    const elibraryData = await prisma.elibrary.findUnique({
      where: {
        elibraryID: parseInt(elibraryID),
      },
      include: {
        document: {
          where: {
            documentStatus: "ACTIVE",
            isElibraryImage: true,
          },
          orderBy: {
            documentCreatedDate: 'desc'
          },
          select: {
            documentID: true,
            documentName: true,
            documentURL: true,
            documentType: true,
            documentExtension: true,
            imageMIMEType: true,
            documentSize: true,
            documentCreatedDate: true,
          },
        },
      },
    });

    if (!elibraryData) {
      return {
        statusCode: 404,
        message: "Data e-library tidak dijumpai",
      };
    }

    return {
      statusCode: 200,
      message: "Data e-library berjaya diperolehi",
      data: elibraryData,
    };
  } catch (error) {
    console.error("Error fetching e-library data:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa mendapatkan data e-library",
      error: error.message,
    };
  }
});
