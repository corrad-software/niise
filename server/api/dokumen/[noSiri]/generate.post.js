import { join } from "path";
import { readFile, writeFile } from "fs/promises";
import { mkdir } from "fs/promises";
import { createError } from "h3";
import html_to_pdf from "html-pdf-node";

export default defineEventHandler(async (event) => {
  try {
    const { noSiri } = event.context.params;
    const body = await readBody(event);
    const { jenisDokumen } = body;

    let data = await getDummyData(jenisDokumen, noSiri);

    // Get template path
    const templatePath =
      process.env.SERVER === "true"
        ? join(
            process.cwd(),
            "../assets/document/templates",
            `${jenisDokumen}.html`
          )
        : join(
            process.cwd(),
            "assets/document/templates",
            `${jenisDokumen}.html`
          );

    // Ensure uploads directory exists
    const uploadsDir =
      process.env.SERVER === "true"
        ? join(process.cwd(), "../public/uploads")
        : join(process.cwd(), "public/uploads");

    await mkdir(uploadsDir, { recursive: true });

    // Read HTML template
    let htmlContent = await readFile(templatePath, "utf-8");

    // Replace variables in HTML
    Object.entries(data).forEach(([key, value]) => {
      if (key === "barangKes") {
        // Handle barangKes table rows
        const tableRows = value
          .map(
            (item, index) => `
          <tr style="height: 19.85pt">
            <td width="36" valign="top" style="width: 26.7pt; border: solid windowtext 1pt; border-top: none; padding: 0in 5.4pt 0in 5.4pt; height: 19.85pt;">
              <p class="MsoNormal">
                <span lang="MS" style="font-size: 11pt; font-family: 'Arial', sans-serif; color: black">
                  ${index + 1}
                </span>
              </p>
            </td>
            <td width="293" valign="top" style="width: 219.7pt; border-top: none; border-left: none; border-bottom: solid windowtext 1pt; border-right: solid windowtext 1pt; padding: 0in 5.4pt 0in 5.4pt; height: 19.85pt;">
              <p class="MsoNormal">
                <span lang="MS" style="font-size: 11pt; font-family: 'Arial', sans-serif; color: black">
                  ${item.perkara}
                </span>
              </p>
            </td>
            <td width="66" valign="top" style="width: 49.6pt; border-top: none; border-left: none; border-bottom: solid windowtext 1pt; border-right: solid windowtext 1pt; padding: 0in 5.4pt 0in 5.4pt; height: 19.85pt;">
              <p class="MsoNormal">
                <span lang="MS" style="font-size: 11pt; font-family: 'Arial', sans-serif; color: black">
                  ${item.tanda}
                </span>
              </p>
            </td>
            <td width="189" valign="top" style="width: 141.75pt; border-top: none; border-left: none; border-bottom: solid windowtext 1pt; border-right: solid windowtext 1pt; padding: 0in 5.4pt 0in 5.4pt; height: 19.85pt;">
              <p class="MsoNormal">
                <span lang="MS" style="font-size: 11pt; font-family: 'Arial', sans-serif; color: black">
                  ${item.keadaan}
                </span>
              </p>
            </td>
            <td width="123" valign="top" style="width: 92.15pt; border-top: none; border-left: none; border-bottom: solid windowtext 1pt; border-right: solid windowtext 1pt; padding: 0in 5.4pt 0in 5.4pt; height: 19.85pt;">
              <p class="MsoNormal">
                <span lang="MS" style="font-size: 11pt; font-family: 'Arial', sans-serif; color: black">
                  ${item.kuantiti}
                </span>
              </p>
            </td>
          </tr>
        `
          )
          .join("");

        // Replace table placeholder with generated rows
        htmlContent = htmlContent.replace(
          /{#each barangKes as item}[\s\S]*?{\/each}/g,
          tableRows
        );
      } else {
        // Replace other variables
        const regex = new RegExp(`{${key}}`, "g");
        htmlContent = htmlContent.replace(regex, value);
      }
    });

    console.log(htmlContent);

    // Generate PDF
    const filename = `${jenisDokumen}_${noSiri}_${Date.now()}.pdf`;
    const outputPath = join(uploadsDir, filename);

    const options = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      preferCSSPageSize: true,
    };

    const file = { content: htmlContent };

    // Generate PDF using html-pdf-node
    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    // Write the PDF to file
    await writeFile(outputPath, pdfBuffer);

    return {
      statusCode: 200,
      message: "Document generated successfully",
      data: {
        filename,
        url: `/uploads/${filename}`,
      },
    };
  } catch (error) {
    console.error("Error generating document:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Error generating document",
    });
  }
});

