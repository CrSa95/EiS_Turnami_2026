import { TurnoModel, EstadoTurno, ITurno } from '../model/turno.model.js';

export class TurnoDAO {
  async buscarTurnosPorEstado(pacienteDni: string, semanaAnio?: string, estados: string[] = []) {
    const filtro: any = {
      pacienteDni,
    };
  
    if (semanaAnio) {
      filtro.semanaAnio = semanaAnio;
    }
  
    if (estados.length > 0) {
      filtro.estado = { $in: estados };
    }
  
    return await TurnoModel.find(filtro).sort({ fechaPreferencia: 1 });
  }


  async crearTurno(datosTurno: Partial<ITurno>) {
    const nuevoTurno = new TurnoModel(datosTurno);
    return await nuevoTurno.save();
  }

  async obtenerTurnoPorId(id: string): Promise<ITurno | null> {
    return await TurnoModel.findById(id);
  }

  async cancelarTurno(id: string): Promise<ITurno | null> {
    return await TurnoModel.findByIdAndUpdate(
      id,
      { estado: EstadoTurno.CANCELADO },
      { new: true }
    );
  }
}
export default TurnoDAO;