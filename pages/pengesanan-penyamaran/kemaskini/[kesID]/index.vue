<script setup>
definePageMeta({
  title: "Kemaskini Pengesanan Penyamaran",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Penyamaran",
      path: "/pengesanan-penyamaran/senarai",
    },
    {
      name: "Kemaskini",
      type: "current",
    },
  ],
});

const route = useRoute();
const router = useRouter();
const { $swal } = useNuxtApp();
const kesID = ref(route.params.kesID);

// Form data structure
const formData = ref({
  reportID: "",
  permohonanID: "",
  permohonanDetailID: "",
  jenisDokumen: "",
  negara: "",
  namaPemilik: "",
  noDokumen: "",
  kewarganegaraan: "",
  tarikhLahir: "",
  jantina: "",
  tarikhLuputDokumen: "",
  skorPersamaanMuka: "",
  skorPersamaanCapJari: "",
  umur: "",
  tinggi: "",
  warnaRambut: "",
  bangsa: "",
  etnik: "",
  bentukKepala: "",
  mata: "",
  telinga: "",
  hidung: "",
  mulut: "",
  parut: "",
  sejarahPerjalanan: "",
  persamaanTandaTangan: "",
  pemeriksaanLain: "",
  dapatan: "",
  laporanTdb: [],
});

// Store current document information
const currentDocument = ref(null);

// Options for dropdowns
const jenisDokumenOptions = ref([
  { label: "Pilih Jenis Dokumen", value: "" },
  { label: "Pasport", value: "Pasport" },
  { label: "MyKad", value: "MyKad" },
  { label: "Visa", value: "Visa" },
]);

const negaraOptions = ref([
  { label: "Pilih Negara", value: "" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Thailand", value: "Thailand" },
  // Add more countries as needed
]);

const kewarganegaraanOptions = ref([
  { label: "Pilih Kewarganegaraan", value: "" },
  { label: "Malaysia", value: "Malaysia" },
  { label: "Indonesia", value: "Indonesia" },
  { label: "Thailand", value: "Thailand" },
  // Add more nationalities as needed
]);

const jantinaOptions = ref([
  { label: "Pilih Jantina", value: "" },
  { label: "Lelaki", value: "Lelaki" },
  { label: "Perempuan", value: "Perempuan" },
]);

const dapatanOptions = ref([
  { label: "Pilih Dapatan", value: "" },
  { label: "Sama", value: "Sama" },
  { label: "Tidak Sama", value: "Tidak Sama" },
  { label: "Tidak Dapat Dikenalpasti", value: "Tidak Dapat Dikenalpasti" },
]);

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const validateFile = (file) => {
  if (!file) {
    return "Fail tidak dipilih";
  }

  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return "Saiz fail tidak boleh melebihi 5MB";
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return "Format fail tidak sah. Sila muat naik fail PDF atau JPG sahaja";
  }

  return true;
};

// API and data handling
const fetchAppointment = async (kesID) => {
  try {
    const response = await $fetch(`/api/temujanji/${kesID}`, {
      method: "GET",
    });
    if (response.statusCode === 200) {
      // Format dates before assigning to formData
      const formattedData = {
        ...response.data,
        tarikhLahir: formatDate(response.data.tarikhLahir),
        tarikhLuputDokumen: formatDate(response.data.tarikhLuputDokumen),
      };
      Object.assign(formData.value, formattedData);
      // Store current document information
      currentDocument.value = response.data.laporanSystemTdb;
    } else {
      throw new Error("Failed to fetch report data.");
    }
  } catch (error) {
    $swal.fire("Ralat!", error.message, "error");
  }
};

