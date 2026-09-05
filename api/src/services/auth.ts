import jwt from "jsonwebtoken";
import MedicoDAO from "../dao/medico"
import {IMedico} from "../model/medico"
import { PasswordService } from "./passwordServices"

export interface BearerTokenResponse {
    access_token: string;
    token_type: "Bearer";
    user: IMedico
}

export default class AuthService {
    private medicoDAO: MedicoDAO
    constructor(medicoDAO: MedicoDAO) {
        this.medicoDAO = medicoDAO
    }
    async login(email: string, password: string): Promise<BearerTokenResponse>{

        let medico: IMedico | null = await this.medicoDAO.findByEmail(email)
        if(!medico){
            throw new Error("Error al iniciar sesión, intente nuevamente")
        }


        const isSamePassword = await PasswordService.compare(password,medico.password)
        if(!isSamePassword){
            throw new Error("Error al iniciar sesión, intente nuevamente")
        }
        
        const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";

        const token = jwt.sign({
            id: medico._id,
            email: medico.email
        }, secret)


        return {
            access_token: token,
            token_type: "Bearer",
            user: {
                id: medico._id,
                email: medico.email,
            }
        };
    }
}
