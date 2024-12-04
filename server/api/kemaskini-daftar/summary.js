export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    // Get query parameters
    const query = getQuery(event);
    const status = query.status;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    // Build base where conditions
    let whereConditions = {};

    // Add date filters if provided
    if (startDate || endDate) {
      whereConditions.create_at = {};
      if (startDate) {
        whereConditions.create_at.gte = startDate;
      }
      if (endDate) {
        whereConditions.create_at.lte = endDate;
      }
    }

    // Add status filter if provided
    if (status) {
      whereConditions.status_permohonan = status;
    }

    const summary = {
      jumlahPermohonan: 0,
      jumlahPermohonanDihantar: 0,
      jumlahPermohonanDisemak: 0,
      jumlahPermohonanDiterima: 0,
      jumlahPermohonanDiluluskan: 0,
      jumlahPermohonanDitolak: 0,
      jumlahSemakanHariIni: 0,
    };

    if (roles.includes("Pegawai Kaunter")) {
      // Add role-specific status filter for Pegawai Kaunter
      const kaunterWhereConditions = {
        ...whereConditions,
        status_permohonan: status
          ? { equals: status }
          : {
              in: [
                "Permohonan Dihantar",
                "Permohonan Disemak",
                "Permohonan Diterima",
              ],
            },
      };

      const statusCounts = await prisma.permohonan.groupBy({
        by: ["status_permohonan"],
        _count: {
          id: true,
        },
        where: kaunterWhereConditions,
      });

      statusCounts.forEach((status) => {
        switch (status.status_permohonan) {
          case "Permohonan Dihantar":
            summary.jumlahPermohonanDihantar = status._count.id;
            break;
          case "Permohonan Disemak":
            summary.jumlahPermohonanDisemak = status._count.id;
            break;
          case "Permohonan Diterima":
            summary.jumlahPermohonanDiterima = status._count.id;
            break;
        }
        summary.jumlahPermohonan += status._count.id;
      });
    }

    if (roles.includes("Pegawai Forensik")) {
      // Add role-specific status filter for Pegawai Forensik
      const forensikWhereConditions = {
        ...whereConditions,
        AND: [
          {
            status_permohonan: status
              ? { equals: status }
              : { in: ["Permohonan Diterima", "Permohonan Diluluskan"] },
          },
          {
            permohonan_assign_forensik: {
              some: {
                pegawai_forensikID: userID,
              },
            },
          },
        ],
      };

      const statusCounts = await prisma.permohonan.groupBy({
        by: ["status_permohonan"],
        _count: {
          id: true,
        },
        where: forensikWhereConditions,
      });

      // Reset jumlahPermohonan for Pegawai Forensik
      summary.jumlahPermohonan = 0;

      statusCounts.forEach((status) => {
        switch (status.status_permohonan) {
          case "Permohonan Diterima":
            summary.jumlahPermohonanDiterima = status._count.id;
            break;
          case "Permohonan Diluluskan":
            summary.jumlahPermohonanDiluluskan = status._count.id;
            break;
        }
        summary.jumlahPermohonan += status._count.id;
      });

      // Get today's reviewed cases
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayReviewed = await prisma.permohonan.count({
        where: {
          ...forensikWhereConditions,
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

      summary.jumlahSemakanHariIni = todayReviewed;
    }

    if (roles.includes("Ketua Bahagian")) {
      // Add role-specific status filter for Ketua Bahagian
      const ketuaWhereConditions = {
        ...whereConditions,
        status_permohonan: status
          ? { equals: status }
          : {
              in: [
                "Permohonan Diterima",
                "Permohonan Diluluskan",
                "Permohonan Ditolak",
              ],
            },
      };

      const statusCounts = await prisma.permohonan.groupBy({
        by: ["status_permohonan"],
        _count: {
          id: true,
        },
        where: ketuaWhereConditions,
      });

      // Reset jumlahPermohonan for Ketua Bahagian
      summary.jumlahPermohonan = 0;

      statusCounts.forEach((status) => {
        switch (status.status_permohonan) {
          case "Permohonan Diterima":
            summary.jumlahPermohonanDiterima = status._count.id;
            break;
          case "Permohonan Diluluskan":
            summary.jumlahPermohonanDiluluskan = status._count.id;
            break;
          case "Permohonan Ditolak":
            summary.jumlahPermohonanDitolak = status._count.id;
            break;
        }
        summary.jumlahPermohonan += status._count.id;
      });
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
