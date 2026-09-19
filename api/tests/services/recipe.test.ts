import { jest, describe, it, beforeEach, afterEach, beforeAll, afterAll, expect } from "@jest/globals";
import { Request, Response } from "express";
import mongoose from "mongoose";
import ImageController from "../../src/controllers/image.controller.js";
import ImageService from "../../src/services/image.service.js";
import ImageDAO from "../../src/dao/image.dao.js";
import PacienteDAO from "../../src/dao/paciente.dao.js";
import ImageModel from "../../src/model/image.model.js";

describe("ImageController - (Tests de integración)", () => {
  let imageController: ImageController;
  let imageService: ImageService;
  let imageDAO: ImageDAO;
  let pacienteDAO: PacienteDAO;
  let req: Partial<Request>;
  let res: Partial<Response>;

  const TEST_RECIPE_ID = "R-TEST-123";

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/turnami_test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    imageDAO = new ImageDAO();
    pacienteDAO = new PacienteDAO();
    imageService = new ImageService(imageDAO);
    imageController = new ImageController(imageDAO, pacienteDAO, imageService);

    res = {
      status: jest.fn().mockReturnThis() as unknown as (code: number) => Response,
      json: jest.fn().mockReturnThis() as unknown as (body?: any) => Response,
    };

    await ImageModel.deleteOne({ idReceta: TEST_RECIPE_ID });
  });

  afterEach(async () => {
    await ImageModel.deleteOne({ idReceta: TEST_RECIPE_ID });
  });

  // ==========================================
  // TESTS: transcribeRecipe
  // ==========================================
  describe("transcribeRecipe", () => {
    it("debería actualizar el estado a 'Transcripta' en la BD y retornar 200 OK", async () => {
      await imageDAO.create({
        idReceta: TEST_RECIPE_ID,
        filename: "test.jpg",
        filepath: "/uploads/test.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        pacienteDni: "12345678",
        estado: "Pendiente",
      });

      req = { params: { idReceta: TEST_RECIPE_ID } };

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "La receta ha sido marcada como transcripta correctamente",
        })
      );

      const updatedImage = await ImageModel.findOne({ idReceta: TEST_RECIPE_ID });
      expect(updatedImage?.estado).toBe("Transcripta");
    });

    it.each([
      { desc: "undefined", params: {} },
      { desc: "string vacío", params: { idReceta: "" } },
      { desc: "solo espacios", params: { idReceta: "   " } },
      { desc: "tipo no string", params: { idReceta: 123 } },
    ])("debería retornar 400 Bad Request cuando idReceta es $desc", async ({ params }) => {
      req = { params: params as any };
    
      await imageController.transcribeRecipe(req as Request, res as Response);
    
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El ID de la receta es requerido",
      });
    }); 

    it("debería retornar 404 Not Found si la receta no existe en la BD", async () => {
      req = { params: { idReceta: "R-INEXISTENTE-999" } };

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se encontró la receta solicitada",
      });
    });

    it("debería retornar 500 Internal Server Error si ocurre una falla en el servicio/BD", async () => {
      req = { params: { idReceta: TEST_RECIPE_ID } };
      const errorSimulado = new Error("Error de conexión a la base de datos");

      jest.spyOn(imageService, "transcribeRecipe").mockRejectedValueOnce(errorSimulado);

      await imageController.transcribeRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al marcar la receta como transcripta",
        error: errorSimulado,
      });
    });
  });

  // ==========================================
  // TESTS: rejectRecipe
  // ==========================================
  describe("rejectRecipe", () => {
    it("debería actualizar el estado a 'Rechazada' en la BD y retornar 200 OK", async () => {
      await imageDAO.create({
        idReceta: TEST_RECIPE_ID,
        filename: "test.jpg",
        filepath: "/uploads/test.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        pacienteDni: "12345678",
        estado: "Pendiente",
      });

      req = { params: { idReceta: TEST_RECIPE_ID } };

      await imageController.rejectRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "La receta ha sido rechazada correctamente",
        })
      );

      const updatedImage = await ImageModel.findOne({ idReceta: TEST_RECIPE_ID });
      expect(updatedImage?.estado).toBe("Rechazada");
    });

    it("debería limpiar espacios en blanco (trim) del idReceta al buscar", async () => {
      await imageDAO.create({
        idReceta: TEST_RECIPE_ID,
        filename: "test.jpg",
        filepath: "/uploads/test.jpg",
        mimetype: "image/jpeg",
        size: 1024,
        pacienteDni: "12345678",
        estado: "Pendiente",
      });

      req = { params: { idReceta: `  ${TEST_RECIPE_ID}  ` } };

      await imageController.rejectRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      const updatedImage = await ImageModel.findOne({ idReceta: TEST_RECIPE_ID });
      expect(updatedImage?.estado).toBe("Rechazada");
    });

    it.each([
      { desc: "undefined", params: {} },
      { desc: "string vacío", params: { idReceta: "" } },
      { desc: "solo espacios", params: { idReceta: "   " } },
      { desc: "tipo no string", params: { idReceta: 999 } },
    ])("debería retornar 400 Bad Request cuando idReceta es $desc", async ({ params }) => {
      req = { params: params as any };
    
      await imageController.rejectRecipe(req as Request, res as Response);
    
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "El ID de la receta es requerido",
      });
    });

    it("debería retornar 404 Not Found si la receta no existe en la BD", async () => {
      req = { params: { idReceta: "R-INEXISTENTE-999" } };

      await imageController.rejectRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "No se encontró la receta solicitada",
      });
    });

    it("debería retornar 500 Internal Server Error si ocurre una falla en el servicio/BD", async () => {
      req = { params: { idReceta: TEST_RECIPE_ID } };
      const errorSimulado = new Error("Error inesperado en Mongoose");

      jest.spyOn(imageService, "rejectRecipe").mockRejectedValueOnce(errorSimulado);

      await imageController.rejectRecipe(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error al rechazar la receta",
        error: errorSimulado,
      });
    });
  });
});