<script setup>
const { $swal } = useNuxtApp();
const router = useRouter();
const route = useRoute();

const temujanji = ref(null);
const loading = ref(true);

const pemohon = ref({
  nama: "",
  jawatan: "",
  noPegawai: "",
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
    <h1>Keputusan Temujanji</h1>

    <rs-card class="mt-4 p-4">
      <div v-if="loading">Loading...</div>
      <div v-else>
        <FormKit type="form" :actions="false" @submit="submitForm">
          <!-- Maklumat Pemohon -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <!-- Jenis Semakan -->
          <FormKit
            type="select"
            label="Jenis Semakan"
            v-model="jenisSemakan"
            :options="jenisSemakanOptions"
            validation="required"
            :disabled="true"
          />

          <!-- Images section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h6 v-if="jenisSemakan !== 'Subjek Hadir'">Gambar Subjek</h6>
              <div class="mt-2 flex justify-center mb-2">
                <img
                  v-if="subjekPreview"
                  :src="subjekPreview"
                  alt="Preview Subjek"
                  class="max-w-xs rounded-lg shadow-md"
                />
              </div>
              <FormKit
                v-if="jenisSemakan === 'Subjek Hadir'"
                type="file"
                name="gambarSubjek"
                label="Gambar Subjek"
                accept="image/*"
                v-model="gambarSubjek"
              />
            </div>
            <div>
              <h6 v-if="jenisSemakan !== 'Subjek Hadir'">Gambar Cap Jari</h6>
              <div class="mt-2 flex justify-center mb-2">
                <img
                  v-if="capJariPreview"
                  :src="capJariPreview"
                  alt="Preview Cap Jari"
                  class="max-w-xs rounded-lg shadow-md"
                />
              </div>
              <FormKit
                v-if="jenisSemakan === 'Subjek Hadir'"
                type="file"
                name="gambarCapJari"
                label="Gambar Cap Jari"
                accept="image/*"
                v-model="gambarCapJari"
              />
            </div>
          </div>

          <!-- Date and Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

          <!-- Action Buttons -->
          <div class="flex justify-end gap-2 mt-4">
            <rs-button @click="goBack" variant="danger">Kembali</rs-button>
            <rs-button
              v-if="jenisSemakan === 'Subjek Hadir'"
              btn-type="submit"
              variant="success"
              >Kemaskini</rs-button
            >
          </div>
        </FormKit>
      </div>
    </rs-card>
  </div>
</template>
