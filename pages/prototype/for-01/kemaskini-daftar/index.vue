<script setup>
definePageMeta({
  title: "Kemaskini Daftar FR2",
  breadcrumb: [
    {
      name: "Kemaskini Daftar FR2",
      type: "current",
    },
  ],
});

const router = useRouter();
const { $swal } = useNuxtApp();

const caseId = ref("");
const equipmentCondition = ref(false);
const officerQualification = ref(false);
const methodApplicability = ref(false);
const externalSupport = ref(false);
const taskAcceptance = ref("");
const officerComments = ref("");
const showForm = ref(false);

const verifyCase = async () => {
  if (!caseId.value) {
    $swal.fire({
      icon: "error",
      title: "ID Kes diperlukan",
      text: "Sila masukkan ID Kes untuk menyemak.",
      timer: 3000,
    });
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    $swal.fire({
      icon: "success",
      title: "ID Kes disahkan",
      text: "Maklumat kes telah berjaya diambil.",
      timer: 3000,
    });
    showForm.value = true;
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal mengesahkan ID Kes",
      text: "Sila cuba lagi atau hubungi pentadbir sistem.",
      timer: 3000,
    });
  }
};

const updateForm = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    $swal.fire({
      icon: "success",
      title: "Rekod telah berjaya dikemas kini",
      text: "Maklumat telah dikemas kini dalam sistem.",
      timer: 3000,
    });
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal mengemas kini rekod",
      text: "Sila cuba lagi atau hubungi pentadbir sistem.",
      timer: 3000,
    });
  }
};

const submitForm = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    $swal.fire({
      icon: "success",
      title: "Rekod telah berjaya disahkan",
      text: "Maklumat telah disahkan dan disimpan dalam sistem.",
      timer: 3000,
    });
    router.push("/dashboard");
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal mengesahkan rekod",
      text: "Sila cuba lagi atau hubungi pentadbir sistem.",
      timer: 3000,
    });
  }
};

const validateForm = () => {
  if (
    !equipmentCondition.value ||
    !officerQualification.value ||
    !methodApplicability.value ||
    !taskAcceptance.value
  ) {
    $swal.fire({
      icon: "error",
      title: "Borang tidak lengkap",
      text: "Sila lengkapkan semua maklumat yang diperlukan.",
      timer: 3000,
    });
    return false;
  }

  if (taskAcceptance.value === "Tidak" && !officerComments.value) {
    $swal.fire({
      icon: "error",
      title: "Komen diperlukan",
      text: "Sila berikan komen kerana tugas tidak diterima.",
      timer: 3000,
    });
    return false;
  }

  return true;
};
</script>

<template>
  <div class="">
    <LayoutsBreadcrumb class="mb-6" />

    <RsCard class="mb-6 shadow-lg">
      <template #header>
        <h2 class="text-2xl">Kemaskini Daftar FR2</h2>
      </template>
      <template #body>
        <div class="space-y-8">
          <div>
            <h3 class="text-lg font-medium mb-4 text-gray-700">
              Pengesahan ID Kes
            </h3>
            <div class="flex flex-col gap-4">
              <FormKit
                type="text"
                name="caseId"
                label="ID Kes"
                validation="required"
                :validation-messages="{
                  required: 'Sila masukkan ID Kes',
                }"
                v-model="caseId"
                class="flex-grow"
                :classes="{
                  outer: 'mb-0',
                }"
              />
              <RsButton @click="verifyCase" variant="primary" class="mb-1"
                >Semak</RsButton
              >
            </div>
          </div>

          <FormKit
            v-if="showForm"
            type="form"
            @submit="submitForm"
            :actions="false"
          >
            <div>
              <h3 class="text-lg font-medium mb-4 text-gray-700">Borang FR2</h3>
              <div class="space-y-4">
                <FormKit
                  type="checkbox"
                  name="equipmentCondition"
                  label="Peralatan dalam keadaan baik untuk analisis/pemeriksaan"
                  v-model="equipmentCondition"
                />
                <FormKit
                  type="checkbox"
                  name="officerQualification"
                  label="Pegawai berkelayakan untuk analisis/pemeriksaan"
                  v-model="officerQualification"
                />
                <FormKit
                  type="checkbox"
                  name="methodApplicability"
                  label="Kaedah boleh dilaksanakan dan diterima untuk analisis"
                  v-model="methodApplicability"
                />
                <FormKit
                  type="checkbox"
                  name="externalSupport"
                  label="Sokongan luar diperlukan"
                  v-model="externalSupport"
                />
                <FormKit
                  type="select"
                  name="taskAcceptance"
                  label="Penerimaan Tugas"
                  :options="[
                    { label: 'Ya', value: 'Ya' },
                    { label: 'Tidak', value: 'Tidak' },
                  ]"
                  validation="required"
                  :validation-messages="{
                    required: 'Sila pilih penerimaan tugas',
                  }"
                  v-model="taskAcceptance"
                />
                <FormKit
                  type="textarea"
                  name="officerComments"
                  label="Komen Pegawai"
                  v-model="officerComments"
                />
              </div>
            </div>

            <div class="mt-8 flex justify-end space-x-4">
              <RsButton @click="updateForm" variant="secondary"
                >Kemas Kini</RsButton
              >
              <!-- <RsButton type="submit" variant="primary">Sahkan</RsButton> -->
            </div>
          </FormKit>
        </div>
      </template>
    </RsCard>
  </div>
</template>
