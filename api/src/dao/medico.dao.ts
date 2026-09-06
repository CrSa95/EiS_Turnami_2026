import MedicoModel, {IMedico } from '../model/medico.model';
export default class MedicoDAO {
    async findByDNI(dni: string): Promise<IMedico | null> {
        return await MedicoModel.findOne({ dni }).exec();
    }
}