async function getDummyData(jenisDokumen, noSiri) {
  try {
    // Fetch permohonan data with related information
    const permohonan = await prisma.permohonan.findUnique({
      where: {
        no_siri: noSiri,
      },
      include: {
        pemohon: true,
        penghantar: true,
        report: {
          select: {
            jenis_barang: true,
            lookup_report_jenis_barangTolookup: {
              select: {
                lookupValue: true,
              },
            },
            tanda_barang: true,
            keadaan_barang: true,
            kuantiti_barang: true,
          },
        },
      },
    });

    if (jenisDokumen === "FR01") {
      return {
        noRujMakmal: `MKL/${new Date().getFullYear()}/${String(
          Math.floor(Math.random() * 999)
        ).padStart(3, "0")}`,
        noRujTuan: `JIM/${new Date().getFullYear()}/123`,
        tarikh: new Date().toLocaleDateString("ms-MY"),
        pejabat: "PEJABAT IMIGRESEN MALAYSIA",
        noAduan: `ADU/${new Date().getFullYear()}/001`,
        tarikhAduan: new Date().toLocaleDateString("ms-MY"),
        bungkusanBertanda: "SAMPEL A123",
        penghantarPangkat:
          permohonan?.penghantar?.pangkat_penghantar || "Inspektor",
        penghantarNama:
          permohonan?.penghantar?.nama_penghantar || "Ahmad bin Abdullah",
        penghantarNo:
          permohonan?.penghantar?.no_pegawai_penghantar || "G/12345",
        ringkasanKenyataanKes:
          permohonan?.ringkasan_kenyataan_kes ||
          "Kes pemalsuan dokumen perjalanan yang dirampas di KLIA.",
        pemeriksaanDikehendaki:
          "Pemeriksaan kesahihan dokumen dan pengesanan pemalsuan.",
        ditandatangani:
          permohonan?.penghantar?.nama_penghantar || "Ahmad bin Abdullah",
        nama: permohonan?.pemohon?.nama_pemohon || "Ahmad bin Abdullah",
        jawatan: "Pegawai Imigresen",
        alamatTugas: "Jabatan Imigresen Malaysia\nPutrajaya",
        noTelefonPejabat: "03-8888 8888",
        noTelefonBimbil: "012-345 6789",
        barangKes: permohonan?.report?.map((item) => ({
          perkara:
            item.lookup_report_jenis_barangTolookup?.lookupValue ||
            "Passport Malaysia",
          tanda: item.tanda_barang || "A1",
          keadaan: item.keadaan_barang || "Baik",
          kuantiti: item.kuantiti_barang?.toString() || "1",
        })) || [
          {
            perkara: "Passport Malaysia",
            tanda: "A1",
            keadaan: "Baik",
            kuantiti: "2",
          },
        ],
      };
    } else if (jenisDokumen === "FR03") {
      return {
        noRujMakmal: `MKL/${new Date().getFullYear()}/${String(
          Math.floor(Math.random() * 999)
        ).padStart(3, "0")}`,
        noRujTuan: `JIM/${new Date().getFullYear()}/456`,
        tarikh: new Date().toLocaleDateString("ms-MY"),
        nama: permohonan?.pemohon?.nama_pemohon || "Siti binti Zainuddin",
        pangkat: permohonan?.pemohon?.pangkat_pemohon || "Pegawai Imigresen",
        kadKuasa: "IM/2024/789",
        tarikhTerima: new Date().toLocaleDateString("ms-MY"),
        jamTerima: "10:30 AM",
        barangKes: permohonan?.report?.map((item, index) => ({
          bil: (index + 1).toString(),
          perkara:
            item.lookup_report_jenis_barangTolookup?.lookupValue ||
            "Passport Malaysia",
          tanda: item.tanda_barang || `B${index + 1}`,
          keadaan: item.keadaan_barang || "Baik",
          kuantiti: item.kuantiti_barang?.toString() || "1",
        })) || [
          {
            bil: "1",
            perkara: "Passport Malaysia",
            tanda: "B1",
            keadaan: "Baik",
            kuantiti: "1",
          },
        ],
        namaPenyerah:
          permohonan?.penghantar?.nama_penghantar || "Ahmad bin Abdullah",
        jawatanPenyerah: "Pegawai Penyiasat",
        noKP: "800101-14-5566",
        namaPenerima:
          permohonan?.pemohon?.nama_pemohon || "Siti binti Zainuddin",
        jawatanPenerima: "Pegawai Forensik",
      };
    }
    return {};
  } catch (error) {
    console.error("Error fetching data:", error);
    // Return default dummy data if there's an error
    return getDummyDataFallback(jenisDokumen);
  }
}

