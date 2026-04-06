import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeCotizacionDetalle } from "@/lib/serializers";
import { validateCotizacionDetalleCreateInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateCotizacionDetalleCreateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const { idPedido, idProducto, numeroPiezas } = validation.data;

    const [pedido, producto] = await Promise.all([
      prisma.contactoWhats.findUnique({
        where: { id: idPedido },
        select: { id: true },
      }),
      prisma.producto.findUnique({
        where: { id: idProducto, activo: true },
        select: { id: true },
      }),
    ]);

    if (!pedido) {
      return NextResponse.json({ message: "No existe un contacto_whats con el idPedido indicado." }, { status: 400 });
    }

    if (!producto) {
      return NextResponse.json({ message: "No existe un producto activo con el idProducto indicado." }, { status: 400 });
    }

    const cotizacionDetalle = await prisma.cotizacionDetalle.create({
      data: {
        idPedido,
        idProducto,
        numeroPiezas,
      },
    });

    return NextResponse.json(serializeCotizacionDetalle(cotizacionDetalle), { status: 201 });
  } catch {
    return NextResponse.json({ message: "No fue posible crear el detalle de la cotizacion." }, { status: 400 });
  }
}