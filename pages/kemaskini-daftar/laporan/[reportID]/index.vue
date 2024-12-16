<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { jsPDF } from "jspdf";

definePageMeta({
  title: "Laporan Bahan Bukti",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Semak Permohonan",
      path: "/kemaskini-daftar/senarai",
    },
    {
      name: "Maklumat",
      type: "/",
    },
  ],
});

const { $swal } = useNuxtApp();
const route = useRoute();
const reportID = route.params.reportID;

const generatedData = ref({
  kesId: "",
  tagNo: "",
  jenisBrg: "",
  jenisPemeriksaan: "",
  pegawai: {
    PEGAWAI_PEMOHON: { nama: "", pangkat: "", noPegawai: "" },
    PEGAWAI_PENGHANTAR: { nama: "", pangkat: "", noPegawai: "" },
    PEGAWAI_PENERIMA: { nama: "", pangkat: "", noPegawai: "" },
    PEGAWAI_FORENSIK: [],
  },
  peralatan: "",
  langkah2: "",
  dapatan: "",
  documentTambahan: [],
});
// State to store dapatan options
const dapatanOptions = ref([]);

// Fetch dapatan options from the lookup API
const fetchDapatanOptions = async () => {
  try {
    const { data } = await useFetch("/api/lookup?type=dapatan");
    if (data.value.statusCode === 200) {
      dapatanOptions.value = [
        { label: "Sila Pilih", value: null },
        ...data.value.data.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      ];
    } else {
      $swal.fire("Error", "Failed to fetch dapatan options.", "error");
    }
  } catch (error) {
    $swal.fire("Error", "Failed to load dapatan options.", "error");
  }
};

onMounted(async () => {
  try {
    const { data } = await useFetch(`/api/laporan/${reportID}`);
    if (data.value.statusCode === 200) {
      generatedData.value = {
        ...generatedData.value, // Keep the default structure
        ...data.value.data, // Merge API data
      };
    } else {
      $swal.fire("Error", "Failed to fetch report data.", "error");
    }

    // Fetch dapatan options on mount
    await fetchDapatanOptions();
  } catch (error) {
    $swal.fire("Error", "Failed to load data.", "error");
  }
});

// function generatePegawai(role = "") {
//   const names = ["Ahmad", "Siti", "Mohd", "Nurul", "Lim", "Raj"];
//   const surnames = ["Abdullah", "Tan", "Kumar", "Lee", "Muthu", "Hassan"];
//   const pangkat = ["Inspektor", "Sarjan", "Koperal", "Konstabel"];

//   return {
//     nama: `${names[Math.floor(Math.random() * names.length)]} ${
//       surnames[Math.floor(Math.random() * surnames.length)]
//     }`,
//     pangkat:
//       role === "KB"
//         ? "Ketua Bahagian"
//         : pangkat[Math.floor(Math.random() * pangkat.length)],
//     noPegawai: `P${Math.floor(Math.random() * 100000)
//       .toString()
//       .padStart(5, "0")}`,
//   };
// }

const submitForm = async (formData) => {
  try {
    const processedFormData = { ...formData };

    if (formData.documentTambahan?.length > 0) {
      console.log(JSON.stringify(formData.documentTambahan));

      processedFormData.documentTambahan = await Promise.all(
        formData.documentTambahan.map(async (doc) => {
          // console.log(doc);

          // Skip if no file is selected
          if (!doc.file?.[0]) return null;

          const file = doc.file[0].file;

          // Validate file type
          const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
          if (!allowedTypes.includes(file.type)) {
            throw new Error("Sila muat naik fail PDF atau JPG sahaja.");
          }

          // Get file extension from file name
          const fileExt = file.name.split(".").pop().toLowerCase();
          const fileName = `${doc.nama}.${fileExt}`;

          // Convert file to base64
          const base64Data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });

          return {
            nama: fileName,
            file: base64Data,
            keterangan: doc.keterangan || "",
          };
        })
      );

      // Filter out null values (skipped files)
      processedFormData.documentTambahan =
        processedFormData.documentTambahan.filter((doc) => doc !== null);
    }

    const { data } = await useFetch(`/api/laporan/${reportID}`, {
      method: "POST",
      body: processedFormData,
    });

    if (data.value.statusCode === 200) {
      $swal.fire("Success", "Report updated successfully", "success");
    } else {
      $swal.fire("Error", data.value.message, "error");
    }
  } catch (error) {
    $swal.fire("Error", error.message || "Failed to submit report", "error");
  }
};

