export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;

    if (!id) {
      return {
        statusCode: 400,
        message: "ID e-library diperlukan",
      };
    }

    // Fetch single elibrary entry with its documents
    const elibraryData = await prisma.elibrary.findUnique({
      where: {
        elibraryID: parseInt(id),
        deleted_at: null, // Only get non-deleted entry
      },
      include: {
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
            documentURL: true,
            documentType: true,
            documentExtension: true,
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

    // Transform the data to match the frontend requirements
    const transformedData = {
      id: elibraryData.elibraryID,
      jenisDokumen: elibraryData.elibrary_jenisDokumen,
      negaraPengeluaran: elibraryData.elibrary_negaraPengeluaran,
      tahunPengeluaran: elibraryData.elibrary_tahunPengeluaran,
      ketulenan: elibraryData.elibrary_ketulenan,
      maklumatTerperinci: elibraryData.elibrary_maklumatTerperinci,
      ulasan: elibraryData.elibrary_ulasan,
      mukaSurat: elibraryData.elibrary_mukaSurat,
      noDocument: elibraryData.elibrary_noDocument,
      namaPemilik: elibraryData.elibrary_namaPemilik,
      peralatanDigunakan: elibraryData.elibrary_peralatanDigunakan,
      caraSemakan: elibraryData.elibrary_caraSemakan,
      dapatan: elibraryData.elibrary_dapatan,
      images: elibraryData.document.map((doc) => doc.documentURL),
      selectedImage: elibraryData.document[0]?.documentURL || null,
    };

    return {
      statusCode: 200,
      message: "Data e-library berjaya diperolehi",
      data: transformedData,
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
