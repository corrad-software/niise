<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">Maklumat E-Library</h1>
    <rs-card class="mt-4 p-4">
      <div v-if="loading">Loading...</div>
      <div v-else-if="error">{{ error }}</div>
      <div v-else>
        <h2 class="text-xl font-semibold mb-2">No. Siri: {{ noSiri }}</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Nama Pemohon:</strong> {{ permohonanData.namaPemohon }}</p>
            <p><strong>Pangkat Pemohon:</strong> {{ permohonanData.pangkatPemohon }}</p>
            <p>
              <strong>No. Pegawai Pemohon:</strong> {{ permohonanData.noPegawaiPemohon }}
            </p>
          </div>
          <div>
            <p><strong>Nama Penghantar:</strong> {{ permohonanData.namaPenghantar }}</p>
            <p>
              <strong>Pangkat Penghantar:</strong> {{ permohonanData.pangkatPenghantar }}
            </p>
            <p>
              <strong>No. Pegawai Penghantar:</strong>
              {{ permohonanData.noPegawaiPenghantar }}
            </p>
          </div>
        </div>
        <div class="mt-4">
          <p>
            <strong>Ringkasan Kenyataan Kes:</strong>
            {{ permohonanData.ringkasanKenyataanKes }}
          </p>
          <p>
            <strong>No. Kertas Siasatan:</strong> {{ permohonanData.noKertasSiasatan }}
          </p>
          <p><strong>No. Laporan Polis:</strong> {{ permohonanData.noLaporanPolis }}</p>
          <p><strong>Tarikh Temujanji:</strong> {{ permohonanData.tarikhTemujanji }}</p>
          <p><strong>Slot Masa:</strong> {{ permohonanData.slotMasa }}</p>
        </div>
        <div class="mt-4">
          <h3 class="text-lg font-semibold mb-2">Senarai Barang</h3>
          <ul>
            <li v-for="(barang, index) in permohonanData.barangList" :key="index">
              {{ barang.jenisBarangDetailLabel }} - {{ barang.jenisBarangSiber }}
            </li>
          </ul>
        </div>
      </div>
    </rs-card>
  </div>
</template>

<script setup>
const route = useRoute();
const noSiri = ref(route.params.noSiri);
const permohonanData = ref({});
const loading = ref(true);
const error = ref(null);

const fetchPermohonanData = async () => {
  try {
    const response = await $fetch(`/api/permohonan/${noSiri.value}`);
    if (response.statusCode === 200) {
      permohonanData.value = response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (err) {
    error.value = "Failed to fetch permohonan data. Please try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPermohonanData();
});
</script>

<style scoped>
/* Add any scoped styles here if needed */
</style>
