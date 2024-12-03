<script setup>
import { useUserStore } from "~/stores/user";

const { $swal } = useNuxtApp();
const router = useRouter();
const userStore = useUserStore();

const pemohon = ref({
  nama: userStore.name,
  jawatan: userStore.rank,
  noPegawai: userStore.officerNumber,
});

const jenisSemakan = ref("");
const jenisSemakanOptions = ref([
  { label: "Sila Pilih", value: "" },
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

definePageMeta({
  title: "Pengesanan Penyamaran Baru",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Pengesanan Penyamaran",
      path: "/pengesanan-penyamaran/senarai",
    },
    {
      name: "Baru",
      type: "current",
    },
  ],
});
</script>

<template>
  <div>
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">
          Pengesanan Penyamaran Baru
        </h3>
      </div>
    </div>

    <rs-card class="mt-4 px-4 py-6">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Maklumat Pemohon section -->
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
        <!-- Date and Time section -->
        <div class="grid gap-6 md:grid-cols-2">
          <FormKit
            type="date"
            label="Tarikh"
            v-model="tarikh"
            validation="required|date"
          />
          <FormKit
            type="time"
            label="Masa"
            v-model="masa"
            validation="required"
          />
        </div>

        <!-- Jenis Semakan section -->
        <FormKit
          type="select"
          label="Jenis Semakan"
          v-model="jenisSemakan"
          :options="jenisSemakanOptions"
        />

        <!-- Image upload section -->
        <div
          v-if="
            jenisSemakan === 'Subjek Hadir' || jenisSemakan === 'Hantar Gambar'
          "
          class="grid gap-6 md:grid-cols-2 mt-4"
        >
          <div>
            <div v-if="subjekPreview" class="mb-4">
              <img
                :src="subjekPreview"
                alt="Preview Subjek"
                class="max-w-xs rounded-lg shadow-md mx-auto"
              />
            </div>
            <FormKit
              type="file"
              name="gambarSubjek"
              label="Gambar Subjek"
              accept="image/*"
              :validation="jenisSemakan === 'Hantar Gambar' ? 'required' : ''"
              v-model="gambarSubjek"
            >
              <template #label>
                <label class="formkit-label">
                  Gambar Subjek
                  <span
                    v-if="jenisSemakan === 'Hantar Gambar'"
                    class="text-red-500"
                    >*</span
                  >
                </label>
              </template>
            </FormKit>
          </div>

          <div>
            <div v-if="capJariPreview" class="mb-4">
              <img
                :src="capJariPreview"
                alt="Preview Cap Jari"
                class="max-w-xs rounded-lg shadow-md mx-auto"
              />
            </div>
            <FormKit
              type="file"
              name="gambarCapJari"
              label="Gambar Cap Jari"
              accept="image/*"
              :validation="jenisSemakan === 'Hantar Gambar' ? 'required' : ''"
              v-model="gambarCapJari"
            >
              <template #label>
                <label class="formkit-label">
                  Gambar Cap Jari
                  <span
                    v-if="jenisSemakan === 'Hantar Gambar'"
                    class="text-red-500"
                    >*</span
                  >
                </label>
              </template>
            </FormKit>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-8">
          <rs-button @click="goBack" variant="danger">
            <Icon name="pajamas:reply" class="w-4 h-4 mr-2" />
            Kembali
          </rs-button>
          <rs-button btn-type="submit" variant="success">
            <Icon
              name="streamline:interface-upload-laptop-arrow-computer-download-internet-laptop-network-server-up-upload"
              class="w-4 h-4 mr-2"
            />
            Hantar
          </rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style lang="scss" scoped></style>
