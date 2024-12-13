export default defineEventHandler(async (event) => {
  // Extract the `noSiri` from the URL params
  const { noSiri } = event.context.params;
  const { roles } = event.context.user;

  let statusApproval = false;

  let showSection = false;
  let showButtonObj = {
    terima: false,
    tolak: false,
  };

  try {
    // Fetch both Penerimaan and Penolakan status
    const penerimaan = await prisma.permohonan_penerimaan.findFirst({
      where: {
        permohonan: {
          no_siri: noSiri,
        },
      },
      select: {
        penerimaanID: true, // Checking if penerimaan exists
      },
    });

    const penolakan = await prisma.permohonan_penolakan.findFirst({
      where: {
        permohonan: {
          no_siri: noSiri,
        },
      },
      select: {
        penolakanID: true, // Checking if penolakan exists
      },
    });

    // Determine status based on existence
    const statusPenerimaan = penerimaan
      ? "Diterima"
      : penolakan
      ? "Ditolak"
      : "Belum Diterima";

    if (roles.includes("Pegawai Kaunter") || roles.includes("Ketua Bahagian")) {
      showSection = true;
    }

    if (roles.includes("Pegawai Kaunter")) {
      if (!penerimaan && !penolakan) {
        showButtonObj.terima = true;
        showButtonObj.tolak = true;
      } else {
        showButtonObj.terima = false;
        showButtonObj.tolak = false;
      }
    }

    if (roles.includes("Ketua Bahagian")) {
      const status = await prisma.permohonan.findUnique({
        where: { no_siri: noSiri },
        select: { status_permohonan: true },
      });

      const approval = await prisma.permohonan_approval.findFirst({
        where: {
          permohonan: {
            no_siri: noSiri,
          },
        },
      });

      if (status.status_permohonan === "Permohonan Diterima" && !approval) {
        showButtonObj.semak = true;
      } else {
        showButtonObj.semak = false;
        statusApproval = true;
      }
    }

    // Return the statuses
    return {
      statusCode: 200,
      data: {
        statusPenerimaan,
      },
      showSection: showSection,
      showButtonObj: showButtonObj,
      showForensicApproval: statusApproval,
    };
  } catch (error) {
    // Return an error if something goes wrong
    return {
      statusCode: 500,
      message: "Gagal mendapatkan status",
    };
  }
});
