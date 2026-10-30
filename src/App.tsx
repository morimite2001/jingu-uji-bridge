/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { createProceduralMaterials, applySurfaceCondition } from './3d/materials';
import { buildUjiBridgeModel, BridgeModel } from './3d/bridgeBuilder';
import { VIEWPOINTS, ANNOTATION_PINS } from './data/viewpoints';
import { getWalkthroughCoords } from './utils/bridgeMath';
import { StructureLayer, SurfaceCondition, Viewpoint } from './types';

import { HeaderHUD } from './components/HeaderHUD';
import { DockHUD } from './components/DockHUD';
import { DetailCard } from './components/DetailCard';
import { SpecsModal } from './components/SpecsModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  // App State
  const [currentViewpoint, setCurrentViewpoint] = useState<Viewpoint>(VIEWPOINTS[0]);
  const [surfaceCondition, setSurfaceCondition] = useState<SurfaceCondition>('wet');
  const [activeLayer, setActiveLayer] = useState<StructureLayer>('all');
  const [explodedOffset, setExplodedOffset] = useState<number>(0);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [isWalkthrough, setIsWalkthrough] = useState<boolean>(false);

  // Modals
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Ref storage for 3D engine handles
  const bridgeModelRef = useRef<BridgeModel | null>(null);
  const materialsRef = useRef<ReturnType<typeof createProceduralMaterials> | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Animation controller ref
  const animRef = useRef({
    active: false,
    progress: 0,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    walkthrough: false,
    walkT: 0,
  });

  // Pin marker projections
  const [pinPositions, setPinPositions] = useState<{ id: string; x: number; y: number; visible: boolean; label: string; vpId: string }[]>([]);

  // Smooth camera transition to a viewpoint
  const handleSelectViewpoint = useCallback((vp: Viewpoint) => {
    setCurrentViewpoint(vp);
    setIsWalkthrough(false);

    if (cameraRef.current && controlsRef.current) {
      animRef.current.active = true;
      animRef.current.walkthrough = false;
      animRef.current.progress = 0;
      animRef.current.startPos.copy(cameraRef.current.position);
      animRef.current.endPos.copy(vp.camPos);
      animRef.current.startTarget.copy(controlsRef.current.target);
      animRef.current.endTarget.copy(vp.camTarget);
    }
  }, []);

  // Walkthrough toggle
  const handleToggleWalkthrough = useCallback(() => {
    setIsWalkthrough((prev) => {
      const next = !prev;
      animRef.current.active = false;
      animRef.current.walkthrough = next;
      if (next) {
        animRef.current.walkT = 0;
      }
      return next;
    });
  }, []);

  // Surface condition change
  const handleToggleSurface = useCallback((cond: SurfaceCondition) => {
    setSurfaceCondition(cond);
    if (materialsRef.current && bridgeModelRef.current) {
      applySurfaceCondition(
        materialsRef.current,
        bridgeModelRef.current.riverMesh.material as THREE.MeshStandardMaterial,
        cond
      );
      const isWet = cond === 'wet';
      bridgeModelRef.current.weirFoamMesh.visible = isWet;
      bridgeModelRef.current.kiyokeWakeCircles.forEach(w => { w.visible = isWet; });
    }
  }, []);

  // Architectural layer filter
  const handleSelectLayer = useCallback((layer: StructureLayer) => {
    setActiveLayer(layer);
    bridgeModelRef.current?.setLayerFilter(layer);
  }, []);

  // Exploded lift change
  const handleChangeExploded = useCallback((offset: number) => {
    setExplodedOffset(offset);
    bridgeModelRef.current?.setExplodedOffset(offset);
  }, []);

  // Screenshot capture
  const handleCaptureScreenshot = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `ise-ujibashi-3d-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL renderer (Three.js skill directive)
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const skyBg = 0xdde6ed;
    scene.background = new THREE.Color(skyBg);
    scene.fog = new THREE.FogExp2(skyBg, 0.0016);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    camera.position.set(-38, 20, 52);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.38;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Studio Environment (RoomEnvironment) for bronze sheen & rivets
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI * 0.54; // allows looking up under the bridge girders
    controls.minDistance = 0.6;             // allows extreme macro closeup on Giboshi & rivets
    controls.maxDistance = 220;
    controls.target.set(0, 4.5, 0);

    // Stop automated camera movement if user manually moves
    controls.addEventListener('start', () => {
      animRef.current.active = false;
      animRef.current.walkthrough = false;
      setIsWalkthrough(false);
    });

    // Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0x8492a6, 1.45);
    scene.add(hemiLight);

    const mainDirLight = new THREE.DirectionalLight(0xfffdf9, 1.95);
    mainDirLight.position.set(38, 65, 42);
    if (!isSoftwareGl) {
      mainDirLight.castShadow = true;
      mainDirLight.shadow.mapSize.width = 2048;
      mainDirLight.shadow.mapSize.height = 2048;
      mainDirLight.shadow.camera.near = 5;
      mainDirLight.shadow.camera.far = 190;
      const dShadow = 65;
      mainDirLight.shadow.camera.left = -dShadow;
      mainDirLight.shadow.camera.right = dShadow;
      mainDirLight.shadow.camera.top = dShadow;
      mainDirLight.shadow.camera.bottom = -dShadow;
      mainDirLight.shadow.bias = -0.0004;
    }
    scene.add(mainDirLight);

    // Fill Light for North & Pier Details
    const subDirLight = new THREE.DirectionalLight(0xe2e8f0, 1.15);
    subDirLight.position.set(-45, 35, -38);
    scene.add(subDirLight);

    // Build Model
    const materials = createProceduralMaterials(renderer.capabilities.getMaxAnisotropy());
    materialsRef.current = materials;

    const bridgeModel = buildUjiBridgeModel(materials);
    bridgeModelRef.current = bridgeModel;
    scene.add(bridgeModel.rootGroup);

    // Resize & Orientation Handler for Mobile & Desktop
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      const aspect = width / height;
      camera.aspect = aspect;

      // In portrait orientation on mobile devices, expand vertical FOV so the 92m bridge fits horizontally
      if (aspect < 1.0) {
        camera.fov = Math.min(64, 42 / Math.max(0.68, aspect));
      } else {
        camera.fov = 42;
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    handleResize(); // Trigger immediately after scene construction
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Keyboard shortcut for walkthrough toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isWalkthrough) {
        handleToggleWalkthrough();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Render / Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();
    const projVec = new THREE.Vector3();

    // afterDraw helper for software WebGL pace (Three.js skill directive)
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          animationFrameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          animationFrameId = window.setTimeout(cb, 60);
        }
      };
      animationFrameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const elapsed = clock.getElapsedTime();

      // Camera preset animation
      if (animRef.current.active) {
        animRef.current.progress += 0.10;
        if (animRef.current.progress >= 1) {
          animRef.current.progress = 1;
          animRef.current.active = false;
        }
        const p = animRef.current.progress;
        // Cubic smoothstep easing
        const t = p * p * (3 - 2 * p);
        camera.position.lerpVectors(animRef.current.startPos, animRef.current.endPos, t);
        controls.target.lerpVectors(animRef.current.startTarget, animRef.current.endTarget, t);
      }

      // Walkthrough auto-walking
      if (animRef.current.walkthrough) {
        animRef.current.walkT += 0.0012;
        if (animRef.current.walkT > 1) {
          animRef.current.walkT = 0;
        }
        const coords = getWalkthroughCoords(animRef.current.walkT);
        camera.position.set(coords.position.x, coords.position.y, coords.position.z);
        controls.target.set(coords.target.x, coords.target.y, coords.target.z);
      }

      controls.update();

      // Wave animation on Isuzu river
      bridgeModel.animateRiver(elapsed);

      // Project annotation pins to screen
      const currentPins = ANNOTATION_PINS.map(pin => {
        projVec.copy(pin.pos);
        projVec.project(camera);
        const inFront = projVec.z < 1;
        const x = (projVec.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-(projVec.y * 0.5) + 0.5) * container.clientHeight;
        return {
          id: pin.id,
          x,
          y,
          visible: inFront,
          label: pin.shortLabel,
          vpId: pin.viewpointId,
        };
      });
      setPinPositions(currentPins);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 font-serif select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        data-testid="threejs-canvas"
      />

      {/* 3D Screen Annotation Markers */}
      {showAnnotations && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {pinPositions.map((pin) => {
            if (!pin.visible) return null;
            return (
              <button
                key={pin.id}
                onClick={() => {
                  const targetVp = VIEWPOINTS.find(v => v.id === pin.vpId);
                  if (targetVp) handleSelectViewpoint(targetVp);
                }}
                style={{
                  left: `${pin.x}px`,
                  top: `${pin.y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute pointer-events-auto flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full glass-panel bg-slate-900/90 hover:bg-amber-600 text-amber-200 hover:text-white border border-amber-400/70 shadow-lg text-[10px] md:text-xs font-sans-ui font-semibold transition hover:scale-110 active:scale-95"
                title={`${pin.label}へカメラ移動`}
                aria-label={pin.label}
              >
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400"></span>
                <span>{pin.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Header HUD */}
      <HeaderHUD
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onCaptureScreenshot={handleCaptureScreenshot}
      />

      {/* Viewpoint Architectural Commentary Card */}
      <DetailCard
        viewpoint={currentViewpoint}
        isWalkthrough={isWalkthrough}
      />

      {/* Bottom Consolidated Dock */}
      <DockHUD
        currentViewpoint={currentViewpoint}
        onSelectViewpoint={handleSelectViewpoint}
        surfaceCondition={surfaceCondition}
        onToggleSurface={handleToggleSurface}
        activeLayer={activeLayer}
        onSelectLayer={handleSelectLayer}
        explodedOffset={explodedOffset}
        onChangeExploded={handleChangeExploded}
        showAnnotations={showAnnotations}
        onToggleAnnotations={setShowAnnotations}
        isWalkthrough={isWalkthrough}
        onToggleWalkthrough={handleToggleWalkthrough}
      />

      {/* Specifications & Historical Blueprint Modal */}
      <SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />

      {/* Navigation Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
