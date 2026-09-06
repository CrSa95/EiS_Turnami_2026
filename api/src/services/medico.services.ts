import jwt from "jsonwebtoken";
import MedicoDAO from "../dao/medico"
import {IMedico} from "../model/medico"
import PasswordService from "./password.services"

export interface TokenResponseMedico {
    access_token: string;
    token_type: "Bearer";
    user: IMedico
}

export default class MedicoServices {
    private medicoDAO: MedicoDAO
    constructor(medicoDAO: MedicoDAO) {
        this.medicoDAO = medicoDAO
    }
    async login(dni: string, password: string): Promise<TokenResponseMedico>{

        let medico: IMedico | null = await this.medicoDAO.findByEmail(dni)
        if(!medico){
            throw new Error("Usted no se encuentra registrado")
        }


        const isSamePassword = await PasswordService.compare(password,medico.password)
        if(!isSamePassword){
            throw new Error("Error al iniciar sesión, intente nuevamente")
        }

        const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";

        const token = jwt.sign({
            id: medico._id,
            dni: medico.dni
        }, secret)


        return {
            access_token: token,
            token_type: "Bearer",
            user: {
                id: medico._id,
                dni: medico.dni,
            }
        };
    }
}
