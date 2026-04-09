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
    // ignore
  }
}

loadEnv();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Comprobación adicional: consultas a tablas reales');

    // Intentar contar tablas conocidas; si faltan, listar tablas públicas
    const modelTables = [
      'contactos',
      'productos',
      'contactos_whats',
      'cotizacion_detalle',
      'usuarios_acceso',
      'inicios_sesion',
      'logs_errores',
      'boton_whats'
    ];

    const present = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    const presentNames = Array.isArray(present) ? present.map(p => p.tablename) : [];
    console.log('Tablas públicas detectadas:', presentNames.join(', '));

    for (const t of modelTables) {
      if (presentNames.includes(t)) {
        const res = await prisma.$queryRawUnsafe(`SELECT count(*)::int as cnt FROM "${t}"`);
        console.log(`${t} count:`, res[0]?.cnt ?? res[0]);
      } else {
        console.log(`${t} -> no existe en la base de datos`);
      }
    }

    // Mostrar un ejemplo de fila si la tabla existe
    if (presentNames.includes('productos')) {
      const example = await prisma.$queryRaw`SELECT id, nombre, precio FROM productos LIMIT 1`;
      console.log('Ejemplo producto:', example[0] ?? null);
    }

    await prisma.$disconnect();
    console.log('Comprobación adicional OK.');
    process.exit(0);
  } catch (err) {
    console.error('Error en comprobación adicional:');
    console.error(err);
    try { await prisma.$disconnect(); } catch (e) {}
    process.exit(1);
  }
}

main();
