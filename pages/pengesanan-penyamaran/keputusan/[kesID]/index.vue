<script setup>
import { useUserStore } from "~/stores/user";
definePageMeta({
  title: "Keputusan Temujanji",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Penyamaran",
      path: "/pengesanan-penyamaran/senarai",
    },
    {
      name: "Keputusan",
      type: "current",
    },
  ],
});
const { $swal } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const temujanji = ref(null);
const loading = ref(true);

const pemohon = ref({
  nama: userStore.name,
  jawatan: userStore.rank,
  noPegawai: userStore.officerNumber,
});

const jenisSemakan = ref("");
const jenisSemakanOptions = ref([
  { label: "Subjek Hadir", value: "Subjek Hadir" },
  { label: "Hantar Gambar", value: "Hantar Gambar" },
]);

const tarikh = ref("");
const masa = ref("");

// Image states
const gambarSubjek = ref(null);
const gambarCapJari = ref(null);

// Image preview states
const subjekPreview = computed(() =>
  gambarSubjek.value?.[0]?.file
    ? URL.createObjectURL(gambarSubjek.value[0].file)
    : temujanji.value?.document_temujanji_gambarSubjekTodocument?.documentURL
);
const capJariPreview = computed(() =>
  gambarCapJari.value?.[0]?.file
    ? URL.createObjectURL(gambarCapJari.value[0].file)
    : temujanji.value?.document_temujanji_gambarCapJariTodocument?.documentURL
);

// Computed properties for temujanji details
const temujanjiDetail = computed(() => temujanji.value?.temujanji_detail || {});

// Format date helper
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ms-MY");
};

// Format file size for display
const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Preview document function
const previewDocument = (doc) => {
  if (!doc?.documentURL) return;

  // For PDFs and other documents, open in new tab
  window.open(doc.documentURL, "_blank");
};

