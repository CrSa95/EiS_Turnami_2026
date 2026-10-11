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
        try{
            if(updatedImage.tipo === "Orden"){
                await this.emailService.sendTranscribedOrder(updatedImage)
                return updatedImage;
            }

            if(updatedImage.tipo === "Receta"){
                await this.emailService.sendTranscribedRecipeAccept(updatedImage)
                return updatedImage;
            }

        }catch(error ){
            const updatedImage = await this.imageDAO.updateStatus(idImagen, 'Pendiente');
            if (!updatedImage) {
                throw new Error('La orden ya no pudo restaurarse al estado pendiente.');
            }

            throw error;
        }

        
        return updatedImage;
    }

    public async rejectImage(idImagen: string, motivo: string) {
        const image = await this.imageDAO.findByIdImagen(idImagen);
        if (!image) return null;

        const rejectedImage = await this.imageDAO.rejectPending(idImagen);
        if (!rejectedImage) return null;

        try {
            const { nombrePaciente, nombreMedico } =
                await this.emailService.getPatientAndDoctorNames(image.pacienteDni);
            await this.emailService.sendRejectionNotification({
                idImagen,
                tipo: image.tipo,
                nombrePaciente,
                nombreMedico,
                motivo
            });
        } catch (error) {
            try {
                const restoredImage = await this.imageDAO.restorePending(idImagen);
                if (!restoredImage) {
                    throw new Error('El documento ya no pudo restaurarse al estado pendiente.');
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