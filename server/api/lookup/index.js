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

    // Transform the lookups data to the required format
    const transformedLookups = [
      { label: "", value: null }, // Add an empty option as the first item
      ...lookups.map((lookup) => ({
        label: lookup.lookupValue,
        value: lookup.lookupID,
      })),
    ];

    return {
      statusCode: 200,
      data: transformedLookups,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Error fetching lookup data",
      error: error.message,
    };
  }
});
