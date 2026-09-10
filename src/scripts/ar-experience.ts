/* ============================================================
   WebAR Experience — Three.js + 8th Wall XR8
   Client-side only. This file never runs on the server.
   ============================================================ */
import * as THREE from 'three';

/* -----------------------------------------------------------
   Expose THREE globally — required by 8th Wall's Threejs
   pipeline module (loaded via CDN before this script runs).
   ----------------------------------------------------------- */
(window as any).THREE = THREE;

/* -----------------------------------------------------------
   Constants
   ----------------------------------------------------------- */
/** Physical width of the image target in metres (adjust to your print size) */
const TARGET_PHYSICAL_WIDTH = 0.2;

/* -----------------------------------------------------------
   Global type declarations for 8th Wall (injected via CDN).
   ----------------------------------------------------------- */
interface PipelineModule {
  name?: string;
  onAttach?: (engine: any) => void;
  onDetach?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
  onUpdate?: (args: { frameTime: number }) => void;
}

declare global {
  interface Window {
    XR8: any;
    THREE: typeof THREE;
    DeviceOrientationEvent: any;
  }

  const XR8: {
    GlTextureRenderer: { pipelineModule: () => PipelineModule };
    Threejs: {
      pipelineModule: () => PipelineModule;
      xrScene: () => THREE.Scene;
    };
    XrController: {
      pipelineModule: () => PipelineModule;
      configure: (config: Record<string, unknown>) => void;
    };
    XrConfig: {
      device: () => { ANY: symbol };
      camera: () => { BACK: symbol };
    };
    addCameraPipelineModules: (modules: PipelineModule[]) => void;
    addPipelineModules: (modules: PipelineModule[]) => void;
    run: (config: Record<string, unknown>) => void;
    stop: () => void;
  };
}

/* -----------------------------------------------------------
   DOM references
   ----------------------------------------------------------- */
const overlay = document.getElementById('ar-loading-overlay') as HTMLElement | null;
const statusEl = document.getElementById('ar-status') as HTMLElement | null;
const canvas = document.getElementById('ar-canvas') as HTMLCanvasElement | null;

/* -----------------------------------------------------------
   Helpers
   ----------------------------------------------------------- */
function showStatus(msg: string, durationMs = 3000) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.classList.add('visible');
  console.log(`[AR-Status] ${msg}`);
  if (durationMs > 0) {
    setTimeout(() => statusEl.classList.remove('visible'), durationMs);
  }
}

function hideOverlay() {
  console.log('[AR] Hiding overlay');
  overlay?.classList.add('hidden');
}

function showError(msg: string) {
  console.error(`[AR-Error] ${msg}`);
  if (!overlay) return;
  const spinner = overlay.querySelector('.loading-spinner');
  if (spinner) spinner.remove();
  const btn = overlay.querySelector('#ar-start-btn');
  if (btn) (btn as HTMLElement).style.display = 'none';
  const text = overlay.querySelector('.loading-text');
  if (text) text.textContent = msg;
}

/* -----------------------------------------------------------
   Canvas — full viewport sizing + resize listener
   ----------------------------------------------------------- */
function setupCanvas(): () => void {
  if (!canvas) return () => {};

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log(`[AR] Canvas resized to ${canvas.width}x${canvas.height}`);
  };
  resize();

  window.addEventListener('resize', resize);
  return () => window.removeEventListener('resize', resize);
}

/* -----------------------------------------------------------
   Three.js objects (managed by the custom pipeline module)
   ----------------------------------------------------------- */
let cube: THREE.Mesh | null = null;
let isCubeVisible = false;

function createCube(scene: THREE.Scene) {
  if (cube) return;

  console.log('[AR] Creating cube in scene');

  // Geometry + material
  const geometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
  const material = new THREE.MeshStandardMaterial({
    color: 0x00ccff,
    roughness: 0.3,
    metalness: 0.6,
  });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.075, 0);
  cube.visible = false;
  scene.add(cube);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(0.5, 1, 0.5);
  scene.add(dir);

  console.log('[AR] Cube created and added to scene');
}

/* -----------------------------------------------------------
   Custom pipeline module — scene visibility & animation.
   Registered via XR8.addPipelineModules() in initAR().
   ----------------------------------------------------------- */
let cubeAdded = false;

function createImageTargetPipeline(): PipelineModule {
  return {
    name: 'image-target-cube',

    onAttach(engine: any) {
      console.log('[AR-Pipeline] onAttach called');
    },

    onDetach() {
      console.log('[AR-Pipeline] onDetach called');
    },

    onUpdate({ frameTime }: { frameTime: number }) {
      if (!cube || !isCubeVisible) return;

      // Rotate the cube — adjust multipliers for speed
      cube.rotation.y += 0.02;
      cube.rotation.x += 0.01;
    },
  };
}

/* -----------------------------------------------------------
   Image target callbacks
   ----------------------------------------------------------- */
