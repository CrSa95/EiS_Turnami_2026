import React, {useState} from 'react';
import { formatearFechaTexto } from '../helpers/dateUtils';
import ConfirmarCancelacionModal from './ConfirmacionCancelarTurno';
import Modal from './Modal';

export default function TurnoTable({ turnos = [], onCancelarTurno }) {
  const [turnoAConfirmar, setTurnoAConfirmar] = useState(null);

  const [modalFeedback, setModalFeedback] = useState({
    status: null,
    message: '',
  });

  const handleClickCancelar = (turno) => {
    setTurnoAConfirmar(turno);
  };

  const handleCerrarConfirmacion = () => {
    setTurnoAConfirmar(null);
  };

  const handleConfirmarCancelacion = async ()=>{
    const {_id } = turnoAConfirmar;
    setTurnoAConfirmar(null);

    if (!onCancelarTurno) return;

    setModalFeedback({
      status: 'Cargando',
      message: 'Cancelando el turno...',
    });

    try {
      await onCancelarTurno(_id);
      setModalFeedback({
        status: 'Ok',
        message: 'Turno cancelado exitosamente.',
      });
    } catch (error) {
      setModalFeedback({
        status: 'Fallo',
        message: error?.message || 'Error al cancelar el turno.',
      });
    }
  }

  const obtenerClaseBadge = (estado) => {
    switch (estado?.toUpperCase()) {
      case "PENDIENTE":
        return "turno-badge badge-pendiente";
      case "CANCELADO":
        return "turno-badge badge-cancelado";
      default:
        return "turno-badge badge-pendiente";
    }
  };

  const handleCancelar = (turno) => {
    if (onCancelarTurno) {
      onCancelarTurno(turno);
    }
  };

  if (!turnos || turnos.length === 0) {
    return (
      <div className="turnos-vacio">
        <p>No hay turnos registrados para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="tabla-turnos-wrapper">
      <table className="tabla-turnos">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Paciente</th>
            <th>Motivo</th>
            <th>Fecha y Hora</th>
            <th className="th-estado">Estado</th>
            <th className="th-accion">Acción</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => {
            const yaCancelado = turno.estado?.toUpperCase() === 'CANCELADO';
            const yaAtendido = turno.estado?.toUpperCase() === 'ATENDIDO';
            const deshabilitarBoton = yaCancelado || yaAtendido;

            return (
              <tr key={turno._id || turno.createdAt}>
                <td data-label="DNI" className="td-dni">
                  {turno.pacienteDni || '-'}
                </td>

                <td data-label="Paciente" className="td-paciente">
                  {turno.pacienteApellido && turno.pacienteNombre
                    ? `${turno.pacienteApellido}, ${turno.pacienteNombre}`
                    : turno.pacienteNombre || turno.pacienteApellido || 'No asignado'}
                </td>

                <td data-label="Motivo" className="td-motivo">
                  <span className="motivo-principal">{turno.motivo}</span>
                </td>

                <td data-label="Fecha y Hora" className="td-fecha">
                  <span className="fecha-principal">
                    {formatearFechaTexto(turno.fechaPreferencia)}
                  </span>
                  <span className="hora-secundaria">
                    {turno.horaPreferencia ? ` - ${turno.horaPreferencia} hs` : ''}
                  </span>
                </td>

                <td data-label="Estado" className="td-estado">
                  <span className={obtenerClaseBadge(turno.estado)}>
                    {yaCancelado ? "Cancelado" : "Pendiente"}
                  </span>
                </td>

                <td data-label="Acción" className="td-accion">
                  <button
                    type="button"
                    className="btn-cancelar"
                    disabled={deshabilitarBoton}
                    onClick={() => handleClickCancelar(turno)}
                  >
                    {yaCancelado ? 'Cancelado' : 'Cancelar'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ConfirmarCancelacionModal 
        isOpen={Boolean(turnoAConfirmar)}
        turno={turnoAConfirmar}
        onConfirmar={handleConfirmarCancelacion}
        onCancelar={handleCerrarConfirmacion}
      />

      <Modal
        status={modalFeedback.status}
        message={modalFeedback.message}
        onClose={() => setModalFeedback({ status: null, message: '' })}
      />
    </div>
  );
}