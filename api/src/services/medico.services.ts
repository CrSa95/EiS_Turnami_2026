import jwt,{JwtPayload} from "jsonwebtoken";
import MedicoDAO from "../dao/medico.dao.js"
import {IMedico} from "../model/medico.model.js"
import PasswordService from "./password.services.js"

export interface TokenResponseMedico {
    access_token: string;
    token_type: "Bearer";
    user: MedicoTokenPayload
}

interface MedicoTokenPayload extends JwtPayload {
    id: string;
    dni: string;
}

export default class MedicoServices {
    private medicoDAO: MedicoDAO
    constructor(medicoDAO: MedicoDAO) {
        this.medicoDAO = medicoDAO
    }
    async login(dni: string, password: string): Promise<TokenResponseMedico>{

        let medico: IMedico | null = await this.medicoDAO.findByDNI(dni)
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
                id: medico._id?.toString() || "",
                dni: medico.dni,
            }
        };
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";
            const decoded = jwt.verify(token, secret) as MedicoTokenPayload;
            if (!decoded?.dni) {
                return false;
            }

            const medico = await this.medicoDAO.findByDNI(decoded.dni);
            return medico !== null;
        }catch(error){
            return false;
        }
    }
}
