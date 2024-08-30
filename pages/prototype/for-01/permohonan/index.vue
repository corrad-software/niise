<script setup>
definePageMeta({
  title: "Permohonan Online",
  breadcrumb: [
    {
      name: "Permohonan Online",
      type: "current",
    },
  ],
});

const router = useRouter();
const { $swal } = useNuxtApp();

const applicantRank = ref("");
const applicantName = ref("");
const applicantOfficerNumber = ref("");
const sameAsSender = ref(false);
const showConfirmationModal = ref(false);
const showDateTimeModal = ref(false);
const availableTimeSlots = ref([]);
const formData = ref({});

onMounted(() => {
  // Fetch applicant details from the system
  fetchApplicantDetails();
});

const fetchApplicantDetails = async () => {
  try {
    // Simulated fetch of applicant details
    applicantRank.value = "Inspector";
    applicantName.value = "John Doe";
    applicantOfficerNumber.value = "123456";
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal mendapatkan maklumat pemohon",
      text: "Sila cuba lagi.",
      timer: 5000,
    });
  }
};

const toggleSenderDetails = (value) => {
  sameAsSender.value = value;
};

const submitForm = (formData) => {
  // Store form data for later use
  formData.value = formData;
  showConfirmationModal.value = true;
};

const confirmSubmission = async () => {
  showConfirmationModal.value = false;
  try {
    // Simulated form submission
    $swal.fire({
      icon: "success",
      title: "Permohonan pemeriksaan forensik telah dihantar",
      timer: 5000,
    });
    showDateTimeModal.value = true;
    fetchAvailableTimeSlots();
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal menghantar permohonan",
      text: "Sila cuba lagi.",
      timer: 5000,
    });
  }
};

const fetchAvailableTimeSlots = async () => {
  try {
    // Simulated fetch of available time slots
    availableTimeSlots.value = [
      { label: "9:00 AM", value: "09:00" },
      { label: "10:00 AM", value: "10:00" },
      { label: "11:00 AM", value: "11:00" },
    ];
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal mendapatkan slot masa yang tersedia",
      text: "Sila cuba lagi.",
      timer: 5000,
    });
  }
};

const confirmDateTimeSlot = async () => {
  try {
    // Simulated confirmation of date and time slot
    const data = { caseId: "FOR-2023-001" };
    $swal.fire({
      icon: "success",
      title: "Janji temu telah disahkan",
      text: `Nombor rujukan kes: ${data.caseId}`,
      timer: 5000,
    });
    showDateTimeModal.value = false;
    router.push("/dashboard"); // Redirect to dashboard or confirmation page
  } catch (error) {
    $swal.fire({
      icon: "error",
      title: "Gagal mengesahkan janji temu",
      text: "Sila cuba lagi.",
      timer: 5000,
    });
  }
};
</script>

