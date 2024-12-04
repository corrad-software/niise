export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const body = await readBody(event);
  const { pegawaiID } = body;

  try {
    // Ensure that the permohonan exists
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Ensure that the pegawai is not already assigned
    const existingAssignment =
      await prisma.permohonan_assign_forensik.findFirst({
        where: {
          permohonanID: permohonan.id,
          pegawai_forensikID: pegawaiID,
        },
      });

    if (existingAssignment) {
      return { statusCode: 400, message: "Pegawai sudah ditugaskan." };
    }

    // Assign the pegawai to this permohonan
    const assignment = await prisma.permohonan_assign_forensik.create({
      data: {
        permohonanID: permohonan.id,
        pegawai_forensikID: pegawaiID,
        modified_at: new Date(),
      },
      include: {
        user: true, // Include user data to get email
      },
    });

    // Send email notification to the assigned Pegawai Forensik
    if (assignment.user?.userEmail) {
      await sendMail({
        to: assignment.user.userEmail,
        subject: `Tugasan Baru: Permohonan ${noSiri}`,
        html: `
          <h1>Anda Telah Ditugaskan Untuk Menyemak Permohonan</h1>
          <p>No. Siri Permohonan: ${noSiri}</p>
          <p>Sila log masuk ke sistem untuk menyemak permohonan ini.</p>
        `,
        text: `
          Anda Telah Ditugaskan Untuk Menyemak Permohonan
          No. Siri Permohonan: ${noSiri}
          Sila log masuk ke sistem untuk menyemak permohonan ini.
        `,
      });
    }

    return { statusCode: 200, message: "Pegawai berjaya ditambah." };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Error adding forensic officer." };
  }
});
