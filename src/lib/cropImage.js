export function coverScale(naturalWidth, naturalHeight, viewWidth, viewHeight) {
  if (!naturalWidth || !naturalHeight || !viewWidth || !viewHeight) return 1;
  return Math.max(viewWidth / naturalWidth, viewHeight / naturalHeight);
}

export function clampOffset(offset, naturalWidth, naturalHeight, viewWidth, viewHeight, zoom) {
  const scale = coverScale(naturalWidth, naturalHeight, viewWidth, viewHeight) * zoom;
  const drawW = naturalWidth * scale;
  const drawH = naturalHeight * scale;
  const maxX = Math.max(0, (drawW - viewWidth) / 2);
  const maxY = Math.max(0, (drawH - viewHeight) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, offset.x)),
    y: Math.min(maxY, Math.max(-maxY, offset.y)),
  };
}

export function imageDrawBox(naturalWidth, naturalHeight, viewWidth, viewHeight, zoom, offset) {
  const scale = coverScale(naturalWidth, naturalHeight, viewWidth, viewHeight) * zoom;
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    scale,
    width,
    height,
    left: (viewWidth - width) / 2 + offset.x,
    top: (viewHeight - height) / 2 + offset.y,
  };
}

export function cropToBlob(image, { offset, zoom, viewWidth, viewHeight, outputWidth, mime = 'image/png' }) {
  const box = imageDrawBox(
    image.naturalWidth,
    image.naturalHeight,
    viewWidth,
    viewHeight,
    zoom,
    offset
  );
  const sx = -box.left / box.scale;
  const sy = -box.top / box.scale;
  const sw = viewWidth / box.scale;
  const sh = viewHeight / box.scale;
  const outputHeight = Math.max(1, Math.round(outputWidth * (viewHeight / viewWidth)));

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('canvas'));
  }
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('blob'))), mime, 0.92);
  });
}
