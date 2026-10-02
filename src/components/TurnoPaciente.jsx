
import { useState, useEffect, useMemo } from "react";

import {
  solicitarTurno,
  obtenerEstadoTurnos,
} from "../data/auth.js";

import {
  getRangoFechasSemanaActual,
  generarHorarios,
} from "../helpers/dateUtils.js";

import Modal from "./Modal.jsx";
import TurnoExistenteCard from "./TurnoExistenteCard.jsx";

import "../styles/turno.css";

function TurnoPaciente({ token, dni, onCancel }) {
  const [descripcion, setDescripcion] = useState(
    "Revisión clínica semanal"
  );

  const { min: fechaMin, max: fechaMax } = useMemo(
    () => getRangoFechasSemanaActual(),
    []
  );

  const [fechaPreferencia, setFechaPreferencia] = useState("");
  const [horaPreferencia, setHoraPreferencia] = useState("");

  const [cargando, setCargando] = useState(false);
  const [consultandoTurno, setConsultandoTurno] = useState(true);

  const [turnoExistente, setTurnoExistente] = useState(null);
  const [medicoNombre, setMedicoNombre] = useState(
    "Médico de cabecera"
  );

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    status: null,
    message: "",
  });

  const opcionesHorarias = useMemo(
    () => generarHorarios(fechaPreferencia),
    [fechaPreferencia]
  );



console.log({ fechaMin, fechaMax });

  useEffect(() => {
    setHoraPreferencia("");
  }, [fechaPreferencia]);

  useEffect(() => {
    let activo = true;

    const cargarTurno = async () => {
      setConsultandoTurno(true);

      try {
        const data = await obtenerEstadoTurnos(token);

        if (!activo) return;

        const turnoData = data?.turno ?? data;

        const tieneTurno =
          turnoData &&
          (turnoData.estado ||
            turnoData.id ||
            turnoData._id ||
            turnoData.idTurno ||
            turnoData.pacienteDni);

        if (tieneTurno) {
          setTurnoExistente(turnoData);

          if (turnoData.medicoNombre) {
            setMedicoNombre(turnoData.medicoNombre);
          }
        }
      } catch (error) {
        console.error(
          "Error al consultar el estado de turnos:",
          error
        );
      } finally {
        if (activo) {
          setConsultandoTurno(false);
        }
      }
    };

    cargarTurno();

    return () => {
      activo = false;
    };
  }, [token]);

  const fechaValida =
    fechaPreferencia >= fechaMin &&
    fechaPreferencia <= fechaMax;

  const isFormValid =
    fechaValida &&
    horaPreferencia !== "" &&
    opcionesHorarias.includes(horaPreferencia);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid || cargando || turnoExistente) {
      return;
    }

    setCargando(true);

    setModalConfig({
      visible: true,
      status: "Cargando",
      message: "Procesando la solicitud de turno...",
    });

    try {
      const payload = {
        pacienteDni: dni,

        motivo: descripcion,
        descripcion,

        fechaPreferencia,
        horaPreferencia,
      };

      const resultado = await solicitarTurno(token, payload);

      const turnoObtenido = resultado?.turno ?? resultado;

      if (!turnoObtenido) {
        throw new Error("La respuesta no contiene el turno.");
      }

      if (turnoObtenido.medicoNombre) {
        setMedicoNombre(turnoObtenido.medicoNombre);
      }

      setTurnoExistente(turnoObtenido);

      setModalConfig({
        visible: true,
        status: "Ok",
        message: "Se agendó su turno exitosamente.",
      });
    } catch (error) {
      console.error("Error al solicitar el turno:", error);

      setModalConfig({
        visible: true,
        status: "Fallo",
        message:
          "Hubo un error agendando su turno. Inténtalo más tarde.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCloseModal = () => {
    setModalConfig({
      visible: false,
      status: null,
      message: "",
    });
  };

  const handleTurnoCancelado = () => {
    setTurnoExistente(null);
    setFechaPreferencia("");
    setHoraPreferencia("");
    setDescripcion("Revisión clínica semanal");
  };

  if (consultandoTurno) {
    return <p>Consultando tus turnos...</p>;
  }

  if (turnoExistente && !modalConfig.visible) {
    return (
      <TurnoExistenteCard
        turno={turnoExistente}
        token={token}
        onTurnoCancelado={handleTurnoCancelado}
        onVolver={onCancel}
      />
    );
  }

  return (
    <div className="turnos">
      <h2>Mis turnos</h2>

      <h4>
        Médico de cabecera: Dr/a. {medicoNombre}
      </h4>

      <div className="turno-form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción / motivo de consulta
            </label>

            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describí el motivo de tu consulta"
              rows={3}
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">
              Preferencia de día
            </label>

            <input
              id="fecha"
              type="date"
              min={fechaMin}
              max={fechaMax}
              value={fechaPreferencia}
              onChange={(e) => setFechaPreferencia(e.target.value)}
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora">
              Preferencia horaria
            </label>

            <select
              id="hora"
              value={horaPreferencia}
              onChange={(e) => setHoraPreferencia(e.target.value)}
              required
              disabled={cargando || opcionesHorarias.length === 0}
            >
              <option value="">
                -- Seleccionar horario --
              </option>

              {opcionesHorarias.map((horario) => (
                <option key={horario} value={horario}>
                  {horario} hs
                </option>
              ))}
            </select>

            {fechaPreferencia && opcionesHorarias.length === 0 && (
              <p role="status">
                No hay horarios disponibles para esta fecha.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={!isFormValid || cargando || !!turnoExistente}
              className={`btn-primary ${
                !isFormValid || cargando || turnoExistente
                  ? "btn-disabled"
                  : ""
              }`}
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

      {modalConfig.visible && (
        <Modal
          status={modalConfig.status}
          message={modalConfig.message}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default TurnoPaciente;