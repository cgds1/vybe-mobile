const base = require('./app.json');

// En EAS Build, GOOGLE_SERVICES_JSON contiene la ruta al archivo temporal
// inyectado como file env variable. Localmente cae al archivo del repo.
base.expo.android.googleServicesFile =
  process.env.GOOGLE_SERVICES_JSON || './google-services.json';

module.exports = base;
