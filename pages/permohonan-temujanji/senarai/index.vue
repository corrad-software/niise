<script setup>
definePageMeta({
  title: "Senarai Permohonan",
  middleware: ["auth"],
  breadcrumb: [
    {
      name: "Permohonan",
      type: "current",
    },
  ],
});

const { $swal } = useNuxtApp();

// Reactive variable to store table data
const tableData = ref([]);

// Add a loading state for better UX
const isLoading = ref(false);

// Add new reactive variables for summary
const summaryData = ref({
  jumlahPermohonan: 0,
  permohonanDraf: 0,
  permohonanDihantar: 0,
  permohonanDitolak: 0,
  permohonanSelesai: 0,
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
  { label: "Permohonan Draf", value: "Permohonan Draf" },
  { label: "Permohonan Dihantar", value: "Permohonan Dihantar" },
  { label: "Permohonan Ditolak", value: "Permohonan Ditolak" },
  { label: "Permohonan Diluluskan", value: "Permohonan Diluluskan" },
];

// Fetch permohonan list from API
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

    const response = await $fetch(`/api/permohonan?${queryParams.toString()}`);
    if (response.statusCode === 200) {
      tableData.value = response.data;
    } else {
      console.error(response.message);
    }
  } catch (error) {
    console.error("Error fetching permohonan data:", error);
  } finally {
    isLoading.value = false;
  }
};

// Update fetchSummary to format dates
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

    const response = await $fetch(
      `/api/permohonan/summary?${queryParams.toString()}`
    );
    if (response.statusCode === 200) {
      summaryData.value = response.data;
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

// Function to navigate to the "Permohonan Baru" page
const permohonanBaru = () => {
  navigateTo("/permohonan-temujanji/baru");
};

// Function to navigate to the "Kemaskini" page for a specific permohonan
const kemaskini = (noSiri) => {
  navigateTo(`/permohonan-temujanji/kemaskini/${noSiri}`);
};

const lihatMaklumat = (noSiri) => {
  navigateTo(`/permohonan-temujanji/maklumat/${noSiri}`);
};

// Function to delete a permohonan by its noSiri
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
      const response = await $fetch(`/api/permohonan/${noSiri}`, {
        method: "DELETE",
      });
      if (response.statusCode === 200) {
        // Remove the deleted permohonan from tableData
        tableData.value = tableData.value.filter(
          (row) => row.noSiri !== noSiri
        );
        $swal.fire("Dihapuskan!", response.message, "success");
      } else {
        $swal.fire("Error!", response.message, "error");
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

    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Ringkasan Permohonan</h3>
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
      <rs-card class="p-4 md:col-span-2 lg:col-span-4 mb-0">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Jumlah Permohonan
          </h3>
          <div class="text-2xl font-bold">
            {{ summaryData.jumlahPermohonan }}
          </div>
        </div>
      </rs-card>

      <rs-card class="p-4 mb-0">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Permohonan Draf
          </h3>
          <div class="text-2xl font-bold text-yellow-600">
            {{ summaryData.permohonanDraf }}
          </div>
        </div>
      </rs-card>

      <rs-card class="p-4 mb-0">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Permohonan Dihantar
          </h3>
          <div class="text-2xl font-bold text-blue-600">
            {{ summaryData.permohonanDihantar }}
          </div>
        </div>
      </rs-card>

      <rs-card class="p-4 mb-0">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Permohonan Ditolak
          </h3>
          <div class="text-2xl font-bold text-red-600">
            {{ summaryData.permohonanDitolak }}
          </div>
        </div>
      </rs-card>

      <rs-card class="p-4 mb-0">
        <div class="space-y-2">
          <h3 class="text-sm font-medium text-muted-foreground">
            Permohonan Diluluskan
          </h3>
          <div class="text-2xl font-bold text-green-600">
            {{ summaryData.permohonanSelesai }}
          </div>
        </div>
      </rs-card>
    </div>

    <!-- Header section with improved spacing and hierarchy -->
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h3 class="text-2xl font-bold tracking-tight">Senarai Permohonan</h3>
      </div>
      <rs-button @click="permohonanBaru()" variant="primary" class="h-10">
        <Icon
          name="streamline:computer-desktop-add-desktop-device-display-add-plus-computer"
          class="mr-2 w-4 h-4"
        />
        Permohonan Baru
      </rs-button>
    </div>

    <!-- Table section with improved card styling -->
    <rs-card class="px-0 py-4">
      <!-- Add loading state -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <Icon name="ph:spinner" class="w-8 h-8 animate-spin" />
      </div>

      <rs-table
        v-else
        :data="tableData"
        :options-advanced="{
          sortable: true,
        }"
        advanced
        class="w-full"
      >
        <!-- Table Data Rows -->
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

        <!-- Updated action buttons with consistent styling -->
        <template v-slot:tindakan="data">
          <div
            class="flex flex-wrap items-center gap-2"
            v-if="data.value.status === 'Permohonan Draf'"
          >
            <rs-button
              @click="kemaskini(data.value.noSiri)"
              variant="warning"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[100px]"
            >
              <Icon name="ph:pencil" class="mr-2 w-4 h-4" />
              Kemaskini
            </rs-button>

            <rs-button
              @click="hapus(data.value.noSiri)"
              variant="danger"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[100px]"
            >
              <Icon
                name="streamline:computer-desktop-delete-device-remove-display-computer-deny-desktop-fail-failure"
                class="mr-2 w-4 h-4"
              />
              Hapus
            </rs-button>
          </div>

          <div v-else-if="data.value.status === 'Permohonan Diluluskan'">
            <rs-button
              variant="info"
              size="sm"
              class="px-3 inline-flex items-center justify-center w-[100px]"
              @click="lihatMaklumat(data.value.noSiri)"
            >
              <Icon name="ph:list" class="mr-2 w-4 h-4" />
              Butiran
            </rs-button>
          </div>

          <div v-else class="text-muted">-</div>
        </template>
      </rs-table>
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
