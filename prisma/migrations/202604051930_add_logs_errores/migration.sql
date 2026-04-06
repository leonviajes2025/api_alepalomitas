CREATE TABLE "logs_errores" (
    "id" SERIAL NOT NULL,
    "dominio" VARCHAR(120) NOT NULL,
    "origen" VARCHAR(255),
    "metodo" VARCHAR(20),
    "codigo" VARCHAR(100),
    "mensaje" TEXT NOT NULL,
    "detalle" TEXT,
    "contexto" TEXT,
    "fechaOcurrencia" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_errores_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "logs_errores_dominio_fechaOcurrencia_idx" ON "logs_errores"("dominio", "fechaOcurrencia");

CREATE INDEX "logs_errores_fechaOcurrencia_idx" ON "logs_errores"("fechaOcurrencia");