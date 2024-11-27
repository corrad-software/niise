export default defineEventHandler(async (event) => {
  try {
    const dokumenLibrary = await prisma.dokumen_library.findMany({
      select: {
        dokumenLibraryID: true,
        reportID: true,
        negaraPengeluaran: true,
        tahunPengeluaran: true,
        mukaSurat: true,
        noDocument: true,
        namaPemilik: true,
        peralatanDigunakan: true,
        caraSemakan: true,
        dapatan: true,
        ulasan: true,
        create_at: true,
        report: {
          select: {
            reportID: true,
            permohonan: {
              select: {
                no_siri: true
              }
            }
          }
        }
      },
      orderBy: {
        create_at: 'desc'
      }
    });

    const formattedData = dokumenLibrary.map((item) => ({
      id: item.dokumenLibraryID,
      noSiri: item.report?.permohonan?.no_siri || '-',
      negaraPengeluaran: item.negaraPengeluaran,
      tahunPengeluaran: item.tahunPengeluaran,
      mukaSurat: item.mukaSurat,
      noDocument: item.noDocument,
      namaPemilik: item.namaPemilik,
      perincian: {
        peralatanDigunakan: item.peralatanDigunakan || '-',
        caraSemakan: item.caraSemakan || '-',
        dapatan: item.dapatan || '-',
        ulasan: item.ulasan || '-'
      },
      tindakan: { id: item.dokumenLibraryID }
    }));

    return {
      statusCode: 200,
      data: formattedData
    };
  } catch (error) {
    console.error("Error fetching dokumen library data:", error);
    return {
      statusCode: 500,
      message: "Error fetching dokumen library data."
    };
  }
}); 