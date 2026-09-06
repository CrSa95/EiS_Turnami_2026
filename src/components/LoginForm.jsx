import BrandMark from './BrandMark'

function LoginForm({ role, dni, password, isSubmitting, onRoleChange, onDniChange, onPasswordChange, onSubmit }) {
  const isPatient = role === 'patient'

  return (
    <section className="form-panel" aria-labelledby="login-title">
      <div className="form-wrap">
        <div className="mobile-brand"><BrandMark /></div>
        <div className="heading-block"><p className="eyebrow">BIENVENIDO/A</p><h2 id="login-title">Ingresá a tu cuenta</h2><p>Elegí cómo querés ingresar a Turnami.</p></div>
        <div className="role-switch" aria-label="Seleccioná tu rol">
          <button type="button" className={isPatient ? 'active' : ''} onClick={() => onRoleChange('patient')}><span className="role-icon">👤</span> Paciente</button>
          <button type="button" className={!isPatient ? 'active' : ''} onClick={() => onRoleChange('doctor')}><span className="role-icon doctor-icon">🩺</span> Profesional</button>
        </div>
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="document">DNI</label>
          <div className="input-shell"><span aria-hidden="true">#</span><input id="document" value={dni} onChange={onDniChange} inputMode="numeric" autoComplete="username" placeholder="Ingresá tu DNI" aria-describedby="dni-help" /></div>
          <small id="dni-help">Ingresá los 8 números de tu documento.</small>
          <div className="input-shell"><span aria-hidden="true">*</span><input id="password" type="password" value={password} onChange={onPasswordChange} autoComplete="current-password" placeholder="Ingresá tu contraseña" /></div>
          <button className="submit-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Ingresando...' : `Ingresar como ${isPatient ? 'paciente' : 'profesional'}`} <span aria-hidden="true">→</span></button>
        </form>
      </div>
    </section>
  )
}

export default LoginForm