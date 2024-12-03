<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  layout: "default",
});

const route = useRoute();
const { $swal } = useNuxtApp();
const roles = useUserStore().roles;

// Evidence Data
const evidences = ref([]);

// Fetch reports (Bahan Bukti)
const fetchReports = async () => {
  try {
    const { data } = await useFetch(
      `/api/permohonan/${route.params.noSiri}/reports`
    );

    if (data.value.statusCode === 200) {
      evidences.value = data.value.data || [];
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
    $swal.fire("Error", "Gagal mendapatkan senarai bahan bukti.", "error");
  }
};

// Fetch officers when the component mounts
onMounted(() => {
  fetchReports(); // Fetch reports related to the permohonan
});
</script>

<template>
  <div class="space-y-6">
    <!-- LIST: Bahan Bukti -->
    <rs-card class="p-6">
      <h3 class="text-lg font-semibold mb-4">Bahan Bukti</h3>
      <rs-table
        v-if="evidences.length > 0"
        :data="evidences"
        :options="{
          variant: 'default',
          striped: true,
          borderless: false,
        }"
        :options-advanced="{
          sortable: true,

          filterable: false,
        }"
        advanced
      >
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
            @click="navigateTo(`/dokumen-library/kemaskini/${data.text}`)"
            size="sm"
            variant="primary"
            class="py-1 px-2"
          >
            kemaskini
          </rs-button>
        </template>
      </rs-table>
      <div v-else class="text-center p-10">
        <p>Tidak ada bahan bukti yang terlibat.</p>
      </div>
    </rs-card>
  </div>
</template>
