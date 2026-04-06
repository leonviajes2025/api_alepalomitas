import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { updateMock } = vi.hoisted(() => ({
  updateMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    contactoWhats: {
      update: updateMock,
    },
  },
}));

import { PATCH } from "@/app/api/contactos-whats/[id]/route";
import { validateContactoWhatsClienteEstatusUpdateInput } from "@/lib/validation";

describe("validateContactoWhatsClienteEstatusUpdateInput", () => {
  it("acepta clienteEstatus y elimina espacios laterales", () => {
    const result = validateContactoWhatsClienteEstatusUpdateInput({ clienteEstatus: "  confirmado  " });

    expect(result).toEqual({
      success: true,
      data: {
        clienteEstatus: "confirmado",
      },
    });
  });

  it("rechaza campos adicionales", () => {
    const result = validateContactoWhatsClienteEstatusUpdateInput({
      clienteEstatus: "confirmado",
      cotizacion: "extra",
    });

    expect(result).toEqual({
      success: false,
      message: "Solo puedes actualizar el campo clienteEstatus.",
    });
  });

  it("rechaza clienteEstatus vacio", () => {
    const result = validateContactoWhatsClienteEstatusUpdateInput({ clienteEstatus: "   " });

    expect(result).toEqual({
      success: false,
      message: "clienteEstatus debe ser un texto no vacio.",
    });
  });
});

describe("PATCH /api/contactos-whats/[id]", () => {
  beforeEach(() => {
    updateMock.mockReset();
  });

  it("rechaza ids invalidos", async () => {
    const request = new Request("http://localhost/api/contactos-whats/abc", {
      method: "PATCH",
      body: JSON.stringify({ clienteEstatus: "confirmado" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "abc" }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "El id de la solicitud de WhatsApp debe ser un entero positivo.",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rechaza bodies con campos distintos a clienteEstatus", async () => {
    const request = new Request("http://localhost/api/contactos-whats/1", {
      method: "PATCH",
      body: JSON.stringify({ clienteEstatus: "confirmado", nombre: "Ana" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Solo puedes actualizar el campo clienteEstatus.",
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("actualiza solo clienteEstatus y devuelve la solicitud serializada", async () => {
    updateMock.mockResolvedValue({
      id: 1,
      nombre: "Ana",
      cotizacion: "20 piezas",
      clienteEstatus: "confirmado",
      fechaEntregaEstimada: new Date("2026-04-20T00:00:00.000Z"),
      fechaCreacion: new Date("2026-04-06T12:00:00.000Z"),
    });

    const request = new Request("http://localhost/api/contactos-whats/1", {
      method: "PATCH",
      body: JSON.stringify({ clienteEstatus: "  confirmado  " }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "1" }) });

    expect(updateMock).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        clienteEstatus: "confirmado",
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 1,
      nombre: "Ana",
      cotizacion: "20 piezas",
      clienteEstatus: "confirmado",
      fechaEntregaEstimada: "2026-04-20",
      fechaCreacion: "2026-04-06T12:00:00.000Z",
    });
  });

  it("devuelve 404 cuando la solicitud no existe", async () => {
    updateMock.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Registro no encontrado", {
        code: "P2025",
        clientVersion: "6.18.0",
      }),
    );

    const request = new Request("http://localhost/api/contactos-whats/999", {
      method: "PATCH",
      body: JSON.stringify({ clienteEstatus: "confirmado" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "999" }) });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: "No existe una solicitud de WhatsApp con ese id.",
    });
  });
});