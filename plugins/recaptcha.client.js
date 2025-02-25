import { install } from "vue3-recaptcha-v2";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(install, {
    sitekey: "6Ldg4eEqAAAAAATulSemuoddAj6KC71BrC5fvICu",
    cnDomains: false,
  });
});
