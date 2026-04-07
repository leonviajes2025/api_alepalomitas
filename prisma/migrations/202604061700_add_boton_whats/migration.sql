CREATE TABLE "boton_whats" (
    "id" SERIAL NOT NULL,
    "IP" VARCHAR(120) NOT NULL,
    "Dipositivo" VARCHAR(255) NOT NULL,
    "Navegador" VARCHAR(255) NOT NULL,
    "fechaClick" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boton_whats_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "boton_whats_fechaClick_idx" ON "boton_whats"("fechaClick");