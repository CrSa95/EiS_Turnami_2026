import jwt, { JwtPayload } from "jsonwebtoken";
import PacienteDAO from "../dao/paciente.dao";
import { IPaciente } from "../model/paciente.model";
import PasswordService from "./password.services";

export interface TokenResponsePaciente {
    access_token: string;
    token_type: "Bearer";
    user: IPaciente;
}

interface PacienteTokenPayload extends JwtPayload {
    id: string;
    dni: string;
}
export default class PacienteServices {
    private pacienteDAO: PacienteDAO;
    constructor(dao: PacienteDAO) {
        this.pacienteDAO = dao;
    }

    async login(dni: string, password: string): Promise<TokenResponsePaciente> {
        let paciente: IPaciente | null = await this.pacienteDAO.findByDNI(dni);
        if (!paciente) {
            throw new Error("Usted no se encuentra registrado");
        }

        const isSamePassword = await PasswordService.compare(
            password,
            paciente.password,
        );
        if (!isSamePassword) {
            throw new Error("Error al iniciar sesión, intente nuevamente");
        }

        const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";

        const token = jwt.sign(
            {
                id: paciente._id,
                dni: paciente.dni,
            },
            secret,
        );

        return {
            access_token: token,
            token_type: "Bearer",
            user: {
                id: paciente._id,
                dni: paciente.dni,
            },
        };
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const secret = process.env.JWT_SECRET || "turnami_dev_secret_key";
            const decoded = jwt.verify(token, secret) as PacienteTokenPayload;
            if (!decoded?.dni) {
                return false;
            }

            const medico = await this.pacienteDAO.findByDNI(decoded.dni);
            return medico !== null;
        } catch (error) {
            return false;
        }
    }
}
