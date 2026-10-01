import TurnoDAO from '../dao/turno.dao.js';
import { EstadoTurno } from '../model/turno.model.js';

export class TurnoService {
  private turnoDAO: TurnoDAO;

  constructor(turnoDAO: TurnoDAO) {
    this.turnoDAO = turnoDAO;
  }

  private getSemanaAnio(fecha: Date): string {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-${weekNo}`;
  }

  async solicitarTurno(datos: {
    pacienteDni: string;
    medicoDni: string;
    medicoNombre: string;
    motivo?: string;
    descripcion?: string;
    fechaPreferencia: string;
    horaPreferencia: string;
  }) {
    const fecha = new Date(datos.fechaPreferencia);
    const semanaAnio = this.getSemanaAnio(fecha);

    // Regla 1: Validar si el paciente ya tiene turno en la semana
    const turnoExistente = await this.turnoDAO.buscarTurnoActivoSemana(datos.pacienteDni, semanaAnio);
    if (turnoExistente) {
      throw new Error("Ya posee una solicitud o turno registrado para esta semana.");
    }

    // Regla 2: Motivo por defecto
    const motivoFinal = datos.motivo && datos.motivo.trim() !== "" 
      ? datos.motivo 
      : "Revisión clínica semanal";

    const nuevoTurno = await this.turnoDAO.crearTurno({
      pacienteDni: datos.pacienteDni,
      medicoDni: datos.medicoDni,
      medicoNombre: datos.medicoNombre,
      motivo: motivoFinal,
      descripcion: datos.descripcion || "",
      fechaPreferencia: fecha,
      horaPreferencia: datos.horaPreferencia,
      estado: EstadoTurno.PENDIENTE,
      semanaAnio
    });

    return {
      mensaje: `Se solicito un turno con el ${datos.medicoNombre} por el motivo ${motivoFinal}, espere respuesta`,
      turno: nuevoTurno
    };
  }

  async obtenerEstadoTurnoSemanal(pacienteDni: string, fechaActual: Date = new Date()) {
    const semanaAnio = this.getSemanaAnio(fechaActual);
    const turnoActivo = await this.turnoDAO.buscarTurnoActivoSemana(pacienteDni, semanaAnio);

    return {
      tieneTurnoActivo: !!turnoActivo,
      estado: turnoActivo ? turnoActivo.estado : null,
      turno: turnoActivo || null
    };
  }
}
export default TurnoService;