export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    // Build where conditions
    let whereConditions = {};

    if (query.jenisDokumen) {
      whereConditions.elibrary_jenisDokumen = {
        contains: query.jenisDokumen,
      };
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

    // Get total documents
    const jumlahDokumen = await prisma.elibrary.count({
      where: whereConditions,
    });

    // Get count of genuine documents
    const jumlahDokumenTulen = await prisma.elibrary.count({
      where: {
        ...whereConditions,
        elibrary_ketulenan: "TULEN",
      },
    });

    // Get count of fake documents
    const jumlahDokumenPalsu = await prisma.elibrary.count({
      where: {
        ...whereConditions,
        elibrary_ketulenan: "PALSU",
      },
    });

    return {
      statusCode: 200,
      data: {
        jumlahDokumen,
        jumlahDokumenTulen,
        jumlahDokumenPalsu,
      },
    };
  } catch (error) {
    console.error("Error fetching e-library summary:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch summary data",
      error: error.message,
    };
  }
});