const generatePDF = async () => {
  const doc = new jsPDF();

  // Set font sizes
  const titleSize = 16;
  const subtitleSize = 14;
  const normalSize = 10;

  // Add title
  doc.setFontSize(titleSize);
  doc.text("Laporan Bahan Bukti", 105, 20, { align: "center" });

  // Add case details
  doc.setFontSize(subtitleSize);
  doc.text("Butiran Kes", 20, 40);

  doc.setFontSize(normalSize);
  doc.text(`KES ID: ${generatedData.value.kesId}`, 30, 50);
  doc.text(`TAG NO: ${generatedData.value.tagNo}`, 30, 60);
  doc.text(`Jenis Barang: ${generatedData.value.jenisBrg}`, 30, 70);
  doc.text(
    `Jenis Pemeriksaan: ${generatedData.value.jenisPemeriksaan}`,
    30,
    80
  );

  // Add officer details
  doc.setFontSize(subtitleSize);
  doc.text("Butiran Pegawai", 20, 100);

  doc.setFontSize(normalSize);
  let yPos = 110;

  // Pegawai Pemohon
  doc.text("Pegawai Pemohon:", 30, yPos);
  doc.text(
    `Nama: ${generatedData.value.pegawai.PEGAWAI_PEMOHON.nama}`,
    40,
    yPos + 10
  );
  doc.text(
    `Pangkat: ${generatedData.value.pegawai.PEGAWAI_PEMOHON.pangkat}`,
    40,
    yPos + 20
  );
  doc.text(
    `No Pegawai: ${generatedData.value.pegawai.PEGAWAI_PEMOHON.noPegawai}`,
    40,
    yPos + 30
  );
  yPos += 45;

  // Pegawai Penghantar
  doc.text("Pegawai Penghantar:", 30, yPos);
  doc.text(
    `Nama: ${generatedData.value.pegawai.PEGAWAI_PENGHANTAR.nama}`,
    40,
    yPos + 10
  );
  doc.text(
    `Pangkat: ${generatedData.value.pegawai.PEGAWAI_PENGHANTAR.pangkat}`,
    40,
    yPos + 20
  );
  doc.text(
    `No Pegawai: ${generatedData.value.pegawai.PEGAWAI_PENGHANTAR.noPegawai}`,
    40,
    yPos + 30
  );
  yPos += 45;

  // Pegawai Penerima
  doc.text("Pegawai Penerima:", 30, yPos);
  doc.text(
    `Nama: ${generatedData.value.pegawai.PEGAWAI_PENERIMA.nama}`,
    40,
    yPos + 10
  );
  doc.text(
    `Pangkat: ${generatedData.value.pegawai.PEGAWAI_PENERIMA.pangkat}`,
    40,
    yPos + 20
  );
  doc.text(
    `No Pegawai: ${generatedData.value.pegawai.PEGAWAI_PENERIMA.noPegawai}`,
    40,
    yPos + 30
  );
  yPos += 45;

  // Pegawai Forensik (if any)
  if (generatedData.value.pegawai.PEGAWAI_FORENSIK.length > 0) {
    generatedData.value.pegawai.PEGAWAI_FORENSIK.forEach((officer, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`Pegawai Forensik ${index + 1}:`, 30, yPos);
      doc.text(`Nama: ${officer.nama}`, 40, yPos + 10);
      doc.text(`Pangkat: ${officer.pangkat}`, 40, yPos + 20);
      doc.text(`No Pegawai: ${officer.noPegawai}`, 40, yPos + 30);
      yPos += 45;
    });
  }

  // Add examination details (check if we need a new page)
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(subtitleSize);
  doc.text("Butiran Pemeriksaan", 20, yPos);
  yPos += 20;

  doc.setFontSize(normalSize);
  // Use splitTextToSize to handle long text
  const peralatanLines = doc.splitTextToSize(
    `Peralatan: ${generatedData.value.peralatan || "N/A"}`,
    150
  );
  const langkahLines = doc.splitTextToSize(
    `Langkah-langkah: ${generatedData.value.langkah2 || "N/A"}`,
    150
  );
  const dapatanText = `Dapatan: ${generatedData.value.dapatan?.label || "N/A"}`;

  // Add the text lines
  peralatanLines.forEach((line) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 30, yPos);
    yPos += 10;
  });

  yPos += 5;
  langkahLines.forEach((line) => {
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(line, 30, yPos);
    yPos += 10;
  });

  yPos += 5;
  if (yPos > 280) {
    doc.addPage();
    yPos = 20;
  }
  doc.text(dapatanText, 30, yPos);

  // Add document attachments section if any
  if (generatedData.value.documentTambahan?.length > 0) {
    yPos += 20;
    if (yPos > 280) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(subtitleSize);
    doc.text("Dokumen Tambahan", 20, yPos);

    doc.setFontSize(normalSize);
    yPos += 10;

    generatedData.value.documentTambahan.forEach((docItem, index) => {
      const docInfo = [
        `${index + 1}. ${docItem.nama}`,
        `   Keterangan: ${docItem.keterangan || "Tiada keterangan"}`,
        `   Jenis: ${docItem.preview?.type || "N/A"}`,
        `   Saiz: ${formatFileSize(docItem.preview?.size)}`,
        `   Tarikh: ${formatDate(docItem.preview?.createdDate)}`,
      ];

      docInfo.forEach((line) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 30, yPos);
        yPos += 10;
      });
      yPos += 5;
    });
  }

  // Add footer with date and page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Tarikh: ${new Date().toLocaleDateString("ms-MY")}`, 20, 290);
    doc.text(`Muka Surat ${i} daripada ${pageCount}`, 180, 290);
  }

  // Generate and download the PDF
  doc.save(`Laporan_${generatedData.value.kesId}.pdf`);
};

