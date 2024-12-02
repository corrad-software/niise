// Path: /api/report/[reportID].get.js

export default defineEventHandler(async (event) => {
  const { reportID } = event.context.params;

  try {
    const report = await prisma.report.findUnique({
      where: { reportID: parseInt(reportID) },
      include: {
        permohonan: {
          include: {
            penghantar: true,
            pemohon: {
              include: {
                user: true,
              },
            },
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
            permohonan_approval: {
              include: {
                user: true,
              },
            },
            permohonan_assign_forensik: {
              include: {
                user: true,
              },
            },
          },
        },
        lookup_report_jenis_barangTolookup: true,
        lookup_report_dapatanTolookup: {
          select: {
            lookupID: true,
            lookupValue: true,
          },
        },
        report_doc_support: {
          include: {
            document: {
              select: {
                documentID: true,
                documentName: true,
                documentURL: true,
                documentType: true,
                documentExtension: true,
                imageMIMEType: true,
                documentSize: true,
                documentStatus: true,
                documentCreatedDate: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return { statusCode: 404, message: "Report not found" };
    }

    const counterOfficer =
      report.permohonan.permohonan_penerimaan?.user ||
      report.permohonan.permohonan_penolakan?.user;

    const headOfDivision = report.permohonan.permohonan_approval?.[0]?.user;

    const reportData = {
      kesId: report.permohonan.no_siri,
      tagNo: report.tanda_barang,
      jenisBrg: report.lookup_report_jenis_barangTolookup.lookupValue,
      jenisPemeriksaan: "Forensik",
      pegawai: {
        PEGAWAI_PEMOHON: {
          nama: report.permohonan.pemohon?.user?.userFullName || "",
          pangkat: report.permohonan.pemohon?.user?.userRank || "",
          noPegawai: report.permohonan.pemohon?.user?.userOfficerNumber || "",
        },
        PEGAWAI_PENGHANTAR: {
          nama: report.permohonan.penghantar_sama_dengan_pemohon
            ? report.permohonan.pemohon?.user?.userFullName || ""
            : report.permohonan.penghantar?.nama_penghantar || "",
          pangkat: report.permohonan.penghantar_sama_dengan_pemohon
            ? report.permohonan.pemohon?.user?.userRank || ""
            : report.permohonan.penghantar?.pangkat_penghantar || "",
          noPegawai: report.permohonan.penghantar_sama_dengan_pemohon
            ? report.permohonan.pemohon?.user?.userOfficerNumber || ""
            : report.permohonan.penghantar?.no_pegawai_penghantar || "",
        },
        PEGAWAI_PENERIMA: {
          nama:
            report.permohonan.permohonan_penerimaan?.user?.userFullName || "",
          pangkat:
            report.permohonan.permohonan_penerimaan?.user?.userRank || "",
          noPegawai:
            report.permohonan.permohonan_penerimaan?.user?.userOfficerNumber ||
            "",
        },
        PEGAWAI_FORENSIK: report.permohonan.permohonan_assign_forensik.map(
          (assignment) => ({
            nama: assignment.user?.userFullName || "",
            pangkat: assignment.user?.userRank || "",
            noPegawai: assignment.user?.userOfficerNumber || "",
          })
        ),
      },
      peralatan: report.peralatan,
      langkah2: report.langkah_langkah,
      dapatan: {
        value: report.lookup_report_dapatanTolookup?.lookupID,
        label: report.lookup_report_dapatanTolookup?.lookupValue,
      },
      documentTambahan: report.report_doc_support.map((doc) => ({
        nama: doc.document.documentName,
        keterangan: doc.keterangan || "",
        preview: {
          url: doc.document.documentURL,
          type: doc.document.imageMIMEType,
          size: doc.document.documentSize,
          extension: doc.document.documentExtension,
          createdDate: doc.document.documentCreatedDate,
        },
      })),
    };

    return { statusCode: 200, data: reportData };
  } catch (error) {
    console.error("Error fetching report:", error);
    return { statusCode: 500, message: error.message };
  }
});
