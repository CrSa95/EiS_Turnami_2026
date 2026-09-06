import { Router  } from 'express';
import PacienteServices from '../services/paciente.services';
const router = Router();

const pacienteServices = new PacienteServices()

router.route("/auth")
    .post(async(req, res)=>{
        try{
            const {dni, password} = req.body;
            return pacienteServices.login(dni, password)
        }catch(error){
            return res.status(400).json(error)
        }
    })
    .get(async (req, res)=>{})

export default router