// File: server/api/permohonan/[noSiri].delete.js
export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;

  if (!noSiri) {
    return {
      statusCode: 400,
      message: "noSiri is required.",
    };
  }

  try {
    await prisma.permohonan.delete({
      where: { no_siri: noSiri },
    });

    return {
      statusCode: 200,
      message: "Permohonan successfully deleted.",
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to delete permohonan.",
    };
  }
});
