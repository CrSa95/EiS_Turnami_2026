import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import { Request, Response } from "express";
import ImageController from "../../src/controllers/image.controller.js";
import ImageDAO from "../../src/dao/image.dao.js";
import PacienteDAO from "../../src/dao/paciente.dao.js";

jest.mock("../../src/dao/image.dao.js");
jest.mock("../../src/dao/paciente.dao.js");

describe("ImageController", () => {
  let imageController: ImageController;
  let mockImageDAO: ImageDAO;
  let mockPacienteDAO: PacienteDAO;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockImageDAO = new ImageDAO();
    mockPacienteDAO = new PacienteDAO();

    mockImageDAO.updateStatus = jest.fn() as any;

    imageController = new ImageController(mockImageDAO, mockPacienteDAO);

    res = {
      status: jest.fn().mockReturnThis() as unknown as (code: number) => Response,
      json: jest.fn().mockReturnThis() as unknown as (body?: any) => Response,
    };
  });

  describe("transcribeRecipe", () => {
    it('debería retornar 200 OK y la receta con estado "Transcripta" cuando se provee un idReceta válido', async () => {
      const mockIdReceta = "R1234";
      req = {
        params: {
          idReceta: mockIdReceta,
        },
      };

      const updatedImageMock = {
        idReceta: mockIdReceta,
        filename: "receta.jpg",
        filepath: "/uploads/receta.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        pacienteDni: "12345678",
        estado: "Transcripta",
      };

      jest.spyOn(mockImageDAO, "updateStatus").mockResolvedValue(updatedImageMock as any);

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "La receta ha sido marcada como transcripta correctamente",
        image: updatedImageMock,
      });
      expect(mockImageDAO.updateStatus).toHaveBeenCalledWith(mockIdReceta, "Transcripta");
    });

    it("debería retornar 400 Bad Request si no se proporciona el idReceta en req.params", async () => {
      req = {
        params: {},
      };

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El ID de la receta es requerido",
      });
    });

    it("debería retornar 404 Not Found si la receta no existe en la BD", async () => {
      const mockIdReceta = "R9999";
      req = {
        params: {
          idReceta: mockIdReceta,
        },
      };

      jest.spyOn(mockImageDAO, "updateStatus").mockResolvedValue(null as any);

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se encontró la receta solicitada",
      });
    });

    it("debería retornar 500 Internal Server Error cuando ocurre una excepción en la base de datos", async () => {
      req = {
        params: {
          idReceta: "R1234",
        },
      };

      const dbError = new Error("DB connection failed");
      jest.spyOn(mockImageDAO, "updateStatus").mockRejectedValue(dbError);

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al marcar la receta como transcripta",
        error: dbError,
      });
    });
  });
});