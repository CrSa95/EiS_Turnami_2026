import PacienteModel, {IPaciente } from '../model/paciente.model.js';
export default class PacienteDAO {
    async findByDNI(dni: string): Promise<IPaciente | null> {
        return await PacienteModel.findOne({ dni }).exec();
    }
    // Buscar todos los pacientes asignados al DNI de un médico
    async findByMedicoDni(medicoDni: string): Promise<IPaciente[]> {
        return await PacienteModel.find({ medicoDni }).exec();
    }
}
