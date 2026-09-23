import ImageDAO from '../dao/image.dao.js';

export default class ImageService {
    private imageDAO: ImageDAO;

    constructor(imageDAO?: ImageDAO) {
        this.imageDAO = imageDAO || new ImageDAO();
    }

    public async transcribeImage(idImagen: string) {
        const updatedImage = await this.imageDAO.updateStatus(idImagen, 'Transcripta');
        return updatedImage;
    }

    public async rejectImage(idImagen: string) {
        const updatedImage = await this.imageDAO.updateStatus(idImagen, 'Rechazada');
        return updatedImage;
    }
}