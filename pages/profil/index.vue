<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({
  title: "Profil",
  middleware: ["auth"],
});

const { $swal } = useNuxtApp();
const userStore = useUserStore();

// Form data
const formData = ref({
  userFullName: userStore.name,
  userEmail: userStore.email,
  userPhone: userStore.phone,
  userRank: userStore.rank,
  userOfficerNumber: userStore.officerNumber,
});

// Password change data
const passwordData = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Add these refs for password visibility toggles
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Update profile information
const updateProfile = async () => {
  try {
    const response = await $fetch("/api/profil/update", {
      method: "POST",
      body: formData.value,
    });

    if (response.statusCode === 200) {
      await $swal.fire({
        title: "Berjaya!",
        text: "Profil telah dikemaskini.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Update store with new values
      userStore.updateProfile(formData.value);
    }
  } catch (error) {
    $swal.fire({
      title: "Ralat!",
      text: error.message || "Ralat telah berlaku.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

// Change password
const changePassword = async () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    $swal.fire({
      title: "Ralat!",
      text: "Kata laluan baru tidak sepadan.",
      icon: "error",
      confirmButtonText: "OK",
    });
    return;
  }

  try {
    const response = await $fetch("/api/profil/change-password", {
      method: "POST",
      body: {
        oldPassword: passwordData.value.oldPassword,
        newPassword: passwordData.value.newPassword,
      },
    });

    if (response.statusCode === 200) {
      await $swal.fire({
        title: "Berjaya!",
        text: "Kata laluan telah dikemaskini.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Reset password fields
      passwordData.value = {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } else {
      $swal.fire({
        title: "Ralat!",
        text: response.message || "Ralat telah berlaku.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    $swal.fire({
      title: "Ralat!",
      text: error.message || "Ralat telah berlaku.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};
</script>

<template>
  <div>
    <div class="flex items-center justify-between space-y-2">
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Profil Pengguna</h2>
      </div>
    </div>

    <rs-card class="mt-4 px-4 py-6">
      <h3 class="text-xl font-semibold mb-6">Maklumat Peribadi</h3>

      <FormKit type="form" :actions="false" @submit="updateProfile">
        <div class="grid gap-6 md:grid-cols-2">
          <FormKit
            type="text"
            label="Nama Penuh"
            v-model="formData.userFullName"
            validation="required"
            :validation-messages="{
              required: 'Nama Penuh diperlukan',
            }"
          />

          <FormKit
            type="text"
            label="No. Pegawai"
            v-model="formData.userOfficerNumber"
            validation="required"
            :validation-messages="{
              required: 'No. Pegawai diperlukan',
            }"
          />

          <FormKit
            type="email"
            label="Emel"
            v-model="formData.userEmail"
            validation="required|email"
            :validation-messages="{
              required: 'Emel diperlukan',
              email: 'Format emel tidak sah',
            }"
          />

          <FormKit
            type="tel"
            label="No. Telefon"
            v-model="formData.userPhone"
            validation="required"
            :validation-messages="{
              required: 'No. Telefon diperlukan',
            }"
          />

          <FormKit
            type="text"
            label="Pangkat"
            v-model="formData.userRank"
            validation="required"
            :validation-messages="{
              required: 'Pangkat diperlukan',
            }"
          />
        </div>

        <div class="flex justify-end mt-6">
          <rs-button btn-type="submit" variant="primary">
            <Icon name="ci:save" class="w-4 h-4 mr-2" />
            Kemaskini Profil
          </rs-button>
        </div>
      </FormKit>
    </rs-card>

    <rs-card class="mt-4 px-4 py-6">
      <h3 class="text-xl font-semibold mb-6">Tukar Kata Laluan</h3>

      <FormKit type="form" :actions="false" @submit="changePassword">
        <FormKit
          :type="showOldPassword ? 'text' : 'password'"
          label="Kata Laluan Semasa"
          name="oldPassword"
          v-model="passwordData.oldPassword"
          validation="required"
          validation-visibility="live"
          :validation-messages="{
            required: 'Kata Laluan Semasa diperlukan',
          }"
        >
          <template #suffix>
            <div
              class="bg-gray-100 hover:bg-slate-200 dark:bg-slate-700 hover:dark:bg-slate-900 h-full rounded-r-md p-3 flex justify-center items-center cursor-pointer"
              @click="showOldPassword = !showOldPassword"
            >
              <Icon v-if="!showOldPassword" name="ion:eye-outline" size="19" />
              <Icon v-else name="ion:eye-off-outline" size="19" />
            </div>
          </template>
        </FormKit>

        <FormKit type="group" name="passwordGroup">
          <div class="grid gap-6 md:grid-cols-2">
            <FormKit
              :type="showNewPassword ? 'text' : 'password'"
              name="newPassword"
              label="Kata Laluan Baru"
              v-model="passwordData.newPassword"
              validation="required|length:8"
              validation-visibility="live"
              :validation-messages="{
                required: 'Kata Laluan Baru diperlukan',
                length: 'Kata laluan mestilah sekurang-kurangnya 8 aksara',
              }"
            >
              <template #suffix>
                <div
                  class="bg-gray-100 hover:bg-slate-200 dark:bg-slate-700 hover:dark:bg-slate-900 h-full rounded-r-md p-3 flex justify-center items-center cursor-pointer"
                  @click="showNewPassword = !showNewPassword"
                >
                  <Icon
                    v-if="!showNewPassword"
                    name="ion:eye-outline"
                    size="19"
                  />
                  <Icon v-else name="ion:eye-off-outline" size="19" />
                </div>
              </template>
            </FormKit>

            <FormKit
              :type="showConfirmPassword ? 'text' : 'password'"
              name="confirmPassword"
              label="Sahkan Kata Laluan Baru"
              v-model="passwordData.confirmPassword"
              validation="required|confirm"
              validation-visibility="live"
              validation-label="Pengesahan Kata Laluan"
              :validation-messages="{
                required: 'Pengesahan Kata Laluan diperlukan',
                confirm: 'Kata laluan tidak sepadan',
              }"
            >
              <template #suffix>
                <div
                  class="bg-gray-100 hover:bg-slate-200 dark:bg-slate-700 hover:dark:bg-slate-900 h-full rounded-r-md p-3 flex justify-center items-center cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <Icon
                    v-if="!showConfirmPassword"
                    name="ion:eye-outline"
                    size="19"
                  />
                  <Icon v-else name="ion:eye-off-outline" size="19" />
                </div>
              </template>
            </FormKit>
          </div>
        </FormKit>

        <div class="flex justify-end mt-6">
          <rs-button btn-type="submit" variant="warning">
            <Icon name="ph:lock-bold" class="w-4 h-4 mr-2" />
            Tukar Kata Laluan
          </rs-button>
        </div>
      </FormKit>
    </rs-card>
  </div>
</template>

<style lang="scss" scoped>
// Remove the previous style block as we're using Tailwind classes now
</style>
