import mongoose, { Schema, Document } from 'mongoose';

//La informacion que se guarda de la imagen
export interface IImage extends Document {
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
}

const ImageSchema: Schema = new Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model<IImage>('Image', ImageSchema);