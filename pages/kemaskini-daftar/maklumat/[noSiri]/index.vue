<template>
  <div class="space-y-6">
    <!-- CARD: Status Semakan & Status Penerimaan -->
    <rs-card class="p-6">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Status Semakan</h3>
        <rs-badge :variant="statusSemakan === 'Selesai' ? 'success' : 'warning'">
          {{ statusSemakan }}
        </rs-badge>
      </div>
      <div class="flex justify-between items-center mt-4">
        <h3 class="text-lg font-semibold">Status Penerimaan</h3>
        <rs-badge :variant="statusPenerimaan === 'Diterima' ? 'success' : 'danger'">
          {{ statusPenerimaan }}
        </rs-badge>
      </div>

      <div class="flex gap-2 justify-end mt-5">
        <rs-button @click="openSemakModal">Semak</rs-button>
        <rs-button @click="openTerimaModal">Terima</rs-button>
        <rs-button @click="openTolakModal">Tolak</rs-button>
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
              @click="openEditModal(data.text, data.index)"
              variant="info"
              size="sm"
            >
              <Icon name="ic:baseline-edit" size="1.2rem" />
            </rs-button>
            <rs-button @click="confirmDelete(data.text)" variant="danger" size="sm">
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
        <template v-slot:tindakan="data">
          <rs-button
            @click="generateReport(data.text)"
            variant="ghost"
            size="sm"
            class="text-primary hover:text-primary-dark"
          >
            <Icon name="mdi:file-report-outline" size="1.5rem" />
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
        <FormKit type="form" :actions="false" @submit="handleSubmit">
          <FormKit
            type="select"
            name="id"
            label="Pilih Pegawai"
            :options="pegawaiOption"
            v-model="selectedPegawai"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih pegawai',
            }"
          />

          <div class="flex justify-end gap-2">
            <rs-button variant="secondary" @click="closeModal">Tutup</rs-button>
            <rs-button variant="primary" btn-type="submit"> Simpan </rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer> </template>
    </rs-modal>

    <!-- Semak Modal -->
    <rs-modal v-model="showSemakModal" @close="closeSemakModal">
      <template #header>
        <h3>Semak Maklumat</h3>
      </template>
      <template #body>
        <FormKit
          v-if="userRole === 'Pegawai Kaunter'"
          type="form"
          :actions="false"
          @submit="handleSemakSubmit"
        >
          <!-- Existing form for kaunter role -->
          <FormKit
            type="radio"
            name="peralatanBaik"
            label="Peralatan dalam keadaan baik"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="pegawaiBerkelayakan"
            label="Pegawai berkelayakan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="kaedahDapatDilakukan"
            label="Kaedah dapat dilakukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="subkontrakDiperlukan"
            label="Subkontrak diperlukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="tugasanDiterima"
            label="Tugasan diterima"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="textarea"
            name="ulasanPegawaiKaunter"
            label="Ulasan pegawai kaunter"
            validation="required"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="danger" @click="closeSemakModal">Batal</rs-button>
            <rs-button variant="primary" type="submit">Hantar</rs-button>
          </div>
        </FormKit>

        <FormKit
          v-else-if="userRole === 'Ketua Bahagian'"
          type="form"
          :actions="false"
          @submit="handleSemakSubmit"
        >
          <FormKit
            type="radio"
            name="kelulusanKetuaBahagian"
            label="Kelulusan ketua bahagian"
            :options="['Diterima', 'Ditolak']"
            validation="required"
          />
          <FormKit
            type="textarea"
            name="ulasanKetuaBahagian"
            label="Ulasan"
            validation="required"
            :validation-messages="{
              required: 'Sila masukkan ulasan',
            }"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="danger" @click="closeSemakModal">Batal</rs-button>
            <rs-button variant="primary" type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
    </rs-modal>

    <!-- Terima Modal -->
    <rs-modal v-model="showTerimaModal" @close="closeTerimaModal">
      <template #header>
        <h3>Terima Permohonan</h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleTerimaSubmit">
          <FormKit
            type="radio"
            name="peralatanBaik"
            label="Peralatan dalam keadaan baik"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="pegawaiBerkelayakan"
            label="Pegawai berkelayakan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="kaedahDapatDilakukan"
            label="Kaedah dapat dilakukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="subkontrakDiperlukan"
            label="Subkontrak diperlukan"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="radio"
            name="tugasanDiterima"
            label="Tugasan diterima"
            :options="['Ya', 'Tidak']"
            validation="required"
          />
          <FormKit
            type="textarea"
            name="ulasanPegawaiKaunter"
            label="Ulasan pegawai kaunter"
            validation="required"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="danger" @click="closeTerimaModal">Batal</rs-button>
            <rs-button variant="primary" type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
    </rs-modal>

    <!-- Tolak Modal -->
    <rs-modal v-model="showTolakModal" @close="closeTolakModal">
      <template #header>
        <h3>Tolak Permohonan</h3>
      </template>
      <template #body>
        <FormKit type="form" :actions="false" @submit="handleTolakSubmit">
          <FormKit
            type="select"
            name="sebabPenolakan"
            label="Sebab penolakan permohonan"
            :options="[
              'Dokumen tidak lengkap',
              'Maklumat tidak tepat',
              'Tidak memenuhi syarat',
              'Lain-lain',
            ]"
            validation="required"
            :validation-messages="{
              required: 'Sila pilih sebab penolakan',
            }"
          />
          <FormKit
            type="textarea"
            name="lainLainSebab"
            label="Lain-lain sebab"
            validation="required_if:sebabPenolakan,Lain-lain"
            :validation-messages="{
              required_if: 'Sila nyatakan sebab lain',
            }"
          />
          <div class="flex justify-end gap-2 mt-4">
            <rs-button variant="secondary" @click="closeTolakModal">Batal</rs-button>
            <rs-button variant="danger" type="submit">Hantar</rs-button>
          </div>
        </FormKit>
      </template>
      <template #footer>
        <div></div>
      </template>
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
const forensicOfficers = ref([]);

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
const selectedPegawai = ref(null);

