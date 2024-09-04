<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Permohonan Baru</h1>
    </div>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- Nama Pemohon Input -->
        <FormKit
          type="text"
          label="Nama Pemohon"
          v-model="namaPemohon"
          validation="required"
        />

        <!-- Pangkat Pemohon Input -->
        <FormKit
          type="text"
          label="Pangkat Pemohon"
          v-model="pangkatPemohon"
          validation="required"
        />

        <!-- No Pegawai Pemohon Input -->
        <FormKit
          type="text"
          label="No Pegawai Pemohon"
          v-model="noPegawaiPemohon"
          validation="required"
        />

        <!-- Checkbox: Apply Pemohon info to Penghantar -->
        <FormKit
          type="checkbox"
          label="Penghantar Sama seperti Pemohon"
          v-model="isPenghantarSameAsPemohon"
        />

        <!-- Conditionally render Nama Penghantar field if checkbox is not checked -->
        <FormKit
          v-if="!isPenghantarSameAsPemohon"
          type="text"
          label="Nama Penghantar"
          v-model="namaPenghantar"
          validation="required"
        />

        <!-- Conditionally render Pangkat Penghantar field if checkbox is not checked -->
        <FormKit
          v-if="!isPenghantarSameAsPemohon"
          type="text"
          label="Pangkat Penghantar"
          v-model="pangkatPenghantar"
          validation="required"
        />

        <!-- Conditionally render No Pegawai Penghantar field if checkbox is not checked -->
        <FormKit
          v-if="!isPenghantarSameAsPemohon"
          type="text"
          label="No Pegawai Penghantar"
          v-model="noPegawaiPenghantar"
          validation="required"
        />

        <!-- Ringkasan Kenyataan Kes Input -->
        <FormKit
          type="textarea"
          label="Ringkasan Kenyataan Kes"
          v-model="ringkasanKenyataanKes"
          validation="required"
        />

        <!-- Bilangan Input -->
        <FormKit
          type="number"
          label="Bilangan"
          v-model="bilangan"
          validation="required|number"
        />

        <!-- Jenis Barang Input -->
        <FormKit
          type="text"
          label="Jenis Barang"
          v-model="jenisBarang"
          validation="required"
        />

        <!-- Tanda Barang Input -->
        <FormKit
          type="text"
          label="Tanda Barang"
          v-model="tandaBarang"
          validation="required"
        />

        <!-- Keadaan Barang Input -->
        <FormKit
          type="text"
          label="Keadaan Barang"
          v-model="keadaanBarang"
          validation="required"
        />

        <!-- Kuantiti Barang Input -->
        <FormKit
          type="number"
          label="Kuantiti Barang"
          v-model="kuantitiBarang"
          validation="required|number"
        />

        <!-- Jenis Barang Detail Select Input -->
        <FormKit
          type="select"
          label="Jenis Barang"
          v-model="jenisBarangDetail"
          :options="jenisBarangDetailOptions"
          validation="required"
        />

        <!-- Jenis Barang Siber Select Input -->
        <FormKit
          type="select"
          label="Jenis Barang Siber"
          v-model="jenisBarangSiber"
          :options="jenisBarangSiberOptions"
          validation="required"
        />

        <!-- No Kertas Siasatan Input -->
        <FormKit
          type="text"
          label="No Kertas Siasatan"
          v-model="noKertasSiasatan"
          validation="required"
        />

        <!-- No Laporan Polis Input -->
        <FormKit
          type="text"
          label="No Laporan Polis"
          v-model="noLaporanPolis"
          validation="required"
        />

        <!-- Tarikh Temujanji Input -->
        <FormKit
          type="date"
          label="Tarikh temujanji"
          v-model="tarikhTemujanji"
          validation="required|date|after:today"
          :validation-messages="{
            after: 'Tarikh temujanji harus selepas hari ini',
          }"
        />

        <!-- Slot Masa Input -->
        <FormKit
          type="time"
          label="Slot masa"
          v-model="slotMasa"
          validation="required"
        />

        <!-- Action Buttons -->
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
import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const namaPemohon = ref("");
const pangkatPemohon = ref("");
const noPegawaiPemohon = ref("");
const namaPenghantar = ref("");
const pangkatPenghantar = ref("");
const noPegawaiPenghantar = ref("");
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
const tarikhTemujanji = ref("");
const slotMasa = ref("");

// State for single checkbox
const isPenghantarSameAsPemohon = ref(false);

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

// Watcher to update Penghantar fields when the single checkbox is checked
watch(isPenghantarSameAsPemohon, (newValue) => {
  if (newValue) {
    // Copy values from Pemohon fields to Penghantar fields
    namaPenghantar.value = namaPemohon.value;
    pangkatPenghantar.value = pangkatPemohon.value;
    noPegawaiPenghantar.value = noPegawaiPemohon.value;
  } else {
    // Clear Penghantar fields when unchecked
    namaPenghantar.value = "";
    pangkatPenghantar.value = "";
    noPegawaiPenghantar.value = "";
  }
});

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
    noPegawaiPenghantar,
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
    tarikhTemujanji,
    slotMasa,
  ];

  return requiredFields.every(
    (field) => field.value !== "" && field.value !== 0
  );
};

const simpan = () => {
  $swal
    .fire({
      title: "Adakah anda pasti?",
      text: "Borang boleh dikemaskini selepas di simpan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hantar",
      cancelButtonText: "Batal",
    })
    .then((result) => {
      if (result.isConfirmed) {
        // Handle form submission
        console.log({
          namaPemohon: namaPemohon.value,
          pangkatPemohon: pangkatPemohon.value,
          noPegawaiPemohon: noPegawaiPemohon.value,
          namaPenghantar: namaPenghantar.value,
          pangkatPenghantar: pangkatPenghantar.value,
          noPegawaiPenghantar: noPegawaiPenghantar.value,
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
          tarikhTemujanji: tarikhTemujanji.value,
          slotMasa: slotMasa.value,
        });

        // Show success message
        $swal.fire({
          title: "Berjaya!",
          text: "Borang telah berjaya disimpan.",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    });
};

const submitForm = () => {
  $swal
    .fire({
      title: "Adakah anda pasti?",
      text: "Anda tidak boleh mengubah maklumat selepas borang dihantar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hantar",
      cancelButtonText: "Batal",
    })
    .then((result) => {
      if (result.isConfirmed) {
        if (isFormValid()) {
          // Handle form submission
          console.log({
            namaPemohon: namaPemohon.value,
            pangkatPemohon: pangkatPemohon.value,
            noPegawaiPemohon: noPegawaiPemohon.value,
            namaPenghantar: namaPenghantar.value,
            pangkatPenghantar: pangkatPenghantar.value,
            noPegawaiPenghantar: noPegawaiPenghantar.value,
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
            tarikhTemujanji: tarikhTemujanji.value,
            slotMasa: slotMasa.value,
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
      }
    });
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
