import MedicoModel, {IMedico } from '../model/medico';
export default class MedicoDAO {
    async findByEmail(email: string): Promise<IMedico | null> {
        return await MedicoModel.findOne({ email }).exec();
    }
}
