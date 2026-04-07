import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeBotonWhats } from "@/lib/serializers";

export const runtime = "nodejs";

const UNKNOWN_IP = "desconocida";
const UNKNOWN_DEVICE = "Desconocido";
const UNKNOWN_BROWSER = "Desconocido";

function trimToMaxLength(value: string, maxLength: number, fallback: string) {
  const normalized = value.trim();

  if (normalized.length === 0) {
    return fallback;
  }

  return normalized.slice(0, maxLength);
}

function getIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const candidates = [
    forwardedFor?.split(",")[0],
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
    request.headers.get("x-client-ip"),
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.trim().length > 0) {
      return trimToMaxLength(candidate, 120, UNKNOWN_IP);
    }
  }

  return UNKNOWN_IP;
}

function detectDevice(userAgent: string) {
  const normalized = userAgent.toLowerCase();

  if (!normalized) {
    return UNKNOWN_DEVICE;
  }

  if (normalized.includes("ipad") || normalized.includes("tablet")) {
    return "Tablet";
  }

  if (normalized.includes("iphone")) {
    return "iPhone";
  }

  if (normalized.includes("android") && normalized.includes("mobile")) {
    return "Android";
  }

  if (normalized.includes("android")) {
    return "Android Tablet";
  }

  if (normalized.includes("windows")) {
    return "Windows";
  }

  if (normalized.includes("mac os") || normalized.includes("macintosh")) {
    return "Mac";
  }

  if (normalized.includes("linux")) {
    return "Linux";
  }

  return UNKNOWN_DEVICE;
}

function detectBrowser(userAgent: string) {
  const normalized = userAgent.toLowerCase();

  if (!normalized) {
    return UNKNOWN_BROWSER;
  }

  if (normalized.includes("edg/")) {
    return "Edge";
  }

  if (normalized.includes("opr/") || normalized.includes("opera")) {
    return "Opera";
  }

  if (normalized.includes("chrome/") && !normalized.includes("edg/") && !normalized.includes("opr/")) {
    return "Chrome";
  }

  if (normalized.includes("firefox/")) {
    return "Firefox";
  }

  if (normalized.includes("safari/") && !normalized.includes("chrome/") && !normalized.includes("android")) {
    return "Safari";
  }

  if (normalized.includes("trident/") || normalized.includes("msie")) {
    return "Internet Explorer";
  }

  return UNKNOWN_BROWSER;
}

function getRequestMetadata(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";

  return {
    ip: getIpAddress(request),
    dispositivo: trimToMaxLength(detectDevice(userAgent), 255, UNKNOWN_DEVICE),
    navegador: trimToMaxLength(detectBrowser(userAgent), 255, UNKNOWN_BROWSER),
  };
}

export async function GET() {
  const registros = await prisma.botonWhats.findMany({
    orderBy: [
      {
        fechaClick: "desc",
      },
      {
        id: "desc",
      },
    ],
  });

  return NextResponse.json(registros.map(serializeBotonWhats));
}

export async function POST(request: Request) {
  const registro = await prisma.botonWhats.create({
    data: getRequestMetadata(request),
  });

  return NextResponse.json(serializeBotonWhats(registro), { status: 201 });
}