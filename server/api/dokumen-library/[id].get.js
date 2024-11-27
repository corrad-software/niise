export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;

    if (!id) {
      return {
        statusCode: 400,
        message: "ID dokumen library diperlukan",
      };
    }

    const dokumenLibraryData = await prisma.dokumen_library.findUnique({
      where: {
        dokumenLibraryID: parseInt(id),
      },
      include: {
        document: {
          where: {
            documentStatus: "ACTIVE",
            isDokumenLibraryImage: true,
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
          orderBy: {
            documentCreatedDate: "desc",
          },
        },
        report: {
          select: {
            reportID: true,
            permohonan: {
              select: {
                no_siri: true,
              },
            },
          },
        },
      },
    });

    if (!dokumenLibraryData) {
      return {
        statusCode: 200,
        message: "Data dokumen library belum wujud",
        data: {
          dokumenLibraryID: parseInt(id),
          negaraPengeluaran: "",
          tahunPengeluaran: "",
          mukaSurat: "",
          noDocument: "",
          namaPemilik: "",
          peralatanDigunakan: "",
          caraSemakan: "",
          dapatan: "",
          ulasan: "",
          document: [],
          report: null,
          create_at: null,
          create_by: null,
          modified_at: null,
          modified_by: null,
        },
      };
    }

    const formattedData = {
      ...dokumenLibraryData,
      document: dokumenLibraryData.document.map(doc => ({
        documentID: doc.documentID,
        documentName: doc.documentName,
        documentURL: doc.documentURL,
        documentType: doc.documentType,
        documentExtension: doc.documentExtension,
        imageMIMEType: doc.imageMIMEType,
        documentSize: doc.documentSize,
        documentCreatedDate: doc.documentCreatedDate,
      })),
    };

    return {
      statusCode: 200,
      message: "Data dokumen library berjaya diperolehi",
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching dokumen library data:", error);
    return {
      statusCode: 500,
      message: "Ralat semasa mendapatkan data dokumen library",
      error: error.message,
    };
  }
});
