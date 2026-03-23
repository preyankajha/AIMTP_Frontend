// utils/helpers.js

export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export const toCommaString = (arr = []) => arr.join(", ");

export const fromCommaString = (str = "") =>
  str.split(",").map((s) => s.trim()).filter(Boolean);

export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const generateDefaultItem = (config) => {
  const item = {};

  config.fields.forEach((field) => {
    if (field === "active") item[field] = true;
    else item[field] = "";
  });

  if (config.subKey) {
    item[config.subKey] = [];
  }

  return item;
};