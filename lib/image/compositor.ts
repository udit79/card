const COLORS = {
  green: "#0B6839",
  yellow: "#FEE101",
  pink: "#FF0080",
  cream: "#FFFBE8",
  white: "#FFFFFF",
  black: "#000000",
};

const FRAME_ASSETS: Record<string, string> = {
  SIGNAL: "Signal.png",
  "ON-CHAIN": "ON-CHAIN.png",
  "COASTAL CIRCUIT": "Coastal Circuit.png",
};

const FRAME_BADGES: Record<string, string> = {
  SIGNAL: "Signal_com.png",
  "ON-CHAIN": "ON-CHAIN_com.png",
  "COASTAL CIRCUIT": "COASTAL_CIRCUIT_com.png",
};

type PhotoAdjustments = {
  zoom: number;
  offsetX: number;
  offsetY: number;
};

export async function drawIdCard(
  canvas: HTMLCanvasElement,
  photoUrl: string,
  name: string,
  roles: string[],
  title: string,
  frameStyle: string,
  logoUrl: string,
  adjustments: PhotoAdjustments = { zoom: 1, offsetX: 0, offsetY: 0 },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = 1080;
  const height = 1350;
  const margin = 60;
  const panelW = width - margin * 2;
  const panelH = height - margin * 2;
  const contentX = margin + 60;
  const contentRight = width - margin - 60;
  const contentW = contentRight - contentX;

  canvas.width = width;
  canvas.height = height;

  const [photo, logo, frameImage, badgeImage] = await Promise.all([
    loadImage(photoUrl),
    loadImage(logoUrl),
    loadImage(`/frames/${encodeURIComponent(FRAME_ASSETS[frameStyle] ?? "Signal.png")}`),
    loadImage(`/frames/badges/${encodeURIComponent(FRAME_BADGES[frameStyle] ?? "Signal_com.png")}`),
  ]);

  // Base canvas and offset card plate.
  ctx.fillStyle = COLORS.green;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(margin + 18, margin + 18, panelW, panelH);
  ctx.strokeStyle = COLORS.black;
  ctx.lineWidth = 4;
  ctx.strokeRect(margin + 18, margin + 18, panelW, panelH);
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(margin, margin, panelW, panelH);
  ctx.strokeStyle = COLORS.black;
  ctx.strokeRect(margin, margin, panelW, panelH);

  // Header: short, event-specific, and deliberately compact.
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = COLORS.green;
  ctx.font = '700 62px "Imbue", serif';
  ctx.fillText("BUILDER ID", contentX, margin + 48);
  ctx.fillStyle = COLORS.green;
  ctx.font = '700 22px "Victor Mono", monospace';
  const eventLabel = "HH GOA 2026";
  ctx.fillText(eventLabel, contentRight - ctx.measureText(eventLabel).width, margin + 44);
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(contentX, margin + 140, contentW, 8);

  // The portrait is an accent, not the whole card. Keep a quiet breathing gap
  // between the circle and the identity column so long names/roles never collide.
  const photoSize = 340;
  const photoX = contentX + 18;
  const photoY = margin + 238;
  const photoCenterX = photoX + photoSize / 2;
  const photoCenterY = photoY + photoSize / 2;
  const outerRadius = photoSize / 2 + 24;

  ctx.fillStyle = COLORS.green;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, outerRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2);
  ctx.clip();
  drawCoverPhoto(ctx, photo, photoX, photoY, photoSize, photoSize, adjustments);
  ctx.restore();

  ctx.strokeStyle = COLORS.cream;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(photoCenterX, photoCenterY, photoSize / 2, 0, Math.PI * 2);
  ctx.stroke();

  drawFrameAsset(ctx, frameImage, photoCenterX, photoCenterY, photoSize);

  // Identity block sits on the right of the portrait.
  const detailsX = 600;
  const detailsW = contentRight - detailsX;
  drawLabel(ctx, "NAME", detailsX, margin + 292);
  drawFittedText(ctx, name.trim().toUpperCase() || "BUILDER", detailsX, margin + 322, {
    family: '"Imbue", serif',
    weight: 800,
    maxSize: 66,
    minSize: 32,
    maxWidth: detailsW,
  });

  drawLabel(ctx, "STACK / ROLE", detailsX, margin + 438);
  drawRoleTags(ctx, roles, detailsX, margin + 470, detailsW);

  if (title.trim()) {
    drawLabel(ctx, "BUILDER CLASS", detailsX, margin + 650);
    const titleFont = fitFont(ctx, title.toUpperCase(), '700 22px "Victor Mono", monospace', detailsW - 32, 15);
    const titleText = truncateToWidth(ctx, title.toUpperCase(), titleFont, detailsW - 32);
    ctx.font = titleFont;
    const chipW = Math.min(detailsW, ctx.measureText(titleText).width + 32);
    const chipH = 58;
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(detailsX, margin + 682, chipW, chipH);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(detailsX, margin + 682, chipW, chipH);
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(titleText, detailsX + 16, margin + 682 + chipH / 2);
  }

  // The left lower quadrant is intentionally open and keeps the badge away
  // from the logo and footer lockup on the right.
  drawBadgeAsset(ctx, badgeImage, contentX - 2, 760, 260);

  // Use the lower breathing room as an intentional HH Goa rubber-stamp area.
  if (title.trim()) {
    drawBuilderStamp(
      ctx,
      logo,
      name.trim().toUpperCase() || "BUILDER",
      title.toUpperCase(),
      contentX + contentW / 2,
      972,
    );
  }

  // Footer lockup.
  const footerY = height - margin - 92;
  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(contentX, footerY - 22, contentW, 6);
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = COLORS.green;
  ctx.font = '700 22px "Victor Mono", monospace';
  ctx.fillText("HHGOA.COM", contentX, height - margin - 36);
  ctx.fillStyle = COLORS.pink;
  const hashtag = "#FRAMEINGOA";
  ctx.fillText(hashtag, contentRight - ctx.measureText(hashtag).width, height - margin - 36);

  const logoMaxW = 150;
  const logoRatio = logo.width / logo.height;
  const logoW = logoMaxW;
  const logoH = logoMaxW / logoRatio;
  ctx.drawImage(logo, contentRight - logoW, footerY - logoH - 34, logoW, logoH);
}

