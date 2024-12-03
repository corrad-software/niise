export default defineEventHandler(async (event) => {
  try {
    const elibraryID = event.context.params.elibraryID;

    if (!elibraryID) {
      return {
        statusCode: 400,
        message: "ID e-library diperlukan",
      };
    }

    // Fetch elibrary data including related documents with all fields
    const elibraryData = await prisma.elibrary.findUnique({
      where: {
        elibraryID: parseInt(elibraryID),
      },
      select: {
        elibraryID: true,
        elibrary_jenisDokumen: true,
        elibrary_negaraPengeluaran: true,
        elibrary_tahunPengeluaran: true,
        elibrary_ketulenan: true,
        elibrary_maklumatTerperinci: true,
        elibrary_ulasan: true,
        // Add new fields to select
        elibrary_mukaSurat: true,
        elibrary_noDocument: true,
        elibrary_namaPemilik: true,
        elibrary_peralatanDigunakan: true,
        elibrary_caraSemakan: true,
        elibrary_dapatan: true,
        created_at: true,
        updated_at: true,
        document: {
          where: {
            documentStatus: "ACTIVE",
            isElibraryImage: true,
          },
          orderBy: {
            documentCreatedDate: "desc",
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
