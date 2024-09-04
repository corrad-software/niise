<template>
  <div class="space-y-6">
    <!-- CARD: Status Semakan & Status Penerimaan -->
    <rs-card class="p-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Status Semakan</h3>
        <rs-badge
          :variant="statusSemakan === 'Selesai' ? 'success' : 'warning'"
        >
          {{ statusSemakan }}
        </rs-badge>
      </div>
      <div class="flex justify-between items-center mt-4">
        <h3 class="text-lg font-semibold">Status Penerimaan</h3>
        <rs-badge
          :variant="statusPenerimaan === 'Diterima' ? 'success' : 'danger'"
        >
          {{ statusPenerimaan }}
        </rs-badge>
      </div>
    </rs-card>

    <!-- LIST: Pegawai Forensic Yang Terlibat -->
    <rs-card class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Pegawai Forensik Yang Terlibat</h3>
        <rs-button
          v-if="isKetuaBahagian"
          @click="openAddModal"
          variant="primary"
          size="sm"
        >
          Tambah Pegawai
        </rs-button>
      </div>
      <rs-table
        v-if="forensicOfficers.length > 0"
        :data="forensicOfficers"
        :options="{
          variant: 'default',
          striped: true,
          borderless: false,
        }"
        :options-advanced="{
          sortable: true,
          responsive: true,
          filterable: false,
        }"
        advanced
      >
        <template v-slot:header>
          <tr>
            <th>Pangkat</th>
            <th>Nama</th>
            <th>No Pegawai</th>
            <th>Tindakan</th>
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
        <template v-slot:tindakan="data">
          <div class="flex gap-2">
            <rs-button
              @click="openEditModal(data.value)"
              variant="info"
              size="sm"
            >
              <Icon name="ic:baseline-edit" size="1.2rem" />
            </rs-button>
            <rs-button
              @click="confirmDelete(data.value)"
              variant="danger"
              size="sm"
            >
              <Icon name="ic:baseline-delete" size="1.2rem" />
            </rs-button>
          </div>
        </template>
      </rs-table>
      <div v-else class="text-center p-10">
        <p>Tidak ada pegawai forensik yang terlibat.</p>
      </div>
    </rs-card>

    <!-- LIST: Bahan Bukti -->
    <rs-card class="p-6">
      <h3 class="text-lg font-semibold mb-4">Bahan Bukti</h3>
      <rs-table
        :data="evidences"
        :options="{
          variant: 'default',
          striped: true,
          borderless: false,
        }"
        :options-advanced="{
          sortable: true,
          responsive: true,
          filterable: false,
        }"
        advanced
      >
        <template v-slot:header>
          <tr>
            <th>No</th>
            <th>Jenis Barang</th>
            <th>Tag No.</th>
            <th>Keadaan</th>
            <th>Kuantiti</th>
            <th>Tindakan</th>
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
          >
            Jana Laporan
          </rs-button>
        </template>
      </rs-table>
    </rs-card>

    <!-- Add/Edit Modal -->
    <rs-modal v-model="showModal" @close="closeModal">
      <template #header>
        <h3>
          {{ editMode ? "Edit Pegawai Forensik" : "Tambah Pegawai Forensik" }}
        </h3>
      </template>
      <template #body>
        <FormKit
          type="form"
          :actions="false"
          @submit="handleSubmit"
          :value="pegawaiForm"
        >
          <FormKit
            v-if="!editMode"
            type="select"
            name="id"
            label="Pilih Pegawai"
            :options="pegawaiList.map(p => ({ value: p.id, label: `${p.pangkat} ${p.nama} (${p.noPegawai})` }))"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih pegawai',
            }"
          />
          <template v-else>
            <FormKit
              type="text"
              name="pangkat"
              label="Pangkat"
              validation="required"
              :validation-messages="{
                required: 'Pangkat diperlukan',
              }"
            />
            <FormKit
              type="text"
              name="nama"
              label="Nama"
              validation="required"
              :validation-messages="{
                required: 'Nama diperlukan',
              }"
            />
            <FormKit
              type="text"
              name="noPegawai"
              label="No Pegawai"
              validation="required|unique:noPegawai"
              :validation-messages="{
                required: 'No Pegawai diperlukan',
                unique: 'No Pegawai sudah wujud',
              }"
            />
          </template>

          <div class="flex justify-end gap-2">
            <rs-button variant="secondary" @click="closeModal">Tutup</rs-button>
            <rs-button variant="primary" btn-type="submit">
              Simpan
            </rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer> </template>
    </rs-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: "default",
});

const { $swal } = useNuxtApp();

// Status data
const statusSemakan = ref("Selesai");
const statusPenerimaan = ref("Diterima");

