<script setup>
definePageMeta({
  title: "User List",
  middleware: ["auth"],
  requiresAuth: true,
  keepalive: {
    exclude: ["rs-table"],
  },
});

const { $swal, $router } = useNuxtApp();

const userList = ref([]);
const userRoleList = ref([]);

const showModal = ref(false);
const showModalForm = ref({
  username: "",
  fullname: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  status: "",
});
const modalType = ref("");

const showModalRole = ref(false);
const showModalRoleForm = ref({
  role: "",
  description: "",
});

const showModalDelete = ref(false);
const showModalDeleteForm = ref({
  username: "",
});

const statusDropdown = ref([
  { label: "Aktif", value: "ACTIVE" },
  { label: "Tidak Aktif", value: "INACTIVE" },
]);

const checkAllRole = ref(false);

const userListbyRole = ref([]);

// Call API
// onMounted(async () => {
//   await getUserList();
//   await getRoleList();
// });

await getUserList();
await getRoleList();

async function getUserList() {
  const { data } = await useFetch("/api/devtool/user/list", {
    initialCache: false,
  });

  // Rename the key
  if (data.value?.statusCode === 200) {
    userList.value = data.value.data.map((user) => ({
      username: user.userUsername,
      fullname: user.userFullName,
      email: user.userEmail,
      phone: user.userPhone,
      role: user.roles.map((r) => {
        return {
          label: r.role.roleName,
          value: r.role.roleID,
        };
      }),
      status: user.userStatus,
      action: null,
    }));

    groupUserByRole();
  }
}

async function getRoleList() {
  const { data } = await useFetch("/api/devtool/role/list", {
    initialCache: false,
  });

  if (data.value.statusCode === 200) {
    userRoleList.value = data.value.data.map((role) => ({
      label: role.roleName,
      value: role.roleID,
    }));
  }
}

function roleWithComma(role) {
  // Limit the number of role to 4 and add "..." if there are more than 4 role
  const roleList = role.map((r) => r.label);
  return roleList.length > 4
    ? roleList.slice(0, 4).join(", ") + "..."
    : roleList.join(", ");
}

// Watch checkAllRole value
watch(
  checkAllRole,
  async (value) => {
    if (value) {
      showModalForm.value.role = userRoleList.value;
    } else {
      if (showModalForm.value.role.length === userRoleList.value.length) {
        showModalForm.value.role = [];
      }
    }
  },
  { immediate: true }
);

// Watch showModalForm.role value
watch(
  showModalForm,
  async (value) => {
    if (value.role.length === userRoleList.value.length) {
      checkAllRole.value = true;
    } else {
      checkAllRole.value = false;
    }
  },
  { deep: true }
);

// Open Modal Add or Edit User
const openModal = async (value, type) => {
  modalType.value = type;

  if (type == "edit") {
    showModalForm.value.username = value.username;
    showModalForm.value.fullname = value.fullname;
    showModalForm.value.phone = value.phone;
    showModalForm.value.email = value.email;
    showModalForm.value.role = value.role;
    showModalForm.value.status = value.status;
  } else {
    showModalForm.value.username = "";
    showModalForm.value.fullname = "";
    showModalForm.value.phone = "";
    showModalForm.value.email = "";
    showModalForm.value.role = "";
    showModalForm.value.status = "";
  }

  showModalRole.value = false;
  showModal.value = true;
};

// Open Modal Add Role
const openModalRole = async () => {
  showModalRoleForm.value.role = "";
  showModalRoleForm.value.description = "";

  showModal.value = false;
  showModalRole.value = true;
};

// Close Modal Role
const closeModalRole = () => {
  showModalRole.value = false;
  showModal.value = true;
};

// Open Modal Delete User
const openModalDelete = async (value) => {
  showModalDeleteForm.value.username = value.username;

  showModalDelete.value = true;
};

const checkDeveloperRole = (role) => {
  return role.some((r) => r.label === "Developer");
};

