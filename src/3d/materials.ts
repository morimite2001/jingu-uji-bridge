import * as THREE from 'three';
import { SurfaceCondition } from '../types';

export interface BridgeMaterials {
  hinokiColumn: THREE.MeshStandardMaterial;
  hinokiRailing: THREE.MeshStandardMaterial;
  hinokiDeck: THREE.MeshStandardMaterial;
  hinokiSubstructure: THREE.MeshStandardMaterial;
  whiteProtectiveCoat: THREE.MeshStandardMaterial;
  giboshiBronze: THREE.MeshStandardMaterial;
  brassRivet: THREE.MeshStandardMaterial;
  verdigrisCopper: THREE.MeshStandardMaterial;
  blackIronHardware: THREE.MeshStandardMaterial;
  inomeBronzeIron: THREE.MeshStandardMaterial;
  graniteStaggeredPaving: THREE.MeshStandardMaterial;
  graniteBorderStone: THREE.MeshStandardMaterial;
  washedPaving: THREE.MeshStandardMaterial;
  gravelGround: THREE.MeshStandardMaterial;
  kikkoMasonry: THREE.MeshStandardMaterial;
  rightTrafficSign: THREE.MeshStandardMaterial[];
}

export function createProceduralMaterials(maxAnisotropy: number = 4): BridgeMaterials {
  // 1) Hinoki Timber (Color + Bump)
  const cColor = document.createElement('canvas');
  const cBump = document.createElement('canvas');
  cColor.width = cBump.width = 1024;
  cColor.height = cBump.height = 1024;
  const ctxC = cColor.getContext('2d')!;
  const ctxB = cBump.getContext('2d')!;

  ctxC.fillStyle = '#7e5f47';
  ctxC.fillRect(0, 0, 1024, 1024);
  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, 1024, 1024);

  // Grain lines & growth rings
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 1024;
    const w = 0.8 + Math.random() * 3.5;
    const tone = Math.random();
    if (tone < 0.45) {
      ctxC.fillStyle = '#5c422e';
      ctxB.fillStyle = '#606060';
    } else if (tone < 0.82) {
      ctxC.fillStyle = '#997355';
      ctxB.fillStyle = '#989898';
    } else {
      ctxC.fillStyle = '#636852'; // subtle lichen / aged timber hue
      ctxB.fillStyle = '#757575';
    }
    ctxC.globalAlpha = 0.12 + Math.random() * 0.18;
    ctxC.fillRect(x, 0, w, 1024);
    ctxB.globalAlpha = 0.20;
    ctxB.fillRect(x, 0, w, 1024);
  }

  // Micro fiber cracks (IMG_8757)
  ctxC.globalAlpha = 0.35;
  ctxB.globalAlpha = 0.55;
  ctxC.fillStyle = '#2d1e14';
  ctxB.fillStyle = '#202020';
  for (let i = 0; i < 45; i++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 800;
    const clen = 60 + Math.random() * 180;
    ctxC.fillRect(cx, cy, 1.2, clen);
    ctxB.fillRect(cx, cy, 1.8, clen);
  }

  const hinokiColorTex = new THREE.CanvasTexture(cColor);
  hinokiColorTex.colorSpace = THREE.SRGBColorSpace;
  hinokiColorTex.wrapS = hinokiColorTex.wrapT = THREE.RepeatWrapping;
  hinokiColorTex.anisotropy = maxAnisotropy;

  const hinokiBumpTex = new THREE.CanvasTexture(cBump);
  hinokiBumpTex.wrapS = hinokiBumpTex.wrapT = THREE.RepeatWrapping;

  // 2) Deck Planks with live knots (IMG_8759, 8764)
  const dCanvas = document.createElement('canvas');
  const dBumpCanvas = document.createElement('canvas');
  dCanvas.width = dBumpCanvas.width = 1024;
  dCanvas.height = dBumpCanvas.height = 256;
  const dCtx = dCanvas.getContext('2d')!;
  const dBumpCtx = dBumpCanvas.getContext('2d')!;

  dCtx.fillStyle = '#8c694e';
  dCtx.fillRect(0, 0, 1024, 256);
  dBumpCtx.fillStyle = '#808080';
  dBumpCtx.fillRect(0, 0, 1024, 256);

  for (let i = 0; i < 420; i++) {
    const y = Math.random() * 256;
    const h = 1 + Math.random() * 3.5;
    dCtx.fillStyle = i % 2 === 0 ? '#6e4f37' : '#a88264';
    dCtx.globalAlpha = 0.14 + Math.random() * 0.15;
    dCtx.fillRect(0, y, 1024, h);

    dBumpCtx.fillStyle = i % 2 === 0 ? '#686868' : '#969696';
    dBumpCtx.globalAlpha = 0.22;
    dBumpCtx.fillRect(0, y, 1024, h);
  }

  // Knots
  for (let k = 0; k < 14; k++) {
    const kx = 60 + Math.random() * 900;
    const ky = 30 + Math.random() * 196;
    const rx = 10 + Math.random() * 16;
    const ry = 5 + Math.random() * 8;

    const grad = dCtx.createRadialGradient(kx, ky, 1, kx, ky, rx * 1.6);
    grad.addColorStop(0, '#3b2618');
    grad.addColorStop(0.45, '#593b26');
    grad.addColorStop(1, 'rgba(140, 105, 78, 0)');
    dCtx.globalAlpha = 0.75;
    dCtx.fillStyle = grad;
    dCtx.beginPath();
    dCtx.ellipse(kx, ky, rx * 1.6, ry * 1.5, 0, 0, Math.PI * 2);
    dCtx.fill();

    dBumpCtx.globalAlpha = 0.5;
    dBumpCtx.fillStyle = '#404040';
    dBumpCtx.beginPath();
    dBumpCtx.ellipse(kx, ky, rx, ry, 0, 0, Math.PI * 2);
    dBumpCtx.fill();
  }

  const deckColorTex = new THREE.CanvasTexture(dCanvas);
  deckColorTex.colorSpace = THREE.SRGBColorSpace;
  deckColorTex.wrapS = deckColorTex.wrapT = THREE.RepeatWrapping;
  deckColorTex.anisotropy = maxAnisotropy;

  const deckBumpTex = new THREE.CanvasTexture(dBumpCanvas);
  deckBumpTex.wrapS = deckBumpTex.wrapT = THREE.RepeatWrapping;

  // 3) Bronze Giboshi with "御裳濯川 御橋" engraved inscription & verdigris patina gradient
  const gCanvas = document.createElement('canvas');
  const gBumpCanvas = document.createElement('canvas');
  gCanvas.width = gBumpCanvas.width = 1024;
  gCanvas.height = gBumpCanvas.height = 512;
  const gCtx = gCanvas.getContext('2d')!;
  const gBumpCtx = gBumpCanvas.getContext('2d')!;

  const gGrad = gCtx.createLinearGradient(0, 0, 0, 512);
  gGrad.addColorStop(0.0, '#22302a');  // Top apex verdigris
  gGrad.addColorStop(0.35, '#354a40'); // Neck verdigris
  gGrad.addColorStop(0.55, '#6e5846'); // Upper cylinder inscription area
  gGrad.addColorStop(0.82, '#8c6244'); // Polished bronze from worshiper touches (IMG_8775)
  gGrad.addColorStop(0.95, '#3b6e57'); // Skirt verdigris
  gGrad.addColorStop(1.0, '#2f5c47');
  gCtx.fillStyle = gGrad;
  gCtx.fillRect(0, 0, 1024, 512);

  gBumpCtx.fillStyle = '#808080';
  gBumpCtx.fillRect(0, 0, 1024, 512);

  // Cast bronze stippling
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const r = 0.8 + Math.random() * 2.2;
    gCtx.fillStyle = Math.random() > 0.5 ? '#466354' : '#594132';
    gCtx.globalAlpha = 0.14;
    gCtx.beginPath();
    gCtx.arc(x, y, r, 0, Math.PI * 2);
    gCtx.fill();

    gBumpCtx.fillStyle = Math.random() > 0.5 ? '#909090' : '#707070';
    gBumpCtx.globalAlpha = 0.25;
    gBumpCtx.fillRect(x, y, 2, 2);
  }

  // Inscriptions: "御裳濯川" and "御橋" (IMG_8775)
  gCtx.globalAlpha = 0.85;
  gCtx.fillStyle = '#263830';
  gCtx.font = '500 22px "Noto Serif JP", serif';
  gCtx.textAlign = 'center';

  gBumpCtx.globalAlpha = 0.9;
  gBumpCtx.fillStyle = '#303030';
  gBumpCtx.font = '500 22px "Noto Serif JP", serif';
  gBumpCtx.textAlign = 'center';

  const col1 = ['御', '裳', '濯', '川'];
  const col2 = ['御', '橋'];
  [256, 768].forEach(baseX => {
    col1.forEach((ch, idx) => {
      gCtx.fillText(ch, baseX + 18, 255 + idx * 24);
      gBumpCtx.fillText(ch, baseX + 18, 255 + idx * 24);
    });
    col2.forEach((ch, idx) => {
      gCtx.fillText(ch, baseX - 18, 262 + idx * 26);
      gBumpCtx.fillText(ch, baseX - 18, 262 + idx * 26);
    });
  });

  const giboshiColorTex = new THREE.CanvasTexture(gCanvas);
  giboshiColorTex.colorSpace = THREE.SRGBColorSpace;
  giboshiColorTex.wrapS = THREE.RepeatWrapping;

  const giboshiBumpTex = new THREE.CanvasTexture(gBumpCanvas);
  giboshiBumpTex.wrapS = THREE.RepeatWrapping;

  // 4) Staggered granite cut stone paving (千鳥目地御影石)
  const grCanvas = document.createElement('canvas');
  const grBump = document.createElement('canvas');
  grCanvas.width = grBump.width = 1024;
  grCanvas.height = grBump.height = 1024;
  const grCtx = grCanvas.getContext('2d')!;
  const grBumpCtx = grBump.getContext('2d')!;

  grCtx.fillStyle = '#9ea6a4';
  grCtx.fillRect(0, 0, 1024, 1024);
  grBumpCtx.fillStyle = '#888888';
  grBumpCtx.fillRect(0, 0, 1024, 1024);

  const rows = 8;
  const cols = 4;
  const rowH = 1024 / rows;
  const colW = 1024 / cols;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offsetX;
      const y = r * rowH;
      const tone = 152 + ((r * 7 + c * 13) % 18);
      grCtx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 3})`;
      grCtx.fillRect(x + 3, y + 3, colW - 6, rowH - 6);

      // Stipples
      for (let p = 0; p < 180; p++) {
        grCtx.fillStyle = p % 2 === 0 ? '#78807e' : '#c2cac8';
        grCtx.globalAlpha = 0.25;
        grCtx.fillRect(x + 4 + Math.random() * (colW - 8), y + 4 + Math.random() * (rowH - 8), 2.5, 2.5);
      }
      grCtx.globalAlpha = 1.0;

      grCtx.strokeStyle = '#474d4b';
      grCtx.lineWidth = 5;
      grCtx.strokeRect(x, y, colW, rowH);

      grBumpCtx.strokeStyle = '#252525';
      grBumpCtx.lineWidth = 6;
      grBumpCtx.strokeRect(x, y, colW, rowH);
    }
  }

  const graniteColorTex = new THREE.CanvasTexture(grCanvas);
  graniteColorTex.colorSpace = THREE.SRGBColorSpace;
  graniteColorTex.wrapS = graniteColorTex.wrapT = THREE.RepeatWrapping;
  graniteColorTex.repeat.set(2, 3);
  graniteColorTex.anisotropy = maxAnisotropy;

  const graniteBumpTex = new THREE.CanvasTexture(grBump);
  graniteBumpTex.wrapS = graniteBumpTex.wrapT = THREE.RepeatWrapping;
  graniteBumpTex.repeat.set(2, 3);

  // 5) Washed aggregate pebble texture
  function makePebbleTex(bgHex: string, count: number, repeat: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 512, 512);

    const palette = ['#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#f4f4f5'];
    for (let i = 0; i < count; i++) {
      ctx.fillStyle = palette[i % palette.length];
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * 512,
        Math.random() * 512,
        1.2 + Math.random() * 2.6,
        1.0 + Math.random() * 2.2,
        Math.random() * Math.PI,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    return tex;
  }

  const washedAggregateTex = makePebbleTex('#686d73', 9500, 6);
  const gravelApproachTex = makePebbleTex('#847f78', 8000, 12);

  // 6) Kikko Hexagonal Masonry (亀甲積み)
  const kmCanvas = document.createElement('canvas');
  const kmBump = document.createElement('canvas');
  kmCanvas.width = kmBump.width = 512;
  kmCanvas.height = kmBump.height = 256;
  const kmCtx = kmCanvas.getContext('2d')!;
  const kmBumpCtx = kmBump.getContext('2d')!;

  const kmCols = 10, kmRows = 5;
  const kmCellW = 512 / kmCols, kmCellH = 256 / kmRows;
  const pts: { x: number; y: number; base: number }[] = [];
  for (let r = -1; r <= kmRows + 1; r++) {
    for (let c = -1; c <= kmCols + 1; c++) {
      const ox = (r % 2) * (kmCellW * 0.5);
      pts.push({
        x: c * kmCellW + ox + (Math.random() - 0.5) * kmCellW * 0.36,
        y: r * kmCellH + (Math.random() - 0.5) * kmCellH * 0.36,
        base: 108 + ((r * 11 + c * 17) % 34)
      });
    }
  }

  const imgC = kmCtx.createImageData(512, 256);
  const imgB = kmBumpCtx.createImageData(512, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x++) {
      let d1 = 1e9, d2 = 1e9, id = 0;
      for (let i = 0; i < pts.length; i++) {
        const d = Math.hypot(x - pts[i].x, y - pts[i].y);
        if (d < d1) { d2 = d1; d1 = d; id = i; }
        else if (d < d2) { d2 = d; }
      }
      const idx = (y * 512 + x) * 4;
      const border = (d2 - d1) < 2.3;
      const n = (Math.random() - 0.5) * 12;
      const v = border ? 48 : pts[id].base + n;
      imgC.data[idx] = v;
      imgC.data[idx + 1] = v + 4;
      imgC.data[idx + 2] = v + 2;
      imgC.data[idx + 3] = 255;

      const bv = border ? 35 : Math.min(245, 130 + (d2 - d1) * 4 + n);
      imgB.data[idx] = imgB.data[idx + 1] = imgB.data[idx + 2] = bv;
      imgB.data[idx + 3] = 255;
    }
  }
  kmCtx.putImageData(imgC, 0, 0);
  kmBumpCtx.putImageData(imgB, 0, 0);

  const kikkoColorTex = new THREE.CanvasTexture(kmCanvas);
  kikkoColorTex.colorSpace = THREE.SRGBColorSpace;
  kikkoColorTex.wrapS = kikkoColorTex.wrapT = THREE.RepeatWrapping;
  kikkoColorTex.repeat.set(3, 1.2);
  kikkoColorTex.anisotropy = maxAnisotropy;

  const kikkoBumpTex = new THREE.CanvasTexture(kmBump);
  kikkoBumpTex.wrapS = kikkoBumpTex.wrapT = THREE.RepeatWrapping;
  kikkoBumpTex.repeat.set(3, 1.2);

  // 7) "右側通行" Wooden Signboard
  const sCanvas = document.createElement('canvas');
  sCanvas.width = 256;
  sCanvas.height = 512;
  const sCtx = sCanvas.getContext('2d')!;
  sCtx.fillStyle = '#463222';
  sCtx.fillRect(0, 0, 256, 512);
  sCtx.strokeStyle = '#291c12';
  sCtx.lineWidth = 14;
  sCtx.strokeRect(7, 7, 242, 498);

  sCtx.fillStyle = '#e7ddd3';
  sCtx.font = 'bold 64px "Noto Serif JP", serif';
  sCtx.textAlign = 'center';
  ['右', '側', '通', '行'].forEach((ch, i) => {
    sCtx.fillText(ch, 128, 120 + i * 105);
  });
  const rightTrafficTex = new THREE.CanvasTexture(sCanvas);
  rightTrafficTex.colorSpace = THREE.SRGBColorSpace;

  // Initialize PBR Materials
  const materials: BridgeMaterials = {
    hinokiColumn: new THREE.MeshStandardMaterial({
      map: hinokiColorTex,
      bumpMap: hinokiBumpTex,
      bumpScale: 0.018,
      color: 0x9c7454,
      roughness: 0.34,
      metalness: 0.05
    }),
    hinokiRailing: new THREE.MeshStandardMaterial({
      map: hinokiColorTex,
      bumpMap: hinokiBumpTex,
      bumpScale: 0.022,
      color: 0xa67e5e,
      roughness: 0.36,
      metalness: 0.05
    }),
    hinokiDeck: new THREE.MeshStandardMaterial({
      map: deckColorTex,
      bumpMap: deckBumpTex,
      bumpScale: 0.015,
      color: 0xb88e6c,
      roughness: 0.24,
      metalness: 0.08
    }),
    hinokiSubstructure: new THREE.MeshStandardMaterial({
      map: hinokiColorTex,
      bumpMap: hinokiBumpTex,
      bumpScale: 0.025,
      color: 0xa37e60,
      roughness: 0.44,
      metalness: 0.04
    }),
    whiteProtectiveCoat: new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.42,
      metalness: 0.04
    }),
    giboshiBronze: new THREE.MeshStandardMaterial({
      map: giboshiColorTex,
      bumpMap: giboshiBumpTex,
      bumpScale: 0.012,
      roughness: 0.26,
      metalness: 0.76
    }),
    brassRivet: new THREE.MeshStandardMaterial({
      color: 0xb48a4e,
      roughness: 0.28,
      metalness: 0.85
    }),
    verdigrisCopper: new THREE.MeshStandardMaterial({
      color: 0x4c8c74,
      roughness: 0.36,
      metalness: 0.62
    }),
    blackIronHardware: new THREE.MeshStandardMaterial({
      color: 0x22252a,
      roughness: 0.32,
      metalness: 0.82
    }),
    inomeBronzeIron: new THREE.MeshStandardMaterial({
      color: 0x3b2820,
      roughness: 0.35,
      metalness: 0.72
    }),
    graniteStaggeredPaving: new THREE.MeshStandardMaterial({
      map: graniteColorTex,
      bumpMap: graniteBumpTex,
      bumpScale: 0.015,
      color: 0xc2cac8,
      roughness: 0.28,
      metalness: 0.06
    }),
    graniteBorderStone: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.30,
      metalness: 0.05
    }),
    washedPaving: new THREE.MeshStandardMaterial({
      map: washedAggregateTex,
      bumpMap: washedAggregateTex,
      bumpScale: 0.016,
      color: 0x9aa1a8,
      roughness: 0.36,
      metalness: 0.05
    }),
    gravelGround: new THREE.MeshStandardMaterial({
      map: gravelApproachTex,
      bumpMap: gravelApproachTex,
      bumpScale: 0.025,
      color: 0xb4afa8,
      roughness: 0.58,
      metalness: 0.02
    }),
    kikkoMasonry: new THREE.MeshStandardMaterial({
      map: kikkoColorTex,
      bumpMap: kikkoBumpTex,
      bumpScale: 0.03,
      color: 0xa3aba6,
      roughness: 0.42,
      metalness: 0.04
    }),
    rightTrafficSign: [
      new THREE.MeshStandardMaterial({ map: rightTrafficTex, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ map: rightTrafficTex, roughness: 0.4 }),
      new THREE.MeshStandardMaterial({ color: 0x5a3f2b, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x5a3f2b, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x5a3f2b, roughness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x5a3f2b, roughness: 0.5 }),
    ]
  };

  return materials;
}

export function applySurfaceCondition(
  mats: BridgeMaterials,
  riverMat: THREE.MeshStandardMaterial,
  condition: SurfaceCondition
) {
  if (condition === 'wet') {
    // Wet condition: higher sheen, rich dark timber, flood river color
    mats.hinokiColumn.color.setHex(0x9c7454);
    mats.hinokiColumn.roughness = 0.32;
    mats.hinokiRailing.color.setHex(0xa67e5e);
    mats.hinokiRailing.roughness = 0.34;
    mats.hinokiDeck.color.setHex(0xb88e6c);
    mats.hinokiDeck.roughness = 0.22;
    mats.graniteStaggeredPaving.roughness = 0.26;
    riverMat.color.setHex(0x8c735b);
    riverMat.opacity = 0.90;
  } else {
    // Dry condition: light weathered hinoki, matte surfaces, crystal emerald river
    mats.hinokiColumn.color.setHex(0xc29874);
    mats.hinokiColumn.roughness = 0.58;
    mats.hinokiRailing.color.setHex(0xcc9f78);
    mats.hinokiRailing.roughness = 0.58;
    mats.hinokiDeck.color.setHex(0xd6ad86);
    mats.hinokiDeck.roughness = 0.55;
    mats.graniteStaggeredPaving.roughness = 0.65;
    riverMat.color.setHex(0x3b7a75);
    riverMat.opacity = 0.72;
  }
}
