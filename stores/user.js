import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",
  state: () => ({
    username: null,
    roles: null,
    rank: null,
    name: null,
    officerNumber: null,
    email: null,
    phone: null,
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
    setEmail(email) {
      this.email = email;
    },
    setPhone(phone) {
      this.phone = phone;
    },
    updateProfile(profileData) {
      const {
        userFullName,
        userEmail,
        userPhone,
        userRank,
        userOfficerNumber,
      } = profileData;
      this.name = userFullName;
      this.email = userEmail;
      this.phone = userPhone;
      this.rank = userRank;
      this.officerNumber = userOfficerNumber;
    },
  },
});