// Sample pegawai listing (simulating API response)
const pegawaiList = ref([]);
const pegawaiOption = ref([
  {
    value: null,
    label: "Pilih Pegawai",
  },
]);

// Fetch pegawai list (simulated API call)
const fetchPegawaiList = () => {
  // In a real scenario, this would be an API call
  pegawaiList.value = [
    {
      id: "PG001",
      nama: "Ahmad bin Ali",
      pangkat: "Inspektor",
      noPegawai: "PG12345",
      tindakan: 1,
    },
    {
      id: "PG002",
      nama: "Siti binti Omar",
      pangkat: "Sarjan",
      noPegawai: "PG67890",
      tindakan: 2,
    },
    {
      id: "PG003",
      nama: "Muthu a/l Rajan",
      pangkat: "Koperal",
      noPegawai: "PG24680",
      tindakan: 3,
    },
  ];
};

onMounted(() => {
  fetchPegawaiList();

  for (let index = 0; index < pegawaiList.value.length; index++) {
    pegawaiOption.value.push({
      value: pegawaiList.value[index].tindakan,
      label: `${pegawaiList.value[index].pangkat} ${pegawaiList.value[index].nama} (${pegawaiList.value[index].noPegawai})`,
    });
  }
});

// Computed property for form validation
const isFormValid = computed(() => {
  return (
    // filter pegawaiList based on selectedPegawai
    pegawaiList.value.filter((p) => p.tindakan === selectedPegawai.value)
  );
});

// Actions
const openAddModal = () => {
  editMode.value = false;
  selectedPegawai.value = null;
  showModal.value = true;
};

const openEditModal = (pegawai, index) => {
  editMode.value = true;
  selectedPegawai.value = pegawai;

  console.log(selectedPegawai.value);
  console.log("index", index);
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedPegawai.value = null;
};

const handleSubmit = () => {
  if (editMode.value) {
    updatePegawai();
  } else {
    addNewPegawai();
  }
};

