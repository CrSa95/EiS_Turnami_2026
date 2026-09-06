import { Schema, model, Types} from 'mongoose';

export interface IMedico {
    _id?: Types.ObjectId | string;
    dni: string;
    password: string;
}
const medicoSchema = new Schema({
    dni: {type: String, required: true},
    password: { type: String, required: true }    
});



export default model<IMedico>('Medico', medicoSchema);
