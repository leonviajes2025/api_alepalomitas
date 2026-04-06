import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeLogError } from "@/lib/serializers";
import { validateLogErrorCreateInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const logsErrores = await prisma.logError.findMany({
    orderBy: [
      {
        fechaOcurrencia: "desc",
      },
      {
        fechaCreacion: "desc",
      },
    ],
  });

  return NextResponse.json(logsErrores.map(serializeLogError));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateLogErrorCreateInput(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.message }, { status: 400 });
    }

    const logError = await prisma.logError.create({
      data: validation.data,
    });

    return NextResponse.json(serializeLogError(logError), { status: 201 });
  } catch {
    return NextResponse.json({ message: "No fue posible registrar el log de error." }, { status: 400 });
  }
}