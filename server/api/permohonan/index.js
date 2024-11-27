// File: server/api/permohonan/index.get.js
export default defineEventHandler(async (event) => {
  try {
    const { userID, roles } = event.context.user;

    let whereCondition = {};

    // Role-based filtering
    if (roles.includes("Pegawai Kaunter")) {
      whereCondition = {
        status_permohonan: {
          in: ["Permohonan Dihantar", "Permohonan Disemak"],
        },
      };
    } else if (
      roles.includes("Ketua Bahagian") ||
      roles.includes("Pegawai Forensik")
    ) {
      whereCondition = {
        status_permohonan: {
          in: [
            "Permohonan Diterima",
            "Permohonan Diluluskan",
            "Permohonan Ditolak",
          ],
        },
      };

      // Additional filter for Pegawai Forensik to only show assigned cases
      if (roles.includes("Pegawai Forensik")) {
        whereCondition = {
          AND: [
            {
              status_permohonan: {
                in: ["Permohonan Diterima", "Permohonan Diluluskan"],
              },
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
      }
    } else {
      // Default condition for other roles
      whereCondition = {
        status_permohonan: {
          notIn: ["Permohonan Ditolak"],
        },
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
          no: index + 1,
          noSiri: item.no_siri,
          tarikhMasa: gmt8Date.toISOString().replace("T", " ").slice(0, 19),
          status: item.status_permohonan,
          pemohon: item.pemohon?.nama_pemohon || "-",
          butiran: item.id,
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
