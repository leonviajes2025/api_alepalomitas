import fs from 'fs';
import { PrismaClient } from '@prisma/client';

function loadEnv(path = '.env') {
  try {
    const src = fs.readFileSync(path, 'utf8');
    for (const rawLine of src.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      let val = line.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch (e) {
    // ignore if no .env
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Intentando conectar a la base de datos...');
    const res = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Respuesta de la base de datos:', res);
    console.log('Conexión OK.');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error al conectar a la base de datos:');
    console.error(err);
    try {
      await prisma.$disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