// Fetch temujanji data
const fetchTemujanji = async () => {
  try {
    const response = await $fetch(
      `/api/temujanji/${route.params.kesID}/keputusan`,
      {
        method: "GET",
      }
    );
    if (response.statusCode === 200) {
      temujanji.value = response.data;
      // Set form values
      pemohon.value = {
        nama: temujanji.value.pemohon?.nama_pemohon || "",
        jawatan: temujanji.value.pemohon?.pangkat_pemohon || "",
        noPegawai: temujanji.value.pemohon?.no_pegawai_pemohon || "",
      };
      jenisSemakan.value = temujanji.value.jenisSemakan;
      tarikh.value = new Date(temujanji.value.tarikh)
        .toISOString()
        .split("T")[0];
      masa.value = new Date(temujanji.value.masa).toTimeString().slice(0, 5);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error fetching temujanji:", error);
    $swal.fire("Ralat!", "Gagal mendapatkan maklumat temujanji.", "error");
  } finally {
    loading.value = false;
  }
};

// Submit form function
const submitForm = async () => {
  try {
    // Convert files to base64 if they exist
    const gambarSubjekBase64 = gambarSubjek.value?.[0]
      ? await fileToBase64(gambarSubjek.value[0].file)
      : null;
    const gambarCapJariBase64 = gambarCapJari.value?.[0]
      ? await fileToBase64(gambarCapJari.value[0].file)
      : null;

    const response = await $fetch(
      `/api/temujanji/${route.params.kesID}/keputusan`,
      {
        method: "PUT",
        body: {
          pemohon: pemohon.value,
          jenisSemakan: jenisSemakan.value,
          tarikh: tarikh.value,
          masa: masa.value,
          gambarSubjek: gambarSubjekBase64,
          gambarCapJari: gambarCapJariBase64,
        },
      }
    );

    if (response.statusCode === 200) {
      $swal.fire("Berjaya!", response.message, "success");
      router.push("/pengesanan-penyamaran/senarai");
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error updating temujanji:", error);
    $swal.fire(
      "Ralat!",
      error.message || "Terdapat ralat semasa mengemaskini temujanji.",
      "error"
    );
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Navigate back
const goBack = () => {
  router.back();
};

// Fetch data on mount
onMounted(fetchTemujanji);
</script>

<template>
  <div>
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Keputusan Temujanji</h3>
      </div>
    </div>

    <rs-card class="mt-4 px-4 py-6">
      <div v-if="loading" class="flex justify-center items-center py-8">
        Loading...
      </div>
      <div v-else>
        <FormKit type="form" :actions="false" @submit="submitForm">
          <!-- Section 1: Maklumat Pemohon -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Maklumat Pemohon
            </h4>
            <div class="grid gap-6 md:grid-cols-3">
              <FormKit
                type="text"
                label="Nama Pemohon"
                v-model="pemohon.nama"
                validation="required"
                :disabled="true"
              />
              <FormKit
                type="text"
                label="Jawatan Pemohon"
                v-model="pemohon.jawatan"
                validation="required"
                :disabled="true"
              />
              <FormKit
                type="text"
                label="No Pegawai Pemohon"
                v-model="pemohon.noPegawai"
                validation="required"
                :disabled="true"
              />
            </div>
          </div>

          <!-- Section 2: Maklumat Temujanji -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Maklumat Temujanji
            </h4>
            <div class="grid gap-6 md:grid-cols-2">
              <FormKit
                type="date"
                label="Tarikh"
                v-model="tarikh"
                validation="required|date"
                :disabled="true"
              />
              <FormKit
                type="time"
                label="Masa"
                v-model="masa"
                validation="required"
                :disabled="true"
              />
            </div>
            <div class="mt-4">
              <FormKit
                type="select"
                label="Jenis Semakan"
                v-model="jenisSemakan"
                :options="jenisSemakanOptions"
                :disabled="true"
              />
            </div>
          </div>

          <!-- Section 3: Gambar Pemeriksaan -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Gambar Pemeriksaan
            </h4>
            <div class="grid gap-6 md:grid-cols-2">
              <div class="text-center">
                <h4 class="font-semibold mb-2">Gambar Subjek</h4>
                <img
                  v-if="subjekPreview"
                  :src="subjekPreview"
                  alt="Preview Subjek"
                  class="max-w-xs rounded-lg shadow-md mx-auto mb-2"
                />
                <FormKit
                  type="file"
                  label="Muat Naik Gambar Subjek"
                  v-model="gambarSubjek"
                  accept="image/*"
                  :multiple="false"
                />
              </div>
              <div class="text-center">
                <h4 class="font-semibold mb-2">Gambar Cap Jari</h4>
                <img
                  v-if="capJariPreview"
                  :src="capJariPreview"
                  alt="Preview Cap Jari"
                  class="max-w-xs rounded-lg shadow-md mx-auto mb-2"
                />
                <FormKit
                  type="file"
                  label="Muat Naik Gambar Cap Jari"
                  v-model="gambarCapJari"
                  accept="image/*"
                  :multiple="false"
                />
              </div>
            </div>
          </div>

          <!-- Section 4: Hasil Pemeriksaan -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Hasil Pemeriksaan
            </h4>
            <div class="grid gap-4 md:grid-cols-2">
              <FormKit
                type="text"
                label="Negara"
                :disabled="true"
                v-model="temujanjiDetail.negara"
              />
              <FormKit
                type="text"
                label="Nama Pemilik"
                :disabled="true"
                v-model="temujanjiDetail.namaPemilik"
              />
              <FormKit
                type="text"
                label="No Dokumen"
                :disabled="true"
                v-model="temujanjiDetail.noDokumen"
              />
              <FormKit
                type="text"
                label="Kewarganegaraan"
                :disabled="true"
                v-model="temujanjiDetail.kewarganegaraan"
              />
              <FormKit
                type="text"
                label="Tarikh Lahir"
                :disabled="true"
                :value="formatDate(temujanjiDetail.tarikhLahir)"
              />
              <FormKit
                type="text"
                label="Jantina"
                :disabled="true"
                v-model="temujanjiDetail.jantina"
              />
              <FormKit
                type="text"
                label="Tarikh Luput Dokumen"
                :disabled="true"
                :value="formatDate(temujanjiDetail.tarikhLuputDokumen)"
              />
              <FormKit
                type="text"
                label="Skor Persamaan Muka"
                :disabled="true"
                v-model="temujanjiDetail.skorPersamaanMuka"
              />
              <FormKit
                type="text"
                label="Skor Persamaan Cap Jari"
                :disabled="true"
                v-model="temujanjiDetail.skorPersamaanCapJari"
              />
            </div>
          </div>

          <!-- Section 5: Ciri-ciri Fizikal -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Ciri-ciri Fizikal
            </h4>
            <div class="grid gap-4 md:grid-cols-3">
              <FormKit
                type="text"
                label="Umur"
                :disabled="true"
                v-model="temujanjiDetail.umur"
              />
              <FormKit
                type="text"
                label="Tinggi (CM)"
                :disabled="true"
                v-model="temujanjiDetail.tinggi"
              />
              <FormKit
                type="text"
                label="Warna Rambut"
                :disabled="true"
                v-model="temujanjiDetail.warnaRambut"
              />
              <FormKit
                type="text"
                label="Bangsa"
                :disabled="true"
                v-model="temujanjiDetail.bangsa"
              />
              <FormKit
                type="text"
                label="Kumpulan Etnik"
                :disabled="true"
                v-model="temujanjiDetail.etnik"
              />
              <FormKit
                type="text"
                label="Bentuk Kepala"
                :disabled="true"
                v-model="temujanjiDetail.bentukKepala"
              />
            </div>
          </div>

          <!-- Section 6: Ciri-ciri Wajah -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Ciri-ciri Wajah
            </h4>
            <div class="grid gap-4 md:grid-cols-4">
              <FormKit
                type="text"
                label="Mata"
                :disabled="true"
                v-model="temujanjiDetail.mata"
              />
              <FormKit
                type="text"
                label="Telinga"
                :disabled="true"
                v-model="temujanjiDetail.telinga"
              />
              <FormKit
                type="text"
                label="Hidung"
                :disabled="true"
                v-model="temujanjiDetail.hidung"
              />
              <FormKit
                type="text"
                label="Mulut"
                :disabled="true"
                v-model="temujanjiDetail.mulut"
              />
            </div>
          </div>

          <!-- Section 7: Maklumat Tambahan -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Maklumat Tambahan
            </h4>
            <div class="grid gap-4 md:grid-cols-1">
              <FormKit
                type="textarea"
                label="Parut, Tahi Lalat, Tatu dan Sebagainya"
                :disabled="true"
                v-model="temujanjiDetail.parut"
              />
              <FormKit
                type="textarea"
                label="Sejarah Perjalanan"
                :disabled="true"
                v-model="temujanjiDetail.sejarahPerjalanan"
              />
              <FormKit
                type="text"
                label="Persamaan Tandatangan"
                :disabled="true"
                v-model="temujanjiDetail.persamaanTandaTangan"
              />
              <FormKit
                type="textarea"
                label="Pemeriksaan Lain"
                :disabled="true"
                v-model="temujanjiDetail.pemeriksaanLain"
              />
              <FormKit
                type="textarea"
                label="Dapatan"
                :disabled="true"
                v-model="temujanjiDetail.dapatan"
              />
            </div>
          </div>

          <!-- Section 8: Laporan TD&B -->
          <div class="mb-8">
            <h4 class="text-lg font-semibold mb-4 pb-2 border-b">
              Laporan TD&B
            </h4>
            <div v-if="temujanjiDetail.document?.documentURL">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  class="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div class="flex flex-col">
                    <div
                      class="cursor-pointer mb-2 flex justify-center items-center h-40 bg-gray-100 rounded"
                      @click="previewDocument(temujanjiDetail.document)"
                    >
                      <div class="flex flex-col items-center">
                        <Icon
                          name="mdi:file-pdf-box"
                          class="w-16 h-16 text-red-500"
                        />
                        <span class="mt-2 text-sm">Klik untuk lihat PDF</span>
                      </div>
                    </div>

                    <div class="space-y-1">
                      <h4
                        class="font-medium text-lg truncate"
                        :title="temujanjiDetail.document.documentName"
                      >
                        {{
                          temujanjiDetail.document.documentName ||
                          "Laporan TD&B"
                        }}
                      </h4>
                      <div class="text-xs text-gray-500">
                        <p>
                          Saiz:
                          {{
                            formatFileSize(
                              temujanjiDetail.document.documentSize
                            )
                          }}
                        </p>
                        <p>
                          Tarikh:
                          {{
                            formatDate(
                              temujanjiDetail.document.documentCreatedDate
                            )
                          }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2 mt-4">
            <rs-button @click="goBack" variant="danger">
              <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
              Kembali
            </rs-button>
            <rs-button btn-type="submit" variant="success" class="mr-2">
              <Icon name="ci:save" class="w-4 h-4 mr-2" />
              Kemaskini
            </rs-button>
          </div>
        </FormKit>
      </div>
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
