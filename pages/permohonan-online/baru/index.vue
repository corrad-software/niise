<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Permohonan Baru</h1>
    </div>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <FormKit
          type="text"
          label="Nama Pemohon"
          v-model="namaPemohon"
          validation="required"
        />
        <FormKit
          type="text"
          label="Pangkat Pemohon"
          v-model="pangkatPemohon"
          validation="required"
        />
        <FormKit
          type="text"
          label="No Pegawai Pemohon"
          v-model="noPegawaiPemohon"
          validation="required"
        />
        <FormKit
          type="text"
          label="Nama Penghantar"
          v-model="namaPenghantar"
          validation="required"
        />
        <FormKit
          type="text"
          label="Pangkat Penghantar"
          v-model="pangkatPenghantar"
          validation="required"
        />
        <FormKit
          type="textarea"
          label="Ringkasan Kenyataan Kes"
          v-model="ringkasanKenyataanKes"
          validation="required"
        />
        <FormKit
          type="number"
          label="Bilangan"
          v-model="bilangan"
          validation="required|number"
        />
        <FormKit
          type="text"
          label="Jenis Barang"
          v-model="jenisBarang"
          validation="required"
        />
        <FormKit
          type="text"
          label="Tanda Barang"
          v-model="tandaBarang"
          validation="required"
        />
        <FormKit
          type="text"
          label="Keadaan Barang"
          v-model="keadaanBarang"
          validation="required"
        />
        <FormKit
          type="number"
          label="Kuantiti Barang"
          v-model="kuantitiBarang"
          validation="required|number"
        />
        <FormKit
          type="select"
          label="Jenis Barang"
          v-model="jenisBarangDetail"
          :options="jenisBarangDetailOptions"
          validation="required"
        />
        <FormKit
          type="select"
          label="Jenis Barang Siber"
          v-model="jenisBarangSiber"
          :options="jenisBarangSiberOptions"
          validation="required"
        />
        <FormKit
          type="text"
          label="No Kertas Siasatan"
          v-model="noKertasSiasatan"
          validation="required"
        />
        <FormKit
          type="text"
          label="No Laporan Polis"
          v-model="noLaporanPolis"
          validation="required"
        />
        <div class="flex justify-end gap-2 mt-4">
          <rs-button type="button" @click="navigateBack" variant="danger"
            >Kembali</rs-button
          >
          <rs-button
            type="button"
            btn-type="submit"
            @click="simpan"
            variant="primary"
            >Simpan</rs-button
          >
          <rs-button
            type="submit"
            @click="submitForm"
            btn-type="submit"
            variant="success"
            >Hantar</rs-button
          >
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const namaPemohon = ref("");
const pangkatPemohon = ref("");
const noPegawaiPemohon = ref("");
const namaPenghantar = ref("");
const pangkatPenghantar = ref("");
const ringkasanKenyataanKes = ref("");
const bilangan = ref(0);
const jenisBarang = ref("");
const tandaBarang = ref("");
const keadaanBarang = ref("");
const kuantitiBarang = ref(0);
const jenisBarangDetail = ref("");
const jenisBarangSiber = ref("");
const noKertasSiasatan = ref("");
const noLaporanPolis = ref("");

const jenisBarangDetailOptions = [
  "PASPORT",
  "MALPASS",
  "CAP KESELAMATAN",
  "CAP JARI",
  "PEMERIKSAAN",
  "I-KAD",
  "LAIN-LAIN",
];

const jenisBarangSiberOptions = ["SIBER", "TULISAN TANGAN"];

const navigateBack = () => {
  router.back();
};

const isFormValid = () => {
  const requiredFields = [
    namaPemohon,
    pangkatPemohon,
    noPegawaiPemohon,
    namaPenghantar,
    pangkatPenghantar,
    ringkasanKenyataanKes,
    bilangan,
    jenisBarang,
    tandaBarang,
    keadaanBarang,
    kuantitiBarang,
    jenisBarangDetail,
    jenisBarangSiber,
    noKertasSiasatan,
    noLaporanPolis,
  ];

  return requiredFields.every(
    (field) => field.value !== "" && field.value !== 0
  );
};

const simpan = () => {
  if (isFormValid()) {
    // Save form data logic
    console.log("Form data saved");
  } else {
    console.error("Please fill in all required fields.");
  }
};

const submitForm = () => {
  if (isFormValid()) {
    // Handle form submission
    console.log({
      namaPemohon: namaPemohon.value,
      pangkatPemohon: pangkatPemohon.value,
      noPegawaiPemohon: noPegawaiPemohon.value,
      namaPenghantar: namaPenghantar.value,
      pangkatPenghantar: pangkatPenghantar.value,
      ringkasanKenyataanKes: ringkasanKenyataanKes.value,
      bilangan: bilangan.value,
      jenisBarang: jenisBarang.value,
      tandaBarang: tandaBarang.value,
      keadaanBarang: keadaanBarang.value,
      kuantitiBarang: kuantitiBarang.value,
      jenisBarangDetail: jenisBarangDetail.value,
      jenisBarangSiber: jenisBarangSiber.value,
      noKertasSiasatan: noKertasSiasatan.value,
      noLaporanPolis: noLaporanPolis.value,
    });

    // Show success message
    $swal.fire({
      title: "Berjaya!",
      text: "Borang telah berjaya dihantar.",
      icon: "success",
      confirmButtonText: "OK",
    });
  } else {
    // Show error message
    $swal.fire({
      title: "Ralat!",
      text: "Sila isi semua medan yang diperlukan.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

const { $swal } = useNuxtApp();
</script>

<style lang="scss" scoped>
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