import {
  isOptionalText,
  isPositiveInteger,
  isRequiredText,
} from '../validator/resource.validacion.js';

const isEmail = (value) => typeof value === 'string'
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  && value.length <= 100;

export const resources = {
  countries: {
    table: 'countries',
    fields: { name: isRequiredText(100) },
    requiredFields: ['name'],
  },
  authors: {
    table: 'authors',
    fields: { name: isRequiredText(150), id_country: isPositiveInteger },
    requiredFields: ['name', 'id_country'],
  },
  editorials: {
    table: 'editorials',
    fields: { name: isRequiredText(150) },
    requiredFields: ['name'],
  },
  categories: {
    table: 'categories',
    fields: { name: isRequiredText(150) },
    requiredFields: ['name'],
  },
  customers: {
    table: 'customers',
    fields: {
      firstname: isRequiredText(50),
      lastname: isRequiredText(50),
      address: isOptionalText(100),
      phone: isRequiredText(20),
      email: isEmail,
      estado: (value) => value === 'ACTIVO' || value === 'INACTIVO',
    },
    requiredFields: ['firstname', 'lastname', 'phone', 'email'],
  },
  cities: {
    table: 'cities',
    fields: { name: isRequiredText(100) },
    requiredFields: ['name'],
  },
  premises: {
    table: 'premises',
    fields: {
      name: isOptionalText(50),
      address: isRequiredText(100),
      id_city: isPositiveInteger,
    },
    requiredFields: ['address', 'id_city'],
  },
  books: {
    table: 'books',
    fields: {
      name: isRequiredText(150),
      year_publish: (value) => Number.isInteger(value) && value > 0 && value <= 9999,
      id_category: isPositiveInteger,
      id_author: isPositiveInteger,
      id_editorial: isPositiveInteger,
      stock: (value) => Number.isSafeInteger(value) && value >= 0 && value <= 2147483647,
    },
    requiredFields: ['name', 'year_publish', 'id_category', 'id_author', 'id_editorial'],
  },
};
