export default defineEventHandler(async (event) => {
  const { temujanjiID } = event.context.params;

  try {
    // Get temujanji record to access related IDs
    const temujanji = await prisma.temujanji.findUnique({
      where: { temujanjiID: parseInt(temujanjiID) },
      select: {
        temujanjiDetailID: true,
        pemohonID: true,
      },
    });

    if (!temujanji) {
      return { statusCode: 404, message: "Temujanji tidak dijumpai" };
    }

    // Delete the temujanji record first
    await prisma.temujanji.delete({
      where: { temujanjiID: parseInt(temujanjiID) },
    });

    // Then delete temujanji_detail if exists
    if (temujanji.temujanjiDetailID) {
      await prisma.temujanji_detail.delete({
        where: { temujanjiDetailID: temujanji.temujanjiDetailID },
      });
    }

    // Finally delete pemohon if exists
    if (temujanji.pemohonID) {
      await prisma.pemohon.delete({
        where: { id: temujanji.pemohonID },
      });
    }

    return { statusCode: 200, message: "Berjaya" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: error.message };
  }
});
