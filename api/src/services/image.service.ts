import ImageDAO from '../dao/image.dao.js';

export default class ImageService {
    private imageDAO: ImageDAO;

    constructor(imageDAO?: ImageDAO) {
        this.imageDAO = imageDAO || new ImageDAO();
    }

    public async transcribeRecipe(idReceta: string) {
        const updatedImage = await this.imageDAO.updateStatus(idReceta, 'Transcripta');
        return updatedImage;
    }

    public async rejectRecipe(idReceta: string) {
        const updatedImage = await this.imageDAO.updateStatus(idReceta, 'Rechazada');
        return updatedImage;
    }
}