function onImageFound(evt: any) {
  console.log('[AR] onImageFound triggered', evt);

  if (!cubeAdded) {
    try {
      const scene = XR8.Threejs.xrScene();
      console.log('[AR] Got XR scene, creating cube');
      createCube(scene);
      cubeAdded = true;
    } catch (err) {
      console.error('[AR] Error getting XR scene:', err);
    }
  }

  isCubeVisible = true;
  if (cube) cube.visible = true;
  showStatus('¡Marcador detectado!');
  hideOverlay();
}

function onImageLost(evt: any) {
  console.log('[AR] onImageLost triggered', evt);
  isCubeVisible = false;
  if (cube) cube.visible = false;
  showStatus('Apunta a la imagen objetivo');
}

/* -----------------------------------------------------------
   XR8 error handler
   ----------------------------------------------------------- */
function onXrError(error: any) {
  console.error('[XR8] Error:', error);

  const errType = error?.type || error;
  const errPerm = error?.permission;

  if (errPerm === 'deviceorientation') {
    showError(
      'Permiso de orientación denegado.\n\n' +
      'En iOS/Safari, toca "Permitir" cuando el navegador solicite acceso al giroscopio.'
    );
  } else if (errType === 'permission' || error === 'permission-denied' || error === 'camera-access-denied') {
    showError(
      'Permiso de cámara denegado.\n\n' +
      'Permite el acceso a la cámara en la configuración de tu navegador.'
    );
  } else if (error === 'no-camera' || error === 'camera-not-available') {
    showError('No se encontró una cámara disponible en este dispositivo.');
  } else if (error === 'https-required') {
    showError(
      'Se requiere HTTPS para acceder a la cámara.\n\n' +
      'Asegúrate de que la página esté servida por HTTPS.'
    );
  } else {
    showError('Error al inicializar la cámara. Revisa la consola para más detalles.');
  }
}

/* -----------------------------------------------------------
   Device orientation permission (iOS 13+ / Safari)
   ----------------------------------------------------------- */
async function requestDeviceOrientationPermission() {
  const DeviceOrientationEvent = window.DeviceOrientationEvent as any;
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result !== 'granted') {
        console.warn('[AR] Device orientation permission denied');
      }
    } catch (e) {
      console.warn('[AR] Device orientation permission error:', e);
    }
  }
}

/* -----------------------------------------------------------
   Bootstrap
   ----------------------------------------------------------- */
async function initAR() {
  console.log('[AR] initAR called');

  if (typeof XR8 === 'undefined') {
    console.error('[AR] XR8 engine not found. Is the CDN script loaded?');
    showError('Error: motor 8th Wall no encontrado.');
    return;
  }

  if (!canvas) {
    console.error('[AR] Canvas element #ar-canvas not found.');
    showError('Error: canvas no encontrado en el DOM.');
    return;
  }

  setupCanvas();

  // Register the camera pipeline modules
  console.log('[AR] Registering camera pipeline modules');
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
  ]);

  // Register custom pipeline module for cube animation
  const imageTargetPipeline = createImageTargetPipeline();
  console.log('[AR] Registering custom pipeline module');
  XR8.addPipelineModules([imageTargetPipeline]);

  // Configure image target tracking
  console.log('[AR] Configuring image target data');
  XR8.XrController.configure({
    imageTargetData: [
      {
        name: 'placeholder-target',
        asset: '/placeholder-target.jpg',
        physicalWidth: TARGET_PHYSICAL_WIDTH,
      },
    ],
    maxTrackables: 1,
    onImageFound,
    onImageLost,
  });

  // Show "Tap to Start" button — iOS requires a user gesture
  // for deviceorientation permission.
  const btn = document.getElementById('ar-start-btn') as HTMLElement | null;
  if (btn) {
    btn.style.display = 'block';
    btn.addEventListener('click', async () => {
      btn.style.display = 'none';
      showStatus('Inicializando cámara…', 0);

      // Request deviceorientation permission (required on iOS/Safari)
      await requestDeviceOrientationPermission();

      console.log('[AR] Calling XR8.run()');
      // Start the XR8 session
      XR8.run({
        canvas,
        allowedDevices: XR8.XrConfig.device().ANY,
        cameraConfig: { direction: XR8.XrConfig.camera().BACK },
        onError: onXrError,
        onCameraStatusChange: (evt: any) => {
          console.log('[AR] Camera status:', evt);
          if (evt.status === 'normal') {
            hideOverlay();
            showStatus('Cámara activa — apunta a la imagen');
          }
        },
      });
    }, { once: true });
  }
}

/* -----------------------------------------------------------
   Wait for 8th Wall engine load, then initialize
   ----------------------------------------------------------- */
function onXrLoaded() {
  console.log('[AR] XR8 loaded');
  initAR();
}

if (typeof window !== 'undefined') {
  if ((window as any).XR8) {
    onXrLoaded();
  } else {
    window.addEventListener('xrloaded', onXrLoaded, { once: true });
  }
}
