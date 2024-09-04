<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Laporan Bahan Bukti</h1>
      <button
        @click="generatePDF"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Jana PDF
      </button>
    </div>

    <rs-card class="p-4">
      <FormKit
        type="form"
        @submit="submitForm"
        #default="{ state }"
        :actions="false"
        class="space-y-6"
      >
        <!-- KES ID and BARANG KES DETAIL -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormKit
            type="text"
            name="kesId"
            label="KES ID"
            v-model="generatedData.kesId"
            validation="required"
            :validation-messages="{ required: 'KES ID diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="tagNo"
            label="TAG NO"
            v-model="generatedData.tagNo"
            validation="required"
            :validation-messages="{ required: 'TAG NO diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="jenisBrg"
            label="Jenis Barang"
            v-model="generatedData.jenisBrg"
            validation="required"
            :validation-messages="{ required: 'Jenis Barang diperlukan' }"
            disabled
          />
          <FormKit
            type="text"
            name="jenisPemeriksaan"
            label="Jenis Pemeriksaan"
            v-model="generatedData.jenisPemeriksaan"
            validation="required"
            :validation-messages="{ required: 'Jenis Pemeriksaan diperlukan' }"
            disabled
          />
        </div>

        <!-- BUTIRAN PEGAWAI -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Butiran Pegawai</h2>
          <div
            v-for="role in ['PENYIASAT', 'PENGHANTAR', 'PENERIMA', 'PEMERIKSA']"
            :key="role"
            class="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <FormKit
              type="text"
              :name="`pegawai.${role}.nama`"
              :label="`${role} - Nama`"
              v-model="generatedData.pegawai[role].nama"
              validation="required"
              :validation-messages="{ required: 'Nama diperlukan' }"
              disabled
            />
            <FormKit
              type="text"
              :name="`pegawai.${role}.pangkat`"
              :label="`${role} - Pangkat`"
              v-model="generatedData.pegawai[role].pangkat"
              validation="required"
              :validation-messages="{ required: 'Pangkat diperlukan' }"
              disabled
            />
            <FormKit
              type="text"
              :name="`pegawai.${role}.noPegawai`"
              :label="`${role} - No Pegawai`"
              v-model="generatedData.pegawai[role].noPegawai"
              validation="required"
              :validation-messages="{ required: 'No Pegawai diperlukan' }"
              disabled
            />
          </div>
        </div>

        <!-- Peralatan and Langkah2 -->
        <div class="space-y-4">
          <FormKit
            type="textarea"
            name="peralatan"
            label="Peralatan"
            validation="required"
            :validation-messages="{ required: 'Peralatan diperlukan' }"
            :rows="3"
          />
          <FormKit
            type="textarea"
            name="langkah2"
            label="Langkah-langkah"
            validation="required"
            :validation-messages="{ required: 'Langkah-langkah diperlukan' }"
            :rows="5"
          />
        </div>

        <!-- Dapatan -->
        <FormKit
          type="radio"
          name="dapatan"
          label="Dapatan"
          :options="['Tulen', 'Palsu', 'Tidak dapat dikenalpasti']"
          validation="required"
          :validation-messages="{ required: 'Dapatan diperlukan' }"
        />

        <!-- Document Tambahan -->
        <div>
          <h2 class="text-xl font-semibold mb-2">Document Tambahan</h2>
          <FormKit type="list" name="documentTambahan" :value="[]">
            <FormKit type="group" :repeatable="true" :key="index">
              <div class="flex items-center space-x-2">
                <FormKit
                  type="text"
                  name="nama"
                  placeholder="Nama dokumen"
                  validation="required"
                  :validation-messages="{ required: 'Nama dokumen diperlukan' }"
                />
                <FormKit
                  type="file"
                  name="file"
                  validation="required"
                  multiple
                  :validation-messages="{ required: 'Fail diperlukan' }"
                />
              </div>
            </FormKit>
          </FormKit>
        </div>

        <div class="flex justify-end gap-2">
          <rs-button btn-type="reset" @click="previousPage()"
            >Kembali</rs-button
          >
          <rs-button type="submit" btn-type="submit">Hantar Laporan</rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { jsPDF } from "jspdf";

const route = useRoute();
const bahanBukti = route.params.bahanBukti;

const generatedData = ref({
  kesId: "",
  tagNo: "",
  jenisBrg: "",
  jenisPemeriksaan: "",
  pegawai: {
    PENYIASAT: { nama: "", pangkat: "", noPegawai: "" },
    PENGHANTAR: { nama: "", pangkat: "", noPegawai: "" },
    PENERIMA: { nama: "", pangkat: "", noPegawai: "" },
    PEMERIKSA: { nama: "", pangkat: "", noPegawai: "" },
  },
  peralatan: "",
  langkah2: "",
  dapatan: "",
  documentTambahan: [],
});

