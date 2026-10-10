import { Resend } from 'resend';
import { readFileSync } from 'node:fs';
import PacienteDAO from '../dao/paciente.dao.js';
import MedicoDAO from '../dao/medico.dao.js';
import { IImage } from '../model/image.model.js';

export class NotificationDeliveryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotificationDeliveryError';
    }
}

interface OrderRejectionNotification {
    idImagen: string;
    nombrePaciente: string;
    nombreMedico: string;
    motivo: string;
}

export interface BrandedEmail {
    subject: string;
    text: string;
    content: string;
}

const LOGO_CONTENT_ID = 'turnami-logo';
const LOGO_CONTENT = readFileSync(new URL('../../assets/Logo_Turnami.png', import.meta.url));

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character] as string);
}

export default class EmailService {
    private pacienteDAO: PacienteDAO;
    private medicoDAO: MedicoDAO;

    constructor(pacienteDAO?: PacienteDAO, medicoDAO?: MedicoDAO) {
        this.pacienteDAO = pacienteDAO || new PacienteDAO();
        this.medicoDAO = medicoDAO || new MedicoDAO();
    }

    public async sendTranscribedRecipeAccept(receta: IImage){
        const paciente = await this.pacienteDAO.findByDNI(receta.pacienteDni);
        const nombrePaciente = paciente?.nombre || 'Paciente';
        const safePaciente = escapeHtml(nombrePaciente);
        return await this.sendBrandedEmail({
            subject: "Receta Transcripta",
            text: [
                `Estimado/a ${nombrePaciente}`,
                "Le informamos que su receta del medicamento fue transcripta con éxito.",
                "Puede acercarse a su farmacia más cercana para comprar su medicamento con cobertura de PAMI",
                "Saludos cordiales,",
                "Equipo de Turnami"
            ].join('\n\n'),
            content: `
                <p style="margin:0 0 18px;font-size:16px;color:#14264b;">Estimado/a <strong>${safePaciente}</strong>:</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#334155;">Le informamos que su receta del medicamento fue transcripta con éxito.</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#334155;">Puede acercarse a su farmacia más cercana para comprar su medicamento con cobertura de PAMI.</p>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">Saludos cordiales,<br><strong style="color:#14264b;">Equipo de Turnami.</strong></p>`
        })
    }

    public async getOrderRejectionNames(pacienteDni: string): Promise<{
        nombrePaciente: string;
        nombreMedico: string;
    }> {
        const paciente = await this.pacienteDAO.findByDNI(pacienteDni);
        const nombrePaciente = [paciente?.nombre, paciente?.apellido]
            .filter(Boolean)
            .join(' ') || 'Paciente';
        const medico = paciente?.medicoDni
            ? await this.medicoDAO.findByDNI(paciente.medicoDni)
            : null;
        const nombreMedico = [medico?.nombre, medico?.apellido]
            .filter(Boolean)
            .join(' ') || 'profesional tratante';

        return { nombrePaciente, nombreMedico };
    }

    public async sendOrderRejectedNotification({
        idImagen,
        nombrePaciente,
        nombreMedico,
        motivo
    }: OrderRejectionNotification): Promise<void> {
        const safePaciente = escapeHtml(nombrePaciente);
        const safeMedico = escapeHtml(nombreMedico);
        const safeMotivo = escapeHtml(motivo);

        await this.sendBrandedEmail({
            subject: 'Orden Rechazada',
            text: [
                `Estimado/a ${nombrePaciente}:`,
                `Le informamos que su orden médica ha sido rechazada por el profesional ${nombreMedico}.`,
                `Motivo del rechazo: ${motivo}.`,
                'Por favor, ingrese a la aplicación para solucionar el inconveniente y volver a cargar su orden.',
                'Saludos cordiales,',
                'Equipo de Turnami.'
            ].join('\n\n'),
            content: `
                <p style="margin:0 0 18px;font-size:16px;color:#14264b;">Estimado/a <strong>${safePaciente}</strong>:</p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#334155;">Le informamos que su orden médica ha sido rechazada por el profesional <strong>${safeMedico}</strong>.</p>
                <div style="margin:22px 0;padding:16px 18px;border-left:4px solid #3153a2;border-radius:8px;background:#eff5ff;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#3153a2;">Motivo del rechazo</p>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#263449;white-space:pre-wrap;">${safeMotivo}</p>
                </div>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#334155;">Por favor, ingrese a la aplicación para solucionar el inconveniente y volver a cargar su orden.</p>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">Saludos cordiales,<br><strong style="color:#14264b;">Equipo de Turnami.</strong></p>
                <p style="margin:22px 0 0;font-size:12px;color:#64748b;">Referencia de orden: ${escapeHtml(idImagen)}</p>`
        });
    }

    public async sendBrandedEmail({ subject, text, content }: BrandedEmail): Promise<void> {
        const apiKey = process.env.RESEND_API_KEY;
        const from = process.env.RESEND_FROM_EMAIL;
        const to = process.env.NOTIFICATION_RECIPIENT_EMAIL;

        if (!apiKey || !from || !to) {
            throw new NotificationDeliveryError(
                'El servicio de notificaciones no está configurado.'
            );
        }

        try {
            const resend = new Resend(apiKey);
            const { error } = await resend.emails.send({
                from,
                to,
                subject,
                text,
                html: `
                    <div style="margin:0;padding:36px 16px;background:#edf3fb;font-family:Arial,Helvetica,sans-serif;">
                        <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Notificación de Turnami</div>
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;border-collapse:separate;border-spacing:0;">
                            <tr>
                                <td align="center" style="padding:22px 24px;background:#ffffff;border-radius:16px 16px 0 0;border-bottom:4px solid #3153a2;">
                                    <img src="cid:${LOGO_CONTENT_ID}" width="190" alt="Turnami" style="display:block;width:190px;max-width:100%;height:auto;border:0;">
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:32px 36px 36px;background:#ffffff;">${content}</td>
                            </tr>
                            <tr>
                                <td align="center" style="padding:20px 24px;background:#10264f;border-radius:0 0 16px 16px;color:#dbe7fb;font-size:12px;line-height:1.6;">
                                    Turnami · Gestión de salud más simple
                                </td>
                            </tr>
                        </table>
                    </div>`,
                attachments: [{
                    filename: 'Logo_Turnami.png',
                    content: LOGO_CONTENT,
                    contentType: 'image/png',
                    contentId: LOGO_CONTENT_ID
                }]
            });

            if (error) {
                console.error('Resend no pudo enviar la notificación de rechazo:', error);
                throw new NotificationDeliveryError(
                    'No se pudo enviar el correo de notificación. La orden continúa pendiente.'
                );
            }
        } catch (error) {
            if (error instanceof NotificationDeliveryError) {
                throw error;
            }
            console.error('Falló la conexión con Resend:', error);
            throw new NotificationDeliveryError(
                'No se pudo enviar el correo de notificación. La orden continúa pendiente.'
            );
        }
    }
}