const saveUser = async () => {
  if (modalType.value == "add") {
    const { data } = await useFetch("/api/devtool/user/add", {
      initialCache: false,
      method: "POST",
      body: JSON.stringify({
        ...showModalForm.value,
        module: "user",
      }),
    });

    if (data.value.statusCode === 200) {
      // console.log("data.value", data.value);
      $swal.fire({
        position: "center",
        icon: "success",
        title: "Berjaya",
        text: "Pengguna telah ditambah",
        timer: 1000,
        showConfirmButton: false,
      });
      // await getUserList();
      // showModal.value = false;

      setTimeout(() => {
        $router.go();
      }, 1000);
    } else {
      $swal.fire({
        position: "center",
        icon: "error",
        title: "Ralat",
        text: data.value.message,
      });
    }
  } else {
    const { data } = await useFetch("/api/devtool/user/edit", {
      initialCache: false,
      method: "POST",
      body: JSON.stringify(showModalForm.value),
    });

    if (data.value.statusCode === 200) {
      $swal.fire({
        position: "center",
        icon: "success",
        title: "Berjaya",
        text: "Pengguna telah dikemaskini",
        timer: 1000,
        showConfirmButton: false,
      });
      // await getUserList();
      // showModal.value = false;

      setTimeout(() => {
        $router.go();
      }, 1000);
    } else {
      $swal.fire({
        position: "center",
        icon: "error",
        title: "Ralat",
        text: data.value.message,
      });
    }
  }
};

const deleteUser = async () => {
  const { data } = await useFetch("/api/devtool/user/delete", {
    initialCache: false,
    method: "POST",
    body: JSON.stringify({ username: showModalDeleteForm.value.username }),
  });

  if (data.value.statusCode === 200) {
    $swal.fire({
      position: "center",
      icon: "success",
      title: "Berjaya",
      text: "Pengguna telah dipadam",
      timer: 1000,
      showConfirmButton: false,
    });

    // Timer to wait timer in swal
    setTimeout(() => {
      $router.go();
    }, 1000);
  } else {
    $swal.fire({
      position: "center",
      icon: "error",
      title: "Ralat",
      text: data.value.message,
    });
  }
};

const saveRole = async () => {
  if (
    showModalRoleForm.value.role == "" ||
    showModalRoleForm.value.role == " "
  ) {
    return false;
  }

  const { data } = await useFetch("/api/devtool/role/add", {
    method: "POST",
    body: JSON.stringify({
      name: showModalRoleForm.value.role,
      description: showModalRoleForm.value.description,
      module: "user",
    }),
  });

  if (data.value.statusCode === 200) {
    $swal.fire({
      position: "center",
      title: "Berjaya",
      text: data.value.message,
      icon: "success",
      timer: 1000,
      showConfirmButton: false,
    });

    await getRoleList();
    closeModalRole();
  } else {
    $swal.fire({
      position: "center",
      title: "Ralat",
      text: data.value.message,
      icon: "error",
    });
  }
};

