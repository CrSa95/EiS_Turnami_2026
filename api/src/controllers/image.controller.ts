import { Request, Response } from 'express';
import ImageDAO from '../dao/image.dao.js';
import PacienteDAO from '../dao/paciente.dao.js';

export default class ImageController {
    private imageDAO: ImageDAO;
    private pacienteDAO: PacienteDAO;

    constructor(imageDAO: ImageDAO, pacienteDAO: PacienteDAO) {
        this.imageDAO = imageDAO;
        this.pacienteDAO = pacienteDAO;
    }

    // Subir imagen (Acción del Paciente logueado)
    public uploadImage = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No se envió ninguna imagen' });
                return;
            }

            // DNI obtenido desde el token del middleware o el body
            const pacienteDni = (req as any).user?.dni || req.body.pacienteDni;

            if (!pacienteDni) {
                res.status(400).json({ message: 'No se proporcionó el DNI del paciente' });
                return;
            }

            // Generar un ID de Receta personalizado (ej: R + número aleatorio de 4 dígitos)
            const idReceta = `R${Math.floor(1000 + Math.random() * 9000)}`;

            const savedImage = await this.imageDAO.create({
                idReceta,
                filename: req.file.filename,
                filepath: `/uploads/${req.file.filename}`,
                mimetype: req.file.mimetype,
                size: req.file.size,
                pacienteDni: pacienteDni,
                estado: 'Pendiente'
            });

            res.status(201).json({
                message: 'Imagen subida exitosamente',
                image: savedImage
            });
        } catch (error) {
            res.status(500).json({ message: 'Error al subir la imagen', error });
        }
    };

    // Obtener recetas pendientes para el Médico (vínculo por DNI)
    public getPendingImagesForMedico = async (req: Request, res: Response): Promise<void> => {
        try {
            // Obtenemos el DNI del médico logueado desde el token
            const medicoDni = (req as any).user?.dni;

            if (!medicoDni) {
                res.status(400).json({ message: 'DNI del médico no presente en la sesión' });
                return;
            }

            // 1. Obtener la cohorte de pacientes a cargo de este médico
            const pacientes = await this.pacienteDAO.findByMedicoDni(medicoDni);
            const pacienteDnis = pacientes.map(p => p.dni);

            // Mapeo rápido para vincular DNI -> "Nombre Apellido"
            const pacientesMap = new Map<string, string>();
            pacientes.forEach(p => {
                pacientesMap.set(p.dni, `${p.nombre || ''} ${p.apellido || ''}`.trim());
            });

            // 2. Buscar imágenes con estado 'Pendiente' pertenecientes a estos DNIs
            const images = await this.imageDAO.findPendingByPacientesDni(pacienteDnis);

            // 3. Mapear datos en la estructura requerida por el Front (Mockup)
            const responseData = images.map(img => ({
                idReceta: img.idReceta,
                paciente: pacientesMap.get(img.pacienteDni) || 'Paciente no registrado',
                dniPaciente: img.pacienteDni,
                fechaCarga: (img as any).createdAt
                    ? new Date((img as any).createdAt).toLocaleDateString('es-AR')
                    : '',
                estado: img.estado,
                filepath: img.filepath
            }));

            res.status(200).json(responseData);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener recetas pendientes', error });
        }
    };

    // Ver imágenes de un paciente específico por DNI (Método restaurado para el test)
    public getImagesByPaciente = async (req: Request, res: Response): Promise<void> => {
        try {
            const pacienteDni = req.params.pacienteDni || (req as any).user?.dni;
            if (!pacienteDni) {
                res.status(400).json({ message: 'El DNI de paciente no es válido' });
                return;
            }

            const images = await this.imageDAO.findByPacienteDni(pacienteDni);
            res.status(200).json(images);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las imágenes del paciente', error });
        }
    };
}