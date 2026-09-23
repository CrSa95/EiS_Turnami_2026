import { Request, Response } from 'express';
import ImageDAO from '../dao/image.dao.js';
import PacienteDAO from '../dao/paciente.dao.js';
import ImageService from '../services/image.service.js';

export default class ImageController {
    private imageDAO: ImageDAO;
    private pacienteDAO: PacienteDAO;
    private imageService: ImageService;

    constructor(imageDAO: ImageDAO, pacienteDAO: PacienteDAO, imageService: ImageService) {
        this.imageDAO = imageDAO;
        this.pacienteDAO = pacienteDAO;
        this.imageService = imageService;
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
            // Se obtiene el tipo desde el form-data, si no viene por defecto será 'Receta'
            const tipo = req.body.tipo || 'Receta';

            if (!pacienteDni) {
                res.status(400).json({ message: 'No se proporcionó el DNI del paciente' });
                return;
            }

            if (!['Receta', 'Orden'].includes(tipo)) {
                res.status(400).json({ message: 'El tipo de documento debe ser Receta u Orden' });
                return;
            }

            // Generar un ID de Receta u Orden personalizado (ej: R + número aleatorio de 4 dígitos)
            const prefijo = tipo === 'Receta' ? 'R' : 'O';
            const idImagen = `${prefijo}${Math.floor(1000 + Math.random() * 9000)}`;

            const savedImage = await this.imageDAO.create({
                idImagen,
                tipo, // <--- Guardamos el tipo
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
            //Lee el tipo desde la URL (ej: ?tipo=Orden). Si no viene nada, por defecto buscamos 'Receta'
            const tipoImagen = (req.query.tipo as 'Receta' | 'Orden') || 'Receta';

            if (!['Receta', 'Orden'].includes(tipoImagen)) {
                res.status(400).json({ message: 'Tipo de imagen no válido' });
                return;
            }

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
            const images = await this.imageDAO.findPendingByPacientesDni(pacienteDnis, tipoImagen);

            // 3. Mapear datos en la estructura requerida por el Front (Mockup)
            const responseData = images.map(img => ({
                idReceta: img.idImagen,
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
            // Se captura el estado y el tipo desde los query params de la URL
            const estado = req.query.estado as string;
            const tipo = req.query.tipo as string;

            if (!pacienteDni) {
                res.status(400).json({ message: 'El DNI de paciente no es válido' });
                return;
            }

            const images = await this.imageDAO.findByPacienteDni(pacienteDni, estado, tipo);
            res.status(200).json(images);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las imágenes del paciente', error });
        }
    };

    // PATCH /api/images/:idReceta/transcribir
    public transcribeRecipe = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idImagen } = req.params;

            if (!idImagen || typeof idImagen !== 'string' || !idImagen.trim()) {
                res.status(400).json({ message: 'El ID de la receta es requerido' });
                return;
            }

            const updatedImage = await this.imageService.transcribeRecipe(idImagen);

            if (!updatedImage) {
                res.status(404).json({ message: 'No se encontró la receta solicitada' });
                return;
            }

            res.status(200).json({
                message: 'La receta ha sido marcada como transcripta correctamente',
                image: updatedImage
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al marcar la receta como transcripta',
                error
            });
        }
    };
  
    // PATCH /api/v1/medico/images/:idReceta/rechazar
    public rejectRecipe = async (req: Request, res: Response): Promise<void> => {
        try {
            const { idReceta } = req.params;

            if (!idReceta || typeof idReceta !== 'string' || !idReceta.trim()) {
                res.status(400).json({ message: 'El ID de la receta es requerido' });
                return;
            }

           const updatedImage = await this.imageService.rejectRecipe(idReceta.trim());

            if (!updatedImage) {
                res.status(404).json({ message: 'No se encontró la receta solicitada' });
                return;
            }

            res.status(200).json({
                message: 'La receta ha sido rechazada correctamente',
                image: updatedImage
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error al rechazar la receta',
                error
            });
        }
    };

}