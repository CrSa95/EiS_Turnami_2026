import { TurnoModel, EstadoTurno, ITurno } from '../model/turno.model.js';

export class TurnoDAO {
  async buscarTurnoActivoSemana(pacienteDni: string, semanaAnio: string) {
    return await TurnoModel.findOne({
      pacienteDni,
      semanaAnio,
      estado: { $in: [EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO] }
    });
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