<template>
  <div>
    <LayoutsBreadcrumb class="mb-6" />

    <FormKit type="form" @submit="submitForm" :actions="false">
      <!-- Butir Permohonan Card -->
      <RsCard class="mb-6">
        <template #header>
          <h2 class="text-2xl font-semibold">Butir Permohonan</h2>
        </template>
        <template #body>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-3">Butir-butir Pemohon</h3>
              <div class="bg-gray-100 p-4 rounded-lg">
                <p>
                  <span class="font-medium">Nama:</span> {{ applicantName }}
                </p>
                <p>
                  <span class="font-medium">Pangkat:</span> {{ applicantRank }}
                </p>
                <p>
                  <span class="font-medium">Nombor Pegawai:</span>
                  {{ applicantOfficerNumber }}
                </p>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3">
                Butir-butir Penghantar Barang Kes
              </h3>
              <FormKit
                type="checkbox"
                name="sameAsSender"
                label="Penghantar Barang Kes Sama Dengan Pemohon"
                v-model="sameAsSender"
              />

              <div v-if="!sameAsSender" class="mt-4 space-y-4">
                <FormKit
                  type="text"
                  name="senderName"
                  label="Nama Penghantar Barang Kes"
                  validation="required"
                  :validation-messages="{
                    required: 'Sila masukkan nama penghantar barang kes',
                  }"
                />
                <FormKit
                  type="text"
                  name="senderRank"
                  label="Pangkat Penghantar Barang Kes"
                  validation="required"
                  :validation-messages="{
                    required: 'Sila masukkan pangkat penghantar barang kes',
                  }"
                />
                <FormKit
                  type="text"
                  name="senderOfficerNumber"
                  label="Nombor Pegawai Penghantar Barang Kes"
                  validation="required|number|length:6"
                  :validation-messages="{
                    required:
                      'Sila masukkan nombor pegawai penghantar barang kes',
                    number: 'Nombor pegawai mesti dalam bentuk nombor',
                    length: 'Nombor pegawai mesti mempunyai 6 digit',
                  }"
                />
              </div>
            </div>
          </div>
        </template>
      </RsCard>

      <!-- Maklumat Kes Card -->
      <RsCard class="mb-6">
        <template #header>
          <h2 class="text-2xl font-semibold">Maklumat Kes</h2>
        </template>
        <template #body>
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-3">Maklumat Barang Kes</h3>
              <div class="space-y-4">
                <FormKit
                  type="select"
                  name="jenisBarang"
                  label="Jenis Barang"
                  :options="[
                    { label: 'Pasport', value: 'pasport' },
                    { label: 'Malpass', value: 'malpass' },
                    { label: 'Cap Keselamatan', value: 'capKeselamatan' },
                    { label: 'Cap Jari', value: 'capJari' },
                    { label: 'Pemeriksaan Siber', value: 'pemeriksaanSiber' },
                    { label: 'Tulisan Tangan', value: 'tulisanTangan' },
                    { label: 'I-Kad', value: 'iKad' },
                    { label: 'Lain-lain', value: 'lainLain' },
                  ]"
                  validation="required"
                  :validation-messages="{
                    required: 'Sila pilih jenis barang',
                  }"
                />
                <FormKit
                  type="text"
                  name="tandaBarang"
                  label="Tanda Barang"
                  validation="required"
                  :validation-messages="{
                    required: 'Sila masukkan tanda barang',
                  }"
                />
                <FormKit
                  type="text"
                  name="keadaanBarang"
                  label="Keadaan Barang"
                  validation="required"
                  :validation-messages="{
                    required: 'Sila masukkan keadaan barang',
                  }"
                />
                <FormKit
                  type="number"
                  name="kuantitiBarang"
                  label="Kuantiti Barang"
                  validation="required|number|min:1"
                  :validation-messages="{
                    required: 'Sila masukkan kuantiti barang',
                    number: 'Kuantiti mesti dalam bentuk nombor',
                    min: 'Kuantiti mesti sekurang-kurangnya 1',
                  }"
                />
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-3">Maklumat Tambahan</h3>
              <div class="space-y-4">
                <FormKit
                  type="textarea"
                  name="ringkasanKes"
                  label="Ringkasan Kenyataan Kes"
                />
                <FormKit
                  type="text"
                  name="nomorKertasSiasatan"
                  label="Nombor Kertas Siasatan"
                />
                <FormKit
                  type="text"
                  name="nomorLaporanPolis"
                  label="Nombor Laporan Polis"
                />
              </div>
            </div>
          </div>
        </template>
      </RsCard>

      <div class="text-center">
        <FormKit
          type="submit"
          label="Hantar Permohonan"
          input-class="text-white font-bold py-2 px-4 rounded w-full"
        />
      </div>
    </FormKit>

    <!-- Confirmation Modal -->
    <RsModal v-model="showConfirmationModal" title="Pengesahan Permohonan">
      <template #body>
        <p>Adakah anda pasti untuk menghantar permohonan ini?</p>
      </template>
      <template #footer>
        <RsButton @click="showConfirmationModal = false" variant="secondary"
          >Kembali</RsButton
        >
        <RsButton @click="confirmSubmission" variant="primary">Sahkan</RsButton>
      </template>
    </RsModal>

    <!-- Date and Time Slot Selection Modal -->
    <RsModal v-model="showDateTimeModal" title="Pilih Tarikh dan Slot Masa">
      <template #body>
        <FormKit
          type="date"
          name="appointmentDate"
          label="Tarikh Janji Temu"
          validation="required|after:today"
          :validation-messages="{
            required: 'Sila pilih tarikh janji temu',
            after: 'Tarikh janji temu mestilah selepas tarikh hari ini',
          }"
        />
        <FormKit
          type="select"
          name="timeSlot"
          label="Slot Masa"
          :options="availableTimeSlots"
          validation="required"
          :validation-messages="{
            required: 'Sila pilih slot masa',
          }"
        />
      </template>
      <template #footer>
        <RsButton @click="showDateTimeModal = false" variant="secondary"
          >Kembali</RsButton
        >
        <RsButton @click="confirmDateTimeSlot" variant="primary"
          >Sahkan</RsButton
        >
      </template>
    </RsModal>
  </div>
</template>
