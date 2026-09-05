import { Schema, model} from 'mongoose';

export interface IMedico {
    email: string;
    password: string;
}
const medicoSchema = new Schema({
    email: {type: String, required: true},
    password: { type: String, required: true }    
});



export default model<IMedico>('Medico', medicoSchema);
