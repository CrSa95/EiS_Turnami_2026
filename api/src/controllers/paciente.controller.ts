import { Router  } from 'express';
import PacienteServices from '../services/paciente.services.js';
import PacienteDAO from '../dao/paciente.dao.js';
const router = Router();

const pacienteDAO = new PacienteDAO();
const pacienteServices = new PacienteServices(pacienteDAO)

router.route("/auth")
    .post(async(req, res)=>{
        try{
            const { dni, password } = req.body || {};
            const session = await pacienteServices.login(dni, password);
            return res.status(201).json(session);
        }catch(error){
            const mensaje = error instanceof Error
                ? error.message
                : "Error al iniciar sesión";
            return res.status(400).json({
                error: "fallo de inicio de sesion",
                mensaje,
            });
        }
    })
    .get(async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            const oauthToken = authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : (req.query.token as string);

            if (!oauthToken) {
                return res.status(400).json({ 
                    message: "Token OAuth no proporcionado en los encabezados o parámetros" 
                });
            }                        
            const session = await pacienteServices.validateToken(oauthToken);

            return res.status(200).json(session);
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : "Token OAuth inválido o expirado";

            return res.status(401).json({ 
                message: errorMessage 
            });
        }
    })

export default router