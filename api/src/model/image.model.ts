import mongoose, {Schema, Document, Types} from 'mongoose';

//La informacion que se guarda de la imagen
export interface IImage extends Document {
  idReceta: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  pacienteDni: string;
  estado: 'Pendiente' | 'Transcripta' | 'Rechazada';
}

const ImageSchema: Schema = new Schema({
  idReceta: { type: String, required: true, unique: true },
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  pacienteDni: { type: String, required: true },
  estado: {
    type: String,
    enum: ['Pendiente', 'Transcripta', 'Rechazada'],
    default: 'Pendiente'
  }
}, { timestamps: true });

export default mongoose.model<IImage>('Image', ImageSchema);