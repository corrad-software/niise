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

    // Add role-based conditions
    if (roles.includes("Pegawai Forensik")) {
      whereConditions.permohonan_assign_forensik = {
        some: {
          pegawai_forensikID: userID
        }
      };
    }

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

    // Get status counts with filters
    const statusCounts = await prisma.permohonan.groupBy({
      by: ['status_permohonan'],
      _count: {
        id: true
      },
      where: whereConditions
    });

    const summary = {
      jumlahPermohonan: 0,
      permohonanDraf: 0,
      permohonanDihantar: 0,
      permohonanDitolak: 0,
      permohonanSelesai: 0
    };

    statusCounts.forEach(status => {
      switch (status.status_permohonan) {
        case 'Permohonan Draf':
          summary.permohonanDraf = status._count.id;
          break;
        case 'Permohonan Dihantar':
          summary.permohonanDihantar = status._count.id;
          break;
        case 'Permohonan Ditolak':
          summary.permohonanDitolak = status._count.id;
          break;
        case 'Permohonan Diluluskan':
          summary.permohonanSelesai = status._count.id;
          break;
      }
      summary.jumlahPermohonan += status._count.id;
    });

    return {
      statusCode: 200,
      data: summary
    };
  } catch (error) {
    console.error("Error fetching summary:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch summary data",
      error: error.message
    };
  }
});
