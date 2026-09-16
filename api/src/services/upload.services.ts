import ImageModel, { IImage } from "../model/image.model.js";

// Definimos un tipo local para el archivo de multer que evita problemas de namespaces
export interface IMulterFile {
    filename: string;
    mimetype: string;
    size: number;
}

export default class UploadServices {
    async guardarMetadatosImagen(
        file: IMulterFile,
        pacienteDni?: string,
        idReceta?: string
    ): Promise<IImage> {
        const newImage = new ImageModel({
            idReceta: idReceta || `R${Math.floor(1000 + Math.random() * 9000)}`,
            filename: file.filename,
            filepath: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size,
            pacienteDni: pacienteDni || '',
            estado: 'Pendiente'
        });

        return await newImage.save();
    }
}