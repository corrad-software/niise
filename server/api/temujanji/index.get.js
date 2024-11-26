export default defineEventHandler(async (event) => {
  try {
    const { roles } = event.context.user;

    let showButtonObj = {
      tambah: false,
      keputusan: false,
      kemaskini: false,
    };

    if (roles.includes("Pegawai Forensik")) {
      showButtonObj.keputusan = true;
      showButtonObj.kemaskini = true;
    }

    if (roles.includes("PDRM")) {
      showButtonObj.tambah = true;
      showButtonObj.keputusan = true;
    }

    const appointments = await prisma.temujanji.findMany({
      include: {
        pemohon: {
          include: {
            user: true,
          },
        }, // Join with pemohon table to get applicant details
      },
    });

    return {
      statusCode: 200,
      data: appointments.map((appointment, index) => ({
        no: index + 1,
        kesId: appointment.temujanjiID,
        namaPemohon: appointment.pemohon.nama_pemohon,
        caraSemakan: appointment.jenisSemakan,
        status: appointment.status || "Pending",
        tindakan: appointment.temujanjiID,
      })),
      showButton: showButtonObj,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Failed to fetch appointments.",
    };
  }
});
