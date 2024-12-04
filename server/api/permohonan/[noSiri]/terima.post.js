export default defineEventHandler(async (event) => {
  const { noSiri } = event.context.params;
  const { userID } = event.context.user;
  const body = await readBody(event);

  try {
    // Get the current permohonan
    const permohonan = await prisma.permohonan.findUnique({
      where: { no_siri: noSiri },
    });

    if (!permohonan) {
      return { statusCode: 404, message: "Permohonan tidak dijumpai." };
    }

    // Create or update the permohonan penerimaan entry
    await prisma.permohonan_penerimaan.upsert({
      where: {
        permohonanID: permohonan.id,
      },
      update: {
        peralatan_keadaan_baik: body.peralatanBaik === "Ya" ? 1 : 0,
        pegawai_berkelayakan: body.pegawaiBerkelayakan === "Ya" ? 1 : 0,
        kaedah_dpt_dilakukan: body.kaedahDapatDilakukan === "Ya" ? 1 : 0,
        subkontrak_diperlukan: body.subkontrakDiperlukan === "Ya" ? 1 : 0,
        tugasan_diterima: body.tugasanDiterima === "Ya" ? 1 : 0,
        ulasan_pegawai: body.ulasanPegawaiKaunter,
        diterima_oleh: userID,
        create_at: new Date(),
      },
      create: {
        permohonanID: permohonan.id,
        peralatan_keadaan_baik: body.peralatanBaik === "Ya" ? 1 : 0,
        pegawai_berkelayakan: body.pegawaiBerkelayakan === "Ya" ? 1 : 0,
        kaedah_dpt_dilakukan: body.kaedahDapatDilakukan === "Ya" ? 1 : 0,
        subkontrak_diperlukan: body.subkontrakDiperlukan === "Ya" ? 1 : 0,
        tugasan_diterima: body.tugasanDiterima === "Ya" ? 1 : 0,
        ulasan_pegawai: body.ulasanPegawaiKaunter,
        diterima_oleh: userID,
        create_at: new Date(),
      },
    });

    // Update the status of the permohonan
    await prisma.permohonan.update({
      where: { no_siri: noSiri },
      data: {
        status_permohonan: "Permohonan Diterima",
        user_permohonan_modified_byTouser: {
          connect: {
            userID: userID,
          },
        },
        modified_at: new Date(),
      },
    });

    // Get all Ketua Bahagian users
    const ketuaBahagianUsers = await prisma.user.findMany({
      where: {
        userrole: {
          some: {
            role: {
              roleName: "Ketua Bahagian",
            },
          },
        },
      },
      select: {
        userEmail: true,
        userFullName: true,
      },
    });

    // Send email notifications to all Ketua Bahagian users
    for (const ketuaBahagian of ketuaBahagianUsers) {
      if (ketuaBahagian.userEmail) {
        await sendMail({
          to: ketuaBahagian.userEmail,
          subject: `Permohonan Baru Untuk Semakan: ${noSiri}`,
          html: `
            <h1>Permohonan Baru Memerlukan Semakan Anda</h1>
            <p>No. Siri Permohonan: ${noSiri}</p>
            <p>Status: Permohonan Diterima</p>
            <p>Ulasan Pegawai Kaunter: ${body.ulasanPegawaiKaunter || "-"}</p>
            <br>
            <p>Sila log masuk ke sistem untuk menyemak permohonan ini.</p>
          `,
          text: `
            Permohonan Baru Memerlukan Semakan Anda
            No. Siri Permohonan: ${noSiri}
            Status: Permohonan Diterima
            Ulasan Pegawai Kaunter: ${body.ulasanPegawaiKaunter || "-"}
            
            Sila log masuk ke sistem untuk menyemak permohonan ini.
          `,
        });
      }
    }

    return {
      statusCode: 200,
      message: "Maklumat penerimaan berjaya dikemaskini.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Gagal mengemaskini maklumat penerimaan.",
    };
  }
});
