import ImageDAO from '../dao/image.dao.js';
import EmailService from './email.service.js';

export default class ImageService {
    private imageDAO: ImageDAO;
    private emailService: EmailService;

    constructor(imageDAO?: ImageDAO, emailService?: EmailService) {
        this.imageDAO = imageDAO || new ImageDAO();
        this.emailService = emailService || new EmailService();
    }

    public async transcribeImage(idImagen: string) {
        const updatedImage = await this.imageDAO.updateStatus(idImagen, 'Transcripta');
        if(updatedImage === null){
            throw new Error("No existe la receta a transcribir")
        }

        if(updatedImage.tipo === "Orden"){
            await this.emailService.sendTranscribedOrder(updatedImage)
            return updatedImage;
        }

        if(updatedImage.tipo === "Receta"){
            await this.emailService.sendTranscribedRecipeAccept(updatedImage)
            return updatedImage;
        }

        
        return updatedImage;
    }

    public async rejectImage(idImagen: string, motivo: string) {
        const image = await this.imageDAO.findByIdImagen(idImagen);
        if (!image) return null;

        if (image.tipo !== 'Orden') {
            return await this.imageDAO.updateStatus(idImagen, 'Rechazada');
        }

        const rejectedImage = await this.imageDAO.rejectPending(idImagen);
        if (!rejectedImage) return null;

        try {
            const { nombrePaciente, nombreMedico } =
                await this.emailService.getOrderRejectionNames(image.pacienteDni);
            await this.emailService.sendOrderRejectedNotification({
                idImagen,
                nombrePaciente,
                nombreMedico,
                motivo
            });
        } catch (error) {
            try {
                const restoredImage = await this.imageDAO.restorePending(idImagen);
                if (!restoredImage) {
                    throw new Error('La orden ya no pudo restaurarse al estado pendiente.');
                }
            } catch (rollbackError) {
                console.error('No se pudo restaurar el estado pendiente tras fallar la notificación:', rollbackError);
                throw new Error(
                    'Falló el envío de la notificación y no se pudo restaurar el estado de la orden.',
                    { cause: rollbackError }
                );
            }

            throw error;
        }

        return rejectedImage;
    }
}