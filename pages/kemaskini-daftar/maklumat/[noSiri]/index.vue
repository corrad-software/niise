<template>
  <div>
    <!-- CARD: Status Semakan & Status Penerimaan -->
    <rs-card class="mt-4 p-4">
      <div class="flex justify-between">
        <h3>Status Semakan</h3>
        <rs-badge
          :variant="statusSemakan === 'Selesai' ? 'success' : 'warning'"
        >
          {{ statusSemakan }}
        </rs-badge>
      </div>
      <div class="flex justify-between mt-2">
        <h3>Status Penerimaan</h3>
        <rs-badge
          :variant="statusPenerimaan === 'Diterima' ? 'success' : 'danger'"
        >
          {{ statusPenerimaan }}
        </rs-badge>
      </div>
    </rs-card>

    <!-- LIST: Pegawai Forensic Yang Terlibat -->
    <rs-card class="mt-4 p-4">
      <div class="flex justify-between items-center">
        <h3>Pegawai Forensik Yang Terlibat</h3>
        <rs-button
          v-if="isKetuaBahagian"
          @click="addPegawai"
          variant="primary"
          size="sm"
          >Tambah Pegawai</rs-button
        >
      </div>
      <rs-table
        :data="forensicOfficers"
        :options="{ striped: true, borderless: true }"
      >
        <template v-slot:header>
          <tr>
            <th>Pangkat</th>
            <th>Nama</th>
            <th>No Pegawai</th>
            <th v-if="isKetuaBahagian">Tindakan</th>
          </tr>
        </template>
        <template v-slot:pangkat="data">
          {{ data.text }}
        </template>
        <template v-slot:nama="data">
          {{ data.text }}
        </template>
        <template v-slot:noPegawai="data">
          {{ data.text }}
        </template>
        <template v-slot:action="data" v-if="isKetuaBahagian">
          <div class="flex gap-2">
            <rs-button @click="editPegawai(data.value)" variant="info" size="sm"
              >Edit</rs-button
            >
            <rs-button
              @click="deletePegawai(data.value)"
              variant="danger"
              size="sm"
              >Delete</rs-button
            >
          </div>
        </template>
      </rs-table>
    </rs-card>

    <!-- LIST: Bahan Bukti -->
    <rs-card class="mt-4 p-4">
      <h3>Bahan Bukti</h3>
      <rs-table
        :data="evidences"
        :options="{ striped: true, borderless: true }"
      >
        <template v-slot:header>
          <tr>
            <th>No</th>
            <th>Jenis Barang</th>
            <th>Tag No.</th>
            <th>Keadaan</th>
            <th>Kuantiti</th>
            <th v-if="!isKetuaJabatan">Tindakan</th>
          </tr>
        </template>
        <template v-slot:no="data">
          {{ data.text }}
        </template>
        <template v-slot:jenisBarang="data">
          {{ data.text }}
        </template>
        <template v-slot:tagNo="data">
          {{ data.text }}
        </template>
        <template v-slot:keadaan="data">
          {{ data.text }}
        </template>
        <template v-slot:kuantiti="data">
          {{ data.text }}
        </template>
        <template v-slot:action="data" v-if="!isKetuaJabatan">
          <rs-button
            @click="generateReport(data.value)"
            variant="primary"
            size="sm"
            >Jana Laporan</rs-button
          >
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useNuxtApp } from "nuxt/app";

// Status data
const statusSemakan = ref("Selesai"); // Can be dynamic (e.g., "Dalam Proses", "Selesai")
const statusPenerimaan = ref("Diterima"); // Can be dynamic (e.g., "Diterima", "Ditolak")

// Forensic Officers Data (Pangkat, Nama, No Pegawai)
const forensicOfficers = ref([
  { pangkat: "Inspektor", nama: "Ali bin Abu", noPegawai: "PG12345" },
  { pangkat: "Sarjan", nama: "Siti binti Ahmad", noPegawai: "PG54321" },
]);

// Evidence Data (No, Jenis Barang, Tag No, Keadaan, Kuantiti)
const evidences = ref([
  {
    no: 1,
    jenisBarang: "Dokumen",
    tagNo: "TAG001",
    keadaan: "Baik",
    kuantiti: 3,
  },
  {
    no: 2,
    jenisBarang: "Peralatan Elektronik",
    tagNo: "TAG002",
    keadaan: "Rosak",
    kuantiti: 5,
  },
]);

// User Roles
const isKetuaBahagian = ref(true); // Simulate role check
const isKetuaJabatan = ref(false); // Simulate role check

// Actions
const addPegawai = () => {
  console.log("Add Pegawai clicked");
};

const editPegawai = (pegawai) => {
  console.log("Edit Pegawai:", pegawai);
};

const deletePegawai = (pegawai) => {
  console.log("Delete Pegawai:", pegawai);
  forensicOfficers.value = forensicOfficers.value.filter(
    (officer) => officer.noPegawai !== pegawai.noPegawai
  );
};

const generateReport = (bahanBukti) => {
  console.log("Generate Report for:", bahanBukti);
};
</script>

<style lang="scss" scoped>
/* Style customizations for table or buttons */
</style>
