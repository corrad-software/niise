export default defineEventHandler(async (event) => {
  try {
    const { temujanjiID } = event.context.params;

    const temujanji = await prisma.temujanji.findUnique({
      where: { temujanjiID: parseInt(temujanjiID) },
      include: {
        pemohon: true,
        document_temujanji_gambarSubjekTodocument: true,
        document_temujanji_gambarCapJariTodocument: true,
        temujanji_detail: {
          include: {
            document: true,
          }
        }
      },
    });

    if (!temujanji) {
      return {
        statusCode: 404,
        message: "Temujanji tidak dijumpai.",
      };
    }

    return {
      statusCode: 200,
      message: "Temujanji berjaya diperolehi.",
      data: temujanji,
    };
  } catch (error) {
    console.error("Error fetching temujanji:", error);
    return {
      statusCode: 500,
      message: "Gagal mendapatkan maklumat temujanji.",
    };
  }
});
