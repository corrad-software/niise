<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Kemaskini Permohonan</h1>
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
            @click="simpan"
            btn-type="submit"
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
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const noSiri = ref(route.params.noSiri);

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

function generateSampleData(noSiri) {
  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1) + min);
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const namaPemohon = [
    "Ali bin Abu",
    "Siti binti Ahmad",
    "Muthu a/l Rajan",
    "Lim Wei Ling",
  ];
  const pangkat = ["Inspektor", "Sarjan", "Koperal", "Konstabel"];
  const jenisBarangOptions = [
    "Dokumen",
    "Peralatan Elektronik",
    "Senjata",
    "Dadah",
    "Barang Kemas",
  ];
  const keadaanBarangOptions = ["Baik", "Sederhana", "Rosak"];

  return {
    noSiri: noSiri,
    namaPemohon: randomChoice(namaPemohon),
    pangkatPemohon: randomChoice(pangkat),
    noPegawaiPemohon: `PG${randomNumber(10000, 99999)}`,
    namaPenghantar: randomChoice(namaPemohon),
    pangkatPenghantar: randomChoice(pangkat),
    ringkasanKenyataanKes: `Kes ${noSiri}: Penemuan barang bukti dalam serbuan di lokasi ${randomChoice(
      ["A", "B", "C", "D"]
    )}`,
    bilangan: randomNumber(1, 10),
    jenisBarang: randomChoice(jenisBarangOptions),
    tandaBarang: `TB-${randomNumber(1000, 9999)}`,
    keadaanBarang: randomChoice(keadaanBarangOptions),
    kuantitiBarang: randomNumber(1, 100),
    jenisBarangDetail: randomChoice(jenisBarangDetailOptions),
    jenisBarangSiber: randomChoice(jenisBarangSiberOptions),
    noKertasSiasatan: `KS-${randomNumber(10000, 99999)}`,
    noLaporanPolis: `RPT-${randomNumber(100000, 999999)}`,
  };
}

onMounted(() => {
  const sampleData = generateSampleData(noSiri.value);

  namaPemohon.value = sampleData.namaPemohon;
  pangkatPemohon.value = sampleData.pangkatPemohon;
  noPegawaiPemohon.value = sampleData.noPegawaiPemohon;
  namaPenghantar.value = sampleData.namaPenghantar;
  pangkatPenghantar.value = sampleData.pangkatPenghantar;
  ringkasanKenyataanKes.value = sampleData.ringkasanKenyataanKes;
  bilangan.value = sampleData.bilangan;
  jenisBarang.value = sampleData.jenisBarang;
  tandaBarang.value = sampleData.tandaBarang;
  keadaanBarang.value = sampleData.keadaanBarang;
  kuantitiBarang.value = sampleData.kuantitiBarang;
  jenisBarangDetail.value = sampleData.jenisBarangDetail;
  jenisBarangSiber.value = sampleData.jenisBarangSiber;
  noKertasSiasatan.value = sampleData.noKertasSiasatan;
  noLaporanPolis.value = sampleData.noLaporanPolis;
});

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