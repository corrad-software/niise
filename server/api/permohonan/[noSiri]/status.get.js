export default defineEventHandler(async (event) => {
  // Extract the `noSiri` from the URL params
  const { noSiri } = event.context.params;
  const { roles } = event.context.user;

  let showSection = false;
  let showButtonObj = {
    semak: false,
    terima: false,
    tolak: false,
  };

  try {
    // Fetch the Semakan status
    const semakan = await prisma.permohonan_semakan.findFirst({
      where: {
        permohonan: {
          no_siri: noSiri,
        },
      },
      select: {
        semakanID: true, // Checking if semakan exists
      },
    });

    // Fetch the Penerimaan status
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

    console.log(semakan, penerimaan);

    // Determine statuses based on existence
    const statusSemakan = semakan ? "Selesai" : "Belum Disemak";
    const statusPenerimaan = penerimaan ? "Diterima" : "Belum Diterima";

    if (roles.includes("Pegawai Kaunter") || roles.includes("Ketua Bahagian")) {
      showSection = true;
    }

    if (roles.includes("Pegawai Kaunter")) {
      if (!semakan && !penerimaan) {
        showButtonObj.semak = true;
        showButtonObj.terima = false;
        showButtonObj.tolak = false;
      } else if (semakan && !penerimaan) {
        showButtonObj.semak = false;
        showButtonObj.terima = true;
        showButtonObj.tolak = true;
      } else if (semakan && penerimaan) {
        showButtonObj.semak = false;
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
      }
    }

    // Return the statuses
    return {
      statusCode: 200,
      data: {
        statusSemakan,
        statusPenerimaan,
      },
      showSection: showSection,
      showButtonObj: showButtonObj,
    };
  } catch (error) {
    // Return an error if something goes wrong
    return {
      statusCode: 500,
      message: "Gagal mendapatkan status",
    };
  }
});
