import { useState, useEffect, useMemo, useCallback } from "react";
import {
  solicitarTurno,
  obtenerProximosTurnos,
  obtenerMedicoAsignado,
} from "../data/auth.js";
import {
  getRangoFechasSemanaActual,
  generarHorarios,
  getSemanaAnio,
  getTurnoId,
  esTurnoActivo,
} from "../helpers/dateUtils.js";
import Modal from "./Modal.jsx";
import TurnoExistenteCard from "./TurnoExistenteCard.jsx";
import "../styles/Turno.css";

const MOTIVO_POR_DEFECTO = "Revisión clínica semanal";
const MEDICO_POR_DEFECTO = "Médico de cabecera";
const MODAL_CERRADO = { visible: false, status: null, message: "" };

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.turnos)) return data.turnos;
  return [];
};

function TurnoPaciente({ token, dni, onCancel }) {
  const [descripcion, setDescripcion] = useState(MOTIVO_POR_DEFECTO);
  const [fechaPreferencia, setFechaPreferencia] = useState("");
  const [horaPreferencia, setHoraPreferencia] = useState("");

  const [cargando, setCargando] = useState(false);
  const [consultandoTurnos, setConsultandoTurnos] = useState(true);
  const [errorConsulta, setErrorConsulta] = useState(false);

  // Fuente única de verdad: turnos activos y futuros del paciente.
  const [turnos, setTurnos] = useState([]);
  const [medicoNombre, setMedicoNombre] = useState(MEDICO_POR_DEFECTO);
  const [modalConfig, setModalConfig] = useState(MODAL_CERRADO);

  const { min: fechaMin, max: fechaMax } = useMemo(
    () => getRangoFechasSemanaActual(),
    []
  );

  const opcionesHorarias = useMemo(
    () => generarHorarios(fechaPreferencia),
    [fechaPreferencia]
  );

  // El turno (si existe) de la única semana que se puede reservar.
  // Regla: un turno por semana -> si ya hay uno, se muestra la tarjeta
  // en lugar del formulario.
  const turnoDeLaSemana = useMemo(() => {
    const semanaReservable = getSemanaAnio(fechaMin);
    return (
      turnos.find(
        (t) => getSemanaAnio(t.fechaPreferencia || t.fecha) === semanaReservable
      ) ?? null
    );
  }, [turnos, fechaMin]);

  const cargarDatos = useCallback(async () => {
    setConsultandoTurnos(true);
    setErrorConsulta(false);

    try {
      const [dataTurnos, dataMedico] = await Promise.all([
        obtenerProximosTurnos(token),
        // Si falla el nombre del médico no debe bloquear la pantalla.
        obtenerMedicoAsignado(token).catch(() => null),
      ]);

      const lista = normalizarLista(dataTurnos).filter(esTurnoActivo);
      setTurnos(lista);

      const nombre = dataMedico?.medicoNombre || lista[0]?.medicoNombre;
      if (nombre) setMedicoNombre(nombre);
    } catch (err) {
      console.error("Error al cargar los turnos:", err);
      setErrorConsulta(true);
    } finally {
      setConsultandoTurnos(false);
    }
  }, [token]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleFechaChange = (e) => {
    setFechaPreferencia(e.target.value);
    setHoraPreferencia(""); // los horarios dependen del día elegido
  };

  const fechaValida =
    fechaPreferencia >= fechaMin && fechaPreferencia <= fechaMax;

  const isFormValid =
    fechaValida &&
    horaPreferencia !== "" &&
    opcionesHorarias.includes(horaPreferencia);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || cargando) return;

    setCargando(true);
    setModalConfig({
      visible: true,
      status: "Cargando",
      message: "Procesando la solicitud de turno...",
    });

    try {
      const motivo = descripcion.trim() || MOTIVO_POR_DEFECTO;

      const resultado = await solicitarTurno(token, {
        pacienteDni: dni,
        motivo,
        descripcion: motivo,
        fechaPreferencia,
        horaPreferencia,
      });

      const turnoCreado = resultado?.turno ?? resultado;
      if (!turnoCreado || !getTurnoId(turnoCreado)) {
        throw new Error("La respuesta no contiene el turno.");
      }

      if (turnoCreado.medicoNombre) setMedicoNombre(turnoCreado.medicoNombre);

      // Al sumarlo a la lista, la tarjeta reemplaza al formulario.
      setTurnos((prev) => [...prev, turnoCreado]);

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
        message: "Hubo un error agendando su turno. Inténtalo más tarde.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCloseModal = () => setModalConfig(MODAL_CERRADO);

  // Se ejecuta después de que el paciente cierra el mensaje de éxito.
  const handleTurnoCancelado = (idCancelado) => {
    setTurnos((prev) => prev.filter((t) => getTurnoId(t) !== idCancelado));
    setFechaPreferencia("");
    setHoraPreferencia("");
    setDescripcion(MOTIVO_POR_DEFECTO);
  };

  if (consultandoTurnos) {
    return <p>Consultando tus turnos...</p>;
  }

  if (errorConsulta) {
    return (
      <div className="turnos">
        <h2>Mis turnos</h2>
        <p role="alert">
          No pudimos consultar tus turnos. Verificá tu conexión e intentá
          nuevamente.
        </p>
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={cargarDatos}>
            Reintentar
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {turnoDeLaSemana ? (
        <TurnoExistenteCard
          turno={turnoDeLaSemana}
          medicoNombre={medicoNombre}
          token={token}
          onTurnoCancelado={handleTurnoCancelado}
          onVolver={onCancel}
        />
      ) : (
        <div className="turnos">
          <h2>Mis turnos</h2>

          <h4>Médico de cabecera: {medicoNombre}</h4>

          <div className="turno-form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="descripcion">
                  Descripción / motivo de consulta (opcional)
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
                <label htmlFor="fecha">Preferencia de día</label>
                <input
                  id="fecha"
                  type="date"
                  min={fechaMin}
                  max={fechaMax}
                  value={fechaPreferencia}
                  onChange={handleFechaChange}
                  onClick={(e) => {
                    if (typeof e.currentTarget.showPicker === "function") {
                      e.currentTarget.showPicker();
                    }
                  }}
                  required
                  disabled={cargando}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hora">Preferencia horaria</label>
                <select
                  id="hora"
                  value={horaPreferencia}
                  onChange={(e) => setHoraPreferencia(e.target.value)}
                  required
                  disabled={cargando || opcionesHorarias.length === 0}
                >
                  <option value="">-- Seleccionar horario --</option>
                  {opcionesHorarias.map((horario) => (
                    <option key={horario} value={horario}>
                      {horario} hs
                    </option>
                  ))}
                </select>

                {fechaPreferencia && opcionesHorarias.length === 0 && (
                  <p role="status">No hay horarios disponibles para esta fecha.</p>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  disabled={!isFormValid || cargando}
                  className={`btn-primary ${
                    !isFormValid || cargando ? "btn-disabled" : ""
                  }`}
                >
                  {cargando ? "Enviando..." : "Enviar"}
                </button>

               {false && <button
                  type="button"
                  onClick={onCancel}
                  className="btn-secondary"
                  disabled={cargando}
                >
                  Cancelar
                </button>}
              </div>
            </form>
          </div>
        </div>
      )}

      {modalConfig.visible && (
        <Modal
          status={modalConfig.status}
          message={modalConfig.message}
          onClose={
            modalConfig.status !== "Cargando" ? handleCloseModal : undefined
          }
        />
      )}
    </>
  );
}

export default TurnoPaciente;
