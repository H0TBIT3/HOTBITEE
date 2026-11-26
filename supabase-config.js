window.HOTBITE_SUPABASE_CONFIG = Object.freeze({
  url: "https://xwgntjptuilyxttsioga.supabase.co",
  anonKey: "sb_publishable_bDM7PQO9TfBQ6fUU0A8Lyw_kUSanX4o"
});

const config = window.HOTBITE_SUPABASE_CONFIG;
if (!window.supabase || !window.supabase.createClient) {
  window.HOTBITE_SUPABASE_CLIENT = null;
  window.HOTBITE_SUPABASE_CONFIG_ERROR = "No se pudo cargar la librería de Supabase.";
} else if (!config.url || !config.anonKey) {
  window.HOTBITE_SUPABASE_CLIENT = null;
  window.HOTBITE_SUPABASE_CONFIG_ERROR = "Configura Supabase en supabase-config.js.";
} else {
  window.HOTBITE_SUPABASE_CLIENT = window.supabase.createClient(config.url, config.anonKey);
  window.HOTBITE_SUPABASE_CONFIG_ERROR = "";
}