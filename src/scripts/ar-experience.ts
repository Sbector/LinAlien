/* ============================================================
   WebAR Experience — Three.js + 8th Wall XR8
   Client-side only. This file never runs on the server.
   ============================================================ */
import * as THREE from 'three';

/* -----------------------------------------------------------
   Global XR8 types injected by the 8th Wall CDN script.
   We declare them here so TypeScript doesn't complain.
   ----------------------------------------------------------- */
declare global {
  interface Window {
    XR8: typeof XR8;
  }

  const XR8: {
    GlTextureRenderer: {
      pipelineModule: () => Record<string, unknown>;
    };
    Threejs: {
      pipelineModule: () => Record<string, unknown>;
      xrScene: () => THREE.Scene;
    };
    XrController: {
      pipelineModule: () => Record<string, unknown>;
      configure: (config: Record<string, unknown>) => void;
    };
    addCameraPipelineModules: (modules: Record<string, unknown>[]) => void;
    run: (config: Record<string, unknown>) => void;
    stop: () => void;
  };
}

/* -----------------------------------------------------------
   DOM references
   ----------------------------------------------------------- */
const overlay = document.getElementById('ar-loading-overlay') as HTMLElement | null;
const statusEl = document.getElementById('ar-status') as HTMLElement | null;

/* -----------------------------------------------------------
   Helpers
   ----------------------------------------------------------- */
function showStatus(msg: string, durationMs = 3000) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.classList.add('visible');
  if (durationMs > 0) {
    setTimeout(() => statusEl.classList.remove('visible'), durationMs);
  }
}

function hideOverlay() {
  overlay?.classList.add('hidden');
}

/* -----------------------------------------------------------
   Three.js scene setup (called once by 8th Wall)
   ----------------------------------------------------------- */
let rotatingCube: THREE.Mesh | null = null;

function createRotatingCube(scene: THREE.Scene) {
  const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ccff,
    roughness: 0.3,
    metalness: 0.6,
  });
  const cube = new THREE.Mesh(geometry, material);

  // Position cube above the image target (0, 0, 0 is the marker center)
  cube.position.set(0, 0.075, 0);
  scene.add(cube);

  // Add a simple light so the cube is visible
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(0.5, 1, 0.5);
  scene.add(dirLight);

  return cube;
}

/* -----------------------------------------------------------
   Animation loop (called each frame by 8th Wall)
   ----------------------------------------------------------- */
function onFrame(_frameTime: number) {
  if (rotatingCube) {
    rotatingCube.rotation.y += 0.02;
    rotatingCube.rotation.x += 0.01;
  }
}

/* -----------------------------------------------------------
   8th Wall pipeline events
   ----------------------------------------------------------- */
let cubeAdded = false;

function onCameraStatusChange(evt: Record<string, unknown>) {
  // evt.status can be: 'normal', 'limited', etc.
  if (evt.status === 'normal') {
    hideOverlay();
  }
}

function onXrFrame() {
  // The actual frame callback is provided by Threejs.pipelineModule()
}

function onImageFound() {
  if (!cubeAdded) {
    const scene = XR8.Threejs.xrScene();
    rotatingCube = createRotatingCube(scene);
    cubeAdded = true;
    showStatus('¡Marcador detectado!');
  }
}

function onImageLost() {
  showStatus('Apunta a la imagen objetivo');
}

/* -----------------------------------------------------------
   Bootstrap
   ----------------------------------------------------------- */
function initAR() {
  // Wait for the 8th Wall engine to be available
  if (typeof XR8 === 'undefined') {
    window.addEventListener('load', () => setTimeout(initAR, 200));
    return;
  }

  showStatus('Inicializando cámara…', 0);

  // Register pipeline modules
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
  ]);

  // Configure image targets
  // Replace 'placeholder-target.jpg' with your actual target image.
  // The asset must live in public/ so it's served at root.
  XR8.XrController.configure({
    imageTargets: [
      {
        name: 'placeholder-target',
        asset: '/placeholder-target.jpg',
        // Approximate physical width in metres (adjust to your print size)
        physicalWidth: 0.2,
      },
    ],
    // Maximum number of simultaneous targets to track
    maxTrackables: 1,
  });

  // Start the XR8 session
  XR8.run({
    canvas: document.getElementById('ar-canvas') as HTMLCanvasElement,
    // Camera permission is requested automatically by 8th Wall
    cameraConfig: {
      direction: 'auto',
    },
    // Use SLAM pipeline (already preloaded via data-preload-chunks)
    pipelines: [],
    // Listen for pipeline events
    onCameraStatusChange,
    onBeforeXrFrame: onXrFrame,
    // Custom events for image target detection
    listeners: {
      'reality.imagefound': onImageFound,
      'reality.imagelost': onImageLost,
    },
  });

  showStatus('Apunta la cámara a la imagen objetivo');
}

// Kick off when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAR);
} else {
  initAR();
}
