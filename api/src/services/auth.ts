import MedicoDAO from "../dao/medico"
import {IMedico} from "../model/medico"
import { PasswordService } from "./passwordServices"
export default class AuthService {
    private medicoDAO: MedicoDAO
    constructor(medicoDAO: MedicoDAO) {
        this.medicoDAO = medicoDAO
    }
    async login(email: string, password: string){

        let medico: IMedico = await this.medicoDAO.findByEmail(email)
        if(!medico){
            throw new Error("Error al iniciar sesión, intente nuevamente")
        }


        const isSamePassword = await PasswordService.compare(password,medico.password)
        if(!isSamePassword){
            throw new Error("Error al iniciar sesión, intente nuevamente")
        }
    }
}
