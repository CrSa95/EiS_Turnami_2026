import { useState } from "react";

import { cancelarTurno } from "../data/auth.js";

import {
  formatearFechaTexto,
  esCancelable24hs,
  getTurnoId,
} from "../helpers/dateUtils.js";

import Modal from "./Modal.jsx";

const MENSAJE_FUERA_DE_PLAZO =
  "El turno no puede ser cancelado por este medio debido a la proximidad de la fecha. Por favor, comuníquese con el consultorio.";

const MENSAJE_ERROR_CANCELACION =
  "Ocurrió un error al intentar cancelar el turno. Por favor, intente nuevamente.";

function TurnoExistenteCard({
  turno,
  medicoNombre: medicoNombreProp,
  token,
  onTurnoCancelado,
  onVolver,
}) {
  const [cargando, setCargando] = useState(false);

  const [modalState, setModalState] = useState({
    visible: false,
    type: null,
    message: "",
  });

  const medicoNombre =
    turno.medicoNombre || medicoNombreProp || "Médico de cabecera";

  const fechaRaw =
    turno.fechaPreferencia || turno.fecha;

  const hora =
    turno.horaPreferencia || turno.hora;

  const fechaFormateada = formatearFechaTexto(fechaRaw);

  const handleBotonCancelarClick = () => {
    if (!esCancelable24hs(turno)) {
      setModalState({
        visible: true,
        type: "fuera_de_plazo",
        message: MENSAJE_FUERA_DE_PLAZO,
      });

      return;
    }

    setModalState({
      visible: true,
      type: "confirmacion",
      message: `¿Está seguro de que desea cancelar el turno con ${medicoNombre} para el ${fechaFormateada} a las ${hora} hs?`,
    });
  };

  const ejecutarCancelacion = async () => {
    if (cargando) return;

    // Volver a validar el plazo antes de enviar la solicitud.
    if (!esCancelable24hs(turno)) {
      setModalState({
        visible: true,
        type: "fuera_de_plazo",
        message: MENSAJE_FUERA_DE_PLAZO,
      });

      return;
    }

    const idTurno = getTurnoId(turno);

    if (!idTurno) {
      setModalState({
        visible: true,
        type: "error",
        message: MENSAJE_ERROR_CANCELACION,
      });

      return;
    }

    setCargando(true);

    setModalState({
      visible: true,
      type: "cargando",
      message: "Procesando la cancelación...",
    });

    try {
      await cancelarTurno(token, idTurno);

      setModalState({
        visible: true,
        type: "exito",
        message: "El turno ha sido cancelado exitosamente.",
      });
    } catch (error) {
      console.error("Error al cancelar el turno:", error);

      // Si el servidor rechazó por plazo (p. ej. desfase de reloj), se
      // informa lo mismo que en la validación local.
      const rechazadoPorPlazo = error?.message === MENSAJE_FUERA_DE_PLAZO;

      setModalState({
        visible: true,
        type: rechazadoPorPlazo ? "fuera_de_plazo" : "error",
        message: rechazadoPorPlazo
          ? MENSAJE_FUERA_DE_PLAZO
          : MENSAJE_ERROR_CANCELACION,
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCloseModal = () => {
    const ultimoTipo = modalState.type;

    setModalState({
      visible: false,
      type: null,
      message: "",
    });

    if (ultimoTipo === "exito") {
      onTurnoCancelado(getTurnoId(turno));
    }
  };

  return (
    <div className="turno-status-card">
      <h2>Mis turnos</h2>

      <p className="mensaje-confirmacion">
        Se solicitó un turno con {medicoNombre} para el día{" "}
        {fechaFormateada} a las {hora} hs.
      </p>

      <div
        className="acciones"
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "15px",
        }}
      >
        <button
          type="button"
          onClick={handleBotonCancelarClick}
          className="btn-danger"
          disabled={cargando}
          style={{
            backgroundColor: "#dc3545",
            color: "#fff",
          }}
        >
          Cancelar turno
        </button>

        <button
          type="button"
          onClick={onVolver}
          className="btn-secondary"
          disabled={cargando}
        >
          Volver al inicio
        </button>
      </div>

      {/* Modal de confirmación */}

      {modalState.visible &&
        modalState.type === "confirmacion" && (
          <div
            className="status-modal-backdrop"
            role="presentation"
          >
            <section
              className="status-modal status-modal-fallo"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-confirmacion"
              aria-describedby="texto-confirmacion"
            >
              <div
                className="status-modal-symbol"
                aria-hidden="true"
              >
                ?
              </div>

              <h2 id="titulo-confirmacion">
                Confirmar cancelación
              </h2>

              <p id="texto-confirmacion">
                {modalState.message}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={ejecutarCancelacion}
                  className="btn-primary"
                  disabled={cargando}
                  style={{
                    backgroundColor: "#dc3545",
                    borderColor: "#dc3545",
                  }}
                >
                  Sí, cancelar
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  disabled={cargando}
                >
                  Mantener turno
                </button>
              </div>
            </section>
          </div>
        )}

      {/* Modales de carga, éxito, error y plazo vencido */}

      {modalState.visible &&
        modalState.type !== "confirmacion" && (
          <Modal
            status={
              modalState.type === "cargando"
                ? "Cargando"
                : modalState.type === "exito"
                  ? "Ok"
                  : "Fallo"
            }
            message={modalState.message}
            onClose={
              modalState.type !== "cargando"
                ? handleCloseModal
                : undefined
            }
          />
        )}
    </div>
  );
}

export default TurnoExistenteCard;