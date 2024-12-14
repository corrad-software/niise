<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Pengesanan Penyamaran",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Penyamaran",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();
const userStore = useUserStore();

// Reactive variables
const tableData = ref([]);
const isLoading = ref(false);
const showButton = ref({});

// Summary data structure matching the API
const summaryData = ref({
  jumlahTemujanji: 0,
  jumlahTemujanjiDiterima: 0,
  jumlahTemujanjiSelesai: 0,
  jumlahTemujanjiHariIni: 0,
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

// Status options
const statusOptions = [
  { label: "Semua", value: "" },
  { label: "Temujanji Diterima", value: "Temujanji Diterima" },
  { label: "Temujanji Selesai", value: "Temujanji Selesai" },
];

// Fetch data functions
const fetchTemujanji = async () => {
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

    const response = await useFetch(`/api/temujanji?${queryParams.toString()}`);
    if (response.data.value?.statusCode === 200) {
      tableData.value = response.data.value.data;

      if (response.data.value.showButton) {
        showButton.value = response.data.value.showButton;
      } else {
        showButton.value = {
          tambah: false,
          keputusan: false,
          kemaskini: false,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching temujanji data:", error);
  } finally {
    isLoading.value = false;
  }
};

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
      `/api/temujanji/summary?${queryParams.toString()}`
    );
    if (response.data.value?.statusCode === 200) {
      summaryData.value = response.data.value.data;
    }
  } catch (error) {
    console.error("Error fetching summary:", error);
  }
};

// Watch for filter changes
watch(
  filters,
  () => {
    fetchTemujanji();
    fetchSummary();
  },
  { deep: true }
);

// Function to navigate to the "Add Appointment" page
const addAppointment = () => {
  navigateTo("/pengesanan-penyamaran/baru");
};

// Function to navigate to the "Update Appointment" page
const updateAppointment = (kesId) => {
  navigateTo(`/pengesanan-penyamaran/kemaskini/${kesId}`);
};

// Function to navigate to the "Result Appointment" page
const resultAppointment = (kesId) => {
  navigateTo(`/pengesanan-penyamaran/keputusan/${kesId}`);
};

// Function to delete an appointment by its kesId
const deleteAppointment = async (kesId) => {
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
      const { data, error } = await useFetch(`/api/temujanji/${kesId}`, {
        method: "DELETE",
      });

      if (data.value && data.value.statusCode === 200) {
        // Remove the deleted appointment from tableData
        await fetchTemujanji();
        $swal.fire("Dihapuskan!", data.value.message, "success");
      } else {
        $swal.fire(
          "Error!",
          error.value?.message || "Failed to delete appointment.",
          "error"
        );
      }
    } catch (error) {
      $swal.fire("Error!", "Failed to delete appointment.", "error");
    }
  }
};

onMounted(() => {
  fetchTemujanji();
  fetchSummary();
});
</script>

