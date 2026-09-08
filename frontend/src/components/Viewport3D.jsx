import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Compass, ZoomIn, ZoomOut, Move3d } from 'lucide-react';

export default function Viewport3D({
  trajectoryPoses = [],
  currentFrameIndex = 0,
  robotConfig = { robot_type: 'so101', offset_x: 0.20, offset_y: 0.00, offset_z: 0.00, yaw_deg: 0.0 }
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const tubeMeshRef = useRef(null);
  const cursorMeshRef = useRef(null);
  const robotGroupRef = useRef(null);
  const offsetLineRef = useRef(null);

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState('iso');
  const [isOrbitTouchEnabled, setIsOrbitTouchEnabled] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    sceneRef.current = scene;

    // 2. Camera Setup (Z is Up in robotics convention)
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 50);
    camera.position.set(0.42, -0.48, 0.42);
    camera.up.set(0, 0, 1);
    camera.lookAt(0.15, 0.05, 0.08);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls Setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.15, 0.05, 0.08);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.08;
    controls.maxDistance = 3.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.20; // Prevent looking completely underneath table
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 2.2;
    // Disable default wheel capture so ordinary mouse wheel scrolls the page freely!
    controls.enableZoom = false;
    controlsRef.current = controls;

    // Allow Ctrl + Mouse Wheel (or Cmd + Wheel) to zoom 3D camera without scrolling page
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
        const zoomDelta = e.deltaY > 0 ? 0.15 : -0.15;
        if ((zoomDelta > 0 && dir.length() < 4.0) || (zoomDelta < 0 && dir.length() > 0.12)) {
          camera.position.addScaledVector(dir, zoomDelta);
          controls.update();
        }
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(1.0, -1.0, 2.0);
    scene.add(dirLight);

    // 6. Workstation Tabletop Mesh
    const tableGeo = new THREE.BoxGeometry(0.90, 0.70, 0.02);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0.18, 0.12, -0.01);
    scene.add(tableMesh);

    // Tabletop Grid
    const gridHelper = new THREE.GridHelper(0.90, 18, 0x475569, 0x334155);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0.18, 0.12, 0.001);
    scene.add(gridHelper);

    // 7. Dual-ArUco Board Meshes
    // Tag A (10cm) at (0, 0, 0)
    const tagAGeo = new THREE.PlaneGeometry(0.10, 0.10);
    const tagAMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const tagAMesh = new THREE.Mesh(tagAGeo, tagAMat);
    tagAMesh.position.set(0.05, 0.05, 0.002);
    scene.add(tagAMesh);

    // Tag B (5cm) at (0.15, 0, 0)
    const tagBGeo = new THREE.PlaneGeometry(0.05, 0.05);
    const tagBMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const tagBMesh = new THREE.Mesh(tagBGeo, tagBMat);
    tagBMesh.position.set(0.175, 0.025, 0.002);
    scene.add(tagBMesh);

    // Origin Axes Gizmo
    const axesGizmo = new THREE.AxesHelper(0.09);
    axesGizmo.position.set(0, 0, 0.005);
    scene.add(axesGizmo);

    // 8. Animated End-Effector Cursor Sphere
    const cursorGeo = new THREE.SphereGeometry(0.012, 32, 32);
    const cursorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.5
    });
    const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
    cursorMeshRef.current = cursorMesh;
    scene.add(cursorMesh);

    // Render loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. ResizeObserver to dynamically update when panels are dragged or window is resized
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 10 && newH > 10) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('wheel', handleWheel);
      controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Sync auto-rotate with controls
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  // Sync touch orbit mode with controls
  useEffect(() => {
    if (!controlsRef.current) return;
    if (isOrbitTouchEnabled) {
      controlsRef.current.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      };
      controlsRef.current.enabled = true;
    } else {
      controlsRef.current.touches = {
        ONE: null,
        TWO: THREE.TOUCH.DOLLY_PAN
      };
      controlsRef.current.enabled = false;
    }
  }, [isOrbitTouchEnabled]);

  // Zoom In / Out Handlers
  const handleZoomIn = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    if (dir.length() > 0.12) {
      camera.position.addScaledVector(dir, -0.20);
      controls.update();
    }
  };

  const handleZoomOut = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    if (dir.length() < 4.0) {
      camera.position.addScaledVector(dir, 0.20);
      controls.update();
    }
  };

  // Set Camera View Angle Preset
  const setViewPreset = (view) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveView(view);
    setIsAutoRotate(false);

    if (view === 'iso') {
      camera.position.set(0.42, -0.48, 0.42);
      controls.target.set(0.15, 0.05, 0.08);
    } else if (view === 'top') {
      camera.position.set(0.15, 0.05, 0.85);
      controls.target.set(0.15, 0.05, 0.0);
    } else if (view === 'front') {
      camera.position.set(0.15, -0.70, 0.15);
      controls.target.set(0.15, 0.05, 0.08);
    } else if (view === 'side') {
      camera.position.set(0.85, 0.05, 0.15);
      controls.target.set(0.15, 0.05, 0.08);
    }
    controls.update();
  };

  // Update Trajectory Tube & Cursor when trajectoryPoses or currentFrameIndex changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (tubeMeshRef.current) {
      scene.remove(tubeMeshRef.current);
      tubeMeshRef.current = null;
    }

    if (trajectoryPoses.length > 1) {
      const points = trajectoryPoses.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(
        curve,
        Math.max(20, trajectoryPoses.length),
        0.004,
        8,
        false
      );
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x4f46e5,
        emissiveIntensity: 0.4,
        roughness: 0.3
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMeshRef.current = tubeMesh;
      scene.add(tubeMesh);
    }

    // Update cursor position
    if (cursorMeshRef.current && trajectoryPoses.length > 0) {
      const idx = Math.min(currentFrameIndex, trajectoryPoses.length - 1);
      const p = trajectoryPoses[idx];
      cursorMeshRef.current.position.set(p[0], p[1], p[2]);
    }
  }, [trajectoryPoses, currentFrameIndex]);

  // Update Robot 3D Mesh and Table-Plane Offset Gizmo when robotConfig changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean previous robot model & line
    if (robotGroupRef.current) {
      scene.remove(robotGroupRef.current);
      robotGroupRef.current = null;
    }
    if (offsetLineRef.current) {
      scene.remove(offsetLineRef.current);
      offsetLineRef.current = null;
    }

    const { offset_x = 0.20, offset_y = 0.00, offset_z = 0.00, yaw_deg = 0.0, robot_type = 'so101' } =
      robotConfig || {};
    const yawRad = THREE.MathUtils.degToRad(yaw_deg);
    const is101 = robot_type.toLowerCase() === 'so101';

    // Link dimensions (meters)
    const L1 = is101 ? 0.118 : 0.115;
    const L2 = is101 ? 0.140 : 0.135;
    const L3 = is101 ? 0.145 : 0.140;
    const L4 = is101 ? 0.110 : 0.105;
    const maxReach = L2 + L3 + L4;

    const robotGroup = new THREE.Group();
    robotGroup.position.set(offset_x, offset_y, offset_z + 0.001);
    robotGroup.rotation.z = yawRad;

    // 1. Table-Mounting Base Footprint Plate
    const basePlateGeo = new THREE.CylinderGeometry(0.046, 0.050, 0.010, 32);
    basePlateGeo.rotateX(Math.PI / 2);
    const basePlateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8
    });
    const basePlate = new THREE.Mesh(basePlateGeo, basePlateMat);
    basePlate.position.set(0, 0, 0.005);
    robotGroup.add(basePlate);

    // 2. Base Turret / Servo Joint (q0)
    const turretGeo = new THREE.CylinderGeometry(0.032, 0.036, 0.024, 32);
    turretGeo.rotateX(Math.PI / 2);
    const turretMat = new THREE.MeshStandardMaterial({
      color: is101 ? 0x6366f1 : 0x0284c7,
      roughness: 0.4,
      metalness: 0.6
    });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.position.set(0, 0, 0.022);
    robotGroup.add(turret);

    // 3. Heading Direction Indicator Arrow on Table Plane
    const headingDir = new THREE.Vector3(1, 0, 0);
    const arrowHelper = new THREE.ArrowHelper(
      headingDir,
      new THREE.Vector3(0, 0, 0.012),
      0.065,
      is101 ? 0x818cf8 : 0x38bdf8,
      0.018,
      0.012
    );
    robotGroup.add(arrowHelper);

    // 4. Stylized Robot Arm Links (Ready / Home Pose)
    const armMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.5,
      roughness: 0.3
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.2
    });

    // Shoulder pillar (L1 height)
    const pillarGeo = new THREE.CylinderGeometry(0.016, 0.018, L1, 16);
    pillarGeo.rotateX(Math.PI / 2);
    const pillar = new THREE.Mesh(pillarGeo, armMat);
    pillar.position.set(0, 0, L1 / 2);
    robotGroup.add(pillar);

    // Shoulder joint sphere
    const shoulderSphereGeo = new THREE.SphereGeometry(0.020, 16, 16);
    const shoulderSphere = new THREE.Mesh(shoulderSphereGeo, jointMat);
    shoulderSphere.position.set(0, 0, L1);
    robotGroup.add(shoulderSphere);

    // Upper arm link (L2) angled up & forward (approx 55 deg)
    const upperArmAngle = THREE.MathUtils.degToRad(55);
    const upperArmDx = L2 * Math.cos(upperArmAngle);
    const upperArmDz = L2 * Math.sin(upperArmAngle);
    const elbowPos = new THREE.Vector3(upperArmDx, 0, L1 + upperArmDz);

    const upperArmCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, L1), elbowPos);
    const upperArmGeo = new THREE.TubeGeometry(upperArmCurve, 8, 0.012, 12, false);
    const upperArm = new THREE.Mesh(upperArmGeo, armMat);
    robotGroup.add(upperArm);

    // Elbow joint sphere
    const elbowSphere = new THREE.Mesh(shoulderSphereGeo, jointMat);
    elbowSphere.position.copy(elbowPos);
    robotGroup.add(elbowSphere);

    // Forearm link (L3) reaching forward & down
    const forearmAngle = THREE.MathUtils.degToRad(-25);
    const forearmDx = L3 * Math.cos(forearmAngle);
    const forearmDz = L3 * Math.sin(forearmAngle);
    const wristPos = new THREE.Vector3(elbowPos.x + forearmDx, 0, elbowPos.z + forearmDz);

    const forearmCurve = new THREE.LineCurve3(elbowPos, wristPos);
    const forearmGeo = new THREE.TubeGeometry(forearmCurve, 8, 0.010, 12, false);
    const forearm = new THREE.Mesh(forearmGeo, armMat);
    robotGroup.add(forearm);

    // Wrist joint
    const wristSphereGeo = new THREE.SphereGeometry(0.014, 16, 16);
    const wristSphere = new THREE.Mesh(wristSphereGeo, jointMat);
    wristSphere.position.copy(wristPos);
    robotGroup.add(wristSphere);

    // Gripper tip (L4)
    const gripperTipPos = new THREE.Vector3(wristPos.x + L4, 0, wristPos.z);
    const gripperCurve = new THREE.LineCurve3(wristPos, gripperTipPos);
    const gripperGeo = new THREE.TubeGeometry(gripperCurve, 6, 0.007, 8, false);
    const gripperMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.2
    });
    const gripperMesh = new THREE.Mesh(gripperGeo, gripperMat);
    robotGroup.add(gripperMesh);

    // 5. Reach Envelope Circle projected on Table Plane
    const reachRingGeo = new THREE.RingGeometry(maxReach * 0.98, maxReach, 64);
    const reachRingMat = new THREE.MeshBasicMaterial({
      color: is101 ? 0x818cf8 : 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const reachRing = new THREE.Mesh(reachRingGeo, reachRingMat);
    reachRing.position.set(0, 0, 0.002);
    robotGroup.add(reachRing);

    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

    // 6. Dashed Reference Line from ArUco Tag A (0,0,0) to Robot Base
    const linePoints = [
      new THREE.Vector3(0, 0, 0.004),
      new THREE.Vector3(offset_x, offset_y, offset_z + 0.004)
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xa855f7,
      dashSize: 0.02,
      gapSize: 0.01,
      linewidth: 1
    });
    const refLine = new THREE.Line(lineGeo, lineMat);
    refLine.computeLineDistances();
    offsetLineRef.current = refLine;
    scene.add(refLine);
  }, [robotConfig]);

  const { offset_x = 0.20, offset_y = 0.00, yaw_deg = 0.0, robot_type = 'so101' } = robotConfig || {};

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card group">
      <div
        ref={mountRef}
        className={`w-full h-full ${isOrbitTouchEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{ touchAction: isOrbitTouchEnabled ? 'none' : 'pan-y' }}
      />

      {/* Top Left: ArUco Origin & Robot Base Info Pill */}
      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md border border-slate-700/70 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2.5 pointer-events-none z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>ArUco Origin: (0,0,0)</span>
        <span className="text-slate-500">|</span>
        <span className="font-semibold text-indigo-300">
          🤖 {robot_type.toUpperCase()} Base: ({(offset_x * 100).toFixed(0)}cm, {(offset_y * 100).toFixed(0)}cm, {yaw_deg.toFixed(0)}°)
        </span>
      </div>

      {/* Top Right: View Angle Controls, Zoom Controls, Touch Mode & Auto-Rotate */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl text-[11px] z-10 shadow-lg flex-wrap justify-end">
        {/* Presets */}
        <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewPreset('iso')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              activeView === 'iso' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Isometric View"
          >
            Iso
          </button>
          <button
            onClick={() => setViewPreset('top')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              activeView === 'top' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Top-Down View (XY Table Plane)"
          >
            Top
          </button>
          <button
            onClick={() => setViewPreset('front')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              activeView === 'front' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Front View"
          >
            Front
          </button>
          <button
            onClick={() => setViewPreset('side')}
            className={`px-2 py-0.5 rounded font-medium transition-all ${
              activeView === 'side' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Side View"
          >
            Side
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            title="Zoom In 3D Camera (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
            title="Zoom Out 3D Camera (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Touch Mode Toggle (Orbit vs Scroll Page) */}
        <button
          onClick={() => setIsOrbitTouchEnabled(!isOrbitTouchEnabled)}
          className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-[10px] font-medium border ${
            isOrbitTouchEnabled
              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title={
            isOrbitTouchEnabled
              ? "3D Orbit Mode: Drag rotates 3D scene (Click to switch to Page Scroll mode)"
              : "Page Scroll Mode: Single finger drags scroll page (Click to enable 3D Orbit)"
          }
        >
          <Move3d className="w-3.5 h-3.5 text-indigo-400" />
          <span>{isOrbitTouchEnabled ? 'Orbit 3D' : 'Scroll Page'}</span>
        </button>

        {/* Auto-Rotate Toggle */}
        <button
          onClick={() => setIsAutoRotate(!isAutoRotate)}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
            isAutoRotate ? 'bg-purple-600 text-white animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={isAutoRotate ? "Stop Auto-Rotation" : "Start Auto-Rotation"}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Bottom Left: Interactive Control Hint */}
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-mono pointer-events-none z-10 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
        <Compass className="w-3 h-3 text-indigo-400" />
        <span>Drag: Rotate • Scroll: Page • [+/-] / Ctrl+Scroll: Zoom</span>
      </div>
    </div>
  );
}
