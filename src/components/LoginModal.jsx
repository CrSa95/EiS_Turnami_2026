function LoginModal({ modal, onClose }) {
  if (!modal) return null

  const title = modal.type === 'success' ? 'Ingreso confirmado' : modal.type === 'info' ? 'Próximamente' : 'No pudimos continuar'

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal ${modal.type}`} role="dialog" aria-modal="true" aria-labelledby="modal-message" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-symbol" aria-hidden="true">{modal.type === 'success' ? '✓' : '!'}</div>
        <h3>{title}</h3>
        <p id="modal-message">{modal.message}</p>
        <button type="button" onClick={onClose}>Entendido</button>
      </section>
    </div>
  )
}

export default LoginModal