export default defineEventHandler(async (event) => {
  try {
    const noSiri = event.context.params.noSiri;

    // Get permohonan details with all related officer information
    const appointment = await prisma.permohonan.findUnique({
      where: {
        no_siri: noSiri,
      },
      include: {
        // Get pemohon details
        pemohon: {
          include: {
            user: true,
          },
        },
        // Get penghantar details
        penghantar: true,
        // Get pegawai kaunter details from penerimaan/penolakan
        permohonan_penerimaan: {
          include: {
            user: true,
          },
        },
        permohonan_penolakan: {
          include: {
            user: true,
          },
        },
        // Get ketua bahagian details from approval
        permohonan_approval: {
          include: {
            user: true,
          },
        },
      },
    });

    // Format the response
    const formattedResponse = {
      pegawaiPemohon: appointment?.pemohon?.user
        ? {
            bil: 1,
            nama: appointment.pemohon.user.userFullName,
            pangkat: appointment.pemohon.user.userRank,
            noPegawai: appointment.pemohon.user.userOfficerNumber,
          }
        : null,
      pegawaiPenghantar: appointment?.penghantar
        ? {
            bil: 2,
            nama: appointment.penghantar.nama_penghantar,
            pangkat: appointment.penghantar.pangkat_penghantar,
            noPegawai: appointment.penghantar.no_pegawai_penghantar,
          }
        : null,
      pegawaiKaunter: appointment?.permohonan_penerimaan?.user
        ? {
            bil: 3,
            nama: appointment.permohonan_penerimaan.user.userFullName,
            pangkat: appointment.permohonan_penerimaan.user.userRank,
            noPegawai: appointment.permohonan_penerimaan.user.userOfficerNumber,
          }
        : appointment?.permohonan_penolakan?.user
        ? {
            bil: 3,
            nama: appointment.permohonan_penolakan.user.userFullName,
            pangkat: appointment.permohonan_penolakan.user.userRank,
            noPegawai: appointment.permohonan_penolakan.user.userOfficerNumber,
          }
        : null,
      ketuaBahagian: appointment?.permohonan_approval?.[0]?.user
        ? {
            bil: 4,
            nama: appointment.permohonan_approval[0].user.userFullName,
            pangkat: appointment.permohonan_approval[0].user.userRank,
            noPegawai:
              appointment.permohonan_approval[0].user.userOfficerNumber,
          }
        : null,
    };

    return {
      statusCode: 200,
      data: formattedResponse,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal server error",
    };
  }
});
