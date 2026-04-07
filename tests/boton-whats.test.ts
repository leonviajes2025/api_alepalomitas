import { beforeEach, describe, expect, it, vi } from "vitest";

const { createMock, findManyMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  findManyMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    botonWhats: {
      create: createMock,
      findMany: findManyMock,
    },
  },
}));

import { GET, POST } from "@/app/api/boton-whats/route";

describe("GET /api/boton-whats", () => {
  beforeEach(() => {
    createMock.mockReset();
    findManyMock.mockReset();
  });

  it("lista los registros ordenando por fechaClick desc e id desc", async () => {
    findManyMock.mockResolvedValue([
      {
        id: 2,
        ip: "203.0.113.25",
        dispositivo: "Windows",
        navegador: "Chrome",
        fechaClick: new Date("2026-04-06T12:05:00.000Z"),
      },
      {
        id: 1,
        ip: "198.51.100.10",
        dispositivo: "iPhone",
        navegador: "Safari",
        fechaClick: new Date("2026-04-06T12:00:00.000Z"),
      },
    ]);

    const response = await GET();

    expect(findManyMock).toHaveBeenCalledWith({
      orderBy: [
        {
          fechaClick: "desc",
        },
        {
          id: "desc",
        },
      ],
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      {
        id: 2,
        ip: "203.0.113.25",
        dispositivo: "Windows",
        navegador: "Chrome",
        fechaClick: "2026-04-06T12:05:00.000Z",
      },
      {
        id: 1,
        ip: "198.51.100.10",
        dispositivo: "iPhone",
        navegador: "Safari",
        fechaClick: "2026-04-06T12:00:00.000Z",
      },
    ]);
  });
});

describe("POST /api/boton-whats", () => {
  beforeEach(() => {
    createMock.mockReset();
    findManyMock.mockReset();
  });

  it("registra ip, dispositivo y navegador a partir de los headers", async () => {
    createMock.mockResolvedValue({
      id: 3,
      ip: "203.0.113.50",
      dispositivo: "Windows",
      navegador: "Chrome",
      fechaClick: new Date("2026-04-06T13:00:00.000Z"),
    });

    const request = new Request("http://localhost/api/boton-whats", {
      method: "POST",
      headers: {
        "x-forwarded-for": "203.0.113.50, 10.0.0.1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
    });

    const response = await POST(request);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        ip: "203.0.113.50",
        dispositivo: "Windows",
        navegador: "Chrome",
      },
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: 3,
      ip: "203.0.113.50",
      dispositivo: "Windows",
      navegador: "Chrome",
      fechaClick: "2026-04-06T13:00:00.000Z",
    });
  });

  it("usa valores por defecto si faltan headers", async () => {
    createMock.mockResolvedValue({
      id: 4,
      ip: "desconocida",
      dispositivo: "Desconocido",
      navegador: "Desconocido",
      fechaClick: new Date("2026-04-06T13:30:00.000Z"),
    });

    const request = new Request("http://localhost/api/boton-whats", {
      method: "POST",
    });

    const response = await POST(request);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        ip: "desconocida",
        dispositivo: "Desconocido",
        navegador: "Desconocido",
      },
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: 4,
      ip: "desconocida",
      dispositivo: "Desconocido",
      navegador: "Desconocido",
      fechaClick: "2026-04-06T13:30:00.000Z",
    });
  });
});