// File: server/api/permohonan/index.get.js
export default defineEventHandler(async () => {
  try {
    const permohonan = await prisma.permohonan.findMany({
      select: {
        id: true,
        no_siri: true,
        create_at: true,
        status_permohonan: true,
      },
    });

    return {
      statusCode: 200,
      message: "Success",
      data: permohonan.map((item, index) => ({
        no: index + 1,
        noSiri: item.no_siri,
        tarikhMasa: item.create_at.toISOString().replace("T", " ").slice(0, 19),
        status: item.status_permohonan,
        butiran: item.id,
      })),
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to fetch permohonan data.",
    };
  }
});
