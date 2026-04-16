import tr from "../../../public/locales/tr.json";
import eng from "../../../public/locales/eng.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  tr: {
    translation: tr,
  },
  en: { translation: eng },
};

const savedLanguage = localStorage.getItem("lang") || "tr";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: "tr",
  interpolation: { escapeValue: false },
});

export default i18n;
