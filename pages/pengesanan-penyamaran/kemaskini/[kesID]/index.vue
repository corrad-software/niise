<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Kemaskini Maklumat Pengesanan Penyamaran</h1>
    </div>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- JENIS DOKUMEN -->
        <FormKit
          type="select"
          label="Jenis Dokumen"
          v-model="formData.jenisDokumen"
          :options="jenisDokumenOptions"
          validation="required"
        />

        <!-- NEGARA -->
        <FormKit
          type="select"
          label="Negara"
          v-model="formData.negara"
          :options="negaraOptions"
          validation="required"
        />

        <!-- NAMA PEMILIK -->
        <FormKit
          type="text"
          label="Nama Pemilik"
          v-model="formData.namaPemilik"
          validation="required"
        />

        <!-- NO DOKUMEN -->
        <FormKit
          type="text"
          label="No Dokumen"
          v-model="formData.noDokumen"
          validation="required"
        />

        <!-- KEWARGANEGARAAN -->
        <FormKit
          type="select"
          label="Kewarganegaraan"
          v-model="formData.kewarganegaraan"
          :options="kewarganegaraanOptions"
          validation="required"
        />

        <!-- TARIKH LAHIR -->
        <FormKit
          type="date"
          label="Tarikh Lahir"
          v-model="formData.tarikhLahir"
          validation="required|date"
        />

        <!-- JANTINA -->
        <FormKit
          type="select"
          label="Jantina"
          v-model="formData.jantina"
          :options="jantinaOptions"
          validation="required"
        />

        <!-- TARIKH LUPUT DOKUMEN -->
        <FormKit
          type="date"
          label="Tarikh Luput Dokumen"
          v-model="formData.tarikhLuputDokumen"
          validation="required|date"
        />

        <!-- SKOR PERSAMAAN MUKA -->
        <FormKit
          type="number"
          label="Skor Persamaan Muka"
          v-model="formData.skorPersamaanMuka"
          validation="required|number|min_value:0|max_value:100"
          step="0.01"
        />

        <!-- SKOR PERSAMAAN CAP JARI -->
        <FormKit
          type="number"
          label="Skor Persamaan Cap Jari"
          v-model="formData.skorPersamaanCapJari"
          validation="required|number|min_value:0|max_value:100"
          step="0.01"
        />

        <!-- OPTIONAL FIELDS -->
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
        <FormKit type="text" label="Mata" v-model="formData.mata" />
        <FormKit type="text" label="Telinga" v-model="formData.telinga" />
        <FormKit type="text" label="Hidung" v-model="formData.hidung" />
        <FormKit type="text" label="Mulut" v-model="formData.mulut" />
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

        <!-- DAPATAN -->
        <FormKit
          type="select"
          label="Dapatan"
          v-model="formData.dapatan"
          :options="dapatanOptions"
          validation="required"
        />

        <!-- LAPORAN SYSTEM TD&B -->
        <FormKit
          type="file"
          label="Laporan Sistem TD&B (JPG/PDF)"
          validation="file|mimes:pdf,jpg"
        />

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
          <rs-button @click="goBack" variant="danger">Kembali</rs-button>
          <rs-button btn-type="submit" variant="success">Kemaskini</rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

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

const fetchAppointment = async (kesID) => {
  try {
    const response = await $fetch(`/api/temujanji/${kesID}`, {
      method: "GET",
    });
    if (response.statusCode === 200) {
      Object.assign(formData.value, response.data);
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

// Submit the updated form data
const submitForm = async () => {
  try {
    const response = await $fetch(`/api/temujanji/${kesID.value}`, {
      method: "PUT",
      body: formData.value,
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
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
