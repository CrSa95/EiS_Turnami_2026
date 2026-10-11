import { describe, expect, it, jest } from '@jest/globals';
import TurnoDAO from '../../src/dao/turno.dao.js';
import { EstadoTurno, ITurno } from '../../src/model/turno.model.js';
import EmailService from '../../src/services/email.service.js';
import TurnoService from '../../src/services/turno.service.js';

describe('TurnoService.cancelarTurnoDelPaciente', () => {
    const turno = {
        _id: 'turno-123',
        pacienteDni: '12345678',
        medicoDni: '87654321',
        estado: EstadoTurno.CONFIRMADO
    } as ITurno;

    it('cancels the appointment before sending the branded notification', async () => {
        const turnoDAO = new TurnoDAO();
        const emailService = new EmailService();
        jest.spyOn(turnoDAO, 'obtenerTurnoPorId').mockResolvedValue(turno);
        const cancelAppointment = jest
            .spyOn(turnoDAO, 'cancelarTurnoDelPaciente')
            .mockResolvedValue({ ...turno, estado: EstadoTurno.CANCELADO } as ITurno);
        const getNames = jest.spyOn(emailService, 'getPatientAndDoctorNames').mockResolvedValue({
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez'
        });
        const sendNotification = jest
            .spyOn(emailService, 'sendDoctorCancelledAppointmentNotification')
            .mockResolvedValue(undefined);
        const service = new TurnoService(turnoDAO, emailService);

        await service.cancelarTurnoDelPaciente(turno.medicoDni, turno._id as string);

        expect(cancelAppointment).toHaveBeenCalledWith(turno.medicoDni, turno._id);
        expect(getNames).toHaveBeenCalledWith(turno.pacienteDni);
        expect(sendNotification).toHaveBeenCalledWith('Ana López', 'Juan Pérez');
        expect(cancelAppointment.mock.invocationCallOrder[0]).toBeLessThan(
            sendNotification.mock.invocationCallOrder[0]
        );
    });

    it('restores the previous appointment status when notification delivery fails', async () => {
        const turnoDAO = new TurnoDAO();
        const emailService = new EmailService();
        jest.spyOn(turnoDAO, 'obtenerTurnoPorId').mockResolvedValue(turno);
        jest.spyOn(turnoDAO, 'cancelarTurnoDelPaciente').mockResolvedValue({
            ...turno,
            estado: EstadoTurno.CANCELADO
        } as ITurno);
        jest.spyOn(emailService, 'getPatientAndDoctorNames').mockResolvedValue({
            nombrePaciente: 'Ana López',
            nombreMedico: 'Juan Pérez'
        });
        jest.spyOn(emailService, 'sendDoctorCancelledAppointmentNotification')
            .mockRejectedValue(new Error('Resend unavailable'));
        const restoreStatus = jest
            .spyOn(turnoDAO, 'restaurarEstadoTurno')
            .mockResolvedValue(turno);
        const service = new TurnoService(turnoDAO, emailService);

        await expect(
            service.cancelarTurnoDelPaciente(turno.medicoDni, turno._id as string)
        ).rejects.toThrow('No se pudo enviar el correo de notificación.');
        expect(restoreStatus).toHaveBeenCalledWith(turno._id, EstadoTurno.CONFIRMADO);
    });
});

describe('EmailService.sendDoctorCancelledAppointmentNotification', () => {
    it('uses the requested subject and message with the Turnami email template', async () => {
        const emailService = new EmailService();
        const sendBrandedEmail = jest
            .spyOn(emailService, 'sendBrandedEmail')
            .mockResolvedValue(undefined);

        await emailService.sendDoctorCancelledAppointmentNotification('Ana López', 'Juan Pérez');

        expect(sendBrandedEmail).toHaveBeenCalledWith(expect.objectContaining({
            subject: 'Turno Cancelado',
            text: expect.stringContaining(
                'Le informamos que su turno médico ha sido cancelado por el profesional Juan Pérez.'
            ),
            content: expect.stringContaining('volver a solicitar un turno.')
        }));
    });
});
