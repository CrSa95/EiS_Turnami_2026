import ImageModel, { IImage } from "../model/image.model.js";

export default class ImageDAO {
    async create(imageData: Partial<IImage>): Promise<IImage> {
        const newImage = new ImageModel(imageData);
        return await newImage.save();
    }

    // Buscar imágenes de un paciente por su DNI
    async findByPacienteDni(pacienteDni: string): Promise<IImage[]> {
        return await ImageModel.find({ pacienteDni }).sort({ createdAt: -1 });
    }

    // Buscar imágenes pendientes para una lista de DNIs de pacientes y el tipo de imagen
    async findPendingByPacientesDni(pacienteDnis: string[], tipoDocumento: 'Receta' | 'Orden'): Promise<IImage[]> {
        return await ImageModel.find({
            pacienteDni: { $in: pacienteDnis },
            estado: 'Pendiente',
            tipo: tipoDocumento // Filtro de recetas u ordenes
        }).sort({ createdAt: -1 });
    }

    async updateStatus(idImagen: string, nuevoEstado: string): Promise<IImage | null> {
        try {
            return await ImageModel.findOneAndUpdate(
                { idImagen },
                { estado: nuevoEstado },
                { new: true }
            );
        } catch (error) {
            throw error;
        }
    }
}