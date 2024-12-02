// File: /api/permohonan/[noSiri]/reports.get.js

export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const { roles } = event.context.user;

  try {
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
      select: {
        report: {
          include: {
            lookup_report_jenis_barangTolookup: true, // To get the jenis barang lookup data
          },
        },
      },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Map reports to the frontend format
    const reports = permohonan.report.map((report, index) => {
      const baseReport = {
        bil: index + 1,
        jenisBarang: report.lookup_report_jenis_barangTolookup.lookupValue,
        tagNo: report.tanda_barang,
        keadaan: report.keadaan_barang,
        kuantiti: report.kuantiti_barang,
      };

      // Only add tindakan field if user has Pegawai Forensik role
      if (roles.includes("Pegawai Forensik")) {
        baseReport.tindakan = report.reportID;
      }

      return baseReport;
    });

    return {
      statusCode: 200,
      data: reports,
    };
  } catch (error) {
    return { statusCode: 500, message: "Error fetching reports." };
  }
});
