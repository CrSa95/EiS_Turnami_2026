import { describe, expect, it, jest } from '@jest/globals';
import ImageDAO from '../../src/dao/image.dao.js';
import EmailService from '../../src/services/email.service.js';
import ImageService from '../../src/services/image.service.js';
import { IImage } from '../../src/model/image.model.js';

describe('ImageService.rejectImage', () => {
    const order = {
        idImagen: 'O-TEST-123',
        tipo: 'Orden',
        pacienteDni: '12345678'
    } as IImage;

    it('sends the notification after marking the order rejected', async () => {
        const dao = new ImageDAO();
        const emailService = new EmailService();
        const findImage = jest.spyOn(dao, 'findByIdImagen').mockResolvedValue(order);
        const rejectPending = jest.spyOn(dao, 'rejectPending').mockResolvedValue(order);
        const getNames = jest.spyOn(emailService, 'getOrderRejectionNames').mockResolvedValue({
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez'
        });
        const sendNotification = jest
            .spyOn(emailService, 'sendOrderRejectedNotification')
            .mockResolvedValue(undefined);
        const service = new ImageService(dao, emailService);

        await service.rejectImage(order.idImagen, 'Motivo de prueba');

        expect(rejectPending).toHaveBeenCalledWith(order.idImagen);
        expect(sendNotification).toHaveBeenCalledWith({
            idImagen: order.idImagen,
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez',
            motivo: 'Motivo de prueba'
        });
        expect(rejectPending.mock.invocationCallOrder[0]).toBeLessThan(
            sendNotification.mock.invocationCallOrder[0]
        );
        expect(findImage).toHaveBeenCalledWith(order.idImagen);
        expect(getNames).toHaveBeenCalledWith(order.pacienteDni);
    });

    it('restores the order to pending when the email fails', async () => {
        const dao = new ImageDAO();
        const emailService = new EmailService();
        jest.spyOn(dao, 'findByIdImagen').mockResolvedValue(order);
        jest.spyOn(dao, 'rejectPending').mockResolvedValue(order);
        const restorePending = jest.spyOn(dao, 'restorePending').mockResolvedValue(order);
        jest.spyOn(emailService, 'getOrderRejectionNames').mockResolvedValue({
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez'
        });
        jest.spyOn(emailService, 'sendOrderRejectedNotification').mockRejectedValue(
            new Error('Resend unavailable')
        );
        const service = new ImageService(dao, emailService);

        await expect(service.rejectImage(order.idImagen, 'Motivo de prueba')).rejects.toThrow(
            'Resend unavailable'
        );
        expect(restorePending).toHaveBeenCalledWith(order.idImagen);
    });
});
