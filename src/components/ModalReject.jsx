import { useState, useEffect } from "react";
import Modal from "./Modal";
import "../styles/modal.css";

const DEFAULT_MOTIVO =
  "La imagen no se lee con claridad. Por favor, vuelva a subirla.";

function ModalReject({
  isOpen,
  recipeId,
  documentType = "Receta",
  token,
  onClose,
  onSuccess,
  rejectRecipeApi,
}) {
      const [motivo, setMotivo] = useState(DEFAULT_MOTIVO);
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState(null);
      const [validationError, setValidationError] = useState("");
    
      useEffect(() => {
        if (isOpen) {
          setMotivo(DEFAULT_MOTIVO);
          setValidationError("");
          setErrorMessage(null);
          setLoading(false);
        }
      }, [isOpen]);
    
      if (!isOpen) return null;
    
      const handleConfirm = async () => {
        setValidationError("");
        setErrorMessage(null);
      
        const trimmedMotivo = motivo.trim();
        if (!trimmedMotivo) {
          setValidationError("El motivo de rechazo no puede estar vacío.");
          return;
        }
      
        if (trimmedMotivo.length > 200) {
          setValidationError("El motivo no puede superar los 200 caracteres.");
          return;
        }
      
        setLoading(true);
        setErrorMessage(null);
      
        try {
          await rejectRecipeApi(token, recipeId, motivo);
          setLoading(false);
          onSuccess(recipeId);
          onClose();
        } catch (error) {
          setLoading(false);
          setErrorMessage(
            error instanceof TypeError
              ? "No se pudo conectar con el servidor. Intentá nuevamente en unos momentos."
              : error.message || "No se pudo completar el rechazo. Intente nuevamente.",
          );
        }
      };
    
      const handleCloseError = () => {
        setErrorMessage(null);
        onClose();
      };
    
      if (loading) {
        return <Modal status="Cargando" message="Procesando la solicitud de rechazo..." />;
      }
    
      if (errorMessage) {
        const isOrderNotification = documentType === "Orden";

        return (
          <div className="status-modal-backdrop" role="presentation">
            <section
              className="status-modal status-modal-fallo"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reject-error-title"
            >
              <div className="status-modal-symbol" aria-hidden="true">!</div>
              <h2 id="reject-error-title">
                {isOrderNotification ? "Ocurrió un error" : `No se pudo rechazar ${documentType.toLowerCase()}`}
              </h2>
              <p role="alert">
                {isOrderNotification
                  ? "No se pudo enviar la notificación correspondiente vía mail al paciente, por favor reintente."
                  : errorMessage}
              </p>
              <button type="button" onClick={handleConfirm}>Reintentar</button>
              {!isOrderNotification && (
                <button
                  type="button"
                  onClick={handleCloseError}
                  style={{ marginLeft: "10px", background: "#5e6b7d" }}
                >
                  Cerrar
                </button>
              )}
            </section>
          </div>
        );
      }

  return (
    <div className="status-modal-backdrop">
      <div className="status-modal">
        <h2>Rechazar {documentType}</h2>
        <p>Ingrese el motivo por el cual rechaza {documentType.toLowerCase()}:</p>

        <textarea
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            if (validationError) setValidationError("");
          }}
          rows={4}
          maxLength={200}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #c8d0da",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          {validationError ? (
            <span style={{ color: "red", fontSize: "12px" }}>{validationError}</span>
          ) : (
            <span />
          )}
          <span style={{ fontSize: "12px", color: motivo.length > 200 ? "red" : "#666" }}>
            {motivo.length}/200
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ background: "#5e6b7d" }}
          >
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalReject;