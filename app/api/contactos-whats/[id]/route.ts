import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeContactoWhats } from "@/lib/serializers";
import { validateContactoWhatsClienteEstatusUpdateInput } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseContactoWhatsId(idParam: string) {
  const id = Number.parseInt(idParam, 10);

  if (Number.isNaN(id) || id <= 0) {
    return null;
  }

  return id;
}

function isNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id: idParam } = await context.params;
    const id = parseContactoWhatsId(idParam);

    if (id === null) {
      return NextResponse.json(
        { message: "El id de la solicitud de WhatsApp debe ser un entero positivo." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = validateContactoWhatsClienteEstatusUpdateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const contactoWhats = await prisma.contactoWhats.update({
      where: { id },
      data: {
        clienteEstatus: validation.data.clienteEstatus,
      },
    });

    return NextResponse.json(serializeContactoWhats(contactoWhats));
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ message: "No existe una solicitud de WhatsApp con ese id." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "No fue posible actualizar el estatus del cliente." },
      { status: 400 },
    );
  }
}