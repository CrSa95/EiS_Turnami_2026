import dotenv from 'dotenv';
import mongoose from 'mongoose';
import TurnoModel, { EstadoTurno } from '../model/turno.model.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://root:secretpassword@127.0.0.1:27017/turnami_db?authSource=admin';

// misma lógica que tu servicio
function getSemanaAnio(fecha: Date): string {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-${41}`;
}

const turnosBase = [
  {
    pacienteDni: '00000000',
    medicoDni: '11223344',
    medicoNombre: 'Juan Perez',
    motivo: 'Control semanal',
    descripcion: 'Chequeo general',
    fechaPreferencia: new Date("2026-10-05T09:00:00Z"), // fecha futura
    horaPreferencia: '09:00',
    estado: EstadoTurno.PENDIENTE,
    semanaAnio: getSemanaAnio(new Date("2026-10-05T09:00:00Z")),
  },
  {
    pacienteDni: '12345678',
    medicoDni: '11223344',
    medicoNombre: 'Juan Perez',
    motivo: 'Consulta por dolor',
    descripcion: 'Dolor abdominal',
    fechaPreferencia: new Date('2026-11-02T11:00:00Z'), // fecha futura
    horaPreferencia: '11:00',
    estado: EstadoTurno.CONFIRMADO,
    semanaAnio: getSemanaAnio(new Date('2026-11-02T11:00:00Z')),
  },
  // estos dos se van a cargar igual, pero el front no los mostrará
  {
    pacienteDni: '87654321',
    medicoDni: '11223344',
    medicoNombre: 'Juan Perez',
    motivo: 'Revisión post tratamiento',
    descripcion: 'Seguimiento de medicación',
    fechaPreferencia: new Date("2026-10-05T15:30:00Z"),
    horaPreferencia: '15:30',
    estado: EstadoTurno.RECHAZADO,
    semanaAnio: getSemanaAnio(new Date("2026-10-05T15:30:00Z")),
  },
  {
    pacienteDni: '00000000',
    medicoDni: '11223344',
    medicoNombre: 'Juan Perez',
    motivo: 'Chequeo anual',
    descripcion: 'Exámenes de rutina',
    fechaPreferencia: new Date("2026-10-05T10:00:00Z"),
    horaPreferencia: '10:00',
    estado: EstadoTurno.CANCELADO,
    semanaAnio: getSemanaAnio(new Date("2026-10-05T10:00:00Z")),
  },
];

async function runSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB para seed de Turnos');

    for (const turno of turnosBase) {
      await TurnoModel.updateOne(
        { pacienteDni: turno.pacienteDni, semanaAnio: turno.semanaAnio },
        { $set: turno },
        { upsert: true }
      );
      console.log(
        ` Turno procesado: Paciente ${turno.pacienteDni} | Estado: ${turno.estado} | Fecha: ${turno.fechaPreferencia.toISOString()}`
      );
    }

    console.log(' Seed de turnos finalizado exitosamente.');
  } catch (error) {
    console.error(' Error al ejecutar el seed de turnos:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runSeed();