const addNewPegawai = () => {
  console.log(selectedPegawai.value);
  if (selectedPegawai.value) {
    const selectedPegawai_ = pegawaiList.value.find(
      (p) => p.tindakan === selectedPegawai.value
    );
    if (selectedPegawai_) {
      const newPegawai = {
        ...selectedPegawai_,
        tindakan: selectedPegawai_.tindakan,
      };
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
  console.log("masuk uodate");
  if (selectedPegawai.value) {
    console.log(selectedPegawai.value);
    const selectedPegawai_ = pegawaiList.value.find(
      (p) => p.tindakan == selectedPegawai.value
    );
    console.log("selectedPegawai_", selectedPegawai_);
    if (selectedPegawai_) {
      const pegawaiFromSelectedPegawais = forensicOfficers.value.findIndex(
        (officer) => officer.tindakan === selectedPegawai.value
      );
      console.log("pegawaiFromSelectedPegawais", pegawaiFromSelectedPegawais);
      if (pegawai_ !== -1) {
        forensicOfficers.value[pegawai_] = {
          ...selectedPegawai_,
          tindakan: selectedPegawai_.tindakan,
        };
        $swal.fire("Berjaya", "Maklumat pegawai telah dikemaskini", "success");
        closeModal();
      } else {
        $swal.fire("Ralat", "Pegawai tidak dijumpai", "error");
      }
    } else {
      $swal.fire("Ralat", "Pegawai tidak dijumpai", "error");
    }
  } else {
    $swal.fire("Ralat", "Sila pilih pegawai", "error");
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
        deletePegawai(pegawai);
      }
    });
};

const deletePegawai = (pegawai) => {
  const index = forensicOfficers.value.findIndex(
    (officer) => officer.tindakan === pegawai
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

  navigateTo(`/kemaskini-daftar/laporan/${bahanBukti}`);
};

// Semak Modal Controls
const showSemakModal = ref(false);

const openSemakModal = () => {
  showSemakModal.value = true;
};

const closeSemakModal = () => {
  showSemakModal.value = false;
};

// User role (you might want to fetch this from your auth system)
const userRole = ref("Pegawai Kaunter"); // Change this to 'ketuaBahagian' to test the other form

// For ketua bahagian form
const kelulusanKetuaBahagian = ref(null);

const handleSemakSubmit = (formData) => {
  console.log("Semak form submitted:", formData);
  // Here you would typically send the data to your API
  let successMessage = "";
  if (userRole.value === "Pegawai Kaunter") {
    successMessage = "Maklumat semakan telah disimpan";
  } else if (userRole.value === "Ketua Bahagian") {
    const decision =
      formData.kelulusanKetuaBahagian === "Diterima" ? "diterima" : "ditolak";
    successMessage = `Permohonan telah ${decision}. Ulasan: ${formData.ulasanKetuaBahagian}`;
  }
  $swal.fire("Berjaya", successMessage, "success");
  closeSemakModal();
};

// Terima Modal Controls
const showTerimaModal = ref(false);

const openTerimaModal = () => {
  showTerimaModal.value = true;
};

const closeTerimaModal = () => {
  showTerimaModal.value = false;
};

const handleTerimaSubmit = (formData) => {
  console.log("Terima form submitted:", formData);
  // Here you would typically send the data to your API
  let successMessage = "Permohonan telah diterima.";

  // Check if any of the radio button answers are 'Tidak'
  const hasNegativeResponse = [
    "peralatanBaik",
    "pegawaiBerkelayakan",
    "kaedahDapatDilakukan",
    "tugasanDiterima",
  ].some((field) => formData[field] === "Tidak");

  if (hasNegativeResponse) {
    successMessage += " Namun, terdapat beberapa perkara yang perlu diberi perhatian.";
  }

  successMessage += ` Ulasan: ${formData.ulasanPegawaiKaunter}`;

  $swal.fire("Berjaya", successMessage, "success");
  closeTerimaModal();
};

// Tolak Modal Controls
const showTolakModal = ref(false);

const openTolakModal = () => {
  showTolakModal.value = true;
};

const closeTolakModal = () => {
  showTolakModal.value = false;
};

const handleTolakSubmit = (formData) => {
  console.log("Tolak form submitted:", formData);
  // Here you would typically send the data to your API
  let rejectionReason = formData.sebabPenolakan;
  if (rejectionReason === "Lain-lain") {
    rejectionReason += `: ${formData.lainLainSebab}`;
  }

  const successMessage = `Permohonan telah ditolak. Sebab: ${rejectionReason}`;

  $swal.fire("Berjaya", successMessage, "success");
  closeTolakModal();
};
</script>

<style lang="scss" scoped></style>
