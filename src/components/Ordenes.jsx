import "../styles/recetas.css";
import Badge from "./Badge";
import CargarReceta from "./CargarReceta";
import RecetaImageModal from "./RecetaImageModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function Ordenes({
  rol,
  ordenes,
  handleUploadImage,
  handleViewImage,
  handleTranscribeRecipe,
  handleRejectRecipe,
  selectedImage,
}) {
  const title =
    rol == "paciente" ? "Ordenes solicitadas" : "Ordenes pendientes";

  return (
    <div className="recetas-layout">
      {rol === "paciente" && (
        <div className="recetas">
          <CargarReceta type={"Orden"} handleUploadImage={handleUploadImage} />
        </div>
      )}
      <div className="recetas">
        <h2 className="recetas-title">{title}</h2>
        <div className="recetas-list">
          {ordenes.length == 0 ? (
            <div className="recetas-empty">
              <span className="recetas-empty-icon" aria-hidden="true">
                ✦
              </span>
              <h3>
                {rol === "paciente"
                  ? "Aún no tienes ordenes"
                  : "Todo está al día"}
              </h3>
              <p>
                {rol === "paciente"
                  ? "Cuando tengas una orden disponible, aparecerá aquí."
                  : "No hay ordenes pendientes para revisar en este momento."}
              </p>
            </div>
          ) : (
            ordenes.map((e, index) => (
              <article
                className="receta-card"
                key={`${e.paciente.nombre}-${index}`}
              >
                <span className="receta-icon" aria-hidden="true">
                  💊
                </span>
                <div className="receta-content">
                  <div className="receta-heading">
                    <p className="receta-name">{e.receta.nombre}</p>
                  </div>
                  {rol !== "paciente" ? (
                    <p className="receta-details">
                      {e.paciente.nombre} {e.paciente.apellido} ·{" "}
                      {e.receta.fecha} · {e.paciente.dni}
                    </p>
                  ) : (
                    <p className="receta-details">{e.receta.fecha}</p>
                  )}

                  <div className="receta-actions">
                    <Badge status={e.status} />
                    <button
                      className="receta-action receta-action-secondary"
                      type="button"
                      onClick={() => handleViewImage(e.image)}
                    >
                      Ver Orden
                    </button>

                    {rol !== "paciente" && (
                      <button
                        className="receta-action receta-action-primary"
                        type="button"
                        onClick={() => {
                          const id = e.image?.idReceta;
                          handleTranscribeRecipe(id, "Orden");
                        }}
                      >
                        Marcar como transcripta
                      </button>
                    )}

                    {rol !== "paciente" && (
                      <button
                        className="receta-action receta-action-primary"
                        type="button"
                        onClick={() => {
                          const id = e.image?.idReceta;
                          handleRejectRecipe(id, "Orden");
                        }}
                      >
                        Rechazar
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {selectedImage?.filepath && (
        <RecetaImageModal
          src={`${API_BASE_URL}${selectedImage.filepath}`}
          alt="Vista previa de la receta"
          onClose={() => handleViewImage(selectedImage)}
        />
      )}
    </div>
  );
}

export default Ordenes;
