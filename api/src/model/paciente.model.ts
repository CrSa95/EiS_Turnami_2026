import { Schema, model, Types} from 'mongoose';

export interface IPaciente {
    _id?: Types.ObjectId | string;
    dni: string;
    password: string;
}
const pacienteSchema = new Schema({
    dni: {type: String, required: true},
    password: { type: String, required: true }    
});



export default model<IPaciente>('Paciente', pacienteSchema);
