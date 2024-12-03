export default defineEventHandler(async (event) => {
  try {
    const { roles } = event.context.user;
    // Get query parameters
    const query = getQuery(event);
    const status = query.status;
    const startDate = query.startDate ? new Date(query.startDate) : null;
    const endDate = query.endDate ? new Date(query.endDate) : null;

    // Build where conditions
    let whereConditions = {};

    // Add status filter
    if (status) {
      whereConditions.status = status;
    }

    // Add date filter conditions
    if (startDate || endDate) {
      whereConditions.create_at = {};
      if (startDate) {
        whereConditions.create_at.gte = startDate;
      }
      if (endDate) {
        whereConditions.create_at.lte = endDate;
      }
    }

    let showButtonObj = {
      tambah: false,
      keputusan: false,
      kemaskini: false,
    };

    if (roles.includes("Pegawai Forensik")) {
      showButtonObj.keputusan = true;
      showButtonObj.kemaskini = true;
    }

    if (roles.includes("Pegawai Penyiasat")) {
      showButtonObj.tambah = true;
      showButtonObj.keputusan = true;
    }

    const appointments = await prisma.temujanji.findMany({
      where: whereConditions,
      include: {
        pemohon: {
          include: {
            user: true,
          },
        },
        temujanji_detail: true,
      },
    });

    console.log(appointments[0].temujanji_detail.dapatan);

    return {
      statusCode: 200,
      data: appointments.map((appointment, index) => ({
        bil: index + 1,
        kesId: appointment.temujanjiID,
        namaPemohon: appointment.pemohon.nama_pemohon,
        caraSemakan: appointment.jenisSemakan,
        status: appointment.status || "Pending",
        tindakan: {
          id: appointment.temujanjiID,
          disabled:
            appointment.temujanji_detail.dapatan != "Sama" &&
            appointment.temujanji_detail.dapatan != "Tidak Sama" &&
            appointment.temujanji_detail.dapatan != "Tidak Dapat Dikenalpasti"
              ? true
              : false,
        },
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
