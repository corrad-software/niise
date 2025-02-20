export default [
  {
    header: "Forensik",
    description: "",
    child: [
      {
        title: "Laman Utama",
        path: "/dashboard",
        icon: "ph:house-duotone",
      },
      {
        title: "Semakan Forensik",
        icon: "ph:user-list-duotone",
        path: "/permohonan-temujanji/senarai",
        meta: { 
          auth: {
            role: ["Admin", "Pegawai Penyiasat"],
          },
        },
      },
      {
        title: "Semakan Forensik",
        icon: "ph:user-list-duotone",
        path: "/kemaskini-daftar/senarai",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Kaunter", "Ketua Bahagian", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "Pengesanan Penyamaran",
        path: "/pengesanan-penyamaran/senarai",
        icon: "ph:user-rectangle-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Penyiasat", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "e-Library",
        path: "/e-library",
        icon: "ph:address-book-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "Dokumen e-Library",
        path: "/dokumen-library",
        icon: "ph:file-archive-duotone",
        meta: {
          auth: {
            role: ["Admin", "Pegawai Forensik"],
          },
        },
      },
    ],
  },
];
