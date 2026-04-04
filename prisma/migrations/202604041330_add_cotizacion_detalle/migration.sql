CREATE TABLE "cotizacion_detalle" (
    "id" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "numeroPiezas" INTEGER NOT NULL,

    CONSTRAINT "cotizacion_detalle_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cotizacion_detalle_idPedido_idx" ON "cotizacion_detalle"("idPedido");
CREATE INDEX "cotizacion_detalle_idProducto_idx" ON "cotizacion_detalle"("idProducto");

ALTER TABLE "cotizacion_detalle"
ADD CONSTRAINT "cotizacion_detalle_idPedido_fkey"
FOREIGN KEY ("idPedido") REFERENCES "contactos_whats"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cotizacion_detalle"
ADD CONSTRAINT "cotizacion_detalle_idProducto_fkey"
FOREIGN KEY ("idProducto") REFERENCES "productos"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;