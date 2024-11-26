export default defineEventHandler(async (event) => {
  try {
    const elibrary = await prisma.elibrary.findMany({
      select: {
        elibraryID: true,
        elibrary_jenisDokumen: true,
        elibrary_negaraPengeluaran: true,
        elibrary_tahunPengeluaran: true,
        elibrary_ketulenan: true,
        elibrary_maklumatTerperinci: true,
        elibrary_ulasan: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedData = elibrary.map((item) => ({
      id: item.elibraryID,
      jenisDokumen: item.elibrary_jenisDokumen,
      negaraPengeluaran: item.elibrary_negaraPengeluaran,
      tahunPengeluaran: item.elibrary_tahunPengeluaran.toString(),
      ketulenan: item.elibrary_ketulenan,
      perincian: {
        maklumatTerperinci: item.elibrary_maklumatTerperinci || "-",
        ulasan: item.elibrary_ulasan || "-",
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
