#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load .env for local development if it exists
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('❌ Faltan variables de entorno: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const envTs = `export const environment = {
  production: false,
  supabase: {
    url: '${url}',
    anonKey: '${anonKey}',
  },
  currency: 'EUR',
};
`;

const envProdTs = `export const environment = {
  production: true,
  supabase: {
    url: '${url}',
    anonKey: '${anonKey}',
  },
  currency: 'EUR',
};
`;

fs.writeFileSync(path.join(__dirname, '../src/environments/environment.ts'), envTs);
fs.writeFileSync(path.join(__dirname, '../src/environments/environment.production.ts'), envProdTs);

console.log('✅ Archivos de entorno generados correctamente');
