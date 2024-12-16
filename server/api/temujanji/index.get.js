export default defineEventHandler(async (event) => {
  try {
    const { roles } = event.context.user;
    // Get query parameters
    const query = getQuery(event);
    const status = query.status;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    let showButtonObj = {
      tambah: false,
      keputusan: false,
      kemaskini: false,
    };

    if (roles.includes("Pegawai Forensik")) {
      showButtonObj.keputusan = true;
      showButtonObj.kemaskini = true;
    }

    // Build where conditions for report
    let whereConditions = {
      pengesanan_penyamaran: true,
      permohonan: {
        NOT: {
          status_permohonan: {
            in: ["Temujanji Ditolak", "Permohonan Ditolak"]
          }
        }
      }
    };

    // Add date filter conditions
    if (startDate || endDate) {
      whereConditions.create_at = {};
      if (startDate) {
        whereConditions.create_at.gte = startDate;
      }
      if (endDate) {
        whereConditions.create_at.lte = endDate;
      }
    }

    const reports = await prisma.report.findMany({
      where: whereConditions,
      include: {
        permohonan: {
          include: {
            pemohon: true,
          },
        },
        permohonan_detail: true,
      },
    });

    return {
      statusCode: 200,
      data: reports.map((report, index) => ({
        bil: index + 1,
        noSiri: report.permohonan?.no_siri || "-",
        namaPemohon: report.permohonan?.pemohon?.nama_pemohon || "-",
        caraSemakan: report.permohonan_detail?.caraSemakan || "-",
        status: report.permohonan?.status_permohonan || "Pending",
        tindakan: {
          id: report.reportID,
          disabled: !(
            report.permohonan_detail?.dapatan === "Sama" ||
            report.permohonan_detail?.dapatan === "Tidak Sama" ||
            report.permohonan_detail?.dapatan === "Tidak Dapat Dikenalpasti"
          ),
        },
      })),
      showButton: showButtonObj,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Failed to fetch report list.",
    };
  }
});
