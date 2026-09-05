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

export default router;