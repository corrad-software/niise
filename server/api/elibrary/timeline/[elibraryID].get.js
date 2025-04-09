export default defineEventHandler(async (event) => {
  try {
    const elibraryID = event.context.params.elibraryID;

    if (!elibraryID) {
      return {
        statusCode: 400,
        message: "ID e-library diperlukan",
      };
    }

    // Fetch timeline data with user information
    const timeline = await prisma.elibrary_log.findMany({
      where: {
        elibraryID: parseInt(elibraryID),
      },
      include: {
        user: {
          select: {
            userFullName: true,
            userRank: true,
            userOfficerNumber: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Format the timeline data
    const formattedTimeline = timeline.map((log) => {
      const changes = JSON.parse(log.changes);
      let details = "";

      if (log.action === "ADD") {
        details = `${changes.jenisDokumen} - ${changes.negaraPengeluaran} (${changes.tahunPengeluaran})`;
        if (changes.documents) {
          details += `, ${changes.documents} dokumen`;
        }
      } else if (log.action === "EDIT") {
        details = `${changes.jenisDokumen.to} - ${changes.negaraPengeluaran.to} (${changes.tahunPengeluaran.to})`;
      }

      return {
        date: log.created_at,
        title:
          log.action === "ADD" ? "Permohonan Didaftarkan" : "Semakan Dilakukan",
        description: `${log.user.userRank} ${log.user.userFullName} (${
          log.user.userOfficerNumber || "-"
        })`,
        details: details,
        type: log.action.toLowerCase(),
        user: {
          nama: log.user.userFullName,
          pangkat: log.user.userRank,
          noPegawai: log.user.userOfficerNumber,
        },
      };
    });

    return {
      statusCode: 200,
      message: "Timeline data retrieved successfully",
      data: formattedTimeline,
    };
  } catch (error) {
    console.error("Error fetching timeline data:", error);
    return {
      statusCode: 500,
      message: "Error fetching timeline data",
      error: error.message,
    };
  }
});
