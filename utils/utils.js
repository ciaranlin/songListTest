// utils/utils.js
// Make sure this file uses ESM exports (Next.js expects static exports on the client bundle)

export const include = (arr, value) => {
  if (!Array.isArray(arr)) return false;
  return arr.includes(value);
};

export const getCursor = () => {
  // keep it simple and safe for all browsers
  return "pointer";
};
