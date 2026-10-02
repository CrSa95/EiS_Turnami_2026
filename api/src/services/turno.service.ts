import TurnoDAO from '../dao/turno.dao.js';
import { EstadoTurno } from '../model/turno.model.js';
import Paciente from '../model/paciente.model.js';
import Medico from '../model/medico.model.js';

export class TurnoService {
  private turnoDAO: TurnoDAO;

  constructor(turnoDAO: TurnoDAO) {
    this.turnoDAO = turnoDAO;
  }

  
  // Las fechas de turno se guardan como medianoche UTC del día elegido, por
  // lo que la semana ISO se calcula en UTC para no depender de la zona
  // horaria del servidor.
  private getSemanaAnio(fecha: Date): string {
    const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${weekNo}`;
  }

  // Momento exacto del turno: día guardado + hora de preferencia, expresada
  // en la zona horaria del consultorio (Argentina por defecto).
  private getFechaHoraTurno(turno: { fechaPreferencia: Date; horaPreferencia: string }): Date {
    const dia = new Date(turno.fechaPreferencia).toISOString().split("T")[0];
    const hora = turno.horaPreferencia.trim().padStart(5, "0");
    return new Date(`${dia}T${hora}:00${process.env.TURNOS_TZ_OFFSET ?? "-03:00"}`);
  }

  async obtenerMedicoAsignado(pacienteDni: string) {
    const paciente = await Paciente.findOne({ dni: pacienteDni });
    if (!paciente || !paciente.medicoDni) {
      throw new Error("No se pudo determinar el médico asignado al paciente.");
    }

    const medico = await Medico.findOne({ dni: paciente.medicoDni });
    const medicoNombre = medico ? `${medico.nombre} ${medico.apellido}`.trim() : "";

    return { medicoDni: paciente.medicoDni, medicoNombre };
  }

  async solicitarTurno(datos: {
    pacienteDni: string;
    medicoDni?: string;
    motivo?: string;
    descripcion?: string;
    fechaPreferencia: string;
    horaPreferencia: string;
  }) {
    let medicoDniFinal = datos.medicoDni?.trim();
    let medicoNombre = "";

    if (!medicoDniFinal) {
      const asignado = await this.obtenerMedicoAsignado(datos.pacienteDni);
      medicoDniFinal = asignado.medicoDni;
      medicoNombre = asignado.medicoNombre;
    } else {
      const medico = await Medico.findOne({ dni: medicoDniFinal });
      medicoNombre = medico ? `${medico.nombre} ${medico.apellido}`.trim() : "";
    }

    const fecha = new Date(datos.fechaPreferencia);
    const semanaAnio = this.getSemanaAnio(fecha);

    const turnosExistentes = await this.turnoDAO.buscarTurnosPorEstado(
      datos.pacienteDni,
      semanaAnio,
      [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO]
    );

    const turnoExistente = turnosExistentes[0];

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
    const turnos = await this.turnoDAO.buscarTurnosPorEstado(
      pacienteDni,
      semanaAnio,
      [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO]
    );

    const turnoActivo = turnos[0] || null;

    return {
      tieneTurnoActivo: !!turnoActivo,
      estado: turnoActivo ? turnoActivo.estado : null,
      turno: turnoActivo,
    };
  }


  async obtenerProximosTurnos(pacienteDni: string) {
    const ahora = new Date();
    const turnos = await this.turnoDAO.buscarTurnosPorEstado(
      pacienteDni,
      undefined,
      [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO]
    );

    // Se compara día + hora: un turno de hoy más tarde sigue siendo próximo.
    return turnos.filter(t => this.getFechaHoraTurno(t) > ahora);
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

    const fechaHoraTurno = this.getFechaHoraTurno(turno);
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