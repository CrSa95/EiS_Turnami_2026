import { Request, Response } from 'express';
import ImageDAO from '../dao/image.dao.js';


export default class ImageController {
    private imageDAO: ImageDAO;

    constructor(imageDAO: ImageDAO) {
        this.imageDAO = imageDAO;
    }
    // Subir imagen (Acción del Paciente logueado)
    public uploadImage = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No se envió ninguna imagen' });
                return;
            }

            const pacienteId = (req as any).user?.id || req.body.pacienteId;

            const savedImage = await this.imageDAO.create({
                filename: req.file.filename,
                filepath: `/uploads/${req.file.filename}`,
                mimetype: req.file.mimetype,
                size: req.file.size,
                pacienteId: pacienteId
            });

            res.status(201).json({
                message: 'Imagen subida exitosamente',
                image: savedImage
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al subir la imagen', error });
        }
    };

    // Ver imágenes de un paciente específico (Acción del Médico)
    public getImagesByPaciente = async (req: Request, res: Response): Promise<void> => {
        try {
            const pacienteId = req.params.pacienteId as string;
            const images = await this.imageDAO.findByPacienteId(pacienteId);

            res.status(200).json(images);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las imágenes del paciente', error });
        }
    };
}