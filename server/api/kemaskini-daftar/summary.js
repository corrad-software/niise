export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    // Get query parameters
    const query = getQuery(event);
    const status = query.status;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    // Build where conditions
    let whereConditions = {};

    // Add filter conditions
    if (status) {
      whereConditions.status_permohonan = status;
    }

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
      jumlahPermohonan: 0,
      jumlahPermohonanDihantar: 0,
      jumlahPermohonanDisemak: 0,
      jumlahSemakanHariIni: 0,
      jumlahPermohonanDiluluskan: 0,
    };

    if (roles.includes("Pegawai Kaunter")) {
      // Get counts for Pegawai Kaunter
      const statusCounts = await prisma.permohonan.groupBy({
        by: ["status_permohonan"],
        _count: {
          id: true,
        },
        where: whereConditions,
      });

      statusCounts.forEach((status) => {
        if (status.status_permohonan === "Permohonan Dihantar") {
          summary.jumlahPermohonanDihantar = status._count.id;
        } else if (status.status_permohonan === "Permohonan Disemak") {
          summary.jumlahPermohonanDisemak = status._count.id;
        }
        summary.jumlahPermohonan += status._count.id;
      });
    }

    if (roles.includes("Pegawai Forensik")) {
      // Get total assigned cases
      const totalAssigned = await prisma.permohonan.count({
        where: {
          ...whereConditions,
          permohonan_assign_forensik: {
            some: {
              pegawai_forensikID: userID,
            },
          },
        },
      });

      // Get today's reviewed cases
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReviewed = await prisma.permohonan.count({
        where: {
          permohonan_assign_forensik: {
            some: {
              pegawai_forensikID: userID,
              modified_at: {
                gte: today,
              },
            },
          },
        },
      });

      summary.jumlahPermohonan = totalAssigned;
      summary.jumlahSemakanHariIni = todayReviewed;
    }

    if (roles.includes("Ketua Bahagian")) {
      // Get counts for Ketua Bahagian for status "Permohonan Diluluskan"
      const approvedCount = await prisma.permohonan.count({
        where: {
          ...whereConditions,
          status_permohonan: "Permohonan Diluluskan",
        },
      });
      summary.jumlahPermohonanDiluluskan = approvedCount;
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
