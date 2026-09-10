import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import { Request, Response } from 'express';
import ImageController from '../../src/controllers/image.controller.js';
import ImageDAO from '../../src/dao/image.dao.js';

describe('ImageController - getImagesByPaciente', () => {
    let imageController: ImageController;
    let mockImageDAO: any; // <--- Declararlo como any evita que TS se queje de los tipos en los mocks
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Objeto mock directo con funciones de Jest
        mockImageDAO = {
            create: jest.fn(),
            findByPacienteId: jest.fn(),
        };

        // Inyectamos el mock casteado al tipo del DAO
        imageController = new ImageController(mockImageDAO as unknown as ImageDAO);

        req = {
            params: {
                pacienteId: '507f1f77bcf86cd799439011'
            }
        };

        res = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };
    });

    it('debería retornar un status 200 y la lista de imágenes cuando el ID del paciente es válido', async () => {
        const mockImages = [
            { _id: '60c72b2f9b1d8b2d88f12345', filename: 'test1.jpg', filepath: '/uploads/test1.jpg' }
        ];

        // Ahora .mockResolvedValue aceptará cualquier array u objeto sin restricciones de tipo
        mockImageDAO.findByPacienteId.mockResolvedValue(mockImages);

        await imageController.getImagesByPaciente(req as Request, res as Response);

        expect(mockImageDAO.findByPacienteId).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockImages);
    });

    it('debería retornar un status 400 si el ID del paciente no es un ObjectId válido de Mongoose', async () => {
        req.params = { pacienteId: 'id-falso-o-invalido' };

        await imageController.getImagesByPaciente(req as Request, res as Response);

        expect(mockImageDAO.findByPacienteId).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'El ID de paciente no es válido' });
    });

    it('debería retornar un status 500 si ocurre un fallo inesperado en el DAO o base de datos', async () => {
        mockImageDAO.findByPacienteId.mockRejectedValue(new Error('Fallo de conexión a DB'));

        await imageController.getImagesByPaciente(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Error al obtener las imágenes del paciente' })
        );
    });
});