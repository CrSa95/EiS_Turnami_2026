import { useState } from "react";
import Modal from "./Modal.jsx";
import { cancelarTurno } from "../data/auth.js";

function TurnoExistenteCard({ turno, token, onTurnoCancelado, onVolver }) {
  const [cargando, setCargando] = useState(false);

  const [modalState, setModalState] = useState({
    visible: false,
    type: null,
    message: "",
  });

  const medicoNombre = turno.medicoNombre || "Médico de cabecera";
  const fechaRaw = turno.fechaPreferencia || turno.fecha;
  const hora = turno.horaPreferencia || turno.hora;

  const formatearFechaTexto = (fechaStr) => {
    if (!fechaStr) return "";

    const soloFecha = fechaStr.includes("T") ? fechaStr.split("T")[0] : fechaStr;
    const [anio, mes, dia] = soloFecha.split("-");

    if (!anio || !mes || !dia) return fechaStr;

    const fechaObj = new Date(Number(anio), Number(mes) - 1, Number(dia));

    return fechaObj.toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const fechaFormateada = formatearFechaTexto(fechaRaw);

  const esCancelable24hs = () => {
    if (typeof turno.cancelable === "boolean") {
      return turno.cancelable;
    }

    if (!fechaRaw || !hora) return true;

    const fechaLimpia = fechaRaw.includes("T") ? fechaRaw.split("T")[0] : fechaRaw;
    const fechaHoraTurno = new Date(`${fechaLimpia}T${hora}:00`);
    const ahora = new Date();

    if (isNaN(fechaHoraTurno.getTime())) return true;

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
      message: `¿Está seguro de que desea cancelar el turno con Dr/a ${medicoNombre} para el ${fechaFormateada} a las ${hora} hs?`,
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
      const idTurno = turno.id || turno._id || turno.idTurno;

      if (!idTurno) {
        throw new Error("No se pudo obtener el identificador del turno.");
      }

      await cancelarTurno(token, idTurno);

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
          error.message ||
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
        {`Se solicitó un turno con Dr/a ${medicoNombre} para el día ${fechaFormateada} a las ${hora} hs.`}
      </p>

      <div className="acciones" style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
        <button
          type="button"
          onClick={handleBotonCancelarClick}
          className="btn-danger"
          disabled={cargando}
          style={{ backgroundColor: "#dc3545", color: "#fff" }}
        >
          Cancelar turno
        </button>
        <button type="button" onClick={onVolver} className="btn-secondary" disabled={cargando}>
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
                disabled={cargando}
                style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
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