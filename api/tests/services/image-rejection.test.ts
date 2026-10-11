import { describe, expect, it, jest } from '@jest/globals';
import ImageDAO from '../../src/dao/image.dao.js';
import EmailService from '../../src/services/email.service.js';
import ImageService from '../../src/services/image.service.js';
import { IImage } from '../../src/model/image.model.js';

describe.each([
    { tipo: 'Orden', idImagen: 'O-TEST-123' },
    { tipo: 'Receta', idImagen: 'R-TEST-123' }
] as const)('ImageService.rejectImage ($tipo)', ({ tipo, idImagen }) => {
    const image = {
        idImagen,
        tipo,
        pacienteDni: '12345678'
    } as IImage;

    it('sends the notification after marking the document rejected', async () => {
        const dao = new ImageDAO();
        const emailService = new EmailService();
        const findImage = jest.spyOn(dao, 'findByIdImagen').mockResolvedValue(image);
        const rejectPending = jest.spyOn(dao, 'rejectPending').mockResolvedValue(image);
        const getNames = jest.spyOn(emailService, 'getPatientAndDoctorNames').mockResolvedValue({
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez'
        });
        const sendNotification = jest
            .spyOn(emailService, 'sendRejectionNotification')
            .mockResolvedValue(undefined);
        const service = new ImageService(dao, emailService);

        await service.rejectImage(image.idImagen, 'Motivo de prueba');

        expect(rejectPending).toHaveBeenCalledWith(image.idImagen);
        expect(sendNotification).toHaveBeenCalledWith({
            idImagen: image.idImagen,
            tipo,
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez',
            motivo: 'Motivo de prueba'
        });
        expect(rejectPending.mock.invocationCallOrder[0]).toBeLessThan(
            sendNotification.mock.invocationCallOrder[0]
        );
        expect(findImage).toHaveBeenCalledWith(image.idImagen);
        expect(getNames).toHaveBeenCalledWith(image.pacienteDni);
    });

    it('restores the document to pending when the email fails', async () => {
        const dao = new ImageDAO();
        const emailService = new EmailService();
        jest.spyOn(dao, 'findByIdImagen').mockResolvedValue(image);
        jest.spyOn(dao, 'rejectPending').mockResolvedValue(image);
        const restorePending = jest.spyOn(dao, 'restorePending').mockResolvedValue(image);
        jest.spyOn(emailService, 'getPatientAndDoctorNames').mockResolvedValue({
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez'
        });
        jest.spyOn(emailService, 'sendRejectionNotification').mockRejectedValue(
            new Error('Resend unavailable')
        );
        const service = new ImageService(dao, emailService);

        await expect(service.rejectImage(image.idImagen, 'Motivo de prueba')).rejects.toThrow(
            'Resend unavailable'
        );
        expect(restorePending).toHaveBeenCalledWith(image.idImagen);
    });

    it('uses the correct rejection email content for each document type', async () => {
        const emailService = new EmailService();
        const sendBrandedEmail = jest
            .spyOn(emailService, 'sendBrandedEmail')
            .mockResolvedValue(undefined);

        await emailService.sendRejectionNotification({
            idImagen: image.idImagen,
            tipo,
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez',
            motivo: 'Motivo de prueba'
        });

        const expectedSubject = tipo === 'Orden' ? 'Orden Rechazada' : 'Receta Rechazada';
        const expectedCopy = tipo === 'Orden'
            ? 'su orden médica ha sido rechazada'
            : 'su receta del medicamento ha sido rechazada';
        expect(sendBrandedEmail).toHaveBeenCalledWith(expect.objectContaining({
            subject: expectedSubject,
            text: expect.stringContaining(expectedCopy)
        }));
    });
});