<template>
  <div class="space-y-6">
    <Breadcrumb />

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Ringkasan Temujanji</h3>
      </div>
    </div>

    <!-- Summary Cards Section -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div class="grid gap-6 md:grid-cols-3 col-span-2 lg:col-span-4">
        <div class="space-y-2">
          <FormKit
            type="select"
            v-model="filters.status"
            :options="statusOptions"
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

      <!-- Pemohon Role Cards -->
      <template v-if="userStore.roles.includes('Pegawai Penyiasat')">
        <rs-card class="p-4 md:col-span-2 lg:col-span-4 mb-0">
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-muted-foreground">
              Jumlah Temujanji
            </h3>
            <div class="text-2xl font-bold">
              {{ summaryData.jumlahTemujanji }}
            </div>
          </div>
        </rs-card>

        <rs-card class="p-4 mb-0 col-span-2">
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-muted-foreground">
              Temujanji Diterima
            </h3>
            <div class="text-2xl font-bold text-blue-600">
              {{ summaryData.jumlahTemujanjiDiterima }}
            </div>
          </div>
        </rs-card>

        <rs-card class="p-4 mb-0 col-span-2">
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-muted-foreground">
              Temujanji Selesai
            </h3>
            <div class="text-2xl font-bold text-green-600">
              {{ summaryData.jumlahTemujanjiSelesai }}
            </div>
          </div>
        </rs-card>
      </template>

      <!-- Pegawai Forensik Role Cards -->
      <template v-if="userStore.roles.includes('Pegawai Forensik')">
        <rs-card class="p-4 md:col-span-2 lg:col-span-3 mb-0">
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-muted-foreground">
              Jumlah Temujanji
            </h3>
            <div class="text-2xl font-bold">
              {{ summaryData.jumlahTemujanji }}
            </div>
          </div>
        </rs-card>

        <rs-card class="p-4 mb-0">
          <div class="space-y-2">
            <h3 class="text-sm font-medium text-muted-foreground">
              Temujanji Hari Ini
            </h3>
            <div class="text-2xl font-bold text-yellow-600">
              {{ summaryData.jumlahTemujanjiHariIni }}
            </div>
          </div>
        </rs-card>
      </template>
    </div>

    <!-- Header section -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Senarai Temujanji</h3>
      </div>
      <rs-button
        v-if="showButton.tambah"
        @click="addAppointment"
        variant="primary"
        class="h-10"
      >
        <Icon
          name="streamline:computer-desktop-add-desktop-device-display-add-plus-computer"
          class="mr-2 w-4 h-4"
        />
        Tambah Temujanji
      </rs-button>
    </div>

    <!-- Table section -->
    <rs-card class="px-0 py-4">
      <div v-if="isLoading" class="flex justify-center py-8">
        <Icon name="ph:spinner" class="w-8 h-8 animate-spin" />
      </div>

      <!-- Table displaying the list of appointments -->
      <rs-card class="mt-4 py-2">
        <rs-table
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
          <!-- Table Data Rows -->
          <template v-slot:kesId="data">
            {{ data.text || "N/A" }}
          </template>
          <template v-slot:namaPemohon="data">
            {{ data.text || "N/A" }}
          </template>
          <template v-slot:caraSemakan="data">
            {{ data.text || "N/A" }}
          </template>
          <template v-slot:status="data">
            <rs-badge
              :variant="
                data.text === 'Temujanji Diterima' ||
                data.text === 'Temujanji Selesai'
                  ? 'info'
                  : 'success'
              "
            >
              {{ data.text || "N/A" }}
            </rs-badge>
          </template>

          <!-- Actions for each appointment -->
          <template v-slot:tindakan="data">
            <div class="flex flex-wrap items-center gap-2">
              <!-- Button to navigate to the "Update" page for the selected appointment -->
              <rs-button
                v-if="showButton.keputusan"
                @click="resultAppointment(data.text.id)"
                variant="secondary-outline"
                size="sm"
                class="px-3 inline-flex items-center justify-center w-[100px]"
                :disabled="data.value.tindakan.disabled"
              >
                <Icon name="ic:baseline-check-circle" class="mr-2 w-4 h-4" />
                Keputusan
              </rs-button>

              <rs-button
                v-if="showButton.kemaskini"
                @click="updateAppointment(data.text.id)"
                variant="primary-outline"
                size="sm"
                class="px-3 inline-flex items-center justify-center w-[100px]"
              >
                <Icon name="ph:pencil" class="mr-2 w-4 h-4" />
                Kemaskini
              </rs-button>

              <div v-if="!showButton.kemaskini && !showButton.keputusan">-</div>

              <!-- Button to delete the selected appointment -->
              <!-- <rs-button
              @click="deleteAppointment(data.value.kesId)"
              variant="danger"
              size="sm"
              class="p-1"
              title="Hapus"
            >
              <Icon name="ic:baseline-delete" size="1.2rem" />
            </rs-button> -->
            </div>
          </template>
        </rs-table>
      </rs-card>
    </rs-card>
  </div>
</template>

<style scoped>
.text-muted-foreground {
  @apply text-gray-500 dark:text-gray-400;
}

.text-muted {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