// Fallback function with the original hard-coded data
function getDummyDataFallback(jenisDokumen) {
  if (jenisDokumen === "FR01") {
    return {
      noRujMakmal: "MKL/2024/001",
      noRujTuan: "JIM/2024/123",
      tarikh: new Date().toLocaleDateString("ms-MY"),
      pejabat: "PEJABAT IMIGRESEN MALAYSIA",
      noAduan: "ADU/2024/001",
      tarikhAduan: new Date().toLocaleDateString("ms-MY"),
      bungkusanBertanda: "SAMPEL A123",
      penghantarPangkat: "Inspektor",
      penghantarNama: "Ahmad bin Abdullah",
      penghantarNo: "G/12345",
      ringkasanKenyataanKes:
        "Kes pemalsuan dokumen perjalanan yang dirampas di KLIA.",
      pemeriksaanDikehendaki:
        "Pemeriksaan kesahihan dokumen dan pengesanan pemalsuan.",
      ditandatangani: "Ahmad bin Abdullah",
      nama: "Ahmad bin Abdullah",
      jawatan: "Pegawai Imigresen",
      alamatTugas: "Jabatan Imigresen Malaysia\nPutrajaya",
      noTelefonPejabat: "03-8888 8888",
      noTelefonBimbil: "012-345 6789",
      barangKes: [
        {
          perkara: "Passport Malaysia",
          tanda: "A1",
          keadaan: "Baik",
          kuantiti: "2",
        },
        {
          perkara: "Visa Indonesia",
          tanda: "A2",
          keadaan: "Baik",
          kuantiti: "3",
        },
        {
          perkara: "Permit Kerja",
          tanda: "A3",
          keadaan: "Baik",
          kuantiti: "1",
        },
      ],
    };
  } else if (jenisDokumen === "FR03") {
    return {
      noRujMakmal: "MKL/2024/002",
      noRujTuan: "JIM/2024/456",
      tarikh: new Date().toLocaleDateString("ms-MY"),
      nama: "Siti binti Zainuddin",
      pangkat: "Pegawai Imigresen",
      kadKuasa: "IM/2024/789",
      tarikhTerima: new Date().toLocaleDateString("ms-MY"),
      jamTerima: "10:30 AM",
      barangKes: [
        {
          bil: "1",
          perkara: "Passport Malaysia",
          tanda: "B1",
          keadaan: "Baik",
          kuantiti: "1",
        },
        {
          bil: "2",
          perkara: "Visa Singapura",
          tanda: "B2",
          keadaan: "Baik",
          kuantiti: "2",
        },
        {
          bil: "3",
          perkara: "Permit Kerja Asing",
          tanda: "B3",
          keadaan: "Rosak",
          kuantiti: "1",
        },
      ],
      namaPenyerah: "Ahmad bin Abdullah",
      jawatanPenyerah: "Pegawai Penyiasat",
      noKP: "800101-14-5566",
      namaPenerima: "Siti binti Zainuddin",
      jawatanPenerima: "Pegawai Forensik",
    };
  }
  return {};
}
