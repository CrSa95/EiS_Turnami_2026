import ImageModel, { IImage } from "../model/image.model.js";

export default class ImageDAO {
    async create(imageData: Partial<IImage>): Promise<IImage> {
        const newImage = new ImageModel(imageData);
        return await newImage.save();
    }
}