// Forensic Officers Data
const forensicOfficers = ref([
  {
    id: 1,
    pangkat: "Inspektor",
    nama: "Ali bin Abu",
    noPegawai: "PG12345",
    tindakan: 1,
  },
  {
    id: 2,
    pangkat: "Sarjan",
    nama: "Siti binti Ahmad",
    noPegawai: "PG54321",
    tindakan: 2,
  },
]);

// Evidence Data
const evidences = ref([
  {
    no: 1,
    jenisBarang: "Dokumen",
    tagNo: "TAG001",
    keadaan: "Baik",
    kuantiti: 3,
    tindakan: 1,
  },
  {
    no: 2,
    jenisBarang: "Peralatan Elektronik",
    tagNo: "TAG002",
    keadaan: "Rosak",
    kuantiti: 5,
    tindakan: 2,
  },
]);

// User Roles
const isKetuaBahagian = ref(true);
const isKetuaJabatan = ref(false);

// Modal Controls
const showModal = ref(false);
const editMode = ref(false);
const pegawaiForm = ref({ id: "", pangkat: "", nama: "", noPegawai: "" });

// Sample pegawai listing (simulating API response)
const pegawaiList = ref([]);

// Fetch pegawai list (simulated API call)
const fetchPegawaiList = () => {
  // In a real scenario, this would be an API call
  pegawaiList.value = [
    { id: 'PG001', nama: 'Ahmad bin Ali', pangkat: 'Inspektor', noPegawai: 'PG12345' },
    { id: 'PG002', nama: 'Siti binti Omar', pangkat: 'Sarjan', noPegawai: 'PG67890' },
    { id: 'PG003', nama: 'Muthu a/l Rajan', pangkat: 'Koperal', noPegawai: 'PG24680' },
  ];
};

onMounted(() => {
  fetchPegawaiList();
});

// Computed property for form validation
const isFormValid = computed(() => {
  return (
    pegawaiForm.value.pangkat &&
    pegawaiForm.value.nama &&
    pegawaiForm.value.noPegawai
  );
});

// Actions
const openAddModal = () => {
  editMode.value = false;
  pegawaiForm.value = { id: "" }; // Only store the selected pegawai id
  showModal.value = true;
};

const openEditModal = (pegawai) => {
  editMode.value = true;
  pegawaiForm.value = { ...pegawai };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  pegawaiForm.value = { id: "", pangkat: "", nama: "", noPegawai: "" };
};

const handleSubmit = () => {
  if (editMode.value) {
    updatePegawai();
  } else {
    addNewPegawai();
  }
};

const addNewPegawai = () => {
  if (pegawaiForm.value.id) {
    const selectedPegawai = pegawaiList.value.find(p => p.id === pegawaiForm.value.id);
    if (selectedPegawai) {
      const newPegawai = { ...selectedPegawai, tindakan: uuidv4() };
      forensicOfficers.value.push(newPegawai);
      $swal.fire("Berjaya", "Pegawai baru telah ditambah", "success");
      closeModal();
    } else {
      $swal.fire("Ralat", "Pegawai tidak dijumpai", "error");
    }
  } else {
    $swal.fire("Ralat", "Sila pilih pegawai", "error");
  }
};

const updatePegawai = () => {
  if (isFormValid.value) {
    const index = forensicOfficers.value.findIndex(
      (officer) => officer.id === pegawaiForm.value.id
    );
    if (index !== -1) {
      forensicOfficers.value[index] = { ...pegawaiForm.value };
      $swal.fire("Berjaya", "Maklumat pegawai telah dikemaskini", "success");
      closeModal();
    } else {
      $swal.fire("Ralat", "Pegawai tidak dijumpai", "error");
    }
  } else {
    $swal.fire("Ralat", "Sila isi semua maklumat yang diperlukan", "error");
  }
};

const confirmDelete = (pegawai) => {
  $swal
    .fire({
      title: "Anda pasti?",
      text: "Pegawai ini akan dipadamkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, padam",
      cancelButtonText: "Batal",
    })
    .then((result) => {
      if (result.isConfirmed) {
        deletePegawai(pegawai.id);
      }
    });
};

const deletePegawai = (id) => {
  const index = forensicOfficers.value.findIndex(
    (officer) => officer.id === id
  );
  if (index !== -1) {
    forensicOfficers.value.splice(index, 1);
    $swal.fire("Dihapuskan!", "Pegawai telah dipadam.", "success");
  } else {
    $swal.fire("Ralat", "Pegawai tidak dijumpai", "error");
  }
};

const generateReport = (bahanBukti) => {
  console.log("Generate Report for:", bahanBukti);
};
</script>

<style lang="scss" scoped></style>
