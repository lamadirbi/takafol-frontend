'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { clampOffset, cropToBlob, imageDrawBox } from '@/lib/cropImage';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const OUTPUT_SIZE = 768;

function outputMime(file) {
  return file?.type === 'image/jpeg' || file?.type === 'image/jpg' ? 'image/jpeg' : 'image/png';
}

function outputName(file) {
  return outputMime(file) === 'image/jpeg' ? 'camp-logo.jpg' : 'camp-logo.png';
}

export default function LogoCropModal({ file, open, onClose, onConfirm, confirming = false }) {
  const viewportRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const stateRef = useRef({ zoom: 1, natural: { w: 0, h: 0 }, view: { w: 280, h: 280 } });
  const [src, setSrc] = useState('');
  const [viewportEl, setViewportEl] = useState(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [view, setView] = useState({ w: 280, h: 280 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [aspect, setAspect] = useState('square');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const attachViewport = useCallback((node) => {
    viewportRef.current = node;
    setViewportEl(node);
  }, []);

  stateRef.current = { zoom, natural, view };

  useEffect(() => {
    if (!file || !open) {
      setSrc('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setAspect('square');
    setError('');
    setNatural({ w: 0, h: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file, open]);

  useEffect(() => {
    if (!viewportEl) return undefined;

    const measure = () => {
      const w = Math.max(1, viewportEl.clientWidth);
      const h = Math.max(1, viewportEl.clientHeight);
      setView((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewportEl);

    const onWheel = (event) => {
      event.preventDefault();
      const current = stateRef.current;
      const z = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, current.zoom + (event.deltaY > 0 ? -0.12 : 0.12))
      );
      setZoom(z);
      setOffset((prev) =>
        clampOffset(prev, current.natural.w, current.natural.h, current.view.w, current.view.h, z)
      );
    };
    viewportEl.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      ro.disconnect();
      viewportEl.removeEventListener('wheel', onWheel);
    };
  }, [viewportEl, aspect]);

  const applyOffset = useCallback(
    (next) => {
      setOffset(clampOffset(next, natural.w, natural.h, view.w, view.h, zoom));
    },
    [natural.h, natural.w, view.h, view.w, zoom]
  );

  function onImageLoad(e) {
    const image = e.currentTarget;
    setNatural({ w: image.naturalWidth, h: image.naturalHeight });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function changeZoom(nextZoom) {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    setZoom(z);
    setOffset((prev) => clampOffset(prev, natural.w, natural.h, view.w, view.h, z));
  }

  function onPointerDown(e) {
    if (!imgRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  }

  function onPointerMove(e) {
    if (!dragRef.current) return;
    applyOffset({
      x: dragRef.current.ox + (e.clientX - dragRef.current.x),
      y: dragRef.current.oy + (e.clientY - dragRef.current.y),
    });
  }

  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  async function save() {
    const image = imgRef.current;
    const viewport = viewportRef.current;
    if (!image || !viewport || !file) return;
    setError('');
    try {
      const blob = await cropToBlob(image, {
        offset,
        zoom,
        viewWidth: viewport.clientWidth,
        viewHeight: viewport.clientHeight,
        outputWidth: OUTPUT_SIZE,
        mime: outputMime(file),
      });
      const cropped = new File([blob], outputName(file), { type: blob.type });
      await onConfirm(cropped);
    } catch {
      setError('تعذر قص الصورة. جرّب صورة ثانية.');
    }
  }

  function handleClose() {
    if (!confirming) onClose?.();
  }

  const box = imageDrawBox(natural.w, natural.h, view.w, view.h, zoom, offset);
  const previewScale = 48 / (view.w || 48);

  return (
    <Modal open={open} title="قص الشعار" onClose={handleClose} centered>
      <p className="text-sm text-muted-foreground">كبّر أو صغّر الصورة، واسحبها حتى تبين بالمكان المناسب، بعدين احفظ.</p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={confirming}
          onClick={() => {
            setAspect('square');
            setOffset({ x: 0, y: 0 });
          }}
          className={`min-h-11 flex-1 rounded-[var(--radius-control)] text-sm font-medium ${
            aspect === 'square' ? 'bg-primary text-white' : 'bg-[#E4E6EB] text-foreground'
          }`}
        >
          مربع
        </button>
        <button
          type="button"
          disabled={confirming}
          onClick={() => {
            setAspect('wide');
            setOffset({ x: 0, y: 0 });
          }}
          className={`min-h-11 flex-1 rounded-[var(--radius-control)] text-sm font-medium ${
            aspect === 'wide' ? 'bg-primary text-white' : 'bg-[#E4E6EB] text-foreground'
          }`}
        >
          مستطيل
        </button>
      </div>

      <div
        ref={attachViewport}
        className={`relative mt-3 w-full touch-none overflow-hidden rounded-xl bg-[#111] ${
          aspect === 'wide' ? 'aspect-[3/1]' : 'aspect-square'
        } ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={onImageLoad}
            className="absolute max-w-none select-none"
            style={{
              width: box.width,
              height: box.height,
              left: box.left,
              top: box.top,
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-white/70 ring-inset" />
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>أصغر</span>
          <span className="font-medium text-foreground">الحجم</span>
          <span>أكبر</span>
        </div>
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          disabled={confirming || !natural.w}
          onChange={(e) => changeZoom(Number(e.target.value))}
          className="h-11 w-full accent-primary"
          aria-label="حجم الشعار"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div
          className={`relative shrink-0 overflow-hidden border border-black/10 bg-white ${
            aspect === 'wide' ? 'h-8 w-12 rounded-md' : 'h-12 w-12 rounded-full'
          }`}
        >
          {src && view.w ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              className="absolute max-w-none"
              style={{
                width: box.width * previewScale,
                height: box.height * previewScale,
                left: box.left * previewScale,
                top: box.top * previewScale,
              }}
            />
          ) : null}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          هيك رح يبين الشعار تقريباً في شريط الموقع. الشكل المربع أنسب للدائرة، والمستطيل للشعار العريض.
        </p>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
        <Button className="w-full sm:w-auto" loading={confirming} disabled={!natural.w} onClick={save}>
          حفظ الشعار
        </Button>
        <Button className="w-full sm:w-auto" variant="outline" disabled={confirming} onClick={handleClose}>
          إلغاء
        </Button>
      </div>
    </Modal>
  );
}
