const i18n = require("i18next");
import { resources } from 'connectfy-i18n';

i18n.init({
  resources,
  fallbackLng: 'en',
  lng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;