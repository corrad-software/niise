<script setup>
const { $swal } = useNuxtApp();

definePageMeta({
  title: "Dokumen Library",
});

// Reactive variable to store table data
const tableData = ref([]);

// Fetch permohonan list from API
const fetchPermohonan = async () => {
  try {
    const response = await useFetch("/api/permohonan");
    if (response.data.value.statusCode === 200) {
      // Populate tableData with the fetched permohonan list
      tableData.value = response.data.value.data;
    } else {
      console.error(response.data.value.message);
    }
  } catch (error) {
    console.error("Error fetching permohonan data:", error);
  }
};

const lihat = (item) => {
  navigateTo(`/dokumen-library/maklumat/${item}`);
};

// Fetch the permohonan list when the component is mounted
onMounted(() => {
  fetchPermohonan();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Dokumen Library</h1>
    </div>

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
          <div class="flex flex-wrap gap-2">
            <!-- View Button -->
            <rs-button
              @click="lihat(data.value.noSiri)"
              variant="primary"
              size="sm"
              class="p-1 px-2"
              title="Lihat"
            >
              Lihat
            </rs-button>
          </div>
        </template>
      </rs-table>
    </rs-card>
  </div>
</template>
