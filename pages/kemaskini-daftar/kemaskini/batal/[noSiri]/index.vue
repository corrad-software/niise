@ -1,157 +0,0 @@
<template>
  <div>
    <div class="flex justify-between items-center">
      <h1>Borang Akuan Penolakan Barang Kes</h1>
    </div>

    <rs-card class="mt-4 p-4">
      <FormKit type="form" :actions="false" @submit="submitForm">
        <!-- New Form Fields -->
        <FormKit
          type="select"
          label="Sebab penolakan permohonan"
          v-model="sebabPenolakan"
          :options="[
            'Tiada permohonan dibuat',
            'Bungkusan barang kes tidak ditanda',
            'Barang kes yang dihantar tidak ditanda',
            'Barang kes yang dihantar tidak sesuai',
            'Lain-lain (Nyatakan)',
          ]"
          validation="required"
        />
        <FormKit
          type="textarea"
          label="Lain-lain sebab"
          v-model="lainLainSebab"
        />

        <div class="flex justify-end gap-2 mt-4">
          <rs-button type="button" @click="navigateBack()" variant="danger"
            >Kembali</rs-button
          >
          <rs-button
            type="submit"
            @click="confirmSah"
            btn-type="submit"
            variant="success"
            >Sah</rs-button
          >
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const noSiri = ref(route.params.noSiri);

// New reactive properties
const sebabPenolakan = ref("");
const lainLainSebab = ref("");

const navigateBack = () => {
  router.back();
};

const isFormValid = () => {
  const requiredFields = [sebabPenolakan];

  return requiredFields.every(
    (field) => field.value !== "" && field.value !== 0 && field.value !== false
  );
};

const submitForm = () => {
  if (isFormValid()) {
    console.log({
      sebabPenolakan: sebabPenolakan.value,
      lainLainSebab: lainLainSebab.value,
    });

    navigateTo(`/kemaskini-daftar/senarai`);

    $swal.fire({
      title: "Berjaya!",
      text: "Borang telah berjaya dihantar.",
      icon: "success",
      confirmButtonText: "OK",
    });
  } else {
    $swal.fire({
      title: "Ralat!",
      text: "Sila isi semua medan yang diperlukan.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

const confirmBatal = () => {
  $swal
    .fire({
      title: "Anda pasti?",
      text: "Adakah anda pasti ingin membatalkan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan!",
      cancelButtonText: "Tidak",
    })
    .then((result) => {
      if (result.isConfirmed) {
        navigateBack();
      }
    });
};

const confirmSah = () => {
  $swal
    .fire({
      title: "Anda pasti?",
      text: "Adakah anda pasti ingin mengesahkan borang ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Sahkan!",
      cancelButtonText: "Tidak",
    })
    .then((result) => {
      if (result.isConfirmed) {
        submitForm();
      }
    });
};

onMounted(() => {
  sebabPenolakan.value = "Tiada permohonan dibuat";
  lainLainSebab.value = "";
});

const { $swal } = useNuxtApp();
</script>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>