function groupUserByRole() {
  userListbyRole.value = userList.value.reduce((acc, cur) => {
    const { role } = cur;
    if (!acc[role.value]) {
      acc[role.value] = {
        role: role,
        users: [],
      };
    }
    acc[role.value].users.push(cur);
    return acc;
  }, {});
}
</script>
<template>
  <div>
    <LayoutsBreadcrumb />
    <rs-card>
      <template #header>
        <div class="flex">
          <Icon class="mr-2 flex justify-center" name="ic:outline-info"></Icon
          >Maklumat
        </div>
      </template>
      <template #body>
        <p class="mb-4">
          Halaman ini hanya boleh diakses oleh pengguna admin. Anda boleh menguruskan pengguna
          di sini. Anda juga boleh menambah pengguna baru. Anda juga boleh menukar peranan pengguna.
        </p>
      </template>
    </rs-card>

    <rs-card>
      <div class="pt-2">
        <rs-tab fill>
          <rs-tab-item title="Semua Pengguna">
            <div class="flex justify-end items-center mb-4">
              <rs-button @click="openModal(null, 'add')">
                <Icon name="material-symbols:add" class="mr-1"></Icon>
                Tambah Pengguna
              </rs-button>
            </div>
            <rs-table
              v-if="userList && userList.length > 0"
              :data="userList"
              :options="{
                variant: 'default',
                striped: true,
                borderless: true,
              }"
              advanced
            >
              <template v-slot:role="data">
                <!-- {{ data.text?.label }} -->
                {{ roleWithComma(data.text) }}
              </template>
              <template v-slot:action="data">
                <div
                  class="flex justify-center items-center"
                  v-if="!checkDeveloperRole(data.value.role)"
                >
                  <Icon
                    name="material-symbols:edit-outline-rounded"
                    class="text-primary hover:text-primary/90 cursor-pointer mr-1"
                    size="22"
                    @click="openModal(data.value, 'edit')"
                  ></Icon>
                  <Icon
                    name="material-symbols:close-rounded"
                    class="text-primary hover:text-primary/90 cursor-pointer"
                    size="22"
                    @click="openModalDelete(data.value)"
                  ></Icon>
                </div>
                <div class="flex justify-center items-center" v-else>-</div>
              </template>
            </rs-table>
          </rs-tab-item>
        </rs-tab>
        <!-- <rs-tab-item title="User Tree">
          <div v-for="(value, index) in userListbyRole">
            {{ value }}
          </div>
        </rs-tab-item> -->
      </div>
    </rs-card>

    <rs-modal
      :title="modalType == 'edit' ? 'Sunting Pengguna' : 'Tambah Pengguna'"
      ok-title="Simpan"
      :ok-callback="saveUser"
      v-model="showModal"
    >
      <FormKit
        type="text"
        v-model="showModalForm.username"
        name="username"
        label="Nama Pengguna"
        :disabled="modalType == 'edit' ? true : false"
      />
      <FormKit
        type="text"
        v-model="showModalForm.fullname"
        name="fullname"
        label="Nama Penuh"
      />
      <FormKit
        type="text"
        v-model="showModalForm.email"
        name="email"
        label="E-mel"
        validation="email"
        validation-visibility="dirty"
      />
      <FormKit
        type="mask"
        v-model="showModalForm.phone"
        name="phone"
        label="Telefon"
        mask="###########"
      />
      <div class="flex justify-between items-center mb-2">
        <label
          class="formkit-label flex items-center gap-x-4 font-semibold text-gray-700 dark:text-gray-200 blockfont-semibold text-sm formkit-invalid:text-red-500 dark:formkit-invalid:text-danger"
          for="input_4"
        >
          Peranan
        </label>
        <rs-button size="sm" @click="openModalRole"> Tambah Peranan </rs-button>
      </div>
      <v-select
        class="formkit-vselect"
        :options="userRoleList"
        v-model="showModalForm.role"
        multiple
      ></v-select>
      <FormKit
        type="checkbox"
        v-model="checkAllRole"
        label="Semua Peranan"
        input-class="icon-check"
      />
      <FormKit
        type="select"
        :options="statusDropdown"
        v-model="showModalForm.status"
        name="status"
        label="Status"
      />
    </rs-modal>

    <!-- Modal Role -->
    <rs-modal
      title="Tambah Peranan"
      ok-title="Simpan"
      cancel-title="Kembali"
      :cancel-callback="closeModalRole"
      :ok-callback="saveRole"
      v-model="showModalRole"
    >
      <FormKit
        type="text"
        v-model="showModalRoleForm.role"
        label="Nama"
        validation="required"
        validation-visibility="live"
      />
      <FormKit
        type="textarea"
        v-model="showModalRoleForm.description"
        label="Penerangan"
      />
    </rs-modal>

    <!-- Modal Delete Confirmation -->
    <rs-modal
      title="Pengesahan Padam"
      ok-title="Ya"
      cancel-title="Tidak"
      :ok-callback="deleteUser"
      v-model="showModalDelete"
    >
      <p>
        Adakah anda pasti mahu memadam pengguna ini ({{
          showModalDeleteForm.username
        }})?
      </p>
    </rs-modal>
  </div>
</template>