const submitForm = async () => {
  try {
    // Convert files to base64 if they exist
    if (formData.value.laporanTdb?.[0]) {
      const file = formData.value.laporanTdb[0].file;
      const validationResult = validateFile(file);

      if (validationResult !== true) {
        throw new Error(validationResult);
      }

      const laporanTdbBase64 = await fileToBase64(file);
      formData.value.laporanTdb = laporanTdbBase64;
    }

    // Ensure dates are in the correct format
    const submissionData = {
      ...formData.value,
      tarikhLahir: formData.value.tarikhLahir,
      tarikhLuputDokumen: formData.value.tarikhLuputDokumen,
    };

    const response = await $fetch(`/api/temujanji/${kesID.value}`, {
      method: "PUT",
      body: submissionData,
    });

    if (response.statusCode === 200) {
      $swal.fire("Berjaya!", response.message, "success");
      router.push("/pengesanan-penyamaran/senarai");
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    $swal.fire("Ralat!", error.message, "error");
  }
};

// UI interaction handlers
const goBack = () => {
  router.back();
};

const previewDocument = () => {
  if (!currentDocument.value) return;

  // For PDFs, open in new tab
  if (currentDocument.value.documentExtension === "pdf") {
    window.open(currentDocument.value.documentURL, "_blank");
  } else {
    // For images, show in SweetAlert
    $swal.fire({
      title: currentDocument.value.documentName,
      imageUrl: currentDocument.value.documentURL,
      imageWidth: 600,
      imageHeight: 400,
      imageAlt: currentDocument.value.documentName,
      showConfirmButton: true,
      confirmButtonText: "Tutup",
    });
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchAppointment(kesID.value);
});

// Helper function for file size formatting
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
</script>

<template>
  <div>
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">
          Kemaskini Keputusan Pengesanan Penyamaran
        </h3>
      </div>
    </div>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Section 1: Document Information -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Maklumat Dokumen
          </h4>
          <FormKit type="group" name="documentInfo">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormKit
                type="select"
                label="Jenis Dokumen"
                v-model="formData.jenisDokumen"
                :options="jenisDokumenOptions"
                validation="required"
              />
              <FormKit
                type="select"
                label="Negara"
                v-model="formData.negara"
                :options="negaraOptions"
                validation="required"
              />
              <FormKit
                type="text"
                label="No Dokumen"
                v-model="formData.noDokumen"
                validation="required"
              />
              <FormKit
                type="date"
                label="Tarikh Luput Dokumen"
                v-model="formData.tarikhLuputDokumen"
                validation="required|date"
                :validation-messages="{
                  date: 'Sila masukkan tarikh yang sah',
                }"
              />
            </div>
          </FormKit>
        </div>

        <!-- Section 2: Personal Information -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Maklumat Peribadi
          </h4>
          <FormKit type="group" name="personalInfo">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormKit
                type="text"
                label="Nama Pemilik"
                v-model="formData.namaPemilik"
                validation="required"
              />
              <FormKit
                type="select"
                label="Kewarganegaraan"
                v-model="formData.kewarganegaraan"
                :options="kewarganegaraanOptions"
                validation="required"
              />
              <FormKit
                type="date"
                label="Tarikh Lahir"
                v-model="formData.tarikhLahir"
                validation="required|date"
                :validation-messages="{
                  date: 'Sila masukkan tarikh yang sah',
                }"
              />
              <FormKit
                type="select"
                label="Jantina"
                v-model="formData.jantina"
                :options="jantinaOptions"
                validation="required"
              />
            </div>
          </FormKit>
        </div>

        <!-- Section 3: Biometric Scores -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Skor Biometrik
          </h4>
          <FormKit type="group" name="biometricScores">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormKit
                type="number"
                label="Skor Persamaan Muka"
                v-model="formData.skorPersamaanMuka"
                validation="required|number|min_value:0|max_value:100"
                step="0.01"
                help="Skor antara 0 hingga 100"
              />
              <FormKit
                type="number"
                label="Skor Persamaan Cap Jari"
                v-model="formData.skorPersamaanCapJari"
                validation="required|number|min_value:0|max_value:100"
                step="0.01"
                help="Skor antara 0 hingga 100"
              />
            </div>
          </FormKit>
        </div>

        <!-- Section 4: Physical Characteristics -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Ciri-ciri Fizikal
          </h4>
          <FormKit type="group" name="physicalCharacteristics">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormKit type="number" label="Umur" v-model="formData.umur" />
              <FormKit
                type="number"
                label="Tinggi (cm)"
                v-model="formData.tinggi"
                step="0.01"
              />
              <FormKit
                type="text"
                label="Warna Rambut"
                v-model="formData.warnaRambut"
              />
              <FormKit type="text" label="Bangsa" v-model="formData.bangsa" />
              <FormKit type="text" label="Etnik" v-model="formData.etnik" />
              <FormKit
                type="text"
                label="Bentuk Kepala"
                v-model="formData.bentukKepala"
              />
            </div>
          </FormKit>
        </div>

        <!-- Section 5: Facial Features -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Ciri-ciri Wajah
          </h4>
          <FormKit type="group" name="facialFeatures">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormKit type="text" label="Mata" v-model="formData.mata" />
              <FormKit type="text" label="Telinga" v-model="formData.telinga" />
              <FormKit type="text" label="Hidung" v-model="formData.hidung" />
              <FormKit type="text" label="Mulut" v-model="formData.mulut" />
            </div>
          </FormKit>
        </div>

        <!-- Section 6: Additional Information -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Maklumat Tambahan
          </h4>
          <FormKit type="group" name="additionalInfo">
            <div class="grid grid-cols-1 gap-4">
              <FormKit
                type="textarea"
                label="Parut, Tahi Lalat, Tatu, dsb."
                v-model="formData.parut"
              />
              <FormKit
                type="textarea"
                label="Sejarah Perjalanan"
                v-model="formData.sejarahPerjalanan"
              />
              <FormKit
                type="textarea"
                label="Persamaan Tanda Tangan"
                v-model="formData.persamaanTandaTangan"
              />
              <FormKit
                type="textarea"
                label="Pemeriksaan Lain"
                v-model="formData.pemeriksaanLain"
              />
            </div>
          </FormKit>
        </div>

        <!-- Section 7: Results and Report -->
        <div class="mb-8">
          <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
            Keputusan dan Laporan
          </h4>
          <FormKit type="group" name="results">
            <div class="grid grid-cols-1 gap-4">
              <FormKit
                type="select"
                label="Dapatan"
                v-model="formData.dapatan"
                :options="dapatanOptions"
                validation="required"
              />

              <!-- TD&B System Report -->
              <div class="mt-6">
                <h4 class="text-lg font-semibold mb-4">Laporan Sistem TD&B</h4>

                <!-- Current Document Display -->
                <div
                  v-if="currentDocument"
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
                >
                  <div
                    class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div class="flex flex-col">
                      <div
                        class="cursor-pointer mb-2 flex justify-center items-center h-40 bg-gray-100 rounded"
                        @click="previewDocument"
                      >
                        <div class="flex flex-col items-center">
                          <Icon
                            name="mdi:file-pdf-box"
                            class="w-16 h-16 text-red-500"
                          />
                          <span class="mt-2 text-sm"
                            >Klik untuk lihat dokumen</span
                          >
                        </div>
                      </div>

                      <div class="space-y-1">
                        <h4
                          class="font-medium text-lg truncate"
                          :title="currentDocument.documentName"
                        >
                          {{ currentDocument.documentName || "Laporan TD&B" }}
                        </h4>
                        <div class="text-xs text-gray-500">
                          <p>
                            Saiz:
                            {{ formatFileSize(currentDocument.documentSize) }}
                          </p>
                          <p>
                            Tarikh:
                            {{
                              formatDate(currentDocument.documentCreatedDate)
                            }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <FormKit
                  v-model="formData.laporanTdb"
                  type="file"
                  label="Laporan Sistem TD&B (JPG/PDF)"
                  validation="required"
                  accept=".pdf,.jpg,.jpeg"
                  :help="
                    currentDocument
                      ? 'Muat naik untuk menggantikan dokumen sedia ada'
                      : ''
                  "
                />
              </div>
            </div>
          </FormKit>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <rs-button @click="goBack" variant="danger">Kembali</rs-button>
          <rs-button btn-type="submit" variant="success">Kemaskini</rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style lang="scss" scoped>
.space-y-2 > * + * {
  margin-top: 0.5rem;
}

h4.text-lg {
  @apply text-gray-700;
}

.border-b {
  @apply border-gray-200;
}
</style>
