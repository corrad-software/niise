export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    // Get query parameters
    const query = getQuery(event);
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    // Build where conditions
    let whereConditions = {
      pengesanan_penyamaran: true,
      permohonan: {
        NOT: {
          status_permohonan: {
            in: ["Temujanji Ditolak", "Permohonan Ditolak"],
          },
        },
      },
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

    const summary = {
      jumlahTemujanji: 0,
      jumlahTemujanjiDiterima: 0,
      jumlahTemujanjiSelesai: 0,
      jumlahTemujanjiHariIni: 0,
    };

    if (roles.includes("Pegawai Penyiasat")) {
      // Get all pemohon records for the user
      const pemohonList = await prisma.pemohon.findMany({
        where: {
          userID: userID,
        },
      });

      if (pemohonList.length > 0) {
        // Get pemohon IDs
        const pemohonIDs = pemohonList.map((p) => p.id);

        // Get total reports with pengesanan_penyamaran across all pemohon IDs
        const totalReports = await prisma.report.count({
          where: {
            ...whereConditions,
            permohonan: {
              ...whereConditions.permohonan,
              pemohonID: {
                in: pemohonIDs,
              },
            },
          },
        });

        // Get counts by status
        const diterima = await prisma.report.count({
          where: {
            ...whereConditions,
            permohonan: {
              ...whereConditions.permohonan,
              pemohonID: {
                in: pemohonIDs,
              },
              status_permohonan: "Temujanji Diterima",
            },
          },
        });

        const selesai = await prisma.report.count({
          where: {
            ...whereConditions,
            permohonan: {
              ...whereConditions.permohonan,
              pemohonID: {
                in: pemohonIDs,
              },
              status_permohonan: "Temujanji Selesai",
            },
          },
        });

        summary.jumlahTemujanji = totalReports;
        summary.jumlahTemujanjiDiterima = diterima;
        summary.jumlahTemujanjiSelesai = selesai;
      }
    }

    if (roles.includes("Pegawai Forensik")) {
      // Get total reports with pengesanan_penyamaran
      const totalReports = await prisma.report.count({
        where: whereConditions,
      });

      // Get today's reports
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReports = await prisma.report.count({
        where: {
          ...whereConditions,
          create_at: {
            gte: today,
          },
        },
      });

      summary.jumlahTemujanji = totalReports;
      summary.jumlahTemujanjiHariIni = todayReports;
    }

    return {
      statusCode: 200,
      data: summary,
    };
  } catch (error) {
    console.error("Error fetching summary:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch summary data",
      error: error.message,
    };
  }
});
