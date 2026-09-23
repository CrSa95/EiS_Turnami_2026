import mongoose, {Schema, Document, Types} from 'mongoose';

//La informacion que se guarda de la imagen
export interface IImage extends Document {
  idImagen: string; // Se hace un refactor del nombre para que sea mas generico
  tipo: 'Receta' | 'Orden'; // Nuevo campo para saber el tipo
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  pacienteDni: string;
  estado: 'Pendiente' | 'Transcripta' | 'Rechazada';
}

const ImageSchema: Schema = new Schema({
  idImagen: { type: String, required: true, unique: true },
  tipo: { type: String, enum: ['Receta', 'Orden'], required: true },
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