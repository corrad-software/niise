export default defineEventHandler(async (event) => {
  const { reportID } = event.context.params;

  try {
    const report = await prisma.report.findUnique({
      where: { reportID: parseInt(reportID) },
      include: {
        lookup_report_dapatanTolookup: true,
        lookup_report_jenis_barangTolookup: true,
        user_report_create_byTouser: true,
        user_report_modified_byTouser: true,
        report_doc_support: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!report) {
      return {
        statusCode: 404,
        message: "Report not found",
      };
    }

    return {
      statusCode: 200,
      data: report,
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return {
      statusCode: 500,
      message: error.message || "Failed to fetch report details",
    };
  }
}); 