import { useRef, useState } from "react";
import "../styles/cargarReceta.css";

function CargarReceta({ handleUploadImage, type }) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_FILE_TYPES = new Set(["image/jpeg", "image/jpg"]);
  
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["jpg", "jpeg"];

    if (
      !fileExtension ||
      !allowedExtensions.includes(fileExtension) ||
      !ALLOWED_FILE_TYPES.has(file.type)
    ) {
      setError("Formato de imagen ilegible, por favor suba una imagen en formato jpg");
      setFile(null);
      setUploaded(false);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen no puede superar los 5 MB.");
      setFile(null);
      setUploaded(false);
      event.target.value = "";
      return;
    }

    setError("");
    setUploading(true);
    setFile(file);
    window.setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 500);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError(`Debe cargar la imagen de la ${type.toLowerCase()} antes de intentar subirla.`);
      return;
    }

    setError("");

    const uploadedSuccessfully = await handleUploadImage(file, type);
    if (!uploadedSuccessfully) return;

    setFile(null);
    setUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="cargar-receta">
      <h2 className="recetas-title">Cargá tu {type}</h2>

      <label className="upload-label" htmlFor="receta-file">
        Sube únicamente una foto de tu documento (formato JPG o JPEG). No
        se aceptan archivos PNG, PDF ni documentos de texto.
      </label>
      {error && <p className="upload-error">{error}</p>}
    
      <input
        ref={fileInputRef}
        id="receta-file"
        className="upload-input"
        type="file"
        onChange={handleFileChange}
        accept=".jpg, .jpeg, .png, image/jpeg, image/png"
      />

      <div
        className={`upload-zone ${uploaded ? "is-uploaded" : ""}`}
        onClick={handleUpload}
        style={{ "--upload-accent": "#2563EB", "--upload-bg": "#EFF6FF" }}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") handleUpload();
        }}
      >
        {uploading ? (
          <div className="upload-state">
            <div className="upload-spinner" />
            <p className="upload-message">Subiendo...</p>
          </div>
        ) : uploaded ? (
          <div className="upload-state">
            <span className="upload-icon" aria-hidden="true">
              ✅
            </span>
            <p className="upload-message upload-message-accent">
              Archivo cargado
            </p>
            <p className="upload-file-name">{file.name}</p>
          </div>
        ) : (
          <div className="upload-state">
            <span className="upload-icon" aria-hidden="true">
              📸
            </span>
            <p className="upload-message upload-message-dark">
              Hacé clic para subir imagen
            </p>
            <p className="upload-file-name">JPEG, JPG — máx. 5MB</p>
          </div>
        )}
      </div>

      <button
        className="issue-button"
        style={{ backgroundColor: file ? "#2563EB" : "#4977dbde" }}
        type="button"
        onClick={handleSubmit}
      >
        Enviar {type}
      </button>
    </section>
  );
}

export default CargarReceta;