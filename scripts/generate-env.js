#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Leer el archivo .env
const envPath = path.join(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

// Generar environment.ts
const envTs = `export const environment = {
  production: false,
  supabase: {
    url: '${envConfig.VITE_SUPABASE_URL}',
    anonKey: '${envConfig.VITE_SUPABASE_ANON_KEY}',
  },
  currency: 'EUR',
};
`;

// Generar environment.production.ts
const envProdTs = `export const environment = {
  production: true,
  supabase: {
    url: '${envConfig.VITE_SUPABASE_URL}',
    anonKey: '${envConfig.VITE_SUPABASE_ANON_KEY}',
  },
  currency: 'EUR',
};
`;

fs.writeFileSync(path.join(__dirname, '../src/environments/environment.ts'), envTs);
fs.writeFileSync(path.join(__dirname, '../src/environments/environment.production.ts'), envProdTs);

console.log('✅ Archivos de entorno generados desde .env');
