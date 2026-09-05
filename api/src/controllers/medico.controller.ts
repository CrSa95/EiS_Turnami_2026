import { Router  } from 'express';
import MedicoService from '../services/medico.services';
import MedicoDAO from '../dao/medico.dao';

const router = Router();
const medicoDAO = new MedicoDAO();
const medicoService = new MedicoService(medicoDAO);


router.route("/auth")
    .post(async (req,res)=>{
        const {email, password} = req.body || {};
        return await medicoService.login(email, password)
    })

export default router;