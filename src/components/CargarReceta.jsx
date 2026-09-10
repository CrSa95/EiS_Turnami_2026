import { useRef, useState } from 'react'
import '../styles/cargarReceta.css'

function CargarReceta({handleImage}) {
    const [uploaded, setUploaded] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [file, setFile] = useState(null)
    const fileInputRef = useRef(null)

    const handleUpload = () => fileInputRef.current?.click()

    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        setUploading(true)
        setFile(file)
        window.setTimeout(() => {
            setUploading(false)
            setUploaded(true)
        }, 500)
    }

    return (
        <section className="cargar-receta">
             <h2 className="recetas-title">Cargá tu receta</h2>

            <label className="upload-label" htmlFor="receta-file">Sube únicamente una foto de tu documento (formato JPG, JPEG o PNG). No se aceptan archivos PDF ni documentos de texto.</label>
            <input
                ref={fileInputRef}
                id="receta-file"
                className="upload-input"
                type="file"
                onChange={handleFileChange}
                accept=".jpg, .jpeg, .png"
            />
            <div
                className={`upload-zone ${uploaded ? 'is-uploaded' : ''}`}
                onClick={handleUpload}
                style={{ '--upload-accent':  '#2563EB', '--upload-bg':  '#EFF6FF' }}
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
                        <p className="upload-file-name">{file.name}</p>
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
                style={{ backgroundColor: '#2563EB' }}
                type="button"
                onClick={() => {handleImage(file)}}
            >
                Enviar Receta
            </button>
        </section>
    )
}

export default CargarReceta;