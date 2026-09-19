import { useEffect, useRef, useState } from "react";
import "../styles/recetaImageModal.css";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
// Cantidad minima de imagen (en px) que queda visible dentro del modal, para no arrastrar completamente afuera.
const MIN_VISIBLE = 60;

function RecetaImageModal({ src, alt, onClose }) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, originX: 0, originY: 0 });
  const viewportRef = useRef(null);
  const imgRef = useRef(null);
  const backdropMouseDownRef = useRef(false);

  const clampOffset = (x, y, currentZoom = zoom, currentRotation = rotation) => {
    const viewport = viewportRef.current;
    const img = imgRef.current;
    if (!viewport || !img) return { x, y };

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    let w = img.offsetWidth;
    let h = img.offsetHeight;
    if (currentRotation === 90 || currentRotation === 270) {
      [w, h] = [h, w];
    }
    const scaledW = w * currentZoom;
    const scaledH = h * currentZoom;
    const maxX = Math.max(0, vw / 2 + scaledW / 2 - MIN_VISIBLE);
    const maxY = Math.max(0, vh / 2 + scaledH / 2 - MIN_VISIBLE);

    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    };
  };

  useEffect(() => {
    setOffset((current) => clampOffset(current.x, current.y));
  }, [zoom, rotation]);

  const rotateCW = () => setRotation((r) => (r + 90) % 360);
  const rotateCCW = () => setRotation((r) => (r - 90 + 360) % 360);
  const zoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  const zoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM));
  const reset = () => {
    setRotation(0);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (event) => {
    if (!isDragging) return;
    const { startX, startY, originX, originY } = dragRef.current;
    setOffset(
      clampOffset(
        originX + (event.clientX - startX),
        originY + (event.clientY - startY),
      ),
    );
  };

  const stopDragging = () => setIsDragging(false);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [isDragging]);

  const handleBackdropMouseDown = (event) => {
    backdropMouseDownRef.current = event.target === event.currentTarget;
  };

  const handleBackdropMouseUp = (event) => {
    if (backdropMouseDownRef.current && event.target === event.currentTarget) {
      onClose();
    }
    backdropMouseDownRef.current = false;
  };

  return (
    <div
      className="receta-image-modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
      onMouseUp={handleBackdropMouseUp}
    >
      <section className="receta-image-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="receta-image-modal-close"
          aria-label="Cerrar vista previa"
          onClick={onClose}
        >
          ✕
        </button>

        <div
          className={`receta-image-modal-viewport${isDragging ? " dragging" : ""}`}
          ref={viewportRef}
          onMouseDown={handleMouseDown}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            draggable={false}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
            }}
          />
        </div>

        <div className="receta-image-modal-controls">
          <button type="button" onClick={rotateCCW} aria-label="Girar 90° antihorario">
            ⟲
          </button>
          <button type="button" onClick={rotateCW} aria-label="Girar 90° horario">
            ⟳
          </button>
          <button type="button" onClick={zoomOut} aria-label="Alejar imagen">
            −
          </button>
          <button type="button" onClick={zoomIn} aria-label="Acercar imagen">
            +
          </button>
          <button type="button" onClick={reset} aria-label="Restablecer imagen">
            ⟳ Normal
          </button>
        </div>
      </section>
    </div>
  );
}

export default RecetaImageModal;

