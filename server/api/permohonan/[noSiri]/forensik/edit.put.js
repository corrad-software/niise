export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const body = await readBody(event);
  const { newPegawaiID, assignID } = body;

  try {
    // Fetch the existing permohonan
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Check if the new pegawai is already assigned
    const existingAssignment =
      await prisma.permohonan_assign_forensik.findFirst({
        where: {
          permohonanID: permohonan.id,
          pegawai_forensikID: newPegawaiID,
        },
      });

    if (existingAssignment) {
      return { statusCode: 400, message: "Pegawai baru sudah ditugaskan." };
    }

    // Get the new pegawai's details for email
    const newPegawai = await prisma.user.findUnique({
      where: { userID: newPegawaiID },
      select: {
        userEmail: true,
        userFullName: true,
      },
    });

    // Update the old pegawai with the new pegawai
    await prisma.permohonan_assign_forensik.update({
      where: {
        assignID: assignID,
      },
      data: {
        pegawai_forensikID: newPegawaiID,
      },
    });

    // Send email notification to the new Pegawai Forensik
    if (newPegawai?.userEmail) {
      await sendMail({
        to: newPegawai.userEmail,
        subject: `Tugasan Baru: Permohonan ${noSiri}`,
        html: `
          <h1>Anda Telah Ditugaskan Untuk Menyemak Permohonan</h1>
          <p>No. Siri Permohonan: ${noSiri}</p>
          <p>Anda telah ditugaskan untuk mengambil alih pemeriksaan permohonan ini.</p>
          <p>Sila log masuk ke sistem untuk menyemak permohonan ini.</p>
        `,
        text: `
          Anda Telah Ditugaskan Untuk Menyemak Permohonan
          No. Siri Permohonan: ${noSiri}
          Anda telah ditugaskan untuk mengambil alih pemeriksaan permohonan ini.
          Sila log masuk ke sistem untuk menyemak permohonan ini.
        `,
      });
    }

    return { statusCode: 200, message: "Pegawai berjaya dikemaskini." };
  } catch (error) {
    console.log(error);
    return { statusCode: 500, message: "Error updating forensic officer." };
  }
});