function previousPage() {
  window.history.back();
}

// Add function to handle document preview
const previewDocument = (doc) => {
  if (!doc.preview?.url) return;

  // Handle different document types
  if (doc.preview.type?.startsWith("image/")) {
    // For images, open in a modal/lightbox
    $swal.fire({
      imageUrl: doc.preview.url,
      imageAlt: doc.nama,
      width: "auto",
      showCloseButton: true,
      showConfirmButton: false,
    });
  } else {
    // For PDFs and other documents, open in new tab
    window.open(doc.preview.url, "_blank");
  }
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("ms-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Laporan Bahan Bukti</h1>
      <rs-button
        variant="primary"
        @click="generatePDF"
        :disabled="!generatedData.dapatan?.value"
      >
        <Icon name="mdi:file-pdf" class="mr-2 w-4 h-4" />
        Jana PDF
      </rs-button>
    </div>

    <rs-card class="p-4">
      <FormKit
        type="form"
        @submit="submitForm"
        #default="{ state }"
        :actions="false"
        class="space-y-6"
      >
        <!-- KES ID and BARANG KES DETAIL -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormKit
            type="text"
            name="kesId"
            label="KES ID"
            v-model="generatedData.kesId"
            validation="required"
            :validation-messages="{ required: 'KES ID diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="tagNo"
            label="TAG NO"
            v-model="generatedData.tagNo"
            validation="required"
            :validation-messages="{ required: 'TAG NO diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="jenisBrg"
            label="Jenis Barang"
            v-model="generatedData.jenisBrg"
            validation="required"
            :validation-messages="{ required: 'Jenis Barang diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="jenisPemeriksaan"
            label="Jenis Pemeriksaan"
            v-model="generatedData.jenisPemeriksaan"
            validation="required"
            :validation-messages="{ required: 'Jenis Pemeriksaan diperlukan' }"
            disabled
          />
        </div>

        <!-- BUTIRAN PEGAWAI -->
        <div class="space-y-4 mb-4">
          <h2 class="text-xl font-semibold">Butiran Pegawai</h2>

          <!-- Pegawai Pemohon -->
          <rs-card class="p-4">
            <h3 class="text-lg font-medium mb-4">Pegawai Pemohon</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PEMOHON.nama"
                label="Nama"
                v-model="generatedData.pegawai.PEGAWAI_PEMOHON.nama"
                disabled
              />
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PEMOHON.pangkat"
                label="Pangkat"
                v-model="generatedData.pegawai.PEGAWAI_PEMOHON.pangkat"
                disabled
              />
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PEMOHON.noPegawai"
                label="No Pegawai"
                v-model="generatedData.pegawai.PEGAWAI_PEMOHON.noPegawai"
                disabled
              />
            </div>
          </rs-card>

          <!-- Pegawai Penghantar -->
          <rs-card class="p-4">
            <h3 class="text-lg font-medium mb-4">Pegawai Penghantar</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PENGHANTAR.nama"
                label="Nama"
                v-model="generatedData.pegawai.PEGAWAI_PENGHANTAR.nama"
                disabled
              />
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PENGHANTAR.pangkat"
                label="Pangkat"
                v-model="generatedData.pegawai.PEGAWAI_PENGHANTAR.pangkat"
                disabled
              />
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PENGHANTAR.noPegawai"
                label="No Pegawai"
                v-model="generatedData.pegawai.PEGAWAI_PENGHANTAR.noPegawai"
                disabled
              />
            </div>
          </rs-card>

          <!-- Pegawai Penerima -->
          <rs-card class="p-4">
            <h3 class="text-lg font-medium mb-4">Pegawai Penerima</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PENERIMA.nama"
                label="Nama"
                v-model="generatedData.pegawai.PEGAWAI_PENERIMA.nama"
                disabled
              />
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PENERIMA.pangkat"
                label="Pangkat"
                v-model="generatedData.pegawai.PEGAWAI_PENERIMA.pangkat"
                disabled
              />
              <FormKit
                type="text"
                name="pegawai.PEGAWAI_PENERIMA.noPegawai"
                label="No Pegawai"
                v-model="generatedData.pegawai.PEGAWAI_PENERIMA.noPegawai"
                disabled
              />
            </div>
          </rs-card>

          <!-- Pegawai Forensik -->
          <rs-card
            class="p-4"
            v-if="generatedData.pegawai.PEGAWAI_FORENSIK.length > 0"
          >
            <h3 class="text-lg font-medium mb-4">Pegawai Forensik</h3>
            <div class="grid grid-cols-1 gap-4">
              <div
                v-for="(officer, index) in generatedData.pegawai
                  .PEGAWAI_FORENSIK"
                :key="index"
              >
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormKit
                    type="text"
                    :name="`pegawai.PEGAWAI_FORENSIK.${index}.nama`"
                    label="Nama"
                    v-model="officer.nama"
                    disabled
                  />
                  <FormKit
                    type="text"
                    :name="`pegawai.PEGAWAI_FORENSIK.${index}.pangkat`"
                    label="Pangkat"
                    v-model="officer.pangkat"
                    disabled
                  />
                  <FormKit
                    type="text"
                    :name="`pegawai.PEGAWAI_FORENSIK.${index}.noPegawai`"
                    label="No Pegawai"
                    v-model="officer.noPegawai"
                    disabled
                  />
                </div>
              </div>
            </div>
          </rs-card>
        </div>

        <!-- Peralatan and Langkah2 -->
        <div class="space-y-4 mb-4">
          <FormKit
            v-model="generatedData.peralatan"
            type="textarea"
            name="peralatan"
            label="Peralatan yang digunakan"
            validation="required"
            :validation-messages="{ required: 'Peralatan diperlukan' }"
            :rows="3"
          />
          <FormKit
            v-model="generatedData.langkah2"
            type="textarea"
            name="langkah2"
            label="Langkah Pemeriksaan"
            validation="required"
            :validation-messages="{ required: 'Langkah diperlukan' }"
            :rows="5"
          />
        </div>

        <!-- Dapatan -->
        <FormKit
          v-model="generatedData.dapatan.value"
          type="select"
          name="dapatan"
          label="Dapatan"
          :options="dapatanOptions"
          validation="required"
          :validation-messages="{ required: 'Dapatan diperlukan' }"
        />

        <!-- Document Tambahan -->
        <div>
          <h2 class="text-xl font-semibold mb-2">Document Tambahan</h2>

          <!-- Display existing documents -->
          <div v-if="generatedData.documentTambahan?.length > 0" class="mb-4">
            <h3 class="text-lg font-medium mb-2">Dokumen Sedia Ada</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(doc, index) in generatedData.documentTambahan"
                :key="index"
                class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <!-- Document Preview Card -->
                <div class="flex flex-col">
                  <!-- Preview Thumbnail -->
                  <div
                    class="cursor-pointer mb-2 flex justify-center items-center h-40 bg-gray-100 rounded"
                    @click="previewDocument(doc)"
                  >
                    <!-- Image Preview -->
                    <img
                      v-if="doc.preview?.type?.startsWith('image/')"
                      :src="doc.preview.url"
                      :alt="doc.nama"
                      class="max-h-full max-w-full object-contain"
                    />
                    <!-- PDF Icon -->
                    <div
                      v-else-if="doc.preview?.type === 'application/pdf'"
                      class="flex flex-col items-center"
                    >
                      <i class="fas fa-file-pdf text-4xl text-red-500"></i>
                      <span class="mt-2 text-sm">Klik untuk lihat PDF</span>
                    </div>
                  </div>

                  <!-- Document Info -->
                  <div class="space-y-1">
                    <h4 class="font-medium text-lg truncate" :title="doc.nama">
                      {{ doc.nama }}
                    </h4>
                    <p
                      class="text-sm text-gray-600 truncate"
                      :title="doc.keterangan"
                    >
                      {{ doc.keterangan || "Tiada keterangan" }}
                    </p>
                    <div class="text-xs text-gray-500">
                      <p>Saiz: {{ formatFileSize(doc.preview?.size) }}</p>
                      <p>Tarikh: {{ formatDate(doc.preview?.createdDate) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload new documents form -->
          <FormKit type="list" name="documentTambahan" :value="[]">
            <FormKit type="group" :repeatable="true" #default="{ index }">
              <div
                class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-start p-4 border rounded-lg"
              >
                <FormKit
                  type="text"
                  name="nama"
                  label="Nama Dokumen"
                  placeholder="Contoh: Laporan Analisis"
                />
                <div class="space-y-2">
                  <FormKit
                    type="file"
                    name="file"
                    label="Fail"
                    accept=".pdf,.jpg,.jpeg"
                    help="Format yang dibenarkan: PDF, JPG"
                  />
                </div>
                <FormKit
                  type="textarea"
                  name="keterangan"
                  label="Keterangan"
                  placeholder="Masukkan keterangan dokumen (optional)"
                  :rows="3"
                />
              </div>
            </FormKit>
          </FormKit>
        </div>

        <div class="flex justify-end gap-2">
          <rs-button variant="danger" btn-type="reset" @click="previousPage()">
            <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
            Kembali</rs-button
          >
          <rs-button type="submit" btn-type="submit">
            <Icon name="ic:round-save" class="w-4 h-4 mr-2" />
            Simpan
          </rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style scoped>
.document-preview {
  transition: all 0.3s ease;
}

.document-preview:hover {
  transform: translateY(-2px);
}
</style>
