<script setup>
const { $swal } = useNuxtApp();
const router = useRouter();

const pemohon = ref({
  nama: "",
  jawatan: "",
  noPegawai: "",
});

const jenisSemakan = ref("Subjek Hadir");
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
    : null
);
const capJariPreview = computed(() =>
  gambarCapJari.value?.[0]?.file
    ? URL.createObjectURL(gambarCapJari.value[0].file)
    : null
);

// Navigate back to the listing page
const goBack = () => {
  router.back();
};

// Submit form function
const submitForm = async (formData) => {
  try {
    // Convert files to base64
    const gambarSubjekBase64 = gambarSubjek.value?.[0]
      ? await fileToBase64(formData.gambarSubjek[0].file)
      : null;
    const gambarCapJariBase64 = gambarCapJari.value?.[0]
      ? await fileToBase64(formData.gambarCapJari[0].file)
      : null;

    const response = await $fetch("/api/temujanji/tambah", {
      method: "POST",
      body: {
        pemohon: pemohon.value,
        jenisSemakan: jenisSemakan.value,
        tarikh: tarikh.value,
        masa: masa.value,
        gambarSubjek: gambarSubjekBase64,
        gambarCapJari: gambarCapJariBase64,
      },
    });

    if (response.statusCode === 200) {
      $swal.fire("Berjaya!", response.message, "success");
      router.push("/pengesanan-penyamaran/senarai");
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    $swal.fire(
      "Ralat!",
      error.message || "Terdapat ralat semasa menambah temujanji.",
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
</script>

<template>
  <div>
    <h1>Tambah Temujanji</h1>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Maklumat Pemohon (Auto-filled) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormKit
            type="text"
            label="Nama Pemohon"
            v-model="pemohon.nama"
            validation="required"
          />
          <FormKit
            type="text"
            label="Jawatan Pemohon"
            v-model="pemohon.jawatan"
            validation="required"
          />
          <FormKit
            type="text"
            label="No Pegawai Pemohon"
            v-model="pemohon.noPegawai"
            validation="required"
          />
        </div>

        <!-- Jenis Semakan Dropdown -->
        <FormKit
          type="select"
          label="Jenis Semakan"
          v-model="jenisSemakan"
          :options="jenisSemakanOptions"
          validation="required"
        />

        <!-- Conditional fields based on jenisSemakan -->
        <template v-if="jenisSemakan === 'Subjek Hadir'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div v-if="subjekPreview" class="mt-2 flex justify-center mb-2">
                <img
                  :src="subjekPreview"
                  alt="Preview Subjek"
                  class="max-w-xs rounded-lg shadow-md"
                />
              </div>
              <FormKit
                type="file"
                name="gambarSubjek"
                label="Gambar Subjek"
                accept="image/*"
                v-model="gambarSubjek"
              />
            </div>
            <div>
              <div v-if="capJariPreview" class="mt-2 flex justify-center mb-2">
                <img
                  :src="capJariPreview"
                  alt="Preview Cap Jari"
                  class="max-w-xs rounded-lg shadow-md"
                />
              </div>
              <FormKit
                type="file"
                name="gambarCapJari"
                label="Gambar Cap Jari"
                accept="image/*"
                v-model="gambarCapJari"
              />
            </div>
          </div>
        </template>

        <template v-else-if="jenisSemakan === 'Hantar Gambar'">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div v-if="subjekPreview" class="mt-2 flex justify-center mb-2">
                <img
                  :src="subjekPreview"
                  alt="Preview Subjek"
                  class="max-w-xs rounded-lg shadow-md"
                />
              </div>
              <FormKit
                type="file"
                name="gambarSubjek"
                label="Gambar Subjek"
                accept="image/*"
                validation="required"
                v-model="gambarSubjek"
              >
                <template #label>
                  <label
                    class="formkit-label formkit-label-global formkit-outer-text"
                  >
                    Gambar Subjek
                    <span class="text-red-500">*</span>
                  </label>
                </template>
              </FormKit>
            </div>
            <div>
              <div v-if="capJariPreview" class="mt-2 flex justify-center mb-2">
                <img
                  :src="capJariPreview"
                  alt="Preview Cap Jari"
                  class="max-w-xs rounded-lg shadow-md"
                />
              </div>
              <FormKit
                type="file"
                name="gambarCapJari"
                label="Gambar Cap Jari"
                accept="image/*"
                validation="required"
                v-model="gambarCapJari"
              >
                <template #label>
                  <label
                    class="formkit-label formkit-label-global formkit-outer-text"
                  >
                    Gambar Cap Jari
                    <span class="text-red-500">*</span>
                  </label>
                </template>
              </FormKit>
            </div>
          </div>
        </template>

        <!-- Date field -->
        <FormKit
          type="date"
          label="Tarikh"
          v-model="tarikh"
          validation="required|date"
        />

        <!-- Time field -->
        <FormKit
          type="time"
          label="Masa"
          v-model="masa"
          validation="required"
        />

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <rs-button @click="goBack" variant="danger">Kembali</rs-button>
          <rs-button btn-type="submit" variant="success">Hantar</rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>
