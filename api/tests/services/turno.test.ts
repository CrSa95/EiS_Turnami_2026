import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import { TurnoController } from "../../src/controllers/turno.controller";
import { Request, Response } from "express";

interface CustomRequest extends Request {
  user?: { dni: string };
}

describe("TurnoController - Tests Integrales Ligeros", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let mockTurnoService: any;
  let turnoController: TurnoController;

  beforeEach(() => {
    jest.clearAllMocks();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    req = {
      body: {},
      query: {},
      params: {},
      headers: {},
    };

    res = {
      status: statusMock as any,
      json: jsonMock as any,
    };

    // INICIALIZACIÓN DE MOCKS COMPLETA
    mockTurnoService = {
      solicitarTurno: jest.fn(),
      obtenerEstadoTurnoSemanal: jest.fn(),
      cancelarTurno: jest.fn(),
      obtenerProximosTurnos: jest.fn(),
      obtenerMedicoAsignado: jest.fn(),
    };

    turnoController = new TurnoController(mockTurnoService);
  });

  describe("POST /api/v1/paciente/turnos (solicitarTurno)", () => {
    it("debería responder con 400 Bad Request si los datos fallan o el servicio tira error", async () => {
      req.user = undefined;

      mockTurnoService.solicitarTurno.mockRejectedValue(new Error("Error al solicitar turno"));

      await turnoController.solicitarTurno(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    it("debería crear un turno exitosamente y responder con 201 Created", async () => {
      req.user = { dni: "12345678" };
      req.body = {
        medicoDni: "87654321",
        fechaPreferencia: "2026-10-20T11:00:00Z",
        horaPreferencia: "11:00",
        motivo: "Chequeo general",
      };

      const turnoCreadoMock = {
        id: "turno-999",
        pacienteDni: "12345678",
        medicoDni: "87654321",
        fechaPreferencia: "2026-10-20T11:00:00Z",
        horaPreferencia: "11:00",
        estado: "PENDIENTE",
      };

      const servicioResponseMock = {
        mensaje: "Se solicito un turno con el médico por el motivo Chequeo general, espere respuesta",
        turno: turnoCreadoMock,
      };

      mockTurnoService.solicitarTurno.mockResolvedValue(servicioResponseMock);

      await turnoController.solicitarTurno(req as Request, res as Response);

      expect(mockTurnoService.solicitarTurno).toHaveBeenCalledWith({
        pacienteDni: "12345678",
        medicoDni: "87654321",
        fechaPreferencia: "2026-10-20T11:00:00Z",
        horaPreferencia: "11:00",
        motivo: "Chequeo general",
        descripcion: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(servicioResponseMock);
    });

    it("debería responder con 400 Bad Request si el horario solicitado no está disponible", async () => {
      req.user = { dni: "12345678" };
      req.body = {
        medicoDni: "87654321",
        fechaPreferencia: "2026-10-20T11:00:00Z",
        horaPreferencia: "11:00",
      };

      const errorConflict = new Error("El profesional ya tiene un turno en ese horario");

      mockTurnoService.solicitarTurno.mockRejectedValue(errorConflict);

      await turnoController.solicitarTurno(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({ message: errorConflict.message })
      );
    });
  });

  describe("GET /api/v1/paciente/turnos/semanal (obtenerEstadoSemanal)", () => {
    it("debería obtener la lista de turnos del paciente con HTTP 200", async () => {
      req.user = { dni: "12345678" };

      const turnosMock = [
        { id: "t-1", fechaPreferencia: "2026-10-19T09:00:00Z", estado: "PENDIENTE" },
        { id: "t-2", fechaPreferencia: "2026-10-21T15:00:00Z", estado: "CONFIRMADO" },
      ];

      mockTurnoService.obtenerEstadoTurnoSemanal.mockResolvedValue(turnosMock);

      await turnoController.obtenerEstadoSemanal(req as Request, res as Response);

      expect(mockTurnoService.obtenerEstadoTurnoSemanal).toHaveBeenCalledWith("12345678");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(turnosMock);
    });

    it("debería responder con 500 si ocurre un error inesperado al obtener turnos", async () => {
      req.user = { dni: "12345678" };

      const dbError = new Error("Error de base de datos");
      mockTurnoService.obtenerEstadoTurnoSemanal.mockRejectedValue(dbError);

      await turnoController.obtenerEstadoSemanal(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: dbError.message });
    });
  });

  describe("PUT /api/v1/paciente/turnos/cancelar/:id (cancelarTurno)", () => {
    it("debería responder con 400 Bad Request si no se proporciona un ID válido en los parámetros", async () => {
      req.user = { dni: "12345678" };
      req.params = {};

      await turnoController.cancelarTurno(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Identificador de turno no válido.",
      });
      expect(mockTurnoService.cancelarTurno).not.toHaveBeenCalled();
    });

    it("debería cancelar el turno exitosamente y responder con 200 OK", async () => {
      req.user = { dni: "12345678" };
      req.params = { id: "turno-123" };

      const resultadoMock = {
        mensaje: "El turno ha sido cancelado exitosamente.",
        turno: { id: "turno-123", estado: "CANCELADO" },
      };

      mockTurnoService.cancelarTurno.mockResolvedValue(resultadoMock);

      await turnoController.cancelarTurno(req as Request, res as Response);

      expect(mockTurnoService.cancelarTurno).toHaveBeenCalledWith("turno-123", "12345678");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(resultadoMock);
    });

    it("debería responder con 400 Bad Request si la cancelación falla por regla de negocio (ej. menos de 24hs)", async () => {
      req.user = { dni: "12345678" };
      req.params = { id: "turno-123" };

      const errorProximidad = new Error(
        "El turno no puede ser cancelado por este medio debido a la proximidad de la fecha. Por favor, comuníquese con el consultorio."
      );

      mockTurnoService.cancelarTurno.mockRejectedValue(errorProximidad);

      await turnoController.cancelarTurno(req as Request, res as Response);

      expect(mockTurnoService.cancelarTurno).toHaveBeenCalledWith("turno-123", "12345678");
      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: errorProximidad.message });
    });
  });

  describe("GET /api/v1/paciente/turnos/proximos (obtenerProximosTurnos)", () => {
    it("debería obtener los próximos turnos del paciente con HTTP 200", async () => {
      req.user = { dni: "12345678" };

      const proximosTurnosMock = [
        {
          id: "t-100",
          pacienteDni: "12345678",
          medicoDni: "87654321",
          fechaPreferencia: "2026-10-25T10:00:00Z",
          horaPreferencia: "10:00",
          estado: "CONFIRMADO",
        },
      ];

      mockTurnoService.obtenerProximosTurnos.mockResolvedValue(proximosTurnosMock);

      await turnoController.obtenerProximosTurnos(req as Request, res as Response);

      expect(mockTurnoService.obtenerProximosTurnos).toHaveBeenCalledWith("12345678");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ turnos: proximosTurnosMock });
    });

    it("debería responder con HTTP 500 si ocurre un error al obtener los próximos turnos", async () => {
      req.user = { dni: "12345678" };

      const errorServicio = new Error("Error de conexión con la base de datos");
      mockTurnoService.obtenerProximosTurnos.mockRejectedValue(errorServicio);

      await turnoController.obtenerProximosTurnos(req as Request, res as Response);

      expect(mockTurnoService.obtenerProximosTurnos).toHaveBeenCalledWith("12345678");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: errorServicio.message });
    });
  });

  describe("GET /api/v1/paciente/medico-asignado (obtenerMedicoAsignado)", () => {
    it("debería devolver el médico asignado con status 200 OK", async () => {
      req.user = { dni: "12345678" };

      const medicoMock = {
        dni: "87654321",
        nombre: "Juan",
        apellido: "Pérez",
        especialidad: "Clínica médica",
      };

      mockTurnoService.obtenerMedicoAsignado.mockResolvedValue(medicoMock);

      await turnoController.obtenerMedicoAsignado(req as Request, res as Response);

      expect(mockTurnoService.obtenerMedicoAsignado).toHaveBeenCalledWith("12345678");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(medicoMock);
    });

    it("debería responder con 400 Bad Request si ocurre un error al obtener el médico", async () => {
      req.user = { dni: "12345678" };

      const errorSinMedico = new Error("El paciente no tiene un médico de cabecera asignado");
      mockTurnoService.obtenerMedicoAsignado.mockRejectedValue(errorSinMedico);

      await turnoController.obtenerMedicoAsignado(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: errorSinMedico.message });
    });
  });
});