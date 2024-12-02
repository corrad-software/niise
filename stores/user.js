import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    username: null,
    roles: null,
    rank: null,
    name: null,
    officerNumber: null,
    isAuth: false,
  }),
  persist: true,
  actions: {
    setUsername(username) {
      this.username = username;
    },
    setRoles(roles) {
      this.roles = roles;
    },
    setRank(rank) {
      this.rank = rank;
    },
    setIsAuthenticated(isAuth) {
      this.isAuth = isAuth;
    },
    setName(name) {
      this.name = name;
    },
    setOfficerNumber(officerNumber) {
      this.officerNumber = officerNumber;
    },
  },
});