function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.fillStyle = COLORS.pink;
  ctx.font = '700 16px "Victor Mono", monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text, x, y);
}

function drawBadgeAsset(
  ctx: CanvasRenderingContext2D,
  badgeImage: HTMLImageElement,
  x: number,
  y: number,
  size: number,
) {
  const ratio = badgeImage.width / badgeImage.height;
  const width = ratio >= 1 ? size : size * ratio;
  const height = ratio >= 1 ? size / ratio : size;
  ctx.save();
  ctx.globalAlpha = 0.96;
  ctx.drawImage(badgeImage, x + (size - width) / 2, y + (size - height) / 2, width, height);
  ctx.restore();
}

function drawRoleTags(ctx: CanvasRenderingContext2D, roles: string[], x: number, y: number, maxWidth: number) {
  const items = roles.length ? roles.slice(0, 5) : ["ATTENDEE"];
  if (roles.length > 5) items.push(`+${roles.length - 5}`);
  let cursorX = x;
  let cursorY = y;
  const tagH = 40;
  const gap = 8;
  items.forEach((role, index) => {
    ctx.font = '700 17px "Victor Mono", monospace';
    const label = truncateToWidth(ctx, role.toUpperCase(), ctx.font, maxWidth - 24);
    const tagW = Math.min(maxWidth, Math.max(74, ctx.measureText(label).width + 24));
    if (cursorX !== x && cursorX + tagW > x + maxWidth) {
      cursorX = x;
      cursorY += tagH + gap;
    }
    const fills = [COLORS.green, COLORS.yellow, COLORS.pink];
    const textColors = [COLORS.cream, COLORS.black, COLORS.white];
    ctx.fillStyle = fills[index % fills.length];
    ctx.fillRect(cursorX, cursorY, tagW, tagH);
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.strokeRect(cursorX, cursorY, tagW, tagH);
    ctx.fillStyle = textColors[index % textColors.length];
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cursorX + 12, cursorY + tagH / 2 + 1);
    cursorX += tagW + gap;
  });
}

