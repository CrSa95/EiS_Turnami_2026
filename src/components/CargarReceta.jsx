import { useRef, useState } from 'react'
import '../styles/cargarReceta.css'

function CargarReceta() {
    const [tab, setTab] = useState('receta')
    const [uploaded, setUploaded] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [fileName, setFileName] = useState('')
    const fileInputRef = useRef(null)

    const cfg = tab === 'receta'
        ? { accent: '#2563EB', bg: '#EFF6FF' }
        : { accent: '#D97706', bg: '#FFFBEB' }

    const handleUpload = () => fileInputRef.current?.click()

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        setFileName(file.name)
        window.setTimeout(() => {
            setUploading(false)
            setUploaded(true)
        }, 500)
    }

    return (
        <section className="cargar-receta">
             <h2 className="recetas-title">Cargar receta</h2>

            <label className="upload-label" htmlFor="receta-file">Sube únicamente una foto de tu documento (formato JPG o PNG). No se aceptan archivos PDF ni documentos de texto.</label>
            <input
                ref={fileInputRef}
                id="receta-file"
                className="upload-input"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
            />
            <div
                className={`upload-zone ${uploaded ? 'is-uploaded' : ''}`}
                onClick={handleUpload}
                style={{ '--upload-accent': cfg.accent, '--upload-bg': cfg.bg }}
                role="button"
                tabIndex="0"
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') handleUpload()
                }}
            >
                {uploading ? (
                    <div className="upload-state">
                        <div className="upload-spinner" />
                        <p className="upload-message">Subiendo...</p>
                    </div>
                ) : uploaded ? (
                    <div className="upload-state">
                        <span className="upload-icon" aria-hidden="true">✅</span>
                        <p className="upload-message upload-message-accent">Archivo cargado</p>
                        <p className="upload-file-name">{fileName}</p>
                    </div>
                ) : (
                    <div className="upload-state">
                        <span className="upload-icon" aria-hidden="true">📸</span>
                        <p className="upload-message upload-message-dark">Hacé clic para subir imagen</p>
                        <p className="upload-file-name">JPG, PNG — máx. 5MB</p>
                    </div>
                )}
            </div>

            <button
                className="issue-button"
                style={{ backgroundColor: cfg.accent }}
                type="button"
            >
                Enviar Receta
            </button>
        </section>
    )
}

export default CargarReceta;