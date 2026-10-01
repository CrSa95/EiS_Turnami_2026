import React from 'react';
import TurnoPaciente from './TurnoPaciente';
import TurnoMedico from './TurnoMedico';

export default function Turno({ role, token, dni, onCancel }) {
  return (
    <div className="turnos-layout">
      {role === "paciente" ? (
        <TurnoPaciente token={token} dni={dni} onCancel={onCancel} />
      ) : (
        <TurnoMedico token={token} onCancel={onCancel} />
      )}
    </div>
  );
}
