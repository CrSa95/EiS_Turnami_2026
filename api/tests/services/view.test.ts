import { jest, describe, it, beforeEach, expect } from "@jest/globals";
import { Request, Response } from 'express';
import ImageController from '../../src/controllers/image.controller.js';
import ImageDAO from '../../src/dao/image.dao.js';
import PacienteDAO from '../../src/dao/paciente.dao.js';

describe('ImageController', () => {
    let imageController: ImageController;
    let mockImageDAO: any;
    let mockPacienteDAO: any;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mocks de los DAOs
        mockImageDAO = {
            create: jest.fn(),
            findByPacienteDni: jest.fn(),
            findPendingByPacientesDni: jest.fn(),
        };

        mockPacienteDAO = {
            findByDNI: jest.fn(),
            findByMedicoDni: jest.fn(),
        };

        // Inyección de dependencias en el controlador
        imageController = new ImageController(
            mockImageDAO as unknown as ImageDAO,
            mockPacienteDAO as unknown as PacienteDAO
        );

        res = {
            status: jest.fn().mockReturnThis() as any,
            json: jest.fn().mockReturnThis() as any
        };
    });

    describe('uploadImage', () => {
        it('debería subir una imagen con éxito y retornar status 201', async () => {
            req = {
                file: {
                    filename: 'receta-123.jpg',
                    mimetype: 'image/jpeg',
                    size: 2048,
                } as Express.Multer.File,
                user: { dni: '33445566' } // DNI del paciente logueado
            } as any;

            const mockSavedImage = {
                idReceta: 'R1001',
                filename: 'receta-123.jpg',
                filepath: '/uploads/receta-123.jpg',
                mimetype: 'image/jpeg',
                size: 2048,
                pacienteDni: '33445566',
                estado: 'Pendiente'
            };

            mockImageDAO.create.mockResolvedValue(mockSavedImage);

            await imageController.uploadImage(req as Request, res as Response);

            expect(mockImageDAO.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    filename: 'receta-123.jpg',
                    pacienteDni: '33445566',
                    estado: 'Pendiente'
                })
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Imagen subida exitosamente',
                image: mockSavedImage
            });
        });

        it('debería retornar status 400 si no se adjuntó ningún archivo', async () => {
            req = { file: undefined, user: { dni: '33445566' } } as any;

            await imageController.uploadImage(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'No se envió ninguna imagen' });
        });

        it('debería retornar status 400 si no se proporcionó el DNI del paciente', async () => {
            req = {
                file: { filename: 'test.jpg' } as any,
                body: {},
                user: undefined
            } as any;

            await imageController.uploadImage(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'No se proporcionó el DNI del paciente' });
        });

        it('debería retornar status 500 si ocurre un error inesperado al guardar', async () => {
            req = {
                file: { filename: 'test.jpg' } as any,
                user: { dni: '33445566' }
            } as any;

            mockImageDAO.create.mockRejectedValue(new Error('Fallo de base de datos'));

            await imageController.uploadImage(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Error al subir la imagen' })
            );
        });
    });

    describe('getPendingImagesForMedico', () => {
        it('debería retornar status 200 y la lista mapeada para la tabla del mockup', async () => {
            req = {
                user: { dni: '11223344' } // DNI del médico logueado
            } as any;

            const mockPacientes = [
                { dni: '22334455', nombre: 'Maria', apellido: 'Gonzalez', medicoDni: '11223344' }
            ];

            const mockImages = [
                {
                    idReceta: 'R1001',
                    filename: 'foto1.jpg',
                    filepath: '/uploads/foto1.jpg',
                    pacienteDni: '22334455',
                    estado: 'Pendiente',
                    createdAt: new Date('2026-08-10T10:00:00Z')
                }
            ];

            mockPacienteDAO.findByMedicoDni.mockResolvedValue(mockPacientes);
            mockImageDAO.findPendingByPacientesDni.mockResolvedValue(mockImages);

            await imageController.getPendingImagesForMedico(req as Request, res as Response);

            expect(mockPacienteDAO.findByMedicoDni).toHaveBeenCalledWith('11223344');
            expect(mockImageDAO.findPendingByPacientesDni).toHaveBeenCalledWith(['22334455']);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([
                expect.objectContaining({
                    idReceta: 'R1001',
                    paciente: 'Maria Gonzalez',
                    dniPaciente: '22334455',
                    estado: 'Pendiente'
                })
            ]);
        });

        it('debería retornar status 400 si el DNI del médico no está en la sesión', async () => {
            req = { user: {} } as any;

            await imageController.getPendingImagesForMedico(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'DNI del médico no presente en la sesión' });
        });

        it('debería retornar status 500 si falla la consulta en la base de datos', async () => {
            req = { user: { dni: '11223344' } } as any;
            mockPacienteDAO.findByMedicoDni.mockRejectedValue(new Error('Fallo de conexión'));

            await imageController.getPendingImagesForMedico(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Error al obtener recetas pendientes' })
            );
        });
    });

    describe('getImagesByPaciente', () => {
        it('debería retornar status 200 y las imágenes del paciente buscando por DNI', async () => {
            req = { params: { pacienteDni: '22334455' } } as any;
            const mockImages = [
                { idReceta: 'R1001', filename: 'test1.jpg', filepath: '/uploads/test1.jpg', pacienteDni: '22334455' }
            ];

            mockImageDAO.findByPacienteDni.mockResolvedValue(mockImages);

            await imageController.getImagesByPaciente(req as Request, res as Response);

            expect(mockImageDAO.findByPacienteDni).toHaveBeenCalledWith('22334455');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockImages);
        });

        it('debería retornar status 400 si no se ingresa el DNI del paciente', async () => {
            req = { params: {} } as any;

            await imageController.getImagesByPaciente(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'El DNI de paciente no es válido' });
        });
    });
});