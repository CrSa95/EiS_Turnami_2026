import { useState, useEffect, useMemo } from "react";
import { solicitarTurno, obtenerEstadoTurnos } from "../data/auth.js";
import { getRangoFechasSemanaActual, generarHorarios } from "../helpers/dateUtils.js";
import "../styles/turno.css";

function TurnoPaciente({ token, dni, onCancel }) {
  const [motivo, setMotivo] = useState("Revisión clínica semanal");
  const [descripcion, setDescripcion] = useState("");
  const [fechaPreferencia, setFechaPreferencia] = useState("");
  const [horaPreferencia, setHoraPreferencia] = useState("");
  
  const [cargando, setCargando] = useState(false);
  const [turnoExistente, setTurnoExistente] = useState(null);

  const { min: fechaMin, max: fechaMax } = useMemo(() => getRangoFechasSemanaActual(), []);
  const opcionesHorarias = useMemo(() => generarHorarios(), []);
  const [medicoNombre, setMedicoNombre] = useState("Médico de cabecera");

  useEffect(() => {
    obtenerEstadoTurnos(token)
      .then((data) => {
        const turnoData = data?.turno || data;
        if (turnoData && (turnoData.estado || turnoData.id || turnoData._id || turnoData.pacienteDni)) {
          setTurnoExistente(turnoData);
          if (turnoData.medicoNombre) {
            setMedicoNombre(turnoData.medicoNombre);
          }
        }
      })
      .catch((err) => {
        console.error("Error al consultar el estado de turnos:", err);
      });
  }, [token]);

  const isFormValid = fechaPreferencia.trim() !== "" && horaPreferencia.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setCargando(true);
    try {
      const payload = {
        pacienteDni: dni,
        motivo,
        descripcion,
        fechaPreferencia,
        horaPreferencia,
      };

      const resultado = await solicitarTurno(token, payload);
      
      const turnoObtenido = resultado?.turno || resultado;
      setTurnoExistente(turnoObtenido);

      if (turnoObtenido?.medicoNombre) {
        setMedicoNombre(turnoObtenido.medicoNombre);
      }
      
    } catch (error) {
      alert(error.message || "Ocurrió un error al solicitar el turno.");
    } finally {
      setCargando(false);
    }
  };

  if (turnoExistente) {
    return (
      <div className="turno-status-card">
        <h2>Mis Turnos</h2>
        <p className="mensaje-confirmacion">
          {`Se solicitó un turno con Dr/a ${medicoNombre}, espere respuesta.`}
        </p>

        <div className="acciones">
          <button type="button" disabled className="btn-disabled">
            Esperando respuesta del médico
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="turnos">
      <h2 className="turnos-title">Reservar Turno</h2>
      
      <div className="turno-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="motivo">Motivo de consulta</label>
            <input
              id="motivo"
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
            />
          </div>

{/*
           <div className="form-group">
            <label htmlFor="descripcion">Descripción (opcional)</label>
            <textarea
              id="descripcion"
              rows="3"
              placeholder="Ingrese detalles o comentarios adicionales..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
*/}
          <div className="form-group">
            <label htmlFor="fecha">Preferencia de día (Semana actual)</label>
            <input
              id="fecha"
              type="date"
              min={fechaMin}
              max={fechaMax}
              value={fechaPreferencia}
              onChange={(e) => setFechaPreferencia(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora">Preferencia horaria</label>
            <select
              id="hora"
              value={horaPreferencia}
              onChange={(e) => setHoraPreferencia(e.target.value)}
              required
            >
              <option value="">-- Seleccionar horario --</option>
              {opcionesHorarias.map((horario) => (
                <option key={horario} value={horario}>
                  {horario} hs
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={!isFormValid || cargando}
              className={`btn-primary ${!isFormValid || cargando ? "btn-disabled" : ""}`}
            >
              {cargando ? "Enviando..." : "Enviar"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={cargando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TurnoPaciente;