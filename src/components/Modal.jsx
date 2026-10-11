import '../styles/modal.css'

const statusContent = {
    Cargando: { title: 'Cargando', symbol: '' },
    Ok: { title: 'Operación completada', symbol: '✓' },
    Fallo: { title: 'Ocurrió un error', symbol: '!' },
}

function Modal({ status, title, message, children, onClose, onRetry }) {
    const content = statusContent[status]

    if (!content) return null

    const displayTitle = title || content.title;

    return (
        <div className="status-modal-backdrop" role="presentation">
            <section
                className={`status-modal status-modal-${status.toLowerCase()}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="status-modal-title"
            >
                <div className="status-modal-symbol" aria-hidden="true">
                    {content.symbol || <span className="status-modal-spinner" />}
                </div>
                <h2 id="status-modal-title">{displayTitle}</h2>
                {(message || children) && <p>{children || message}</p>}
                
                <div className="status-modal-actions">
                    {onRetry && (
                        <button type="button" className="btn-retry" onClick={onRetry}>
                            Reintentar
                        </button>
                    )}
                    {onClose && status !== 'Cargando' && (
                        <button type="button" className="btn-close" onClick={onClose}>
                            Cerrar
                        </button>
                    )}
                </div>
            </section>
        </div>
    )
}
export default Modal