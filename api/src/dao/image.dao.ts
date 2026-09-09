import ImageModel, { IImage } from "../model/image.model.js";

export default class ImageDAO {
    async create(imageData: Partial<IImage>): Promise<IImage> {
        const newImage = new ImageModel(imageData);
        return await newImage.save();
    }

    // Buscar todas las imágenes que pertenecen a un paciente en particular
    async findByPacienteId(pacienteId: string): Promise<IImage[]> {
        return await ImageModel.find({ pacienteId }).sort({ _id: -1 });
    }
}