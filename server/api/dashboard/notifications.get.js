export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    if (!userID) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    let whereCondition = {};

    // Role-based filtering
    if (roles.includes("Pegawai Kaunter")) {
      whereCondition.status_permohonan = {
        in: [
          "Permohonan Dihantar",
          "Permohonan Diterima",
          "Temujanji Diterima",
        ],
      };
    } else if (roles.includes("Ketua Bahagian")) {
      whereCondition.status_permohonan = {
        in: [
          "Permohonan Diterima",
          "Permohonan Diluluskan",
          "Permohonan Ditolak",
          "Temujanji Diterima",
          "Temujanji Ditolak",
        ],
      };
    } else if (roles.includes("Pegawai Forensik")) {
      whereCondition.AND = [
        {
          status_permohonan: {
            in: [
              "Permohonan Diterima",
              "Permohonan Diluluskan",
              "Permohonan Dihantar",
            ],
          },
        },
        {
          permohonan_assign_forensik: {
            some: {
              pegawai_forensikID: parseInt(userID),
            },
          },
        },
      ];
    } else {
      // For Pegawai Penyiasat and others
      whereCondition = {
        create_by: parseInt(userID),
        status_permohonan: {
          in: [
            "Permohonan Draf",
            "Permohonan Dihantar",
            "Permohonan Ditolak",
            "Permohonan Diluluskan",
            "Temujanji Diterima",
            "Temujanji Ditolak",
          ],
        },
      };
    }

    // Get recent permohonan
    const recentPermohonan = await prisma.permohonan.findMany({
      where: whereCondition,
      select: {
        no_siri: true,
        status_permohonan: true,
        create_at: true,
        pemohon: {
          select: {
            nama_pemohon: true,
          },
        },
      },
      orderBy: {
        create_at: "desc",
      },
      take: 5,
    });

    // Format notifications
    const formattedNotifications = recentPermohonan.map(item => {
      let title = "";
      let message = "";

      switch (item.status_permohonan) {
        case "Permohonan Dihantar":
          title = "Permohonan Baru";
          message = `Permohonan #${item.no_siri} telah dihantar oleh ${item.pemohon?.nama_pemohon || 'pemohon'}`;
          break;
        case "Permohonan Diterima":
          title = "Permohonan Diterima";
          message = `Permohonan #${item.no_siri} telah diterima`;
          break;
        case "Permohonan Diluluskan":
          title = "Permohonan Diluluskan";
          message = `Permohonan #${item.no_siri} telah diluluskan`;
          break;
        case "Permohonan Ditolak":
          title = "Permohonan Ditolak";
          message = `Permohonan #${item.no_siri} telah ditolak`;
          break;
        case "Temujanji Diterima":
          title = "Temujanji Diterima";
          message = `Temujanji untuk permohonan #${item.no_siri} telah diterima`;
          break;
        case "Temujanji Ditolak":
          title = "Temujanji Ditolak";
          message = `Temujanji untuk permohonan #${item.no_siri} telah ditolak`;
          break;
        default:
          title = "Permohonan Update";
          message = `Status permohonan #${item.no_siri} telah dikemaskini ke ${item.status_permohonan}`;
      }

      // Calculate time ago
      const timeAgo = calculateTimeAgo(item.create_at);

      return {
        title,
        message,
        time: timeAgo,
      };
    });

    return {
      statusCode: 200,
      message: "Berjaya",
      data: formattedNotifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch notifications",
      error: error.message,
    };
  }
});

// Helper function to calculate time ago
function calculateTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) {
    return "Baru sahaja";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  }
}