onMounted(() => {
  // Simulate fetching system-generated data
  generatedData.value = {
    kesId: `KES${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`,
    tagNo: `TAG${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    jenisBrg: ["Dokumen", "Elektronik", "Senjata"][
      Math.floor(Math.random() * 3)
    ],
    jenisPemeriksaan: ["Forensik", "Visual", "Kimia"][
      Math.floor(Math.random() * 3)
    ],
    pegawai: {
      PENYIASAT: generatePegawai("KB"),
      PENGHANTAR: generatePegawai(),
      PENERIMA: generatePegawai(),
      PEMERIKSA: generatePegawai(),
    },
  };
});

function generatePegawai(role = "") {
  const names = ["Ahmad", "Siti", "Mohd", "Nurul", "Lim", "Raj"];
  const surnames = ["Abdullah", "Tan", "Kumar", "Lee", "Muthu", "Hassan"];
  const pangkat = ["Inspektor", "Sarjan", "Koperal", "Konstabel"];

  return {
    nama: `${names[Math.floor(Math.random() * names.length)]} ${
      surnames[Math.floor(Math.random() * surnames.length)]
    }`,
    pangkat:
      role === "KB"
        ? "Ketua Bahagian"
        : pangkat[Math.floor(Math.random() * pangkat.length)],
    noPegawai: `P${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0")}`,
  };
}

const submitForm = async (formData) => {
  console.log("Form submitted:", formData);
  // Implement your API call or form submission logic here
};

const generatePDF = () => {
  const doc = new jsPDF();
  
  // Set font sizes
  const titleSize = 16;
  const subtitleSize = 14;
  const normalSize = 10;
  
  // Add title
  doc.setFontSize(titleSize);
  doc.text("Laporan Bahan Bukti", 105, 20, { align: "center" });
  
  // Add case details
  doc.setFontSize(subtitleSize);
  doc.text("Butiran Kes", 20, 40);
  
  doc.setFontSize(normalSize);
  doc.text(`KES ID: ${generatedData.value.kesId}`, 30, 50);
  doc.text(`TAG NO: ${generatedData.value.tagNo}`, 30, 60);
  doc.text(`Jenis Barang: ${generatedData.value.jenisBrg}`, 30, 70);
  doc.text(`Jenis Pemeriksaan: ${generatedData.value.jenisPemeriksaan}`, 30, 80);
  
  // Add officer details
  doc.setFontSize(subtitleSize);
  doc.text("Butiran Pegawai", 20, 100);
  
  doc.setFontSize(normalSize);
  let yPos = 110;
  for (const [role, officer] of Object.entries(generatedData.value.pegawai)) {
    doc.text(`${role}:`, 30, yPos);
    doc.text(`Nama: ${officer.nama}`, 40, yPos + 10);
    doc.text(`Pangkat: ${officer.pangkat}`, 40, yPos + 20);
    doc.text(`No Pegawai: ${officer.noPegawai}`, 40, yPos + 30);
    yPos += 45;
  }
  
  // Add examination details
  doc.setFontSize(subtitleSize);
  doc.text("Butiran Pemeriksaan", 20, yPos);
  
  doc.setFontSize(normalSize);
  doc.text(`Peralatan: ${generatedData.value.peralatan || "N/A"}`, 30, yPos + 10);
  doc.text(`Langkah-langkah: ${generatedData.value.langkah2 || "N/A"}`, 30, yPos + 20);
  doc.text(`Dapatan: ${generatedData.value.dapatan || "N/A"}`, 30, yPos + 30);
  
  // Add additional documents
  if (generatedData.value.documentTambahan && generatedData.value.documentTambahan.length > 0) {
    yPos += 50;
    doc.setFontSize(subtitleSize);
    doc.text("Dokumen Tambahan", 20, yPos);
    
    doc.setFontSize(normalSize);
    generatedData.value.documentTambahan.forEach((doc, index) => {
      doc.text(`${index + 1}. ${doc.nama}`, 30, yPos + 10 + (index * 10));
    });
  }
  
  // Generate and download the PDF
  doc.save(`Laporan_${generatedData.value.kesId}.pdf`);
};

function previousPage() {
  window.history.back();
}
</script>

<style lang="scss" scoped>
// Add any scoped styles here if needed
</style>
