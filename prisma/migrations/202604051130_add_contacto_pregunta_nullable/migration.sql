ALTER TABLE "contactos" RENAME TO "contactos_old";
ALTER TABLE "contactos_old" RENAME CONSTRAINT "contactos_pkey" TO "contactos_old_pkey";
ALTER INDEX "contactos_email_key" RENAME TO "contactos_old_email_key";

CREATE TABLE "contactos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "aceptaPromociones" BOOLEAN NOT NULL DEFAULT false,
    "pregunta" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactos_pkey" PRIMARY KEY ("id")
);

INSERT INTO "contactos" (
    "id",
    "nombre",
    "email",
    "telefono",
    "aceptaPromociones",
    "pregunta",
    "fechaCreacion",
    "fechaActualizacion"
)
SELECT
    "id",
    "nombre",
    "email",
    "telefono",
    "aceptaPromociones",
    NULL,
    "fechaCreacion",
    "fechaActualizacion"
FROM "contactos_old";

CREATE UNIQUE INDEX "contactos_email_key" ON "contactos"("email");

SELECT setval(
    pg_get_serial_sequence('"contactos"', 'id'),
    COALESCE((SELECT MAX("id") FROM "contactos"), 1),
    (SELECT COUNT(*) > 0 FROM "contactos")
);

DROP TABLE "contactos_old";