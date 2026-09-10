import mongoose, {Schema, Document, Types} from 'mongoose';

//La informacion que se guarda de la imagen
export interface IImage extends Document {
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  pacienteId: Types.ObjectId; // Relación con el paciente
}

const ImageSchema: Schema = new Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  pacienteId: { type: Schema.Types.ObjectId, ref: "Paciente", required: true }
}, { timestamps: true });

export default mongoose.model<IImage>('Image', ImageSchema);