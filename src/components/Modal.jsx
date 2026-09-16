import '../styles/modal.css'

const statusContent = {
	Cargando: { title: 'Cargando', symbol: '' },
	Ok: { title: 'Operación completada', symbol: '✓' },
	Fallo: { title: 'Ocurrió un error', symbol: '!' },
}

function Modal({ status, message, children, onClose }) {
	const content = statusContent[status]

	if (!content) return null

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
				<h2 id="status-modal-title">{content.title}</h2>
				{(message || children) && <p>{children || message}</p>}
				{onClose && status !== 'Cargando' && (
					<button type="button" onClick={onClose}>Cerrar</button>
				)}
			</section>
		</div>
	)
}
export default Modal