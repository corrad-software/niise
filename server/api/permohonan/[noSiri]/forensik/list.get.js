export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const { roles } = event.context.user;

  let showSection = false;

  if (!roles.includes("Ketua Bahagian")) {
    return { statusCode: 200, data: [], showSection: false };
  }

  try {
    // Fetch the permohonan by noSiri
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
      select: {
        permohonan_assign_forensik: {
          include: {
            user: {
              select: {
                userID: true,
                userFullName: true,
                userUsername: true,
              },
            },
          },
        },
        status_permohonan: true,
      },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Return the list of assigned forensic officers
    const forensicOfficers = permohonan.permohonan_assign_forensik.map(
      (assignment, index) => ({
        bil: index + 1,
        nama: assignment.user.userFullName,
        tindakan: {
          userID: assignment.user.userID,
          assignID: assignment.assignID,
        },
      })
    );

    // Check status of permohonan
    const status = permohonan.status_permohonan;

    if (status === "Permohonan Diluluskan") {
      showSection = true;
    }

    return {
      statusCode: 200,
      data: forensicOfficers,
      showSection: showSection,
    };
  } catch (error) {
    return { statusCode: 500, message: "Error fetching forensic officers." };
  }
});
