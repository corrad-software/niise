export default [
  {
    header: "Forensik",
    description: "",
    child: [
      {
        title: "FOR-01",
        icon: "ph:number-circle-one-fill",
        child: [
          {
            title: "Permohonan Temujanji",
            path: "/permohonan-temujanji/senarai",
            child: [],
            meta: {
              auth: {
                role: ["PDRM"],
              },
            },
          },
          {
            title: "Kaunter Semakan ",
            path: "/kemaskini-daftar/senarai",
            child: [],
            meta: {
              auth: {
                role: ["Pegawai Kaunter", "Ketua Bahagian", "Pegawai Forensik"],
              },
            },
          },
        ],
      },
      {
        title: "FOR-02",
        icon: "ph:number-circle-two-fill",
        child: [
          {
            title: "Pengesanan Penyamaran",
            path: "/pengesanan-penyamaran/senarai",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["PDRM", "Pegawai Forensik"],
          },
        },
      },
      {
        title: "FOR-03",
        icon: "ph:number-circle-two-fill",
        child: [
          {
            title: "e-library",
            path: "/e-library",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Pegawai Forensik"],
          },
        },
      },
      {
        title: "FOR-04",
        icon: "ph:number-circle-four-fill",
        child: [
          {
            title: "Dokumen Library",
            path: "/dokumen-library",
            child: [],
            meta: {},
          },
        ],
        meta: {
          auth: {
            role: ["Pegawai Forensik"],
          },
        },
      },
    ],
  },
];
