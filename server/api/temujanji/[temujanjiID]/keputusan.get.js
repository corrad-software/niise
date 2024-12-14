export default defineEventHandler(async (event) => {
  try {
    const { temujanjiID } = event.context.params;

    const report = await prisma.report.findFirst({
      where: {
        reportID: parseInt(temujanjiID),
        pengesanan_penyamaran: true,
        permohonan: {
          NOT: {
            status_permohonan: {
              in: ["Temujanji Ditolak", "Permohonan Ditolak"],
            },
          },
        },
      },
      include: {
        permohonan: {
          include: {
            pemohon: true,
          },
        },
        permohonan_detail: {
          include: {
            document: true,
            document_permohonan_detail_gambarCapJariTodocument: true,
            document_permohonan_detail_gambarSubjekTodocument: true,
          },
        },
      },
    });

    if (!report) {
      return {
        statusCode: 404,
        message: "Report tidak dijumpai.",
      };
    }

    return {
      statusCode: 200,
      message: "Report berjaya diperolehi.",
      data: {
        reportID: report.reportID,
        permohonanID: report.permohonanID,
        tarikh: report.permohonan?.tarikh_temujanji,
        masa: report.permohonan?.slot_masa,
        pemohon: {
          nama: report.permohonan?.pemohon?.nama_pemohon,
          jawatan: report.permohonan?.pemohon?.pangkat_pemohon,
          noPegawai: report.permohonan?.pemohon?.no_pegawai_pemohon,
        },
        jenisSemakan: report.jenisSemakan,
        gambarSubjek:
          report.permohonan_detail
            ?.document_permohonan_detail_gambarSubjekTodocument?.documentURL,
        gambarCapJari:
          report.permohonan_detail
            ?.document_permohonan_detail_gambarCapJariTodocument?.documentURL,
        temujanji_detail: {
          jenisDokumen: report.permohonan_detail?.jenisDokumen,
          negara: report.permohonan_detail?.negara,
          namaPemilik: report.permohonan_detail?.namaPemilik,
          noDokumen: report.permohonan_detail?.noDokumen,
          kewarganegaraan: report.permohonan_detail?.kewarganegaraan,
          tarikhLahir: report.permohonan_detail?.tarikhLahir,
          jantina: report.permohonan_detail?.jantina,
          tarikhLuputDokumen: report.permohonan_detail?.tarikhLuputDokumen,
          skorPersamaanMuka: report.permohonan_detail?.skorPersamaanMuka,
          skorPersamaanCapJari: report.permohonan_detail?.skorPersamaanCapJari,
          umur: report.permohonan_detail?.umur,
          tinggi: report.permohonan_detail?.tinggi,
          warnaRambut: report.permohonan_detail?.warnaRambut,
          bangsa: report.permohonan_detail?.bangsa,
          etnik: report.permohonan_detail?.etnik,
          bentukKepala: report.permohonan_detail?.bentukKepala,
          mata: report.permohonan_detail?.mata,
          telinga: report.permohonan_detail?.telinga,
          hidung: report.permohonan_detail?.hidung,
          mulut: report.permohonan_detail?.mulut,
          parut: report.permohonan_detail?.parut,
          sejarahPerjalanan: report.permohonan_detail?.sejarahPerjalanan,
          persamaanTandaTangan: report.permohonan_detail?.persamaanTandaTangan,
          pemeriksaanLain: report.permohonan_detail?.pemeriksaanLain,
          dapatan: report.permohonan_detail?.dapatan,
          document: report.permohonan_detail?.document
            ? {
                documentURL: report.permohonan_detail.document.documentURL,
                documentName: report.permohonan_detail.document.documentName,
                documentType: report.permohonan_detail.document.documentType,
                documentExtension:
                  report.permohonan_detail.document.documentExtension,
                imageMIMEType: report.permohonan_detail.document.imageMIMEType,
                documentSize: report.permohonan_detail.document.documentSize,
                documentCreatedDate:
                  report.permohonan_detail.document.documentCreatedDate,
              }
            : null,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching report:", error);
    return {
      statusCode: 500,
      message: "Gagal mendapatkan maklumat report.",
    };
  }
});
