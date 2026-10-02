import { useState } from "react";
import Modal from "./Modal.jsx";

function TurnoExistenteCard({ turno, token, onTurnoCancelado, onVolver }) {
  const [cargando, setCargando] = useState(false);

  const [modalState, setModalState] = useState({
    visible: false,
    type: null,
    message: "",
  });

  const medicoNombre = turno.medicoNombre || "Médico de cabecera";
  const fecha = turno.fechaPreferencia || turno.fecha;
  const hora = turno.horaPreferencia || turno.hora;

  /**
   * Helper para verificar si la fecha del turno está a más de 24 hs de la fecha actual
   */
  const esCancelable24hs = () => {
    if (!fecha || !hora) return true; // Si no hay datos, dejamos intentar o manejamos con fallback

    // Creamos un objeto Date combinando fecha (YYYY-MM-DD) y hora (HH:mm)
    const fechaHoraTurno = new Date(`${fecha}T${hora}:00`);
    const ahora = new Date();

    const diferenciaMs = fechaHoraTurno.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    return diferenciaHoras >= 24;
  };

  const handleBotonCancelarClick = () => {
    if (!esCancelable24hs()) {
      setModalState({
        visible: true,
        type: "fuera_de_plazo",
        message:
          "El turno no puede ser cancelado por este medio debido a la proximidad de la fecha. Por favor, comuníquese con el consultorio.",
      });
      return;
    }

    setModalState({
      visible: true,
      type: "confirmacion",
      message: `¿Está seguro de que desea cancelar el turno con Dr/a ${medicoNombre} para el ${fecha} a las ${hora} hs?`,
    });
  };

  const ejecutarCancelacion = async () => {
    setCargando(true);
    setModalState({
      visible: true,
      type: "cargando",
      message: "Procesando la cancelación...",
    });

    try {
      setModalState({
        visible: true,
        type: "exito",
        message: "El turno ha sido cancelado exitosamente.",
      });
    } catch (error) {
      setModalState({
        visible: true,
        type: "error",
        message:
          "Ocurrió un error al intentar cancelar el turno. Por favor, intente nuevamente.",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleCloseModal = () => {
    const ultimoTipo = modalState.type;
    setModalState({ visible: false, type: null, message: "" });

    if (ultimoTipo === "exito") {
      onTurnoCancelado();
    }
  };

  return (
    <div className="turno-status-card">
      <h2>Mis Turnos</h2>
      <p className="mensaje-confirmacion">
        {`Se solicitó un turno con Dr/a ${medicoNombre} para el día ${fecha} a las ${hora} hs.`}
      </p>

      <div className="acciones" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button
          type="button"
          onClick={handleBotonCancelarClick}
          className="btn-danger"
          style={{ backgroundColor: "#dc3545", color: "#fff" }}
        >
          Cancelar turno
        </button>
        <button type="button" onClick={onVolver} className="btn-secondary">
          Volver al inicio
        </button>
      </div>

      {/* RENDERIZADO DE MODALES */}

      {modalState.visible && modalState.type === "confirmacion" && (
        <div className="status-modal-backdrop" role="presentation">
          <section className="status-modal status-modal-fallo" role="dialog" aria-modal="true">
            <div className="status-modal-symbol">?</div>
            <h2>Confirmar cancelación</h2>
            <p>{modalState.message}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
              <button
                type="button"
                onClick={ejecutarCancelacion}
                className="btn-primary"
                style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
              >
                Sí, cancelar
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn-secondary"
              >
                Volver/Mantener turno
              </button>
            </div>
          </section>
        </div>
      )}

      {modalState.visible && modalState.type !== "confirmacion" && (
        <Modal
          status={
            modalState.type === "cargando"
              ? "Cargando"
              : modalState.type === "exito"
              ? "Ok"
              : "Fallo"
          }
          message={modalState.message}
          onClose={modalState.type !== "cargando" ? handleCloseModal : undefined}
        />
      )}
    </div>
  );
}

export default TurnoExistenteCard;