import mongoose, { Schema, Document, Types } from 'mongoose';

export enum EstadoTurno {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  RECHAZADO = 'RECHAZADO',
}

export interface ITurno extends Document {
  pacienteDni: string;
  medicoDni: string;
  medicoNombre: string;
  motivo: string;
  descripcion?: string;
  fechaPreferencia: Date;
  horaPreferencia: string;
  estado: EstadoTurno;
  semanaAnio: string;
}

export interface ITurnoConPaciente extends Omit<ITurno, keyof Document> {
  _id: Types.ObjectId | string;
  pacienteNombre?: string;
  pacienteApellido?: string;
}

const TurnoSchema: Schema = new Schema(
  {
    pacienteDni: { type: String, required: true, index: true },
    medicoDni: { type: String, required: true, index: true },
    medicoNombre: { type: String },
    motivo: { type: String, required: true, default: 'Revisión clínica semanal' },
    descripcion: { type: String, default: '' },
    fechaPreferencia: { type: Date, required: true },
    horaPreferencia: { type: String, required: true },
    estado: {
      type: String,
      enum: Object.values(EstadoTurno),
      default: EstadoTurno.PENDIENTE,
    },
    semanaAnio: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const TurnoModel = mongoose.model<ITurno>('Turno', TurnoSchema);
export default TurnoModel;