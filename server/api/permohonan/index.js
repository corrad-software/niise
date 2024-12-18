// File: server/api/permohonan/index.get.js
export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    // Get query parameters
    const query = getQuery(event);
    const status = query.status;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;
    const pengesahan = query.pengesahan;

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
              "Permohonan Diterima",
              "Temujanji Diterima",
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
              : {
                  in: [
                    "Permohonan Diterima",
                    "Permohonan Diluluskan",
                    pengesahan ? "Permohonan Dihantar" : undefined,
                  ],
                },
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
                "Temujanji Diterima",
                "Temujanji Ditolak",
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
              "Temujanji Diterima",
              "Temujanji Ditolak",
            ],
          };

      whereCondition.create_by = userID;
    }

    const permohonan = await prisma.permohonan.findMany({
      where: whereCondition,
      select: {
        id: true,
        no_siri: true,
        tarikh_temujanji: true,
        slot_masa: true,
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
      message: "Berjaya",
      data: permohonan.map((item, index) => {
        // Combine date and time
        let tarikhMasa = null;
        if (item.tarikh_temujanji && item.slot_masa) {
          const date = new Date(item.tarikh_temujanji);
          const time = new Date(item.slot_masa);

          // Set the time components from slot_masa to the date
          date.setHours(time.getHours());
          date.setMinutes(time.getMinutes());
          date.setSeconds(time.getSeconds());

          // Convert to GMT+8 and format date
          const gmt8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);

          // Format: DD/MM/YYYY HH:mm
          tarikhMasa = gmt8Date
            .toLocaleString("en-MY", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(",", "");
        }

        return {
          bil: index + 1,
          noSiri: item.no_siri,
          tarikhMasa,
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
