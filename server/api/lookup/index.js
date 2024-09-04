export default defineEventHandler(async (event) => {
  const { type } = getQuery(event); // Get lookup type from query params, e.g., jenis_barang, dapatan

  if (!type) {
    return {
      statusCode: 400,
      message: "Lookup type is required",
    };
  }

  try {
    const lookups = await prisma.lookup.findMany({
      where: {
        lookupTitle: type,
        lookupStatus: "ACTIVE",
      },
      select: {
        lookupID: true,
        lookupTitle: true,
        lookupValue: true,
      },
    });

    return {
      statusCode: 200,
      data: lookups,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error fetching lookup data",
      error: error.message,
    };
  }
});
