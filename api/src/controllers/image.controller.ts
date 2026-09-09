import { Request, Response } from 'express';
import ImageDAO from '../dao/image.dao.js';

export default class ImageController {
    private imageDAO: ImageDAO;

    constructor(imageDAO: ImageDAO) {
        this.imageDAO = imageDAO;
    }

    public uploadImage = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No se envió ninguna imagen' });
                return;
            }

            const savedImage = await this.imageDAO.create({
                filename: req.file.filename,
                filepath: `/uploads/${req.file.filename}`,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            res.status(201).json({
                message: 'Imagen subida exitosamente',
                image: savedImage
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al subir la imagen', error });
        }
    };
}