// File: server/api/permohonan/index.get.js
export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    // Get query parameters
    const query = getQuery(event);
    const status = query.status;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    let whereCondition = {};
    const dateCondition = {};

    // Add date filters if provided
    if (startDate || endDate) {
      if (startDate) {
        dateCondition.gte = startDate;
      }
      if (endDate) {
        dateCondition.lte = endDate;
      }
      whereCondition.create_at = dateCondition;
    }

    // Role-based filtering combined with status filter
    if (roles.includes("Pegawai Kaunter")) {
      whereCondition.status_permohonan = status
        ? { equals: status }
        : {
            in: [
              "Permohonan Dihantar",
              "Permohonan Disemak",
              "Permohonan Diterima",
            ],
          };
    } else if (
      roles.includes("Ketua Bahagian") ||
      roles.includes("Pegawai Forensik")
    ) {
      if (roles.includes("Pegawai Forensik")) {
        whereCondition.AND = [
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
        ];
      } else {
        whereCondition.status_permohonan = status
          ? { equals: status }
          : {
              in: [
                "Permohonan Diterima",
                "Permohonan Diluluskan",
                "Permohonan Ditolak",
              ],
            };
      }
    } else {
      // Default condition for other roles
      whereCondition.status_permohonan = status
        ? { equals: status }
        : {
            in: [
              "Permohonan Draf",
              "Permohonan Dihantar",
              "Permohonan Ditolak",
              "Permohonan Diluluskan",
            ],
          };
    }

    const permohonan = await prisma.permohonan.findMany({
      where: whereCondition,
      select: {
        id: true,
        no_siri: true,
        create_at: true,
        status_permohonan: true,
        pemohon: {
          select: {
            nama_pemohon: true,
          },
        },
      },
      orderBy: {
        create_at: "desc",
      },
    });

    return {
      statusCode: 200,
      message: "Success",
      data: permohonan.map((item, index) => {
        // Convert UTC to GMT+8
        const gmt8Date = new Date(
          item.create_at.getTime() + 8 * 60 * 60 * 1000
        );
        return {
          bil: index + 1,
          noSiri: item.no_siri,
          tarikhMasa: gmt8Date.toISOString().replace("T", " ").slice(0, 19),
          status: item.status_permohonan,
          tindakan: item.id,
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching permohonan:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch permohonan data.",
      error: error.message,
    };
  }
});
