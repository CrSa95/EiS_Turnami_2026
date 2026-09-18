import { useState } from "react";
import Modal from "./Modal";
import "../styles/modal.css";

const DEFAULT_MOTIVO =
  "La imagen no se lee con claridad. Por favor, vuelva a subirla.";

function ModalReject({
  isOpen,
  recipeId,
  token,
  onClose,
  onSuccess,
  rejectRecipeApi,
}) {
  const [motivo, setMotivo] = useState(DEFAULT_MOTIVO);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await rejectRecipeApi(token, recipeId, motivo);
      setLoading(false);
      onSuccess(recipeId);
      onClose();
    } catch (error) {
      setLoading(false);
      setErrorMessage("No se pudo rechazar la receta. Intente nuevamente.");
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
    return (
      <Modal status="Fallo" message={errorMessage} onClose={handleCloseError} />
    );
  }

  return (
    <div className="status-modal-backdrop">
      <div className="status-modal">
        <h2>Rechazar Receta</h2>
        <p>Ingrese el motivo por el cual rechaza la receta:</p>

        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          rows={4}
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