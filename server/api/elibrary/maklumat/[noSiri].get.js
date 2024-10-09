export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;

  try {
    const logs = await prisma.temujanji_log.findMany({
      where: {
        temujanjiID: parseInt(noSiri),
      },
      orderBy: {
        create_at: "desc",
      },
      take: 10, // Limit to last 10 entries
    });

    if (logs.length === 0) {
      return {
        statusCode: 404,
        message: "No data found for this noSiri.",
      };
    }

    return {
      statusCode: 200,
      data: logs,
    };
  } catch (error) {
    console.error("Error fetching e-library data:", error);
    return {
      statusCode: 500,
      message: "Error fetching e-library data.",
    };
  }
});
