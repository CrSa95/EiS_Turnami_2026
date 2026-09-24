import "../styles/tabView.css";

function TabView({ color = "#2563EB", tabs, tab, setTab }) {
  return (
    <div
      className="tab-container"
      role="tablist"
      aria-label="Secciones de tu cuenta"
    >
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          id={`${item.key}`}
          role="tab"
          aria-selected={tab === item.key}
          tabIndex={tab === item.key ? 0 : -1}
          onClick={() => setTab(item.key)}
          onKeyDown={() => setTab(item.key)}
          className={`tab-button ${tab === item.key ? "tab-button-active" : ""}`}
          style={{
            "--tab-accent": color,
          }}
        >
          <span className="tab-button-dot" aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default TabView;
