import PacienteModel, {IPaciente } from '../model/paciente.model';
export default class PacienteDAO {
    async findByDNI(dni: string): Promise<IPaciente | null> {
        return await PacienteModel.findOne({ dni }).exec();
    }
}
