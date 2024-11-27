<script setup>
const { $swal } = useNuxtApp();
const router = useRouter();
const route = useRoute();

const kesID = ref(route.params.kesID);

// Reactive variables for form data
const formData = ref({
  jenisDokumen: "Passport",
  negara: "Malaysia",
  namaPemilik: "",
  noDokumen: "",
  kewarganegaraan: "Malaysia",
  tarikhLahir: "",
  jantina: "Lelaki",
  tarikhLuputDokumen: "",
  skorPersamaanMuka: 0,
  skorPersamaanCapJari: 0,
  umur: null,
  tinggi: null,
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
  dapatan: "Sama",
  laporanTdb: null,
});

// Dropdown options
const jenisDokumenOptions = ref([
  { label: "Sila Pilih", value: "" },
  { label: "Passport", value: "Passport" },
  { label: "Kad Pengenalan", value: "Kad Pengenalan" },
]);

const negaraOptions = ref([
  { label: "Sila Pilih", value: "" },

  { label: "Malaysia", value: "Malaysia" },
  { label: "Singapura", value: "Singapura" },
]);

const kewarganegaraanOptions = ref([
  { label: "Sila Pilih", value: "" },

  { label: "Malaysia", value: "Malaysia" },
  { label: "Singapura", value: "Singapura" },
  { label: "Tiada", value: "Tiada" },
]);

const jantinaOptions = ref([
  { label: "Sila Pilih", value: "" },
  { label: "Lelaki", value: "Lelaki" },
  { label: "Perempuan", value: "Perempuan" },
  { label: "Lain-lain", value: "Lain-lain" },
]);

const dapatanOptions = ref([
  { label: "Sila Pilih", value: "" },
  { label: "Sama", value: "Sama" },
  { label: "Tidak Sama", value: "Tidak Sama" },
  { label: "Tidak Dapat Dikenalpasti", value: "Tidak Dapat Dikenalpasti" },
]);

// Add new ref for current document
const currentDocument = ref(null);

// Add date formatting helper function
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
};

// Modify fetchAppointment to format dates
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
      throw new Error("Failed to fetch appointment data.");
    }
  } catch (error) {
    $swal.fire("Ralat!", error.message, "error");
  }
};

onMounted(() => {
  fetchAppointment(kesID.value);
});

// Helper function to convert File to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Add this after the fileToBase64 function
const validateFile = (file) => {
  // Check if file exists
  if (!file) {
    return "Fail tidak dipilih";
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return "Saiz fail tidak boleh melebihi 5MB";
  }

  // Check file type
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    return "Format fail tidak sah. Sila muat naik fail PDF atau JPG sahaja";
  }

  return true;
};

// Then modify the submitForm function to use validation
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

// Go back to the previous page
const goBack = () => {
  router.back();
};

// Add method to preview document
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
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Kemaskini Maklumat Pengesanan Penyamaran</h1>
    </div>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Document Information Section -->
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

        <!-- Personal Information Section -->
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

        <!-- Biometric Scores Section -->
        <FormKit type="group" name="biometricScores">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormKit
              type="number"
              label="Skor Persamaan Muka"
              v-model="formData.skorPersamaanMuka"
              validation="required|number|min_value:0|max_value:100"
              step="0.01"
            />
            <FormKit
              type="number"
              label="Skor Persamaan Cap Jari"
              v-model="formData.skorPersamaanCapJari"
              validation="required|number|min_value:0|max_value:100"
              step="0.01"
            />
          </div>
        </FormKit>

        <!-- Physical Characteristics Section -->
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

        <!-- Facial Features Section -->
        <FormKit type="group" name="facialFeatures">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormKit type="text" label="Mata" v-model="formData.mata" />
            <FormKit type="text" label="Telinga" v-model="formData.telinga" />
            <FormKit type="text" label="Hidung" v-model="formData.hidung" />
            <FormKit type="text" label="Mulut" v-model="formData.mulut" />
          </div>
        </FormKit>

        <!-- Additional Information Section -->
        <FormKit type="group" name="additionalInfo">
          <div class="grid grid-cols-1 gap-4">
            <FormKit
              type="text"
              label="Parut, Tahi Lalat, Tatu, dsb."
              v-model="formData.parut"
            />
            <FormKit
              type="text"
              label="Sejarah Perjalanan"
              v-model="formData.sejarahPerjalanan"
            />
            <FormKit
              type="text"
              label="Persamaan Tanda Tangan"
              v-model="formData.persamaanTandaTangan"
            />
            <FormKit
              type="text"
              label="Pemeriksaan Lain"
              v-model="formData.pemeriksaanLain"
            />
          </div>
        </FormKit>

        <!-- Results Section -->
        <FormKit type="group" name="results">
          <div class="grid grid-cols-1 gap-4">
            <FormKit
              type="select"
              label="Dapatan"
              v-model="formData.dapatan"
              :options="dapatanOptions"
              validation="required"
            />

            <!-- Document Preview Section -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Laporan Sistem TD&B (JPG/PDF)
              </label>

              <!-- Show current document if exists -->
              <div v-if="currentDocument" class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">
                  {{ currentDocument.documentName }}
                </span>
                <rs-button @click="previewDocument" variant="primary" size="sm">
                  Papar Dokumen
                </rs-button>
              </div>

              <!-- File upload input -->
              <FormKit
                v-model="formData.laporanTdb"
                type="file"
                label="Muat Naik Dokumen Baru"
                validation="file|mimes:pdf,jpg"
                :help="
                  currentDocument
                    ? 'Muat naik untuk menggantikan dokumen sedia ada'
                    : ''
                "
              />
            </div>
          </div>
        </FormKit>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <rs-button @click="goBack" variant="danger">Kembali</rs-button>
          <rs-button btn-type="submit" variant="success">Kemaskini</rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style scoped>
/* Add any custom styles here */
.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
