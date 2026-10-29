import * as THREE from 'three';
import { BridgeMaterials } from './materials';
import {
  HALF_LEN,
  BRIDGE_SPECS,
  RAIL_CENTER_Z,
  DECK_OUTER_Z,
  BASE_Y,
  getBridgeY,
  getBridgePitch
} from '../utils/bridgeMath';
import { StructureLayer } from '../types';

export interface BridgeModel {
  rootGroup: THREE.Group;
  deckGroup: THREE.Group;
  railingsGroup: THREE.Group;
  substructureGroup: THREE.Group;
  riverGroup: THREE.Group;
  approachesGroup: THREE.Group;
  riverMesh: THREE.Mesh;
  riverVertices: { x: number; y: number; z: number }[];
  kiyokeWakeCircles: THREE.Mesh[];
  weirFoamMesh: THREE.Mesh;
  setLayerFilter: (layer: StructureLayer) => void;
  setExplodedOffset: (t: number) => void;
  animateRiver: (elapsed: number) => void;
}

export function buildUjiBridgeModel(materials: BridgeMaterials): BridgeModel {
  const rootGroup = new THREE.Group();

  const deckGroup = new THREE.Group();
  const railingsGroup = new THREE.Group();
  const substructureGroup = new THREE.Group();
  const riverGroup = new THREE.Group();
  const approachesGroup = new THREE.Group();

  rootGroup.add(substructureGroup);
  rootGroup.add(deckGroup);
  rootGroup.add(railingsGroup);
  rootGroup.add(approachesGroup);
  rootGroup.add(riverGroup);

  const BRIDGE_LEN = BRIDGE_SPECS.modelLengthMeters;
  const DECK_TOTAL_WIDTH = DECK_OUTER_Z * 2;

  // ==========================================
  // 1. Precision Giboshi Geometry (6 rings, 12 rivets, inscription)
  // ==========================================
  const giboshiPts = [
    new THREE.Vector2(0.001, 0.0),
    new THREE.Vector2(0.305, 0.0),
    new THREE.Vector2(0.285, 0.045),
    new THREE.Vector2(0.278, 0.065),
    new THREE.Vector2(0.292, 0.080),
    new THREE.Vector2(0.275, 0.095),
    new THREE.Vector2(0.290, 0.110),
    new THREE.Vector2(0.270, 0.125),
    new THREE.Vector2(0.266, 0.255),
    new THREE.Vector2(0.284, 0.270),
    new THREE.Vector2(0.266, 0.285),
    new THREE.Vector2(0.284, 0.305),
    new THREE.Vector2(0.264, 0.320),
    new THREE.Vector2(0.258, 0.435),
    new THREE.Vector2(0.276, 0.450),
    new THREE.Vector2(0.258, 0.465),
    new THREE.Vector2(0.274, 0.482),
    new THREE.Vector2(0.245, 0.505),
    new THREE.Vector2(0.195, 0.535),
    new THREE.Vector2(0.220, 0.565),
    new THREE.Vector2(0.305, 0.655),
    new THREE.Vector2(0.312, 0.725),
    new THREE.Vector2(0.260, 0.805),
    new THREE.Vector2(0.140, 0.875),
    new THREE.Vector2(0.065, 0.935),
    new THREE.Vector2(0.038, 0.985),
    new THREE.Vector2(0.001, 1.010)
  ];
  const giboshiGeo = new THREE.LatheGeometry(giboshiPts, 36);

  // Inome strap with spade tip and bolts
  function createInomeStrap(lenY: number = 0.80) {
    const g = new THREE.Group();
    const plateGeo = new THREE.BoxGeometry(0.018, lenY, 0.082);
    const plate = new THREE.Mesh(plateGeo, materials.inomeBronzeIron);
    plate.position.y = -lenY / 2;
    g.add(plate);

    const tipShape = new THREE.Shape();
    tipShape.moveTo(0, -0.13);
    tipShape.quadraticCurveTo(0.08, -0.05, 0.062, 0.02);
    tipShape.lineTo(-0.062, 0.02);
    tipShape.quadraticCurveTo(-0.08, -0.05, 0, -0.13);
    const tipGeo = new THREE.ExtrudeGeometry(tipShape, { depth: 0.018, bevelEnabled: false });
    tipGeo.rotateY(Math.PI / 2);
    const tipMesh = new THREE.Mesh(tipGeo, materials.inomeBronzeIron);
    tipMesh.position.set(-0.009, -lenY, 0);
    g.add(tipMesh);

    const boltGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.032, 6);
    boltGeo.rotateZ(Math.PI / 2);
    [-0.12, -0.40, -0.68].forEach(by => {
      const b = new THREE.Mesh(boltGeo, materials.blackIronHardware);
      b.position.set(0.008, by, 0);
      g.add(b);
    });
    return g;
  }

  // Kurigata strut
  function buildKurigataStrutMesh() {
    const sGroup = new THREE.Group();

    // Base pad
    const basePadGeo = new THREE.BoxGeometry(0.42, 0.06, 0.25);
    const basePad = new THREE.Mesh(basePadGeo, materials.hinokiRailing);
    basePad.position.y = 0.10;
    sGroup.add(basePad);

    // Body
    const bodyH = 1.00;
    const bodyGeo = new THREE.BoxGeometry(0.21, bodyH, 0.20);
    const body = new THREE.Mesh(bodyGeo, materials.hinokiRailing);
    body.position.y = 0.12 + bodyH / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    sGroup.add(body);

    // Neck
    const neckGeo = new THREE.BoxGeometry(0.165, 0.08, 0.165);
    const neck = new THREE.Mesh(neckGeo, materials.hinokiRailing);
    neck.position.y = 1.16;
    sGroup.add(neck);

    // Capital
    const capGeo = new THREE.BoxGeometry(0.225, 0.14, 0.225);
    const cap = new THREE.Mesh(capGeo, materials.hinokiRailing);
    cap.position.y = 1.27;
    cap.castShadow = true;
    sGroup.add(cap);

    return sGroup;
  }

  // Full Oyabashira assembly
  function createOyabashira(
    x: number,
    yBase: number,
    z: number,
    postH: number = 1.74,
    attachSideWalls: 'both' | 'right' | 'left' | 'none' = 'both'
  ) {
    const pGroup = new THREE.Group();
    pGroup.position.set(x, yBase, z);

    const radius = 0.285;

    // Hinoki post
    const colGeo = new THREE.CylinderGeometry(radius * 0.96, radius, postH, 32);
    const colMesh = new THREE.Mesh(colGeo, materials.hinokiColumn);
    colMesh.position.y = postH / 2;
    colMesh.castShadow = true;
    colMesh.receiveShadow = true;
    pGroup.add(colMesh);

    // Top verdigris copper ring
    const topCopperGeo = new THREE.CylinderGeometry(radius * 0.99, radius * 0.99, 0.055, 32);
    const topCopper = new THREE.Mesh(topCopperGeo, materials.verdigrisCopper);
    topCopper.position.y = postH - 0.025;
    pGroup.add(topCopper);

    // Giboshi
    const giboshi = new THREE.Mesh(giboshiGeo, materials.giboshiBronze);
    giboshi.position.y = postH;
    giboshi.castShadow = true;
    pGroup.add(giboshi);

    // 12 brass rivets along skirt
    const rivetGeo = new THREE.SphereGeometry(0.013, 8, 8);
    for (let r = 0; r < 12; r++) {
      const ang = (r / 12) * Math.PI * 2;
      const rivet = new THREE.Mesh(rivetGeo, materials.brassRivet);
      rivet.position.set(
        Math.cos(ang) * 0.292,
        postH + 0.032,
        Math.sin(ang) * 0.292
      );
      pGroup.add(rivet);
    }

    // 4 Inome straps
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const strap = createInomeStrap(0.78);
      strap.position.set(
        Math.cos(ang) * (radius + 0.004),
        postH - 0.02,
        Math.sin(ang) * (radius + 0.004)
      );
      strap.rotation.y = -ang;
      pGroup.add(strap);
    }

    // Flanking kurigata struts
    const sideDirs = attachSideWalls === 'both' ? [-1, 1] : (attachSideWalls === 'right' ? [1] : (attachSideWalls === 'left' ? [-1] : []));
    sideDirs.forEach(dirX => {
      const pilaster = buildKurigataStrutMesh();
      pilaster.position.set(dirX * (radius + 0.085), 0, 0);
      pGroup.add(pilaster);
    });

    railingsGroup.add(pGroup);
  }

  // Railing Span (Hokogi + Hirageta + Jifuku + 4-nail joints + Uta-kanagu)
  const JIFUKU_Y = 0.22;
  const HIRAGETA_Y = 0.84;
  const HOKOGI_Y = 1.40;

  function buildRailingSpan(p1: THREE.Vector3, p2: THREE.Vector3, numStruts: number = 3) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    const horizLen = Math.hypot(dx, dz);
    const spanLen = Math.hypot(dx, dy, dz);
    const yaw = Math.atan2(-dz, dx);
    const pitch = Math.atan2(dy, horizLen);

    const spanGroup = new THREE.Group();
    spanGroup.position.set((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
    spanGroup.rotation.y = yaw;

    const beamLen = spanLen + 0.08;

    // 1) Hokogi (circular rail)
    const hokogiGeo = new THREE.CylinderGeometry(0.122, 0.122, beamLen, 28);
    hokogiGeo.rotateZ(-Math.PI / 2);
    const hokogi = new THREE.Mesh(hokogiGeo, materials.hinokiRailing);
    hokogi.position.y = HOKOGI_Y;
    hokogi.rotation.z = pitch;
    hokogi.castShadow = true;
    hokogi.receiveShadow = true;
    spanGroup.add(hokogi);

    // 2) Hirageta
    const hiragetaGeo = new THREE.BoxGeometry(beamLen, 0.17, 0.225);
    const hirageta = new THREE.Mesh(hiragetaGeo, materials.hinokiRailing);
    hirageta.position.y = HIRAGETA_Y;
    hirageta.rotation.z = pitch;
    hirageta.castShadow = true;
    hirageta.receiveShadow = true;
    spanGroup.add(hirageta);

    // 3) Jifuku
    const jifukuGeo = new THREE.BoxGeometry(beamLen, 0.21, 0.255);
    const jifuku = new THREE.Mesh(jifukuGeo, materials.hinokiRailing);
    jifuku.position.y = JIFUKU_Y;
    jifuku.rotation.z = pitch;
    jifuku.castShadow = true;
    jifuku.receiveShadow = true;
    spanGroup.add(jifuku);

    // 4) Struts & hardware
    for (let k = 1; k <= numStruts; k++) {
      const ratio = k / (numStruts + 1) - 0.5;
      const sx = ratio * horizLen;
      const sy = ratio * dy;

      const strut = buildKurigataStrutMesh();
      strut.position.set(sx, sy, 0);
      spanGroup.add(strut);

      // 4-square-nail joint plate
      const jointHardwareGroup = new THREE.Group();
      jointHardwareGroup.position.set(sx, sy + HOKOGI_Y, 0);
      jointHardwareGroup.rotation.z = pitch;

      const topPlateGeo = new THREE.CylinderGeometry(0.127, 0.127, 0.36, 20, 1, true, -Math.PI * 0.32, Math.PI * 0.64);
      topPlateGeo.rotateZ(-Math.PI / 2);
      const topPlate = new THREE.Mesh(topPlateGeo, materials.blackIronHardware);
      jointHardwareGroup.add(topPlate);

      const pegGeo = new THREE.BoxGeometry(0.018, 0.032, 0.018);
      [-0.12, -0.04, 0.04, 0.12].forEach(dxPeg => {
        const peg = new THREE.Mesh(pegGeo, materials.blackIronHardware);
        peg.position.set(dxPeg, 0.132, 0);
        jointHardwareGroup.add(peg);
      });
      spanGroup.add(jointHardwareGroup);

      // Domed Uta-kanagu with central nipple & vertical tie strap
      [-1, 1].forEach(sideZ => {
        const domeGeo = new THREE.SphereGeometry(0.042, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
        domeGeo.rotateX(sideZ > 0 ? Math.PI / 2 : -Math.PI / 2);
        const dome = new THREE.Mesh(domeGeo, materials.blackIronHardware);
        dome.position.set(sx, sy + HIRAGETA_Y, sideZ * 0.114);
        spanGroup.add(dome);

        const nippleGeo = new THREE.CylinderGeometry(0.009, 0.012, 0.022, 8);
        nippleGeo.rotateX(Math.PI / 2);
        const nipple = new THREE.Mesh(nippleGeo, materials.brassRivet);
        nipple.position.set(sx, sy + HIRAGETA_Y, sideZ * 0.150);
        spanGroup.add(nipple);

        const vStrapGeo = new THREE.BoxGeometry(0.042, 0.64, 0.016);
        const vStrap = new THREE.Mesh(vStrapGeo, materials.blackIronHardware);
        vStrap.position.set(sx, sy + 0.44, sideZ * 0.130);
        spanGroup.add(vStrap);

        const smallRivetGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.024, 6);
        smallRivetGeo.rotateX(Math.PI / 2);
        [0.68, 0.52, 0.28, 0.15].forEach(ry => {
          const rv = new THREE.Mesh(smallRivetGeo, materials.blackIronHardware);
          rv.position.set(sx, sy + ry, sideZ * 0.135);
          spanGroup.add(rv);
        });
      });
    }

    railingsGroup.add(spanGroup);
  }

  // ==========================================
  // 2. Build Deck & Railings
  // ==========================================
  const numPlanks = 148;
  const stepX = BRIDGE_LEN / numPlanks;
  const plankGeo = new THREE.BoxGeometry(stepX * 0.90, 0.19, DECK_TOTAL_WIDTH);
  const plankInst = new THREE.InstancedMesh(plankGeo, materials.hinokiDeck, numPlanks);
  plankInst.castShadow = true;
  plankInst.receiveShadow = true;

  const nailGeo = new THREE.BoxGeometry(0.025, 0.015, 0.025);
  const nailInst = new THREE.InstancedMesh(nailGeo, materials.blackIronHardware, numPlanks * 4);

  const dummy = new THREE.Object3D();
  const nailDummy = new THREE.Object3D();
  let nailIdx = 0;

  for (let i = 0; i < numPlanks; i++) {
    const x = -HALF_LEN + (i + 0.5) * stepX;
    const y = getBridgeY(x);
    const pitch = getBridgePitch(x);
    dummy.position.set(x, y, 0);
    dummy.rotation.set(0, 0, pitch);
    dummy.updateMatrix();
    plankInst.setMatrixAt(i, dummy.matrix);

    [-1, 1].forEach(sZ => {
      [3.92, 4.10].forEach(absZ => {
        nailDummy.position.set(x, y + 0.098, sZ * absZ);
        nailDummy.rotation.set(0, 0, pitch);
        nailDummy.updateMatrix();
        nailInst.setMatrixAt(nailIdx++, nailDummy.matrix);
      });
    });
  }
  plankInst.instanceMatrix.needsUpdate = true;
  nailInst.instanceMatrix.needsUpdate = true;
  deckGroup.add(plankInst);
  deckGroup.add(nailInst);

  // Central median curb
  const medianSegs = 60;
  const medianLen = BRIDGE_LEN - 0.6;
  const mStep = medianLen / medianSegs;

  for (let i = 0; i < medianSegs; i++) {
    const x = -medianLen / 2 + (i + 0.5) * mStep;
    const y = getBridgeY(x) + 0.135;
    const pitch = getBridgePitch(x);

    const curGeo = new THREE.BoxGeometry(mStep * 1.01, 0.095, 0.22);
    const curMesh = new THREE.Mesh(curGeo, materials.hinokiRailing);
    curMesh.position.set(x, y, 0);
    curMesh.rotation.z = pitch;
    curMesh.castShadow = true;
    curMesh.receiveShadow = true;
    deckGroup.add(curMesh);
  }

  // Curb end terminals & brackets
  [-1, 1].forEach(endSign => {
    const tipX = endSign * (HALF_LEN - 0.18);
    const tipGroup = new THREE.Group();
    tipGroup.position.set(tipX, getBridgeY(tipX) + 0.095, 0);
    if (endSign < 0) tipGroup.rotation.y = Math.PI;

    const rampGeo = new THREE.BoxGeometry(0.32, 0.09, 0.22);
    const rampMesh = new THREE.Mesh(rampGeo, materials.hinokiRailing);
    rampMesh.position.set(-0.08, 0.03, 0);
    rampMesh.rotation.z = -0.22;
    tipGroup.add(rampMesh);

    const bracketGeo = new THREE.BoxGeometry(0.14, 0.035, 0.25);
    const bracket = new THREE.Mesh(bracketGeo, materials.blackIronHardware);
    bracket.position.set(0.06, 0.015, 0);
    tipGroup.add(bracket);

    deckGroup.add(tipGroup);
  });

  // Longitudinal Girders (5 rows)
  const girderZPositions = [-3.85, -1.92, 0, 1.92, 3.85];
  const girderSegs = 44;
  const gStep = BRIDGE_LEN / girderSegs;

  girderZPositions.forEach((gz, gIdx) => {
    const isEdge = (gIdx === 0 || gIdx === girderZPositions.length - 1);
    const gHeight = isEdge ? 0.66 : 0.56;
    const gWidth = isEdge ? 0.44 : 0.38;
    const gGeo = new THREE.BoxGeometry(gStep * 1.02, gHeight, gWidth);

    for (let i = 0; i < girderSegs; i++) {
      const x = -HALF_LEN + (i + 0.5) * gStep;
      const y = getBridgeY(x) - gHeight / 2 - 0.08;
      const pitch = getBridgePitch(x);
      const gMesh = new THREE.Mesh(gGeo, materials.hinokiSubstructure);
      gMesh.position.set(x, y, gz);
      gMesh.rotation.z = pitch;
      gMesh.castShadow = true;
      gMesh.receiveShadow = true;
      deckGroup.add(gMesh);
    }
  });

  // Edge Fascia
  [-DECK_OUTER_Z, DECK_OUTER_Z].forEach(edgeZ => {
    for (let i = 0; i < girderSegs; i++) {
      const x = -HALF_LEN + (i + 0.5) * gStep;
      const y = getBridgeY(x) - 0.02;
      const pitch = getBridgePitch(x);
      const fasciaGeo = new THREE.BoxGeometry(gStep * 1.01, 0.22, 0.06);
      const fascia = new THREE.Mesh(fasciaGeo, materials.kikkoMasonry);
      fascia.position.set(x, y, edgeZ);
      fascia.rotation.z = pitch;
      deckGroup.add(fascia);
    }
  });

  // Oyabashira & Railing Spans
  const bridgePostXList = [-46.0, -31.0, -15.5, 0.0, 15.5, 31.0, 46.0];

  [-RAIL_CENTER_Z, RAIL_CENTER_Z].forEach(zSide => {
    bridgePostXList.forEach((px, idx) => {
      const attach = (idx === 0) ? 'right' : (idx === bridgePostXList.length - 1 ? 'left' : 'both');
      createOyabashira(px, getBridgeY(px), zSide, 1.74, attach);
    });

    for (let i = 0; i < bridgePostXList.length - 1; i++) {
      const xStart = bridgePostXList[i];
      const xEnd = bridgePostXList[i + 1];
      const subDivs = 3;
      for (let s = 0; s < subDivs; s++) {
        const xa = xStart + (xEnd - xStart) * (s / subDivs);
        const xb = xStart + (xEnd - xStart) * ((s + 1) / subDivs);
        buildRailingSpan(
          new THREE.Vector3(xa, getBridgeY(xa), zSide),
          new THREE.Vector3(xb, getBridgeY(xb), zSide),
          1
        );
      }
    }
  });

  // Wing Railings (Sode-kouran)
  const sodeOuterZ = 7.45;
  [-1, 1].forEach(endSign => {
    const endX = endSign * HALF_LEN;
    [-1, 1].forEach(sideSign => {
      const innerZ = sideSign * RAIL_CENTER_Z;
      const outerZ = sideSign * sodeOuterZ;
      const outerY = BASE_Y - 0.16;

      createOyabashira(endX, outerY, outerZ, 1.74, 'none');

      buildRailingSpan(
        new THREE.Vector3(endX, BASE_Y, innerZ),
        new THREE.Vector3(endX, outerY, outerZ),
        3
      );

      // Iron fence grilles
      const grilleGroup = new THREE.Group();
      const grilleX = endX - endSign * 0.55;
      const grilleZ = sideSign * (RAIL_CENTER_Z + 0.45);
      grilleGroup.position.set(grilleX, BASE_Y, grilleZ);

      for (let b = 0; b < 5; b++) {
        const barGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.92, 8);
        const bar = new THREE.Mesh(barGeo, materials.blackIronHardware);
        bar.position.set(0, 0.46, (b - 2) * 0.11);
        grilleGroup.add(bar);
      }
      [0.15, 0.82].forEach(hy => {
        const hBarGeo = new THREE.BoxGeometry(0.025, 0.025, 0.52);
        const hBar = new THREE.Mesh(hBarGeo, materials.blackIronHardware);
        hBar.position.set(0, hy, 0);
        grilleGroup.add(hBar);
      });
      deckGroup.add(grilleGroup);
    });
  });

  // ==========================================
  // 3. Substructure: 11 Pier Rows + X-Braces + Caps
  // ==========================================
  const pierXPositions = [-39.5, -32.0, -24.0, -16.0, -8.0, 0.0, 8.0, 16.0, 24.0, 32.0, 39.5];
  const colZPositions = [-3.15, -1.05, 1.05, 3.15];

  pierXPositions.forEach((px) => {
    const pierGroup = new THREE.Group();
    const girderBottomY = getBridgeY(px) - 0.62;

    let groundY = -1.35;
    if (Math.abs(px) > 36) groundY = 1.65;
    else if (Math.abs(px) > 28) groundY = 0.85;
    else if (Math.abs(px) > 20) groundY = 0.15;

    const colH = girderBottomY - groundY;

    // 4 square columns + copper sleeves
    const colGeo = new THREE.BoxGeometry(0.54, colH, 0.54);
    colZPositions.forEach(pz => {
      const colMesh = new THREE.Mesh(colGeo, materials.hinokiSubstructure);
      colMesh.position.set(px, groundY + colH / 2, pz);
      colMesh.castShadow = true;
      colMesh.receiveShadow = true;
      pierGroup.add(colMesh);

      const collarY = Math.max(groundY + 0.22, 0.45);
      const copperGeo = new THREE.BoxGeometry(0.58, 0.36, 0.58);
      const copper = new THREE.Mesh(copperGeo, materials.verdigrisCopper);
      copper.position.set(px, collarY, pz);
      pierGroup.add(copper);

      const shoeGeo = new THREE.BoxGeometry(0.64, 0.10, 0.64);
      const shoe = new THREE.Mesh(shoeGeo, materials.blackIronHardware);
      shoe.position.set(px, collarY - 0.18, pz);
      pierGroup.add(shoe);
    });

    // Cap beam (Kabuki) + Gable roof covers
    const capLen = DECK_TOTAL_WIDTH + 0.35;
    const capGeo = new THREE.BoxGeometry(0.66, 0.54, capLen);
    const capBeam = new THREE.Mesh(capGeo, materials.hinokiSubstructure);
    capBeam.position.set(px, girderBottomY - 0.18, 0);
    capBeam.castShadow = true;
    pierGroup.add(capBeam);

    [-1, 1].forEach(sideZ => {
      const roofZ = sideZ * (capLen / 2 + 0.08);
      const roofBox = new THREE.Group();
      roofBox.position.set(px, girderBottomY - 0.16, roofZ);

      const faceBoardGeo = new THREE.BoxGeometry(0.56, 0.76, 0.22);
      const faceBoard = new THREE.Mesh(faceBoardGeo, materials.hinokiSubstructure);
      faceBoard.position.y = -0.10;
      faceBoard.castShadow = true;
      roofBox.add(faceBoard);

      [-1, 1].forEach(sSlope => {
        const slopeGeo = new THREE.BoxGeometry(0.50, 0.065, 0.44);
        const slope = new THREE.Mesh(slopeGeo, materials.whiteProtectiveCoat);
        slope.position.set(sSlope * 0.19, 0.32, sideZ * 0.04);
        slope.rotation.z = -sSlope * 0.48;
        slope.castShadow = true;
        roofBox.add(slope);
      });

      pierGroup.add(roofBox);
    });

    // Horizontal ties (Nuki) with white end grains
    const whiteEndMatArray = [
      materials.whiteProtectiveCoat,
      materials.whiteProtectiveCoat,
      materials.hinokiSubstructure,
      materials.hinokiSubstructure,
      materials.whiteProtectiveCoat,
      materials.whiteProtectiveCoat
    ];

    const upperNukiY = girderBottomY - 1.15;
    const upperTransNukiGeo = new THREE.BoxGeometry(0.28, 0.30, DECK_TOTAL_WIDTH - 0.8);
    const upperTransNuki = new THREE.Mesh(upperTransNukiGeo, whiteEndMatArray);
    upperTransNuki.position.set(px, upperNukiY, 0);
    upperTransNuki.castShadow = true;
    pierGroup.add(upperTransNuki);

    colZPositions.forEach(pz => {
      const shortLugGeo = new THREE.BoxGeometry(1.22, 0.28, 0.26);
      const shortLug = new THREE.Mesh(shortLugGeo, whiteEndMatArray);
      shortLug.position.set(px, upperNukiY - 0.05, pz);
      shortLug.castShadow = true;
      pierGroup.add(shortLug);
    });

    // Lower ties & X-Bracing
    if (Math.abs(px) < 35) {
      const lowerNukiY = Math.max(groundY + 0.75, 0.95);
      const lowerTransNuki = new THREE.Mesh(upperTransNukiGeo, whiteEndMatArray);
      lowerTransNuki.position.set(px, lowerNukiY, 0);
      lowerTransNuki.castShadow = true;
      pierGroup.add(lowerTransNuki);

      colZPositions.forEach(pz => {
        const lowLugGeo = new THREE.BoxGeometry(1.15, 0.26, 0.25);
        const lowLug = new THREE.Mesh(lowLugGeo, whiteEndMatArray);
        lowLug.position.set(px, lowerNukiY, pz);
        pierGroup.add(lowLug);
      });

      const braceMidZList = [-2.10, 0.0, 2.10];
      const braceHeight = upperNukiY - lowerNukiY;
      const braceSpanZ = 2.10;
      const diagLen = Math.hypot(braceHeight, braceSpanZ);
      const diagAngle = Math.atan2(braceSpanZ, braceHeight);

      braceMidZList.forEach(midZ => {
        [-1, 1].forEach(crossSign => {
          const xBraceGeo = new THREE.BoxGeometry(0.20, diagLen, 0.20);
          const xBrace = new THREE.Mesh(xBraceGeo, materials.hinokiSubstructure);
          xBrace.position.set(px, (upperNukiY + lowerNukiY) / 2, midZ);
          xBrace.rotation.x = crossSign * diagAngle;
          xBrace.castShadow = true;
          pierGroup.add(xBrace);
        });
      });
    }

    // Diagonal bracket struts (Hozue)
    [-1, 1].forEach(dirX => {
      const strutLen = 2.55;
      const strutGeo = new THREE.BoxGeometry(0.24, strutLen, 0.24);
      colZPositions.forEach(pz => {
        const hozue = new THREE.Mesh(strutGeo, materials.hinokiSubstructure);
        hozue.position.set(px + dirX * 0.88, girderBottomY - 0.88, pz);
        hozue.rotation.z = -dirX * 0.70;
        hozue.castShadow = true;
        pierGroup.add(hozue);
      });
    });

    substructureGroup.add(pierGroup);
  });

  // ==========================================
  // 4. Upstream Kiyokegui & River
  // ==========================================
  const kiyokeWakeCircles: THREE.Mesh[] = [];
  const kiyokeXList = [-24.0, -16.0, -8.0, 0.0, 8.0, 16.0, 24.0];
  const kiyokeBaseZ = 9.2;

  kiyokeXList.forEach(kx => {
    const kGroup = new THREE.Group();
    kGroup.position.set(kx, 0, kiyokeBaseZ);

    const mainPileH = 5.4;
    const mainPileGeo = new THREE.BoxGeometry(0.38, mainPileH, 0.38);
    const mainPile = new THREE.Mesh(mainPileGeo, materials.hinokiSubstructure);
    mainPile.position.set(0, 1.45, -0.35);
    mainPile.rotation.x = -0.16;
    mainPile.castShadow = true;
    kGroup.add(mainPile);

    const capRoofGroup = new THREE.Group();
    capRoofGroup.position.set(0, 4.12, -0.78);
    [-1, 1].forEach(s => {
      const rPlateGeo = new THREE.BoxGeometry(0.42, 0.06, 0.48);
      const rPlate = new THREE.Mesh(rPlateGeo, materials.whiteProtectiveCoat);
      rPlate.position.set(s * 0.15, 0, 0);
      rPlate.rotation.z = -s * 0.42;
      capRoofGroup.add(rPlate);
    });
    kGroup.add(capRoofGroup);

    const frontSlantGeo = new THREE.BoxGeometry(0.32, 3.6, 0.32);
    const frontSlant = new THREE.Mesh(frontSlantGeo, materials.hinokiSubstructure);
    frontSlant.position.set(0, 1.05, 0.42);
    frontSlant.rotation.x = -0.46;
    frontSlant.castShadow = true;
    kGroup.add(frontSlant);

    const whiteShieldGeo = new THREE.BoxGeometry(0.34, 2.2, 0.06);
    const whiteShield = new THREE.Mesh(whiteShieldGeo, materials.whiteProtectiveCoat);
    whiteShield.position.set(0, 1.45, 0.62);
    whiteShield.rotation.x = -0.46;
    kGroup.add(whiteShield);

    const tieBeamGeo = new THREE.BoxGeometry(0.95, 0.24, 0.24);
    const tieBeam = new THREE.Mesh(tieBeamGeo, materials.whiteProtectiveCoat);
    tieBeam.position.set(0, 0.65, 0.85);
    kGroup.add(tieBeam);

    const longitudinalTieGeo = new THREE.BoxGeometry(0.24, 0.24, 1.95);
    const longitudinalTie = new THREE.Mesh(longitudinalTieGeo, materials.hinokiSubstructure);
    longitudinalTie.position.set(0, 0.65, 0.15);
    kGroup.add(longitudinalTie);

    // Wake
    const wakeShape = new THREE.RingGeometry(0.35, 1.65, 24, 1, -Math.PI * 0.85, Math.PI * 0.7);
    wakeShape.rotateX(-Math.PI / 2);
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const wakeMesh = new THREE.Mesh(wakeShape, wakeMat);
    wakeMesh.position.set(0, 0.44, 0.25);
    kGroup.add(wakeMesh);
    kiyokeWakeCircles.push(wakeMesh);

    riverGroup.add(kGroup);
  });

  // River Banks & Revetments
  [-1, 1].forEach(bankSign => {
    const pavedSlopeGeo = new THREE.BoxGeometry(20, 2.6, 130);
    const pavedSlope = new THREE.Mesh(pavedSlopeGeo, materials.kikkoMasonry);
    pavedSlope.position.set(bankSign * 36.5, 0.1, 0);
    pavedSlope.rotation.z = -bankSign * 0.085;
    pavedSlope.receiveShadow = true;
    riverGroup.add(pavedSlope);

    const terraceGeo = new THREE.BoxGeometry(24, 3.0, 130);
    const terrace = new THREE.Mesh(terraceGeo, materials.gravelGround);
    terrace.position.set(bankSign * 52.0, 0.85, 0);
    terrace.receiveShadow = true;
    riverGroup.add(terrace);
  });

  // Training jetty
  const jettyGroup = new THREE.Group();
  jettyGroup.position.set(24.5, 0.55, -14.0);
  const jettyGeo = new THREE.BoxGeometry(12.0, 1.2, 16.0);
  const jetty = new THREE.Mesh(jettyGeo, materials.kikkoMasonry);
  jetty.receiveShadow = true;
  jettyGroup.add(jetty);
  riverGroup.add(jettyGroup);

  // Downstream weir
  const weirGeo = new THREE.BoxGeometry(52, 0.9, 2.4);
  const weir = new THREE.Mesh(weirGeo, materials.kikkoMasonry);
  weir.position.set(0, 0.05, -28.0);
  riverGroup.add(weir);

  const foamGeo = new THREE.PlaneGeometry(50, 3.6, 32, 4);
  foamGeo.rotateX(-Math.PI / 2);
  const foamMat = new THREE.MeshBasicMaterial({
    color: 0xf8fafc,
    transparent: true,
    opacity: 0.72
  });
  const weirFoamMesh = new THREE.Mesh(foamGeo, foamMat);
  weirFoamMesh.position.set(0, 0.44, -29.2);
  riverGroup.add(weirFoamMesh);

  // River Bed
  const bedGeo = new THREE.PlaneGeometry(60, 150);
  bedGeo.rotateX(-Math.PI / 2);
  const bed = new THREE.Mesh(bedGeo, materials.gravelGround);
  bed.position.y = -1.35;
  bed.receiveShadow = true;
  riverGroup.add(bed);

  // River Water Surface
  const riverGeo = new THREE.PlaneGeometry(54, 150, 56, 80);
  riverGeo.rotateX(-Math.PI / 2);
  const riverVertices: { x: number; y: number; z: number }[] = [];
  const pos = riverGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    riverVertices.push({
      x: pos.getX(i),
      y: pos.getY(i),
      z: pos.getZ(i)
    });
  }

  const riverMat = new THREE.MeshStandardMaterial({
    color: 0x8c735b,
    roughness: 0.22,
    metalness: 0.15,
    transparent: true,
    opacity: 0.90
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.position.y = 0.38;
  riverMesh.receiveShadow = true;
  riverGroup.add(riverMesh);

  // ==========================================
  // 5. Approaches, Abutments & Torii Gates
  // ==========================================
  [-1, 1].forEach(endSign => {
    const toriiX = endSign * (HALF_LEN + 6.4);

    // Staggered Granite Zone
    const cutStoneZoneX = endSign * (HALF_LEN + 1.4);
    const cutStoneGeo = new THREE.BoxGeometry(2.8, 0.42, 7.3);
    const cutStoneMesh = new THREE.Mesh(cutStoneGeo, materials.graniteStaggeredPaving);
    cutStoneMesh.position.set(cutStoneZoneX, BASE_Y - 0.12, 0);
    cutStoneMesh.receiveShadow = true;
    approachesGroup.add(cutStoneMesh);

    // Washed stone & border frame
    const washedZoneX = endSign * (HALF_LEN + 3.9);
    const frameSlabGeo = new THREE.BoxGeometry(5.0, 0.41, 15.2);
    const frameSlab = new THREE.Mesh(frameSlabGeo, materials.graniteBorderStone);
    frameSlab.position.set(washedZoneX, BASE_Y - 0.125, 0);
    frameSlab.receiveShadow = true;
    approachesGroup.add(frameSlab);

    [-2.05, 2.05].forEach(pz => {
      const wPanelGeo = new THREE.BoxGeometry(3.8, 0.02, 3.3);
      const wPanel = new THREE.Mesh(wPanelGeo, materials.washedPaving);
      wPanel.position.set(washedZoneX, BASE_Y + 0.085, pz);
      wPanel.receiveShadow = true;
      approachesGroup.add(wPanel);
    });

    [-5.35, 5.35].forEach(pzOuter => {
      const wOuterGeo = new THREE.BoxGeometry(4.2, 0.02, 2.6);
      const wOuter = new THREE.Mesh(wOuterGeo, materials.washedPaving);
      wOuter.position.set(washedZoneX - endSign * 0.2, BASE_Y + 0.01, pzOuter);
      wOuter.rotation.x = (pzOuter > 0 ? 1 : -1) * 0.035;
      wOuter.receiveShadow = true;
      approachesGroup.add(wOuter);
    });

    const curbStoneGeo = new THREE.BoxGeometry(0.42, 0.43, 15.4);
    const curbStone = new THREE.Mesh(curbStoneGeo, materials.whiteProtectiveCoat);
    curbStone.position.set(endSign * (HALF_LEN + 6.1), BASE_Y - 0.12, 0);
    curbStone.receiveShadow = true;
    approachesGroup.add(curbStone);

    const outerPlazaGeo = new THREE.BoxGeometry(16.0, 0.40, 26.0);
    const outerPlaza = new THREE.Mesh(outerPlazaGeo, materials.gravelGround);
    outerPlaza.position.set(endSign * (HALF_LEN + 14.2), BASE_Y - 0.14, 0);
    outerPlaza.receiveShadow = true;
    approachesGroup.add(outerPlaza);

    // 2-tier Kikko Masonry Abutment Walls
    const mainAbutmentWallGeo = new THREE.BoxGeometry(5.6, 3.2, 15.6);
    const mainAbutmentWall = new THREE.Mesh(mainAbutmentWallGeo, materials.kikkoMasonry);
    mainAbutmentWall.position.set(endSign * (HALF_LEN + 2.6), BASE_Y - 1.72, 0);
    mainAbutmentWall.receiveShadow = true;
    mainAbutmentWall.castShadow = true;
    approachesGroup.add(mainAbutmentWall);

    [-1, 1].forEach(sideSign => {
      const stepTerraceGeo = new THREE.BoxGeometry(5.4, 1.5, 1.8);
      const stepTerrace = new THREE.Mesh(stepTerraceGeo, materials.kikkoMasonry);
      stepTerrace.position.set(endSign * (HALF_LEN + 2.4), BASE_Y - 1.55, sideSign * 8.2);
      stepTerrace.receiveShadow = true;
      approachesGroup.add(stepTerrace);

      const copingGeo = new THREE.BoxGeometry(5.5, 0.14, 1.95);
      const coping = new THREE.Mesh(copingGeo, materials.graniteBorderStone);
      coping.position.set(endSign * (HALF_LEN + 2.4), BASE_Y - 0.78, sideSign * 8.2);
      approachesGroup.add(coping);
    });

    // Right-hand traffic signpost
    const signGroup = new THREE.Group();
    signGroup.position.set(endSign * (HALF_LEN + 0.22), BASE_Y + 0.08, 0);

    const postGeo = new THREE.BoxGeometry(0.075, 2.55, 0.075);
    const post = new THREE.Mesh(postGeo, materials.hinokiRailing);
    post.position.y = 1.275;
    post.castShadow = true;
    signGroup.add(post);

    const signBoxGeo = new THREE.BoxGeometry(0.12, 0.72, 0.38);
    const signBox = new THREE.Mesh(signBoxGeo, materials.rightTrafficSign);
    signBox.position.y = 2.45;
    signBox.castShadow = true;
    signGroup.add(signBox);

    const roofCapGeo = new THREE.BoxGeometry(0.24, 0.045, 0.48);
    const roofCap = new THREE.Mesh(roofCapGeo, materials.hinokiRailing);
    roofCap.position.y = 2.83;
    signGroup.add(roofCap);

    approachesGroup.add(signGroup);

    // Shinmei Torii Gate (Authentic Ise Jingu style)
    const toriiGroup = new THREE.Group();
    toriiGroup.position.set(toriiX, BASE_Y + 0.08, 0);

    const colSpan = 7.40;
    const colH = 8.85;
    const colTopR = 0.41;
    const colBotR = 0.48;

    [-colSpan / 2, colSpan / 2].forEach(tz => {
      const tColGeo = new THREE.CylinderGeometry(colTopR, colBotR, colH, 40);
      const tCol = new THREE.Mesh(tColGeo, materials.hinokiColumn);
      tCol.position.set(0, colH / 2 - 0.08, tz);
      tCol.castShadow = true;
      tCol.receiveShadow = true;
      toriiGroup.add(tCol);

      const baseWeatherGeo = new THREE.CylinderGeometry(colBotR * 0.992, colBotR * 1.004, 0.85, 40);
      const baseWeatherMat = new THREE.MeshStandardMaterial({
        color: 0x42382c,
        roughness: 0.42
      });
      const baseWeather = new THREE.Mesh(baseWeatherGeo, baseWeatherMat);
      baseWeather.position.set(0, 0.34, tz);
      toriiGroup.add(baseWeather);
    });

    // Kasagi
    const kasagiTopHalfLen = 5.75;
    const kasagiBotHalfLen = 5.56;
    const kasagiWallH = 0.50;
    const kasagiHalfThick = 0.33;

    const kasagiGroup = new THREE.Group();
    kasagiGroup.position.set(0, colH - 0.12, 0);

    const lowerShape = new THREE.Shape();
    lowerShape.moveTo(-kasagiBotHalfLen, 0);
    lowerShape.lineTo(kasagiBotHalfLen, 0);
    lowerShape.lineTo(kasagiTopHalfLen, kasagiWallH);
    lowerShape.lineTo(-kasagiTopHalfLen, kasagiWallH);
    lowerShape.closePath();

    const lowerExtrudeGeo = new THREE.ExtrudeGeometry(lowerShape, { depth: kasagiHalfThick * 2, bevelEnabled: false });
    lowerExtrudeGeo.rotateY(Math.PI / 2);
    lowerExtrudeGeo.translate(-kasagiHalfThick, 0, 0);
    const kasagiBody = new THREE.Mesh(lowerExtrudeGeo, materials.hinokiColumn);
    kasagiBody.castShadow = true;
    kasagiBody.receiveShadow = true;
    kasagiGroup.add(kasagiBody);

    [-1, 1].forEach(sideX => {
      const roofSlopeGeo = new THREE.BoxGeometry(kasagiHalfThick * 1.08, 0.12, kasagiTopHalfLen * 2 + 0.04);
      const roofSlope = new THREE.Mesh(roofSlopeGeo, materials.hinokiColumn);
      roofSlope.position.set(sideX * (kasagiHalfThick * 0.48), kasagiWallH + 0.08, 0);
      roofSlope.rotation.z = -sideX * 0.34;
      roofSlope.castShadow = true;
      kasagiGroup.add(roofSlope);

      const copperSlopeGeo = new THREE.BoxGeometry(kasagiHalfThick * 1.12, 0.035, kasagiTopHalfLen * 2 + 0.08);
      const copperSlope = new THREE.Mesh(copperSlopeGeo, materials.blackIronHardware);
      copperSlope.position.set(sideX * (kasagiHalfThick * 0.48), kasagiWallH + 0.13, 0);
      copperSlope.rotation.z = -sideX * 0.34;
      kasagiGroup.add(copperSlope);
    });

    toriiGroup.add(kasagiGroup);

    // Non-protruding Nuki with trapezoidal wedges
    const nukiSpanLen = colSpan - colTopR * 1.2;
    const nukiHeight = 0.56;
    const nukiThick = 0.28;
    const nukiCenterY = colH - 1.72;

    const nukiGeo = new THREE.BoxGeometry(nukiThick, nukiHeight, nukiSpanLen);
    const nuki = new THREE.Mesh(nukiGeo, materials.hinokiColumn);
    nuki.position.set(0, nukiCenterY, 0);
    nuki.castShadow = true;
    nuki.receiveShadow = true;
    toriiGroup.add(nuki);

    [-1, 1].forEach(sideZ => {
      const innerColumnFaceZ = sideZ * (colSpan / 2 - colTopR * 0.88);
      const wedgeW = 0.38;
      const wedgeH = 0.22;

      const wedgeShape = new THREE.Shape();
      if (sideZ > 0) {
        wedgeShape.moveTo(0, 0);
        wedgeShape.lineTo(-wedgeW, 0);
        wedgeShape.lineTo(-wedgeW, wedgeH * 0.32);
        wedgeShape.lineTo(0, wedgeH);
      } else {
        wedgeShape.moveTo(0, 0);
        wedgeShape.lineTo(wedgeW, 0);
        wedgeShape.lineTo(wedgeW, wedgeH * 0.32);
        wedgeShape.lineTo(0, wedgeH);
      }
      wedgeShape.closePath();

      const wedgeGeo = new THREE.ExtrudeGeometry(wedgeShape, { depth: nukiThick * 1.04, bevelEnabled: false });
      wedgeGeo.rotateY(Math.PI / 2);
      wedgeGeo.translate(-nukiThick * 0.52, nukiCenterY + nukiHeight / 2, innerColumnFaceZ);

      const wedgeMesh = new THREE.Mesh(wedgeGeo, materials.hinokiColumn);
      wedgeMesh.castShadow = true;
      toriiGroup.add(wedgeMesh);
    });

    approachesGroup.add(toriiGroup);
  });

  // Layer filter function
  function setLayerFilter(layer: StructureLayer) {
    if (layer === 'all') {
      deckGroup.visible = true;
      railingsGroup.visible = true;
      substructureGroup.visible = true;
      riverGroup.visible = true;
      approachesGroup.visible = true;
    } else {
      deckGroup.visible = (layer === 'deck');
      railingsGroup.visible = (layer === 'railings');
      substructureGroup.visible = (layer === 'substructure');
      riverGroup.visible = (layer === 'river');
      approachesGroup.visible = (layer === 'approaches');
    }
  }

  // Exploded / layer separation function
  function setExplodedOffset(t: number) {
    const clamped = Math.max(0, Math.min(1, t));
    // Substructure stays grounded at 0
    // Deck lifts up by 2.2m * t
    deckGroup.position.y = clamped * 2.2;
    // Railings lift up by 4.8m * t (clearing deck and allowing view of joinery)
    railingsGroup.position.y = clamped * 4.8;
  }

  // River water wave animation
  function animateRiver(elapsed: number) {
    if (riverGeo) {
      const positionAttr = riverGeo.attributes.position;
      for (let i = 0; i < positionAttr.count; i++) {
        const v = riverVertices[i];
        const wave = Math.sin(v.z * 0.45 + elapsed * 3.2) * 0.055 + Math.cos(v.x * 0.35 - elapsed * 2.0) * 0.035;
        positionAttr.setY(i, v.y + wave);
      }
      positionAttr.needsUpdate = true;
    }
  }

  return {
    rootGroup,
    deckGroup,
    railingsGroup,
    substructureGroup,
    riverGroup,
    approachesGroup,
    riverMesh,
    riverVertices,
    kiyokeWakeCircles,
    weirFoamMesh,
    setLayerFilter,
    setExplodedOffset,
    animateRiver,
  };
}
