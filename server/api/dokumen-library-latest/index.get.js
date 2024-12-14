export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Build where conditions
    let whereConditions = {
      deleted_at: null, // Only get non-deleted entries
    };

    if (query.jenisDokumen) {
      whereConditions.elibrary_jenisDokumen = query.jenisDokumen;
    }

    if (query.negaraPengeluaran) {
      whereConditions.elibrary_negaraPengeluaran = query.negaraPengeluaran;
    }

    if (query.tahunPengeluaran) {
      whereConditions.elibrary_tahunPengeluaran = parseInt(
        query.tahunPengeluaran
      );
    }

    if (query.ketulenan) {
      whereConditions.elibrary_ketulenan = query.ketulenan;
    }

    const elibrary = await prisma.elibrary.findMany({
      where: whereConditions,
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
            documentName: true,
            documentURL: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform the data to match the frontend requirements
    const transformedData = elibrary.map((item) => ({
      id: item.elibraryID,
      jenisDokumen: item.elibrary_jenisDokumen,
      negaraPengeluaran: item.elibrary_negaraPengeluaran,
      tahunPengeluaran: item.elibrary_tahunPengeluaran,
      ketulenan: item.elibrary_ketulenan,
      maklumatTerperinci: item.elibrary_maklumatTerperinci,
      ulasan: item.elibrary_ulasan,
      mukaSurat: item.elibrary_mukaSurat,
      noDocument: item.elibrary_noDocument,
      namaPemilik: item.elibrary_namaPemilik,
      peralatanDigunakan: item.elibrary_peralatanDigunakan,
      caraSemakan: item.elibrary_caraSemakan,
      dapatan: item.elibrary_dapatan,
      images: item.document.map((doc) => doc.documentURL),
      selectedImage: item.document[0]?.documentURL || null,
    }));

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
