import { Schema, model, Document} from 'mongoose';

export interface IMedico extends Document {
    email: string;
    password: string;
}
const medicoSchema = new Schema({
    email: {type: String, required: true},
    password: { type: String, required: true }    
});



export default model<IMedico>('Medico', medicoSchema);
