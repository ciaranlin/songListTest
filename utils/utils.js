// utils/utils.js
// Make sure this file uses ESM exports (Next.js expects static exports on the client bundle)

export const include = (field, value) => {
  // If no search value provided, treat as match-all
  if (value === null || value === undefined || String(value).trim() === "") return true;

  if (field === null || field === undefined) return false;

  try {
    return String(field).toLowerCase().includes(String(value).toLowerCase());
  } catch (e) {
    return false;
  }
};

export const getCursor = () => {
  // keep it simple and safe for all browsers
  return "pointer";
};
