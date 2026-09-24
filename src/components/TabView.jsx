import { useId, useState } from "react";
import "../styles/tabView.css";

function TabView({ color = "#2563EB", tabs, tab, setTab }) {
  const tabListId = useId();

  const selectTab = (key) => {
    setTab(key);
  };

  const handleKeyDown = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    selectTab(tabs[nextIndex].key);
    document.getElementById(`${tabListId}-${tabs[nextIndex].key}`)?.focus();
  };

  return (
    <div
      className="tab-container"
      role="tablist"
      aria-label="Secciones de tu cuenta"
    >
      {tabs.map((item, index) => (
        <button
          key={item.key}
          type="button"
          id={`${tabListId}-${item.key}`}
          role="tab"
          aria-selected={tab === item.key}
          tabIndex={tab === item.key ? 0 : -1}
          onClick={() => selectTab(item.key)}
          onKeyDown={(event) => handleKeyDown(event, index)}
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
