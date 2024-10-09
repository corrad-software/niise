<script setup>
const tableData = ref([]);

const fetchELibraryData = async () => {
  try {
    const { data: response } = await useFetch("/api/elibrary");
    if (response.value && response.value.statusCode === 200) {
      tableData.value = response.value.data;
    } else {
      console.error("Error fetching e-library data:", response.value.message);
    }
  } catch (error) {
    console.error("Error fetching e-library data:", error);
  }
};

const viewItem = (noSiri) => {
  console.log(`View item with noSiri: ${noSiri}`);
  // Implement view functionality
  navigateTo(`/e-library/maklumat/${noSiri}`);
};

onMounted(() => {
  fetchELibraryData();
});
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>E-Library</h1>
    </div>

    <div class="mt-4">
      <rs-card class="py-1">
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
          <template v-slot:aksi="data">
            <div class="flex gap-2">
              <rs-button
                @click="viewItem(data.value.noSiri)"
                variant="info"
                size="sm"
                class="p-1"
                title="Lihat"
              >
                <Icon name="ic:outline-visibility" size="1.2rem" />
              </rs-button>
            </div>
          </template>
        </rs-table>
      </rs-card>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
