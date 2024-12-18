// File: server/api/jana-barang/index.get.js

export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    // Get query parameters
    const query = getQuery(event);
    const noKertasSiasatan = query.noKertasSiasatan;

    // Validate input
    if (!noKertasSiasatan) {
      return {
        statusCode: 400,
        message: "No Kertas Siasatan is required",
      };
    }

    // Find permohonan with the given no_kertas_siasatan
    const permohonan = await prisma.permohonan.findFirst({
      where: {
        no_kertas_siasatan: noKertasSiasatan,
      },
      include: {
        report: {
          select: {
            jenis_barang: true,
            tanda_barang: true,
            keadaan_barang: true,
            kuantiti_barang: true,
            pengesanan_penyamaran: true,
            lookup_report_jenis_barangTolookup: {
              select: {
                lookupTitle: true,
                lookupValue: true,
              },
            },
          },
        },
      },
    });

    if (!permohonan) {
      return {
        statusCode: 404,
        message:
          "Tiada data barang ditemui. Sila pastikan no kertas siasatan adalah betul.",
      };
    }

    // Transform the data
    const barangList = permohonan.report.map((report) => ({
      jenisBarangDetail: report.jenis_barang,
      jenisBarangDetailLabel:
        report.lookup_report_jenis_barangTolookup?.lookupValue || "",
      tandaBarang: report.tanda_barang || "",
      keadaanBarang: report.keadaan_barang || "",
      kuantitiBarang: report.kuantiti_barang || 1,
      pengesananPenyamaran: report.pengesanan_penyamaran || false,
    }));

    return {
      statusCode: 200,
      message: "Berjaya",
      data: barangList,
    };
  } catch (error) {
    console.error("Error fetching barang:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch barang data.",
      error: error.message,
    };
  }
});
