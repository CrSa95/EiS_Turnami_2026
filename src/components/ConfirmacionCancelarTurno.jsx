import React from 'react';
import '../styles/modal.css';

export default function ConfirmarCancelacionModal({
  isOpen,
  turno,
  onConfirmar,
  onCancelar,
}) {
  if (!isOpen || !turno) return null;

  const nombreCompleto = turno.pacienteApellido && turno.pacienteNombre
    ? `${turno.pacienteNombre} ${turno.pacienteApellido}`
    : turno.pacienteNombre || turno.pacienteApellido || 'Paciente';

  const horario = turno.horaPreferencia ? `${turno.horaPreferencia} hs` : 'Sin horario';

  return (
    <div className="status-modal-backdrop" role="presentation">
      <section
        className="status-modal status-modal-confirmacion"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <h2 id="confirm-modal-title">
          ¿Confirma cancelar turno con el paciente {nombreCompleto}?
        </h2>

        <div className="modal-detalle-paciente">
          <p><strong>DNI:</strong> {turno.pacienteDni || '-'}</p>
          <p><strong>Horario:</strong> {horario}</p>
        </div>

        <div className="modal-acciones" >
          <button
            type="button"
            className="btn-modal-confirmar"
            onClick={onConfirmar}
          >
            Si, cancelar
          </button>
          <button
            type="button"
            className="btn-modal-descartar"
            onClick={onCancelar}
          >
            No, manterner turno
          </button>
        </div>
      </section>
    </div>
  );
}