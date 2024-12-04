export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const { userID } = event.context.user;
  const body = await readBody(event);

  try {
    // Find the permohonan by its noSiri with pemohon details
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
      include: {
        pemohon: {
          include: {
            user: true, // This will get us the pemohon's email
          },
        },
      },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Create permohonan_approval entry
    await prisma.permohonan_approval.create({
      data: {
        permohonanID: permohonan.id,
        approve_by: userID,
        approval_status: body.kelulusanKetuaBahagian === "Diterima" ? 1 : 0,
        ulasan: body.ulasanKetuaBahagian,
        approval_date: new Date(),
      },
    });

    // Update the status of the permohonan based on approval
    const newStatus =
      body.kelulusanKetuaBahagian === "Diterima"
        ? "Permohonan Diluluskan"
        : "Permohonan Ditolak";
    await prisma.permohonan.update({
      where: { no_siri: noSiri },
      data: {
        status_permohonan: newStatus,
        user_permohonan_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
    });

    // Send email notification to the pemohon
    if (permohonan.pemohon?.user?.userEmail) {
      await sendMail({
        to: permohonan.pemohon.user.userEmail,
        subject: `Status Permohonan ${noSiri} Telah Dikemaskini`,
        html: `
          <h1>Status Permohonan Anda Telah Dikemaskini</h1>
          <p>No. Siri Permohonan: ${noSiri}</p>
          <p>Status: ${newStatus}</p>
          <p>Ulasan Ketua Bahagian: ${body.ulasanKetuaBahagian || "-"}</p>
          <br>
          <p>Sila log masuk ke sistem untuk melihat butiran lanjut.</p>
        `,
        text: `
          Status Permohonan Anda Telah Dikemaskini
          No. Siri Permohonan: ${noSiri}
          Status: ${newStatus}
          Ulasan Ketua Bahagian: ${body.ulasanKetuaBahagian || "-"}
          
          Sila log masuk ke sistem untuk melihat butiran lanjut.
        `,
      });
    }

    return {
      statusCode: 200,
      message: "Maklumat semakan ketua bahagian berjaya dikemaskini.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Gagal mengemaskini maklumat semakan ketua bahagian.",
    };
  }
});