function drawBuilderStamp(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  name: string,
  title: string,
  centerX: number,
  centerY: number,
) {
  const width = 350;
  const height = 158;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-0.055);
  ctx.globalAlpha = 0.96;

  ctx.fillStyle = COLORS.yellow;
  ctx.fillRect(-width / 2 + 16, -height / 2 + 16, width, height);
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.strokeStyle = COLORS.pink;
  ctx.lineWidth = 7;
  ctx.setLineDash([14, 9]);
  ctx.strokeRect(-width / 2, -height / 2, width, height);
  ctx.setLineDash([]);
  ctx.strokeStyle = COLORS.green;
  ctx.lineWidth = 3;
  ctx.strokeRect(-width / 2 + 12, -height / 2 + 12, width - 24, height - 24);

  const logoSize = 86;
  ctx.drawImage(logo, -width / 2 + 26, -height / 2 + 36, logoSize, logoSize);
  const textX = -width / 2 + 132;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = COLORS.pink;
  ctx.font = '700 15px "Victor Mono", monospace';
  ctx.fillText("HACKER HOUSE GOA", textX, -height / 2 + 24);
  ctx.fillStyle = COLORS.green;
  drawFittedText(ctx, name, textX, -height / 2 + 46, {
    family: '"Imbue", serif',
    weight: 800,
    maxSize: 44,
    minSize: 22,
    maxWidth: width - 154,
  });
  ctx.fillStyle = COLORS.black;
  const stampTitleMaxWidth = width - 154;
  const stampTitleFont = fitFont(ctx, title || "BUILDER", '700 15px "Victor Mono", monospace', stampTitleMaxWidth, 10);
  ctx.font = stampTitleFont;
  ctx.textBaseline = "top";
  ctx.fillText(truncateToWidth(ctx, title || "BUILDER", stampTitleFont, stampTitleMaxWidth), textX, -height / 2 + 102);
  const stampFooter = "HH GOA 2026";
  const stampFooterFont = fitFont(ctx, stampFooter, '700 13px "Victor Mono", monospace', stampTitleMaxWidth, 10);
  ctx.font = stampFooterFont;
  ctx.fillText(stampFooter, textX, -height / 2 + 122);
  ctx.restore();
}

function drawFrameAsset(
  ctx: CanvasRenderingContext2D,
  frameImage: HTMLImageElement,
  centerX: number,
  centerY: number,
  photoSize: number,
) {
  // Preserve the source artwork's aspect ratio. The supplied frames are
  // landscape compositions with a circular opening; forcing them into a
  // square distorts the artwork and makes it cover too much of the card.
  const frameWidth = photoSize * 2.05;
  const frameHeight = frameWidth * (frameImage.height / frameImage.width);
  const frameX = centerX - frameWidth / 2;
  const frameY = centerY - frameHeight / 2;

  // These supplied PNGs are RGBA overlays with their own transparent photo
  // opening. Draw the original artwork directly above the portrait so every
  // rim, wave, node, and decorative detail stays in front of the image.
  ctx.drawImage(frameImage, frameX, frameY, frameWidth, frameHeight);
}

function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  adjustments: PhotoAdjustments,
) {
  const imageRatio = photo.width / photo.height;
  const targetRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let drawX = x;
  let drawY = y;

  const zoom = Math.max(1, adjustments.zoom);
  if (imageRatio > targetRatio) {
    drawWidth = height * imageRatio * zoom;
    drawHeight = height * zoom;
    drawX = x - (drawWidth - width) / 2 + adjustments.offsetX * (drawWidth - width) / 2;
    drawY = y - (drawHeight - height) / 2 + adjustments.offsetY * (drawHeight - height) / 2;
  } else {
    drawWidth = width * zoom;
    drawHeight = width / imageRatio * zoom;
    drawX = x - (drawWidth - width) / 2 + adjustments.offsetX * (drawWidth - width) / 2;
    drawY = y - (drawHeight - height) / 2 + adjustments.offsetY * (drawHeight - height) / 2;
  }

  ctx.drawImage(photo, drawX, drawY, drawWidth, drawHeight);
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: { family: string; weight: number; maxSize: number; minSize: number; maxWidth: number },
) {
  let size = options.maxSize;
  while (size > options.minSize) {
    ctx.font = `${options.weight} ${size}px ${options.family}`;
    if (ctx.measureText(text).width <= options.maxWidth) break;
    size -= 2;
  }
  ctx.fillStyle = COLORS.black;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(truncateToWidth(ctx, text, ctx.font, options.maxWidth), x, y);
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, font: string, maxWidth: number, minSize: number) {
  const match = font.match(/^(.*?)(\d+)px(.*)$/);
  if (!match) return font;
  const prefix = match[1];
  let size = Number(match[2]);
  const suffix = match[3];
  while (size > minSize) {
    ctx.font = `${prefix}${size}px${suffix}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return `${prefix}${size}px${suffix}`;
}

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, font: string, maxWidth: number) {
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let output = text;
  while (output.length > 1 && ctx.measureText(`${output}…`).width > maxWidth) output = output.slice(0, -1);
  return `${output.trimEnd()}…`;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}
