export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const { userID } = event.context.user;
  const body = await readBody(event);

  try {
    // Get the current permohonan
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    await prisma.permohonan.update({
      where: { id: permohonan.id },
      data: {
        status_permohonan:
          body.status == "Diterima"
            ? "Temujanji Diterima"
            : "Temujanji Ditolak",
        user_permohonan_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
    });

    return {
      statusCode: 200,
      message: "Status permohonan berjaya dikemaskini.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Gagal mengemaskini maklumat penerimaan.",
    };
  }
});
