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

    // Buscar imágenes pendientes para una lista de DNIs de pacientes
    async findPendingByPacientesDni(pacienteDnis: string[]): Promise<IImage[]> {
        return await ImageModel.find({
            pacienteDni: { $in: pacienteDnis },
            estado: 'Pendiente'
        }).sort({ createdAt: -1 });
    }
}