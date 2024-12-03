<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Senarai Kaunter Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Kaunter",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();
const userStore = useUserStore();

// Reactive variables
const tableData = ref([]);
const isLoading = ref(false);

// Summary data structure
const summaryData = ref({
  jumlahPermohonan: 0,
  jumlahPermohonanDihantar: 0,
  jumlahPermohonanDisemak: 0,
  jumlahSemakanHariIni: 0,
  jumlahPermohonanDiluluskan: 0,
});

// Add filter states with ISO date string format
const filters = ref({
  status: "",
  startDate: "",
  endDate: "",
});

// Add date validation rules
const startDateRules = computed(() => ({
  date_before: filters.value.endDate || undefined,
}));

const endDateRules = computed(() => ({
  date_after: filters.value.startDate || undefined,
}));

// Format date for API
const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

// Update fetchPermohonan to use filters
const fetchPermohonan = async () => {
  isLoading.value = true;
  try {
    const queryParams = new URLSearchParams();
    if (filters.value.status) {
      queryParams.append("status", filters.value.status);
    }
    if (filters.value.startDate) {
      queryParams.append("startDate", formatDate(filters.value.startDate));
    }
    if (filters.value.endDate) {
      queryParams.append("endDate", formatDate(filters.value.endDate));
    }

    const response = await useFetch(
      `/api/permohonan?${queryParams.toString()}`
    );
    if (response.data.value?.statusCode === 200) {
      tableData.value = response.data.value.data;
    } else {
      console.error(response.data.value?.message);
    }
  } catch (error) {
    console.error("Error fetching permohonan data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Update fetchSummary to use the correct API endpoint
const fetchSummary = async () => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.value.status) {
      queryParams.append("status", filters.value.status);
    }
    if (filters.value.startDate) {
      queryParams.append("startDate", formatDate(filters.value.startDate));
    }
    if (filters.value.endDate) {
      queryParams.append("endDate", formatDate(filters.value.endDate));
    }

    const response = await useFetch(
      `/api/kemaskini-daftar/summary?${queryParams.toString()}`
    );
    if (response.data.value?.statusCode === 200) {
      summaryData.value = response.data.value.data;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
  }
};

// Watch for filter changes to trigger both fetches
watch(
  filters,
  () => {
    fetchPermohonan();
    fetchSummary();
  },
  { deep: true }
);

// Status options for Pegawai Kaunter
const statusOptions = [
  { label: "Semua", value: "" },
  { label: "Permohonan Dihantar", value: "Permohonan Dihantar" },
  { label: "Permohonan Disemak", value: "Permohonan Disemak" },
];

const statusOptionsKetuaBahagian = [
  { label: "Semua", value: "" },
  { label: "Permohonan Diluluskan", value: "Permohonan Diluluskan" },
];

const statusOptionsPegawaiForensik = [{ label: "Semua", value: "" }];

const permohonanBaru = () => {
  navigateTo("/permohonan-temujanji/baru");
};

const kemaskini = (item) => {
  navigateTo(`/kemaskini-daftar/kemaskini/${item}`);
};

const lihat = (item) => {
  // Navigate to a detailed view page for the selected item
  navigateTo(`/kemaskini-daftar/maklumat/${item}`);
};

const hapus = async (noSiri) => {
  const confirmation = await $swal.fire({
    title: "Anda pasti?",
    text: "Anda tidak akan dapat memulihkan semula data ini!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Ya, hapuskan!",
    cancelButtonText: "Batal",
  });

  if (confirmation.isConfirmed) {
    try {
      const response = await useFetch(`/api/permohonan/${noSiri}`, {
        method: "DELETE",
      });
      if (response.data.value.statusCode === 200) {
        // Remove the deleted permohonan from tableData
        tableData.value = tableData.value.filter(
          (row) => row.noSiri !== noSiri
        );
        $swal.fire("Dihapuskan!", response.data.value.message, "success");
      } else {
        $swal.fire("Error!", response.data.value.message, "error");
      }
    } catch (error) {
      $swal.fire("Error!", "Failed to delete permohonan.", "error");
    }
  }
};

// Fetch the permohonan list when the component is mounted
onMounted(() => {
  fetchPermohonan();
  fetchSummary();
});
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <!-- Title -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Ringkasan Permohonan</h3>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div class="space-y-2">
        <FormKit
          type="select"
          v-model="filters.status"
          :options="
            userStore.roles.includes('Pegawai Kaunter')
              ? statusOptions
              : userStore.roles.includes('Pegawai Forensik')
              ? statusOptionsPegawaiForensik
              : statusOptionsKetuaBahagian
          "
          label="Status"
          placeholder="Pilih Status"
        />
      </div>

      <div class="space-y-2">
        <FormKit
          type="date"
          v-model="filters.startDate"
          label="Tarikh Mula"
          :validation="`date_before:${filters.endDate}`"
          validation-visibility="live"
          :validation-messages="{
            date_before: 'Tarikh mula tidak boleh melebihi tarikh akhir',
          }"
        />
      </div>

      <div class="space-y-2">
        <FormKit
          type="date"
          v-model="filters.endDate"
          label="Tarikh Akhir"
          :validation="`date_after:${filters.startDate}`"
          validation-visibility="live"
          :validation-messages="{
            date_after: 'Tarikh akhir tidak boleh kurang dari tarikh mula',
          }"
        />
      </div>
    </div>

    <!-- Summary Cards Section -->
    <div
      class="grid gap-4 md:grid-cols-2"
      :class="
        userStore.roles.includes('Pegawai Forensik') ||
        userStore.roles.includes('Ketua Bahagian')
          ? 'lg:grid-cols-2'
          : 'lg:grid-cols-3'
      "
    >
      <!-- Pegawai Kaunter Stats -->
      <rs-card v-if="userStore.roles.includes('Pegawai Kaunter')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan
          </h3>
          <div class="text-2xl font-bold">
            {{ summaryData.jumlahPermohonan }}
          </div>
        </div>
      </rs-card>

      <rs-card v-if="userStore.roles.includes('Pegawai Kaunter')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan Dihantar
          </h3>
          <div class="text-2xl font-bold text-blue-600">
            {{ summaryData.jumlahPermohonanDihantar }}
          </div>
        </div>
      </rs-card>

      <rs-card v-if="userStore.roles.includes('Pegawai Kaunter')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan Disemak
          </h3>
          <div class="text-2xl font-bold text-green-600">
            {{ summaryData.jumlahPermohonanDisemak }}
          </div>
        </div>
      </rs-card>

      <!-- Pegawai Forensik Stats -->
      <rs-card v-if="userStore.roles.includes('Pegawai Forensik')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan
          </h3>
          <div class="text-2xl font-bold">
            {{ summaryData.jumlahPermohonan }}
          </div>
        </div>
      </rs-card>

      <rs-card v-if="userStore.roles.includes('Pegawai Forensik')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Semakan Hari Ini
          </h3>
          <div class="text-2xl font-bold text-blue-600">
            {{ summaryData.jumlahSemakanHariIni }}
          </div>
        </div>
      </rs-card>

      <!-- Ketua Bahagian Stats -->
      <rs-card v-if="userStore.roles.includes('Ketua Bahagian')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan
          </h3>
          <div class="text-2xl font-bold">
            {{ summaryData.jumlahPermohonan }}
          </div>
        </div>
      </rs-card>

      <rs-card v-if="userStore.roles.includes('Ketua Bahagian')" class="p-4">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan Diluluskan
          </h3>
          <div class="text-2xl font-bold text-green-600">
            {{ summaryData.jumlahPermohonanDiluluskan }}
          </div>
        </div>
      </rs-card>
    </div>

    <!-- Header section with improved spacing and hierarchy -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Senarai Permohonan</h3>
      </div>
    </div>

    <rs-card class="mt-4 py-2">
      <div v-if="isLoading" class="flex justify-center py-8">
        <Icon name="ph:spinner" class="w-8 h-8 animate-spin" />
      </div>

      <rs-table
        v-else
        :data="tableData"
        :options="{
          variant: 'default',
          striped: true,
          borderless: true,
        }"
        :options-advanced="{
          sortable: true,
          filterable: false,
        }"
        advanced
      >
        <template v-slot:no="data">
          {{ data.text }}
        </template>
        <template v-slot:noSiri="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:tarikhMasa="data">
          {{ data.text || "N/A" }}
        </template>
        <template v-slot:status="data">
          <rs-badge
            :variant="
              data.text === 'Permohonan Draf'
                ? 'warning'
                : data.text === 'Permohonan Dihantar' ||
                  data.text === 'Permohonan Disemak'
                ? 'info'
                : data.text === 'Permohonan Diterima' ||
                  data.text === 'Permohonan Diluluskan'
                ? 'success'
                : 'danger'
            "
          >
            {{ data.text || "N/A" }}
          </rs-badge>
        </template>
        <template v-slot:tindakan="data">
          <div class="flex flex-wrap items-center gap-2">
            <!-- View Button -->
            <rs-button
              @click="lihat(data.value.noSiri)"
              variant="info"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[100px]"
            >
              <Icon name="ph:list" class="mr-2 w-4 h-4" />
              Butiran
            </rs-button>

            <!-- Edit Button -->
            <rs-button
              @click="kemaskini(data.value.noSiri)"
              variant="primary"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[100px]"
            >
              <Icon name="ph:pencil" class="mr-2 w-4 h-4" />
              Kemaskini
            </rs-button>
          </div>
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>
