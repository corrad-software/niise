<template>
  <div>
    <h1>Tambah Temujanji</h1>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Maklumat Pemohon (Auto-filled) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormKit type="text" label="Nama Pemohon" v-model="pemohon.nama" />
          <FormKit
            type="text"
            label="Jawatan Pemohon"
            v-model="pemohon.jawatan"
          />
          <FormKit
            type="text"
            label="No Pegawai Pemohon"
            v-model="pemohon.noPegawai"
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
          <FormKit type="file" label="Gambar Subjek" />
          <FormKit type="file" label="Gambar Cap Jari" />
        </template>

        <template v-else-if="jenisSemakan === 'Hantar Gambar'">
          <FormKit type="file" label="Gambar Subjek" validation="required" />
          <FormKit type="file" label="Gambar Cap Jari" validation="required" />
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

// Navigate back to the listing page
const goBack = () => {
  router.back();
};

// Submit form function
const submitForm = async (formData) => {
  try {
    const response = await $fetch("/api/temujanji/tambah", {
      method: "POST",
      body: {
        pemohon: pemohon.value,
        jenisSemakan: jenisSemakan.value,
        tarikh: tarikh.value,
        masa: masa.value,
        ...formData,
      },
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
</script>
