export default defineEventHandler(async (event) => {
  try {
    const { userID } = event.context.user;

    if (!userID) {
      return {
        statusCode: 401,
        message: "Unauthorized",
      };
    }

    // Get user roles
    const userWithRoles = await prisma.user.findUnique({
      where: { userID: parseInt(userID) },
      select: {
        userLastLogin: true,
        userLastLoginIP: true,
        userrole: {
          select: {
            role: {
              select: {
                roleName: true,
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return {
        statusCode: 404,
        message: "User not found",
      };
    }

    const roles = userWithRoles.userrole.map((ur) => ur.role.roleName);
    const role = roles[0]; // Primary role

    // Last login info from user table
    const lastLogin = userWithRoles.userLastLogin
      ? {
          date: new Date(userWithRoles.userLastLogin)
            .toISOString()
            .split("T")[0],
          time: new Date(userWithRoles.userLastLogin)
            .toTimeString()
            .split(" ")[0],
          ip: userWithRoles.userLastLoginIP,
        }
      : null;

    // Get permohonan statistics based on role
    let permohonanStats = {};

    if (["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(role)) {
      const [dihantar, draft, rejected, approved] = await Promise.all([
        prisma.permohonan.count({
          where: {
            create_by: parseInt(userID),
            status_permohonan: "Permohonan Dihantar",
          },
        }),
        prisma.permohonan.count({
          where: {
            create_by: parseInt(userID),
            status_permohonan: "DRAFT",
          },
        }),
        prisma.permohonan.count({
          where: {
            create_by: parseInt(userID),
            status_permohonan: "Permohonan Ditolak",
          },
        }),
        prisma.permohonan.count({
          where: {
            create_by: parseInt(userID),
            status_permohonan: "Permohonan Diluluskan",
          },
        }),
      ]);

      permohonanStats = {
        dihantar,
        draft,
        rejected,
        approved,
      };
    } else if (["Ketua Bahagian", "Pegawai Kaunter"].includes(role)) {
      // For Pegawai Kaunter, we need to handle specific statuses
      const [dihantar, ditolak, diluluskan] = await Promise.all([
        prisma.permohonan.count({
          where: {
            status_permohonan: {
              in: ["Permohonan Dihantar", "Permohonan Diterima"],
            },
          },
        }),
        prisma.permohonan.count({
          where: {
            status_permohonan: {
              in: ["Permohonan Ditolak", "Temujanji Ditolak"],
            },
          },
        }),
        prisma.permohonan.count({
          where: {
            status_permohonan: {
              in: ["Permohonan Diluluskan", "Temujanji Diterima"],
            },
          },
        }),
      ]);

      permohonanStats = {
        dihantar,
        ditolak,
        diluluskan,
      };
    } else if (role === "Pegawai Forensik") {
      const [dihantar, completed] = await Promise.all([
        prisma.permohonan_assign_forensik.count({
          where: {
            pegawai_forensikID: parseInt(userID),
            permohonan: {
              status_permohonan: "Permohonan Dihantar",
            },
          },
        }),
        prisma.permohonan_assign_forensik.count({
          where: {
            pegawai_forensikID: parseInt(userID),
            permohonan: {
              status_permohonan: "Permohonan Diluluskan",
            },
          },
        }),
      ]);

      permohonanStats = {
        dihantar,
        completed,
      };
    }

    // Get monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const monthlyStats = await prisma.permohonan.groupBy({
      by: ["status_permohonan", "create_at"],
      where: {
        create_at: {
          gte: startOfYear,
          lte: endOfYear,
        },
        ...(["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(role) && {
          create_by: parseInt(userID),
        }),
        status_permohonan: {
          in: ["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(role)
            ? [
                "Permohonan Dihantar",
                "Permohonan Disemak",
                "Permohonan Diterima",
                "Permohonan Diluluskan",
                "Permohonan Ditolak",
              ]
            : ["Permohonan Diluluskan", "Temujanji Diterima"], // Include Temujanji Diterima for approved count
        },
      },
      _count: {
        id: true,
      },
    });

    // Transform monthly stats to include month information
    const transformedMonthlyStats = monthlyStats.map((stat) => ({
      status_permohonan: stat.status_permohonan,
      create_at: stat.create_at,
      _count: stat._count.id,
    }));

    // Get evidence type statistics from report table - only for Pegawai Penyiasat
    let evidenceStats = [];
    let transformedEvidenceStats = [];

    if (["Pegawai Penyiasat", "Pegawai Penyiasat JIM"].includes(role)) {
      evidenceStats = await prisma.report.groupBy({
        by: ["jenis_barang"],
        where: {
          create_by: parseInt(userID),
        },
        _count: {
          reportID: true,
        },
      });

      // Get lookup values for evidence types
      const lookupValues = await prisma.lookup.findMany({
        where: {
          lookupID: {
            in: evidenceStats
              .map((stat) => stat.jenis_barang)
              .filter((id) => id !== null),
          },
          lookupTitle: "jenis_barang",
        },
      });

      // Transform evidence stats to include lookup information
      transformedEvidenceStats = evidenceStats.map((stat) => {
        const lookup = lookupValues.find(
          (l) => l.lookupID === stat.jenis_barang
        );
        return {
          jenis_barang: stat.jenis_barang,
          nama: lookup ? lookup.lookupValue : "Lain-lain",
          _count: stat._count.reportID,
        };
      });
    }

    return {
      statusCode: 200,
      message: "Success",
      data: {
        lastLogin,
        stats: permohonanStats,
        monthlyStats: transformedMonthlyStats,
        evidenceStats: transformedEvidenceStats,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      statusCode: 500,
      message: "Failed to fetch dashboard data",
      error: error.message,
    };
  }
});
