export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Build where conditions
    let whereConditions = {};

    if (query.jenisDokumen) {
      whereConditions.elibrary_jenisDokumen = query.jenisDokumen;
    }

    if (query.negaraPengeluaran) {
      whereConditions.elibrary_negaraPengeluaran = {
        contains: query.negaraPengeluaran,
      };
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
            documentCreatedDate: 'desc'
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

    const formattedData = elibrary.map((item, index) => ({
      bil: index + 1,
      jenisDokumen: item.elibrary_jenisDokumen,
      negaraPengeluaran: item.elibrary_negaraPengeluaran,
      tahunPengeluaran: item.elibrary_tahunPengeluaran.toString(),
      ketulenan: item.elibrary_ketulenan,
      perincian: {
        maklumatTerperinci: item.elibrary_maklumatTerperinci || "-",
        ulasan: item.elibrary_ulasan || "-",
        images: item.document || [],
      },
      tindakan: { id: item.elibraryID },
    }));

    return {
      statusCode: 200,
      data: formattedData,
    };
  } catch (error) {
    console.error("Error fetching e-library data:", error);
    return {
      statusCode: 500,
      message: "Error fetching e-library data.",
    };
  }
});
