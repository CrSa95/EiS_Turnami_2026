import { Router  } from 'express';
import MedicoService from '../services/medico.services';
import MedicoDAO from '../dao/medico.dao';

const router = Router();
const medicoDAO = new MedicoDAO();
const medicoService = new MedicoService(medicoDAO);


router.route("/auth")
    .post(async (req,res)=>{
        try{
            const {email, password} = req.body || {};
            return await medicoService.login(email, password)
        }catch(error){
            return res.status(400).json(error)
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
            const session = await medicoService.validateToken(oauthToken);

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

export default router;