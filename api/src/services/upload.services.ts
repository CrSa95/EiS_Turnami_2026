import ImageModel, { IImage } from "../model/image.model.js";

// Definimos un tipo local para el archivo de multer que evita problemas de namespaces
export interface IMulterFile {
    filename: string;
    mimetype: string;
    size: number;
}

export default class UploadServices {
    async guardarMetadatosImagen(file: IMulterFile): Promise<IImage> {
        const newImage = new ImageModel({
            filename: file.filename,
            filepath: `/uploads/${file.filename}`,
            mimetype: file.mimetype,
            size: file.size
        });

        return await newImage.save();
    }
}