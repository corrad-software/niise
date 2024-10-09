export default defineEventHandler(async (event) => {
  try {
    const logs = await prisma.temujanji_log.findMany({
      select: {
        temujanjiLogID: true,
        temujanjiID: true,
        jenisSemakan: true,
        tarikh: true,
        namaPemilik: true,
        noDokumen: true,
        dapatan: true,
      },
      orderBy: {
        tarikh: "desc",
      },
    });

    const formattedLogs = logs.map((log) => ({
      noSiri: log.temujanjiID.toString(),
      pengguna: log.namaPemilik || "N/A",
      subjek: log.jenisSemakan || "N/A",
      tarikh: log.tarikh
        ? new Date(log.tarikh).toLocaleDateString("ms-MY")
        : "N/A",
      aksi: { noSiri: log.temujanjiID.toString() },
    }));

    return {
      statusCode: 200,
      data: formattedLogs,
    };
  } catch (error) {
    console.error("Error fetching e-library data:", error);
    return {
      statusCode: 500,
      message: "Error fetching e-library data.",
    };
  }
});
