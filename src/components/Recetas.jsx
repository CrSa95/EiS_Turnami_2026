import "../styles/recetas.css";
import Badge from "./Badge";
import CargarReceta from "./CargarReceta";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function Recetas({
  rol,
  recetas,
  handleImage,
  handleViewImage,
  handleDownload,
  selectedImage,
}) {
  const title =
    rol == "paciente" ? "Recetas solicitadas" : "Recetas pendientes";

  return (
    <div className="recetas-layout">
      {rol === "paciente" && (
        <div className="recetas">
          <CargarReceta handleImage={handleImage} />
        </div>
      )}
      <div className="recetas">
        <h2 className="recetas-title">{title}</h2>
        <div className="recetas-list">
          {recetas.length === 0 ? (
            <div className="recetas-empty" role="status">
              <span className="recetas-empty-icon" aria-hidden="true">
                ✦
              </span>
              <h3>
                {rol === "paciente"
                  ? "Aún no tienes recetas"
                  : "Todo está al día"}
              </h3>
              <p>
                {rol === "paciente"
                  ? "Cuando tengas una receta disponible, aparecerá aquí."
                  : "No hay recetas pendientes para revisar en este momento."}
              </p>
            </div>
          ) : (
            recetas.map((e, index) => (
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
                      {e.receta.fecha}
                    </p>
                  ) : (
                    <p className="receta-details">{e.receta.fecha}</p>
                  )}

                  <div className="receta-actions">
                    <Badge />
                    <button
                      className="receta-action receta-action-secondary"
                      type="button"
                      onClick={() => handleViewImage(e.image)}
                    >
                      {!selectedImage ? "Ver receta" : "Cerrar vista"}
                    </button>
                    <button
                      className="receta-action receta-action-secondary"
                      type="button"
                      onClick={() => handleDownload(e.image)}
                    >
                      Descargar imagen
                    </button>
                    {rol !== "paciente" && (
                      <button
                        className="receta-action receta-action-primary"
                        type="button"
                      >
                        Aprobar transcriptcion
                      </button>
                    )}
                  </div>

                  {selectedImage === e.image && e.image?.filepath && (
                    <div className="receta-image">
                      <img
                        src={`${API_BASE_URL}${e.image.filepath}`}
                        alt={`Receta ${e.receta.nombre}`}
                      />
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Recetas;
