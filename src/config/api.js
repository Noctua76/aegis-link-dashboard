const PRODUCTION_API_BASE_URL =
  "https://noctua-panic-backend-production.up.railway.app";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || PRODUCTION_API_BASE_URL
).replace(/\/$/, "");
