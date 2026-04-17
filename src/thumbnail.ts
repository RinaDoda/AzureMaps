export function generateThumbnail(title: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, 720);
  bg.addColorStop(0, '#020818');
  bg.addColorStop(0.5, '#080D1A');
  bg.addColorStop(1, '#0D1B3E');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1280, 720);

  // Stars
  const rng = (seed: number) => ((seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 180; i++) {
    const x = rng(i * 3) * 1280;
    const y = rng(i * 3 + 1) * 720;
    const r = rng(i * 3 + 2) * 2 + 0.5;
    const alpha = rng(i * 7) * 0.7 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,240,${alpha})`;
    ctx.fill();
  }

  // Moon
  ctx.beginPath();
  ctx.arc(1100, 130, 80, 0, Math.PI * 2);
  const moonGrad = ctx.createRadialGradient(1090, 120, 10, 1100, 130, 80);
  moonGrad.addColorStop(0, '#FFF9D0');
  moonGrad.addColorStop(0.7, '#F4D03F');
  moonGrad.addColorStop(1, '#E6A817');
  ctx.fillStyle = moonGrad;
  ctx.fill();
  // Moon crescent cutout
  ctx.beginPath();
  ctx.arc(1140, 110, 65, 0, Math.PI * 2);
  ctx.fillStyle = '#030A18';
  ctx.fill();

  // Bottom glow
  const glow = ctx.createLinearGradient(0, 460, 0, 720);
  glow.addColorStop(0, 'rgba(244,185,66,0)');
  glow.addColorStop(1, 'rgba(244,185,66,0.08)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 460, 1280, 260);

  // Title text — word-wrap
  const lines = wrapText(ctx, title.toUpperCase(), 980, 72);
  const lineHeight = 90;
  const totalH = lines.length * lineHeight;
  const startY = (720 - totalH) / 2 + 30;

  ctx.textAlign = 'center';

  // Shadow / glow layers
  for (const [i, line] of lines.entries()) {
    const y = startY + i * lineHeight;
    ctx.shadowColor = '#F4B942';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#F4B942';
    ctx.font = 'bold 72px "Playfair Display", Georgia, serif';
    ctx.fillText(line, 640, y);
  }

  // White sharp text on top
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  for (const [i, line] of lines.entries()) {
    const y = startY + i * lineHeight;
    ctx.fillText(line, 640, y);
  }

  // Subtitle
  ctx.font = '32px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,220,120,0.85)';
  ctx.shadowColor = 'transparent';
  ctx.fillText('✨ A Bedtime Story ✨', 640, startY + lines.length * lineHeight + 30);

  return canvas.toDataURL('image/jpeg', 0.95);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  ctx.font = `bold ${fontSize}px "Playfair Display", Georgia, serif`;
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
