import dotenv from 'dotenv';
import mongoose from 'mongoose';
import TurnoModel, { EstadoTurno } from '../model/turno.model.js';

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://root:secretpassword@127.0.0.1:27017/turnami_db?authSource=admin';

// Misma lógica que turno.service.ts (semana ISO calculada en UTC)
function getSemanaAnio(fecha: Date): string {
  const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${weekNo}`;
}

const base = {
  pacienteDni: '00000000',
  medicoDni: '11223344',
  medicoNombre: 'Juan Perez',
};

const turnosBase = [
  {
    ...base,
    motivo: 'Control semanal',
    descripcion: 'Chequeo general',
    fechaPreferencia: new Date('2026-10-05T00:00:00Z'),
    horaPreferencia: '09:00',
    estado: EstadoTurno.PENDIENTE,
  },
  {
    ...base,
    motivo: 'Consulta por dolor',
    descripcion: 'Dolor abdominal',
    fechaPreferencia: new Date('2026-11-02T00:00:00Z'),
    horaPreferencia: '11:00',
    estado: EstadoTurno.CONFIRMADO,
  },
  // Estos dos se cargan igual, pero el front no los muestra
  {
    ...base,
    motivo: 'Revisión post tratamiento',
    descripcion: 'Seguimiento de medicación',
    fechaPreferencia: new Date('2026-10-05T00:00:00Z'),
    horaPreferencia: '15:30',
    estado: EstadoTurno.RECHAZADO,
  },
  {
    ...base,
    motivo: 'Chequeo anual',
    descripcion: 'Exámenes de rutina',
    fechaPreferencia: new Date('2026-10-05T00:00:00Z'),
    horaPreferencia: '10:00',
    estado: EstadoTurno.CANCELADO,
  },
].map((t) => ({ ...t, semanaAnio: getSemanaAnio(t.fechaPreferencia) }));

async function runSeed() {
  const isCleanOnly = process.argv.includes('--clean-only');
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Conectado a MongoDB para seed de Turnos');

    if (isCleanOnly) {
      await TurnoModel.deleteMany({});
      console.log('🧹 Todos los turnos han sido eliminados de la base de datos.');
      return;
    }

    for (const turno of turnosBase) {
      await TurnoModel.updateOne(
        {
          pacienteDni: turno.pacienteDni,
          fechaPreferencia: turno.fechaPreferencia,
          horaPreferencia: turno.horaPreferencia,
        },
        { $set: turno },
        { upsert: true }
      );
      console.log(
        ` Turno procesado: Paciente ${turno.pacienteDni} | Estado: ${turno.estado} | ${turno.fechaPreferencia.toISOString().split('T')[0]} ${turno.horaPreferencia} | Semana ${turno.semanaAnio}`
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