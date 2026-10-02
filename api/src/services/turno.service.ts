import TurnoDAO from '../dao/turno.dao.js';
import { EstadoTurno } from '../model/turno.model.js';
import Paciente from '../model/paciente.model.js';
import Medico from '../model/medico.model.js';

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
    medicoDni?: string;
    motivo?: string;
    descripcion?: string;
    fechaPreferencia: string;
    horaPreferencia: string;
  }) {
    let medicoDniFinal = datos.medicoDni;
    let medicoN;
    let medicoP;
    let medicoNombre;

    if (!medicoDniFinal || medicoDniFinal.trim() === "") {
      const paciente = await Paciente.findOne({ dni: datos.pacienteDni });
      const medico = await Medico.findOne({ dni: paciente?.medicoDni });

      if (!paciente || !paciente.medicoDni) {
        throw new Error("No se pudo determinar el médico asignado al paciente.");
      }

      medicoDniFinal = paciente.medicoDni;
      medicoN = medico ? medico.nombre : "";
      medicoP = medico ? medico.apellido : "";
      medicoNombre = medicoN && medicoP ? `${medicoN} ${medicoP}` : "";
    }

    const fecha = new Date(datos.fechaPreferencia);
    const semanaAnio = this.getSemanaAnio(fecha);

    const turnoExistente = await this.turnoDAO.buscarTurnoActivoSemana(datos.pacienteDni, semanaAnio);
    if (turnoExistente) {
      throw new Error("Ya posee una solicitud o turno registrado para esta semana.");
    }

    const motivoFinal = datos.motivo && datos.motivo.trim() !== "" 
      ? datos.motivo 
      : "Revisión clínica semanal";

    const nuevoTurno = await this.turnoDAO.crearTurno({
      pacienteDni: datos.pacienteDni,
      medicoDni: medicoDniFinal,
      medicoNombre: medicoNombre,
      motivo: motivoFinal,
      descripcion: datos.descripcion || "",
      fechaPreferencia: fecha,
      horaPreferencia: datos.horaPreferencia,
      estado: EstadoTurno.PENDIENTE,
      semanaAnio
    });

    return {
      mensaje: `Se solicito un turno con el médico por el motivo ${motivoFinal}, espere respuesta`,
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

  async cancelarTurno(turnoId: string, pacienteDni: string) {
    const turno = await this.turnoDAO.obtenerTurnoPorId(turnoId);

    if (!turno) {
      throw new Error("El turno solicitado no existe.");
    }

    if (turno.pacienteDni !== pacienteDni) {
      throw new Error("No tiene permisos para cancelar este turno.");
    }

    if (turno.estado === EstadoTurno.CANCELADO || turno.estado === EstadoTurno.RECHAZADO) {
      throw new Error("El turno ya se encuentra inactivo.");
    }

    const fechaTurnoStr = turno.fechaPreferencia.toISOString().split("T")[0]; // YYYY-MM-DD
    const fechaHoraTurno = new Date(`${fechaTurnoStr}T${turno.horaPreferencia}:00`);
    const ahora = new Date();

    const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    if (diferenciaHoras < 24) {
      throw new Error(
        "El turno no puede ser cancelado por este medio debido a la proximidad de la fecha. Por favor, comuníquese con el consultorio."
      );
    }

    const turnoCancelado = await this.turnoDAO.cancelarTurno(turnoId);

    return {
      mensaje: "El turno ha sido cancelado exitosamente.",
      turno: turnoCancelado,
    };
  }
}

export default TurnoService;