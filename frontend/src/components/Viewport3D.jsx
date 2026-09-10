import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Compass, ZoomIn, ZoomOut, Move3d, Crosshair, Sparkles, CheckCircle2, AlertTriangle, Layers, Bot, Camera } from 'lucide-react';

// ==============================================================================
// 5-DOF Robot Inverse Kinematics Engine (with Impossible Kinematics Handling)
// ==============================================================================
function solve5DofIK(targetX, targetY, targetZ, targetPitch, targetRoll, L1, L2, L3, L4, jointLimits, q3SafeMaxDeg = 0.0) {
  const q0 = Math.atan2(targetY, targetX);
  const r = Math.hypot(targetX, targetY);
  const zEff = Math.max(0.012, targetZ); // Enforce table surface clearance

  const maxReachWrist = (L2 + L3) * 0.995;
  const minReachWrist = Math.max(0.020, Math.abs(L2 - L3) + 0.010);

  let bestQ = null;
  let bestErr = 1e9;
  let wasClamped = false;
  let clampedReason = '';

  // Altitude-dependent ground-proximity plunge prior:
  // When reaching for floor or tabletop objects (targetZ < 0.16m), adapt nominal pitch downward
  // to prevent camera mount crushing into forearm and ensure top-down grasp.
  let nominalPitch = targetPitch || 0;
  if (targetZ < 0.16) {
    const alphaZ = Math.max(0, Math.min(1, (targetZ - 0.02) / 0.14));
    const plungePitch = THREE.MathUtils.degToRad(-60.0);
    nominalPitch = plungePitch * (1 - alphaZ) + nominalPitch * alphaZ;
  }

  // Downward plunge candidates FIRST to ensure safe negative q3
  const pitchCandidates = [nominalPitch];
  for (let d = 5; d <= 75; d += 5) {
    pitchCandidates.push(nominalPitch - THREE.MathUtils.degToRad(d));
  }
  for (let d = 5; d <= 75; d += 5) {
    pitchCandidates.push(nominalPitch + THREE.MathUtils.degToRad(d));
  }

  const q3SafeMax = q3SafeMaxDeg !== undefined ? Number(q3SafeMaxDeg) : 0.0;

  for (const pCand of pitchCandidates) {
    const pClamped = Math.max(-1.48, Math.min(1.48, pCand));
    let rw = r - L4 * Math.cos(pClamped);
    let zw = (zEff - L1) - L4 * Math.sin(pClamped);
    let dw = Math.hypot(rw, zw);
    let iterClamped = false;
    let iterReason = '';

    if (dw > maxReachWrist) {
      const s = maxReachWrist / Math.max(1e-6, dw);
      rw *= s;
      zw *= s;
      dw = maxReachWrist;
      iterClamped = true;
      iterReason = 'OUT_OF_REACH';
    } else if (dw < minReachWrist) {
      const s = minReachWrist / Math.max(1e-6, dw);
      rw *= s;
      zw *= s;
      dw = minReachWrist;
      iterClamped = true;
      iterReason = 'SINGULARITY';
    }

    const cosQ2 = Math.max(-1.0, Math.min(1.0, (dw * dw - L2 * L2 - L3 * L3) / (2.0 * L2 * L3)));
    const q2 = -Math.acos(cosQ2); // elbow-up
    const alpha = Math.atan2(zw, rw);
    const beta = Math.atan2(L3 * Math.sin(q2), L2 + L3 * Math.cos(q2));
    const q1 = alpha - beta;
    const q3 = pClamped - (q1 + q2);
    const q4 = targetRoll || 0;

    const qRad = [q0, q1, q2, q3, q4];
    let inLimits = true;
    for (let j = 0; j < 5; j++) {
      const [lo, hi] = jointLimits[j];
      if (qRad[j] < lo - 1e-3 || qRad[j] > hi + 1e-3) {
        inLimits = false;
        break;
      }
    }

    if (inLimits) {
      const th1 = q1;
      const th2 = q1 + q2;
      const th3 = q1 + q2 + q3;
      const rTip = L2 * Math.cos(th1) + L3 * Math.cos(th2) + L4 * Math.cos(th3);
      const zTip = L1 + L2 * Math.sin(th1) + L3 * Math.sin(th2) + L4 * Math.sin(th3);
      const xTip = rTip * Math.cos(q0);
      const yTip = rTip * Math.sin(q0);

      const posErr = Math.hypot(xTip - targetX, yTip - targetY, zTip - targetZ);
      const pitchDiff = Math.abs(pClamped - (targetPitch || 0));

      // Asymmetric Camera Safety Cost: Penalize positive q3 heavily
      const q3Deg = THREE.MathUtils.radToDeg(q3);
      let q3Penalty = 0;
      if (q3Deg > q3SafeMax) {
        q3Penalty = 500.0 * Math.pow(q3Deg - q3SafeMax, 2);
      } else {
        q3Penalty = -0.1 * Math.abs(q3Deg);
      }

      // Universal 3D Euclidean clearance: camera mount to forearm segment (Elbow -> Wrist)
      const pElbowX = L2 * Math.cos(q1) * Math.cos(q0);
      const pElbowY = L2 * Math.cos(q1) * Math.sin(q0);
      const pElbowZ = L1 + L2 * Math.sin(q1);

      const pWristX = pElbowX + L3 * Math.cos(th2) * Math.cos(q0);
      const pWristY = pElbowY + L3 * Math.cos(th2) * Math.sin(q0);
      const pWristZ = pElbowZ + L3 * Math.sin(th2);

      const tDirX = Math.cos(th3) * Math.cos(q0);
      const tDirY = Math.cos(th3) * Math.sin(q0);
      const tDirZ = Math.sin(th3);

      const latX = -Math.sin(q0);
      const latY = Math.cos(q0);
      const latZ = 0.0;

      const upX = tDirY * latZ - tDirZ * latY;
      const upY = tDirZ * latX - tDirX * latZ;
      const upZ = tDirX * latY - tDirY * latX;

      const pCamX = xTip - 0.128 * tDirX + 0.109 * upX;
      const pCamY = yTip - 0.128 * tDirY + 0.109 * upY;
      const pCamZ = zTip - 0.128 * tDirZ + 0.109 * upZ;

      const segX = pWristX - pElbowX;
      const segY = pWristY - pElbowY;
      const segZ = pWristZ - pElbowZ;
      const segLenSq = segX * segX + segY * segY + segZ * segZ;
      let camClearance = 0.10;
      if (segLenSq > 1e-6) {
        const tClamped = Math.max(0, Math.min(1, ((pCamX - pElbowX) * segX + (pCamY - pElbowY) * segY + (pCamZ - pElbowZ) * segZ) / segLenSq));
        const cX = pElbowX + tClamped * segX;
        const cY = pElbowY + tClamped * segY;
        const cZ = pElbowZ + tClamped * segZ;
        camClearance = Math.hypot(pCamX - cX, pCamY - cY, pCamZ - cZ);
      }

      let clearancePenalty = 0;
      if (camClearance < 0.045) {
        clearancePenalty = 800.0 * Math.pow(0.045 - camClearance, 2);
      }

      const score = posErr * 200.0 + pitchDiff * 0.05 + q3Penalty + clearancePenalty;

      if (score < bestErr) {
        bestErr = score;
        bestQ = qRad;
        wasClamped = iterClamped;
        clampedReason = iterReason;
        if (posErr < 0.005 && !iterClamped && q3Deg <= q3SafeMax && camClearance >= 0.045) break;
      }
    }
  }

  if (!bestQ) {
    wasClamped = true;
    clampedReason = 'JOINT_LIMIT';
    let rw = r - L4 * Math.cos(nominalPitch);
    let zw = (zEff - L1) - L4 * Math.sin(nominalPitch);
    let dw = Math.hypot(rw, zw);
    if (dw > maxReachWrist) {
      rw *= maxReachWrist / dw;
      zw *= maxReachWrist / dw;
      dw = maxReachWrist;
      clampedReason = 'OUT_OF_REACH';
    }
    const cosQ2 = Math.max(-1.0, Math.min(1.0, (dw * dw - L2 * L2 - L3 * L3) / (2.0 * L2 * L3)));
    const q2 = -Math.acos(cosQ2);
    const alpha = Math.atan2(zw, rw);
    const beta = Math.atan2(L3 * Math.sin(q2), L2 + L3 * Math.cos(q2));
    const q1 = alpha - beta;
    const q3 = nominalPitch - (q1 + q2);
    bestQ = [
      q0,
      Math.max(jointLimits[1][0], Math.min(jointLimits[1][1], q1)),
      Math.max(jointLimits[2][0], Math.min(jointLimits[2][1], q2)),
      Math.max(jointLimits[3][0], Math.min(jointLimits[3][1], q3)),
      Math.max(jointLimits[4][0], Math.min(jointLimits[4][1], targetRoll || 0))
    ];
  }

  return {
    q: bestQ,
    isClamped: wasClamped,
    clampedReason: clampedReason || 'OK',
    errorDist: bestErr
  };
}

const _up = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _quat = new THREE.Quaternion();

function orientCylinder(mesh, pA, pB, radius) {
  _dir.subVectors(pB, pA);
  const len = Math.max(0.001, _dir.length());
  mesh.scale.set(radius, len, radius);
  mesh.position.copy(pA).addScaledVector(_dir, 0.5);
  _dir.normalize();
  _quat.setFromUnitVectors(_up, _dir);
  mesh.quaternion.copy(_quat);
}

// Helper: Generates realistic ArUco Marker Canvas Texture with Origin Dot
function createArucoCanvasTexture(markerId) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Crisp white outer border margin
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  // Black marker frame
  ctx.fillStyle = '#090d16';
  ctx.fillRect(24, 24, 208, 208);

  // Inner simulated bit pattern
  ctx.fillStyle = '#ffffff';
  if (markerId === 0) {
    ctx.fillRect(64, 64, 44, 44);
    ctx.fillRect(148, 64, 44, 44);
    ctx.fillRect(64, 148, 44, 44);
    ctx.fillRect(106, 106, 44, 44);
  } else {
    ctx.fillRect(64, 106, 44, 44);
    ctx.fillRect(148, 106, 44, 44);
    ctx.fillRect(106, 64, 44, 44);
    ctx.fillRect(106, 148, 44, 44);
  }

  // Red origin corner dot at Corner 0 (bottom-left)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(28, 228, 9, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;

  // Load genuine high-res marker PNG from backend asynchronously
  if (typeof Image !== 'undefined') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 256, 256);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(28, 228, 9, 0, Math.PI * 2);
      ctx.fill();
      texture.needsUpdate = true;
    };
    img.src = `/api/marker/image?marker_id=${markerId}&size=256`;
  }

  return texture;
}

// Helper: Generates high-res Text Sprite for Tabletop Labels
function createTextSprite(text, bgColor = '#0f172a', textColor = '#94a3b8', borderColor = '#334155') {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(4, 4, 432, 56, 14);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 20px "JetBrains Mono", Menlo, Consolas, monospace';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 220, 32);

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.18, 0.026, 1);
  return sprite;
}

// Helper: Generates smooth Floor Reach Rings
function createCircleRing(radius, colorHex, dashed = true) {
  const segments = 96;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0.002));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  if (dashed) {
    const mat = new THREE.LineDashedMaterial({
      color: colorHex,
      dashSize: 0.020,
      gapSize: 0.015,
      transparent: true,
      opacity: 0.85
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    return line;
  } else {
    const mat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.75
    });
    return new THREE.Line(geo, mat);
  }
}

export default function Viewport3D({
  trajectoryPoses = [],
  eePoses = [],
  gripperStates = [],
  currentFrameIndex = 0,
  robotConfig = { robot_type: 'so_arm101_omni_kin', offset_x: 0.038, offset_y: -0.406, offset_z: 0.00, yaw_deg: 90.0 },
  onUpdateRobotConfig = null,
  episodeId = null,
  trajectoryMode = 'free_form',
  approachEePoses = [],
  approachGripperStates = [],
  approachCamPoses = [],
  isApproachPhase = false,
  approachFrameIndex = 0
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const tubeMeshRef = useRef(null);
  const approachTubeRef = useRef(null);
  const cameraLineRef = useRef(null);
  const cursorMeshRef = useRef(null);
  const camWaypointRef = useRef(null);
  const startMarkerRef = useRef(null);
  const goalMarkerRef = useRef(null);
  const homeMarkerRef = useRef(null);
  const homeLabelRef = useRef(null);
  const robotGroupRef = useRef(null);
  const zonesGroupRef = useRef(null);

  // Rigidly Mounted Camera Subsystem (Attached to Robot Embodiment)
  const mountedCamGroupRef = useRef(null);
  const mountedCamMeshRef = useRef(null);
  const mountedBracketRef = useRef(null);
  const mountedClampRef = useRef(null);
  const mountedToolRodRef = useRef(null);

  // Dynamic Articulated Robot Arm & End-Effector Meshes
  const turretMeshRef = useRef(null);
  const upperArmMeshRef = useRef(null);
  const forearmMeshRef = useRef(null);
  const elbowSphereRef = useRef(null);
  const wristSphereRef = useRef(null);
  const gripperMeshRef = useRef(null);
  const gripperTipRef = useRef(null);
  const reachLineRef = useRef(null);

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState('iso');
  const [isOrbitTouchEnabled, setIsOrbitTouchEnabled] = useState(true);
  const [isAligning, setIsAligning] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [showCameraPath, setShowCameraPath] = useState(true);
  const [showComponentBreakdown, setShowComponentBreakdown] = useState(false);

  const [ikStatus, setIkStatus] = useState({
    isFeasible: true,
    errorDistCm: 0.0,
    clampedReason: 'OK',
    jointsDeg: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 50);
    // Centered on the Recommended Tabletop Workspace (centroid: X=0.08m, Y=-0.20m, Z=0.08m)
    camera.position.set(0.48, -0.74, 0.48);
    camera.up.set(0, 0, 1);
    camera.lookAt(0.08, -0.20, 0.08);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.08, -0.20, 0.08);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.08;
    controls.maxDistance = 3.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.20;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 2.2;
    controls.enableZoom = false;
    controlsRef.current = controls;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(1.0, -1.0, 2.0);
    scene.add(dirLight);

    // =========================================================================
    // Tabletop Physical Surface (Width=0.88m, Depth=0.72m, centered at Y=-0.20m)
    // Encompasses Tag Anchors at Y=0 down to Robot Base at Y=-0.41m cleanly
    // =========================================================================
    const tableGeo = new THREE.BoxGeometry(0.88, 0.72, 0.02);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.60,
      metalness: 0.30
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0.08, -0.20, -0.01);
    scene.add(tableMesh);

    // Table Chamfer Border Trim
    const borderGeo = new THREE.BoxGeometry(0.89, 0.73, 0.018);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.set(0.08, -0.20, -0.011);
    scene.add(borderMesh);

    // Metric Tabletop Grid Helper (5cm spacing)
    const gridHelper = new THREE.GridHelper(0.88, 22, 0x334155, 0x1e293b);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0.08, -0.20, 0.001);
    scene.add(gridHelper);

    // =========================================================================
    // Authentic Dual ArUco Markers (Tag A: 10cm at Origin, Tag B: 5cm at +15cm)
    // =========================================================================
    const tagAGeo = new THREE.PlaneGeometry(0.10, 0.10);
    const tagAMat = new THREE.MeshBasicMaterial({
      map: createArucoCanvasTexture(0),
      side: THREE.DoubleSide
    });
    const tagAMesh = new THREE.Mesh(tagAGeo, tagAMat);
    tagAMesh.position.set(0.05, 0.05, 0.002);
    scene.add(tagAMesh);

    const tagBGeo = new THREE.PlaneGeometry(0.05, 0.05);
    const tagBMat = new THREE.MeshBasicMaterial({
      map: createArucoCanvasTexture(1),
      side: THREE.DoubleSide
    });
    const tagBMesh = new THREE.Mesh(tagBGeo, tagBMat);
    tagBMesh.position.set(0.175, 0.025, 0.002);
    scene.add(tagBMesh);

    // =========================================================================
    // Functional Workspace Layout Zones Overlay Group
    // =========================================================================
    const zonesGroup = new THREE.Group();
    zonesGroupRef.current = zonesGroup;
    scene.add(zonesGroup);

    // --- 1. REFERENCE ZONE (ArUco Anchors • Beyond Reach) ---
    const refZoneGeo = new THREE.PlaneGeometry(0.32, 0.16);
    const refZoneMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const refZoneMesh = new THREE.Mesh(refZoneGeo, refZoneMat);
    refZoneMesh.position.set(0.095, 0.04, 0.0015);
    zonesGroup.add(refZoneMesh);

    const refBorderPts = [
      new THREE.Vector3(-0.16, -0.08, 0),
      new THREE.Vector3(0.16, -0.08, 0),
      new THREE.Vector3(0.16, 0.08, 0),
      new THREE.Vector3(-0.16, 0.08, 0),
      new THREE.Vector3(-0.16, -0.08, 0)
    ];
    const refBorderGeo = new THREE.BufferGeometry().setFromPoints(refBorderPts);
    const refBorderMat = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.7 });
    const refBorderLine = new THREE.Line(refBorderGeo, refBorderMat);
    refBorderLine.position.copy(refZoneMesh.position);
    zonesGroup.add(refBorderLine);

    const refLabel = createTextSprite("REFERENCE ZONE (Anchors • Out of Reach)", "#083344", "#38bdf8", "#0e7490");
    refLabel.position.set(0.095, 0.130, 0.003);
    refLabel.scale.set(0.24, 0.034, 1);
    zonesGroup.add(refLabel);

    // --- 2. MANIPULATION WORKSPACE (Pick & Place Target Zone) ---
    const manipZoneGeo = new THREE.PlaneGeometry(0.52, 0.22);
    const manipZoneMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.07,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const manipZoneMesh = new THREE.Mesh(manipZoneGeo, manipZoneMat);
    manipZoneMesh.position.set(0.07, -0.20, 0.0015);
    zonesGroup.add(manipZoneMesh);

    const manipBorderPts = [
      new THREE.Vector3(-0.26, -0.11, 0),
      new THREE.Vector3(0.26, -0.11, 0),
      new THREE.Vector3(0.26, 0.11, 0),
      new THREE.Vector3(-0.26, 0.11, 0),
      new THREE.Vector3(-0.26, -0.11, 0)
    ];
    const manipBorderGeo = new THREE.BufferGeometry().setFromPoints(manipBorderPts);
    const manipBorderMat = new THREE.LineDashedMaterial({
      color: 0xa855f7,
      dashSize: 0.02,
      gapSize: 0.015,
      transparent: true,
      opacity: 0.8
    });
    const manipBorderLine = new THREE.Line(manipBorderGeo, manipBorderMat);
    manipBorderLine.computeLineDistances();
    manipBorderLine.position.copy(manipZoneMesh.position);
    zonesGroup.add(manipBorderLine);

    const manipLabel = createTextSprite("MANIPULATION WORKSPACE (Pick & Place Demo)", "#2e1065", "#c084fc", "#7c3aed");
    manipLabel.position.set(0.07, -0.078, 0.003);
    manipLabel.scale.set(0.28, 0.034, 1);
    zonesGroup.add(manipLabel);

    // --- 3. 5.0 cm Metric Gap Bracket Between Tags ---
    const gapPts = [
      new THREE.Vector3(0.10, 0.025, 0.003),
      new THREE.Vector3(0.15, 0.025, 0.003)
    ];
    const gapGeo = new THREE.BufferGeometry().setFromPoints(gapPts);
    const gapMat = new THREE.LineBasicMaterial({ color: 0x64748b });
    const gapLine = new THREE.Line(gapGeo, gapMat);
    zonesGroup.add(gapLine);

    const gapLabel = createTextSprite("5cm Gap", "#0f172a", "#94a3b8", "#334155");
    gapLabel.position.set(0.125, 0.038, 0.004);
    gapLabel.scale.set(0.065, 0.016, 1);
    zonesGroup.add(gapLabel);

    // --- 4. Tag Identifier Labels ---
    const tagALabel = createTextSprite("Tag A [Origin (0,0)]", "#022c22", "#34d399", "#059669");
    tagALabel.position.set(0.05, -0.018, 0.004);
    tagALabel.scale.set(0.14, 0.022, 1);
    zonesGroup.add(tagALabel);

    const tagBLabel = createTextSprite("Tag B [+15cm]", "#082f49", "#38bdf8", "#0284c7");
    tagBLabel.position.set(0.175, -0.012, 0.004);
    tagBLabel.scale.set(0.10, 0.020, 1);
    zonesGroup.add(tagBLabel);

    const axesGizmo = new THREE.AxesHelper(0.09);
    axesGizmo.position.set(0, 0, 0.005);
    scene.add(axesGizmo);

    const cursorGeo = new THREE.SphereGeometry(0.010, 32, 32);
    const cursorMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6
    });
    const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
    cursorMeshRef.current = cursorMesh;
    scene.add(cursorMesh);

    // 📷 Recorded Camera Trajectory Waypoint Marker (on table cyan dashed line)
    const camWpGeo = new THREE.SphereGeometry(0.007, 16, 16);
    const camWpMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.85,
      roughness: 0.3
    });
    const camWaypoint = new THREE.Mesh(camWpGeo, camWpMat);
    camWaypoint.visible = false;
    camWaypointRef.current = camWaypoint;
    scene.add(camWaypoint);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

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

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

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

  const setViewPreset = (view) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveView(view);
    setIsAutoRotate(false);

    if (view === 'iso') {
      camera.position.set(0.48, -0.74, 0.48);
      controls.target.set(0.08, -0.20, 0.08);
    } else if (view === 'top') {
      camera.position.set(0.08, -0.20, 1.05);
      controls.target.set(0.08, -0.20, 0.0);
    } else if (view === 'front') {
      camera.position.set(0.08, -0.86, 0.22);
      controls.target.set(0.08, -0.20, 0.08);
    } else if (view === 'side') {
      camera.position.set(0.82, -0.20, 0.22);
      controls.target.set(0.08, -0.20, 0.08);
    }
    controls.update();
  };

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (tubeMeshRef.current) {
      scene.remove(tubeMeshRef.current);
      tubeMeshRef.current.geometry?.dispose();
      tubeMeshRef.current.material?.dispose();
      tubeMeshRef.current = null;
    }
    if (approachTubeRef.current) {
      scene.remove(approachTubeRef.current);
      approachTubeRef.current.geometry?.dispose();
      approachTubeRef.current.material?.dispose();
      approachTubeRef.current = null;
    }
    if (homeMarkerRef.current) {
      scene.remove(homeMarkerRef.current);
      homeMarkerRef.current.geometry?.dispose();
      homeMarkerRef.current.material?.dispose();
      homeMarkerRef.current = null;
    }
    if (homeLabelRef.current) {
      scene.remove(homeLabelRef.current);
      homeLabelRef.current.material?.dispose();
      homeLabelRef.current = null;
    }
    if (cameraLineRef.current) {
      scene.remove(cameraLineRef.current);
      cameraLineRef.current.geometry?.dispose();
      cameraLineRef.current.material?.dispose();
      cameraLineRef.current = null;
    }
    if (startMarkerRef.current) {
      scene.remove(startMarkerRef.current);
      startMarkerRef.current.geometry?.dispose();
      startMarkerRef.current.material?.dispose();
      startMarkerRef.current = null;
    }
    if (goalMarkerRef.current) {
      scene.remove(goalMarkerRef.current);
      goalMarkerRef.current.geometry?.dispose();
      goalMarkerRef.current.material?.dispose();
      goalMarkerRef.current = null;
    }

    const activePoses = (eePoses && eePoses.length > 0) ? eePoses : trajectoryPoses;

    // 1. Render Gripper TCP Main Trajectory (Solid Tube)
    if (activePoses.length > 1) {
      const points = activePoses.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubularSegments = Math.max(30, Math.min(200, activePoses.length));
      const radialSegments = 8;
      const tubeGeo = new THREE.TubeGeometry(
        curve,
        tubularSegments,
        0.0035,
        radialSegments,
        false
      );

      const {
        offset_x = 0.038,
        offset_y = -0.406,
        offset_z = 0.00,
        robot_type = 'so_arm101_omni_kin'
      } = robotConfig || {};
      const is101 = (robot_type || 'so_arm101_omni_kin').toLowerCase().includes('101');
      const maxNominalReach = is101 ? 0.35 : 0.34;
      const maxHardReach = is101 ? 0.385 : 0.375;

      const colors = [];
      const cGreen = new THREE.Color(0x10b981); // Reachable
      const cYellow = new THREE.Color(0xf59e0b); // Boundary / Adapted
      const cRed = new THREE.Color(0xef4444); // Out of Reach / Table collision

      for (let i = 0; i <= tubularSegments; i++) {
        const u = i / tubularSegments;
        const pt = curve.getPoint(u);
        const dist = Math.hypot(pt.x - offset_x, pt.y - offset_y, pt.z - offset_z);
        const isTableSafe = pt.z >= 0.012;

        let col = cGreen;
        if (!isTableSafe || dist > maxHardReach) {
          col = cRed;
        } else if (dist > maxNominalReach) {
          col = cYellow;
        }

        for (let j = 0; j <= radialSegments; j++) {
          colors.push(col.r, col.g, col.b);
        }
      }

      tubeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const tubeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.3,
        metalness: 0.2
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMeshRef.current = tubeMesh;
      scene.add(tubeMesh);

      // 🟢 Start Waypoint Marker (Green Sphere)
      const startGeo = new THREE.SphereGeometry(0.008, 20, 20);
      const startMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });
      const startMesh = new THREE.Mesh(startGeo, startMat);
      startMesh.position.copy(points[0]);
      startMarkerRef.current = startMesh;
      scene.add(startMesh);

      // 🔴 Goal / End Waypoint Marker (Red Sphere)
      const goalGeo = new THREE.SphereGeometry(0.008, 20, 20);
      const goalMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.6,
        roughness: 0.3
      });
      const goalMesh = new THREE.Mesh(goalGeo, goalMat);
      goalMesh.position.copy(points[points.length - 1]);
      goalMarkerRef.current = goalMesh;
      scene.add(goalMesh);
    }

    // 2. Render Auto Approach Path (Purple Tube) when Initial-Position Aware Mode is active
    if (trajectoryMode === 'initial_aware' && approachEePoses && approachEePoses.length > 1) {
      const appPoints = approachEePoses.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const appCurve = new THREE.CatmullRomCurve3(appPoints);
      const appSegments = Math.max(20, Math.min(100, approachEePoses.length));
      const appTubeGeo = new THREE.TubeGeometry(appCurve, appSegments, 0.0034, 8, false);
      const appTubeMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Vibrant Purple / Violet
        emissive: 0x6b21a8,
        emissiveIntensity: 0.45,
        roughness: 0.25,
        metalness: 0.4
      });
      const appTubeMesh = new THREE.Mesh(appTubeGeo, appTubeMat);
      approachTubeRef.current = appTubeMesh;
      scene.add(appTubeMesh);

      // 🏠 Initial Home Waypoint Marker (Purple Glowing Sphere)
      const homeGeo = new THREE.SphereGeometry(0.010, 20, 20);
      const homeMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.85,
        roughness: 0.2
      });
      const homeMesh = new THREE.Mesh(homeGeo, homeMat);
      homeMesh.position.copy(appPoints[0]);
      homeMarkerRef.current = homeMesh;
      scene.add(homeMesh);

      // Home Label Text Sprite
      const homeLabel = createTextSprite("🏠 Initial Home", "#3b0764", "#d8b4fe", "#9333ea");
      homeLabel.position.set(appPoints[0].x, appPoints[0].y, appPoints[0].z + 0.024);
      homeLabel.scale.set(0.13, 0.019, 1);
      homeLabelRef.current = homeLabel;
      scene.add(homeLabel);
    }

    // 3. Render Secondary Camera Path (Dashed Cyan Line) when offset is active
    if (showCameraPath && trajectoryPoses.length > 1 && eePoses && eePoses.length > 0) {
      const camPoints = trajectoryPoses.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
      const camCurve = new THREE.CatmullRomCurve3(camPoints);
      const camPts = camCurve.getPoints(Math.max(40, Math.min(250, trajectoryPoses.length * 2)));
      const camGeo = new THREE.BufferGeometry().setFromPoints(camPts);
      const camMat = new THREE.LineDashedMaterial({
        color: 0x06b6d4,
        dashSize: 0.016,
        gapSize: 0.010,
        transparent: true,
        opacity: 0.85
      });
      const camLine = new THREE.Line(camGeo, camMat);
      camLine.computeLineDistances();
      cameraLineRef.current = camLine;
      scene.add(camLine);
    }
  }, [trajectoryPoses, eePoses, showCameraPath, robotConfig, trajectoryMode, approachEePoses]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (robotGroupRef.current) {
      scene.remove(robotGroupRef.current);
      robotGroupRef.current = null;
    }

    const {
      offset_x = 0.038,
      offset_y = -0.406,
      offset_z = 0.00,
      yaw_deg = 90.0,
      robot_type = 'so_arm101_omni_kin'
    } = robotConfig || {};
    const yawRad = THREE.MathUtils.degToRad(yaw_deg);
    const rType = (robot_type || 'so_arm101_omni_kin').toLowerCase();
    const is100 = rType.includes('100') && !rType.includes('101');
    const is101 = !is100;

    const L1 = is100 ? 0.115 : 0.119;

    const robotGroup = new THREE.Group();
    robotGroup.position.set(offset_x, offset_y, offset_z + 0.001);
    robotGroup.rotation.z = yawRad;
    robotGroupRef.current = robotGroup;
    scene.add(robotGroup);

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

    const turretGeo = new THREE.CylinderGeometry(0.032, 0.036, 0.024, 32);
    turretGeo.rotateX(Math.PI / 2);
    const turretMat = new THREE.MeshStandardMaterial({
      color: is101 ? 0x6366f1 : 0x0284c7,
      roughness: 0.4,
      metalness: 0.6
    });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.position.set(0, 0, 0.022);
    turretMeshRef.current = turret;
    robotGroup.add(turret);

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

    // 1. Arm Body Materials & Kinematics (Metallic Silver & Gunmetal Slate)
    const armMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.6, roughness: 0.25 });
    const armJointMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });

    // 2. End-Effector Gripper Materials (Distinct Industrial Cyan / Sky Blue)
    const gripperMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant Industrial Cyan
      metalness: 0.7,
      roughness: 0.25
    });
    // 3. Tool Center Point (TCP) Glowing Reticle
    const tcpReticleMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.85,
      metalness: 0.5
    });

    const pillarGeo = new THREE.CylinderGeometry(0.015, 0.017, L1, 16);
    pillarGeo.rotateX(Math.PI / 2);
    const pillar = new THREE.Mesh(pillarGeo, armMat);
    pillar.position.set(0, 0, L1 / 2);
    robotGroup.add(pillar);

    const shoulderSphereGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const shoulderSphere = new THREE.Mesh(shoulderSphereGeo, armJointMat);
    shoulderSphere.position.set(0, 0, L1);
    robotGroup.add(shoulderSphere);

    const unitCylGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

    const upperArm = new THREE.Mesh(unitCylGeo, armMat);
    upperArmMeshRef.current = upperArm;
    robotGroup.add(upperArm);

    const elbowSphere = new THREE.Mesh(shoulderSphereGeo, armJointMat);
    elbowSphereRef.current = elbowSphere;
    robotGroup.add(elbowSphere);

    const forearm = new THREE.Mesh(unitCylGeo, armMat);
    forearmMeshRef.current = forearm;
    robotGroup.add(forearm);

    const wristSphereGeo = new THREE.SphereGeometry(0.014, 16, 16);
    const wristSphere = new THREE.Mesh(wristSphereGeo, armJointMat);
    wristSphereRef.current = wristSphere;
    robotGroup.add(wristSphere);

    // End-Effector: Main Gripper Cylinder Link (Distinct Industrial Cyan Color)
    const gripperBase = new THREE.Mesh(unitCylGeo, gripperMat);
    gripperMeshRef.current = gripperBase;
    robotGroup.add(gripperBase);

    // Tool Center Point (TCP) Focal Tip (Glowing Reticle Sphere)
    const tipSphereGeo = new THREE.SphereGeometry(0.010, 16, 16);
    const gripperTip = new THREE.Mesh(tipSphereGeo, tcpReticleMat);
    gripperTipRef.current = gripperTip;
    robotGroup.add(gripperTip);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.015, gapSize: 0.01 });
    const reachLine = new THREE.Line(lineGeo, lineMat);
    reachLine.computeLineDistances();
    reachLine.visible = false;
    reachLineRef.current = reachLine;
    robotGroup.add(reachLine);

    // =========================================================================
    // 📷 Rigidly Mounted Camera Subsystem (URDF End-Effector Bracket Mount)
    // Fixed directly to the robot embodiment per gripper_offset extrinsic parameters
    // =========================================================================
    const mountedCamGroup = new THREE.Group();
    mountedCamGroupRef.current = mountedCamGroup;
    robotGroup.add(mountedCamGroup);

    // 1. Camera Mounting Bracket Link (connects wrist assembly to camera cradle)
    const bracketMesh = new THREE.Mesh(unitCylGeo, armJointMat);
    mountedBracketRef.current = bracketMesh;
    mountedCamGroup.add(bracketMesh);

    // Wrist mount clamp collar
    const clampMesh = new THREE.Mesh(unitCylGeo, armJointMat);
    mountedClampRef.current = clampMesh;
    mountedCamGroup.add(clampMesh);

    // 2. Camera Optical Focal Node (Sleek spherical focal point, zero box artifacts)
    const camBodyGroup = new THREE.Group();
    mountedCamMeshRef.current = camBodyGroup;
    mountedCamGroup.add(camBodyGroup);

    const camFocalSphereGeo = new THREE.SphereGeometry(0.007, 16, 16);
    const camFocalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8
    });
    const camFocalMesh = new THREE.Mesh(camFocalSphereGeo, camFocalMat);
    camBodyGroup.add(camFocalMesh);

    // 3. Rigid Tool Center Point (TCP) Connecting Rod / Sightline
    const toolRodGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const toolRodMat = new THREE.LineDashedMaterial({
      color: 0x06b6d4,
      dashSize: 0.012,
      gapSize: 0.008,
      transparent: true,
      opacity: 0.85
    });
    const mountedToolRod = new THREE.Line(toolRodGeo, toolRodMat);
    mountedToolRod.computeLineDistances();
    mountedToolRodRef.current = mountedToolRod;
    mountedCamGroup.add(mountedToolRod);

    // =========================================================================
    // Robot Physical Reach Boundary Envelopes on Table Floor
    // =========================================================================
    // 1. Inner / Nominal Reach Ring (R = 0.22m, Emerald) - optimal dexterity envelope
    const nominalRing = createCircleRing(0.22, 0x10b981, true);
    nominalRing.name = 'nominalRing';
    nominalRing.visible = showZones;
    robotGroup.add(nominalRing);

    // 2. Outer / Maximum Physical Reach Limit (R = 0.385m, Amber) - absolute reach boundary
    const maxReachRadius = is101 ? 0.385 : 0.375;
    const maxRing = createCircleRing(maxReachRadius, 0xf59e0b, true);
    maxRing.name = 'maxRing';
    maxRing.visible = showZones;
    robotGroup.add(maxRing);

    // 3. Base Mounting Plate Floor Perimeter (R = 0.065m, Slate/Indigo)
    const baseMountRing = createCircleRing(0.065, 0x6366f1, false);
    baseMountRing.name = 'baseMountRing';
    baseMountRing.visible = showZones;
    robotGroup.add(baseMountRing);

    // 4. Reach Ring Diagnostic Labels
    const nominalLabel = createTextSprite("Nominal Reach (22cm)", "#064e3b", "#34d399", "#059669");
    nominalLabel.position.set(0, 0.22, 0.003);
    nominalLabel.scale.set(0.14, 0.022, 1);
    nominalLabel.name = 'nominalLabel';
    nominalLabel.visible = showZones;
    robotGroup.add(nominalLabel);

    const maxLabel = createTextSprite(`Max Reach (${(maxReachRadius * 100).toFixed(1)}cm)`, "#78350f", "#fcd34d", "#d97706");
    maxLabel.position.set(0, maxReachRadius, 0.003);
    maxLabel.scale.set(0.15, 0.022, 1);
    maxLabel.name = 'maxLabel';
    maxLabel.visible = showZones;
    robotGroup.add(maxLabel);

  }, [robotConfig]);

  // Sync workspace layout zones and reach ring visibility when user toggles 'showZones'
  useEffect(() => {
    if (zonesGroupRef.current) {
      zonesGroupRef.current.visible = showZones;
    }
    if (robotGroupRef.current) {
      const ringNames = ['nominalRing', 'maxRing', 'baseMountRing', 'nominalLabel', 'maxLabel'];
      ringNames.forEach((n) => {
        const obj = robotGroupRef.current.getObjectByName(n);
        if (obj) obj.visible = showZones;
      });
    }
  }, [showZones]);

  useEffect(() => {
    if (!robotGroupRef.current) return;

    const {
      offset_x = 0.038,
      offset_y = -0.406,
      offset_z = 0.00,
      yaw_deg = 90.0,
      robot_type = 'so_arm101_omni_kin',
      q3_safe_max_deg = 0.0
    } = robotConfig || {};
    const yawRad = THREE.MathUtils.degToRad(yaw_deg);
    const safeQ3Rad = THREE.MathUtils.degToRad(q3_safe_max_deg !== undefined ? Number(q3_safe_max_deg) : 0.0);
    const rType = (robot_type || 'so_arm101_omni_kin').toLowerCase();
    const is100 = rType.includes('100') && !rType.includes('101');
    const isOmni = rType.includes('omni');

    const L1 = is100 ? 0.115 : 0.119;
    const L2 = is100 ? 0.135 : 0.140;
    const L3 = isOmni ? 0.135 : (is100 ? 0.140 : 0.145);
    const L4 = is100 ? 0.105 : 0.110;

    const jointLimits = isOmni ? [
      [-1.833, 1.833],
      [-1.745, 1.745],
      [-2.618, 2.618],
      [-1.745, Math.min(1.745, safeQ3Rad)],
      [-Math.PI, Math.PI]
    ] : [
      [-Math.PI, Math.PI],
      [-1.745, 1.745],
      [-2.618, 2.618],
      [-1.745, Math.min(1.745, safeQ3Rad)],
      [-Math.PI, Math.PI]
    ];

    const isApproachActive = trajectoryMode === 'initial_aware' && isApproachPhase && approachEePoses && approachEePoses.length > 0;

    const activePoses = (eePoses && eePoses.length > 0) ? eePoses : trajectoryPoses;
    let targetGripper = [0.15, 0.05, 0.15, 0, 0, 0];
    let activeGripVal = 50.0;
    let targetCam = null;

    if (isApproachActive) {
      const idx = Math.min(Math.max(0, approachFrameIndex), approachEePoses.length - 1);
      targetGripper = approachEePoses[idx];
      if (approachGripperStates && approachGripperStates.length > idx && approachGripperStates[idx] !== undefined) {
        activeGripVal = Number(approachGripperStates[idx]);
      } else {
        activeGripVal = 100.0;
      }
      if (approachCamPoses && approachCamPoses.length > idx) {
        targetCam = approachCamPoses[idx];
      }
    } else {
      if (activePoses && activePoses.length > 0) {
        const idx = Math.min(currentFrameIndex, activePoses.length - 1);
        targetGripper = activePoses[idx];
        if (gripperStates && gripperStates.length > idx && gripperStates[idx] !== undefined) {
          activeGripVal = Number(gripperStates[idx]);
        }
      }
      if (trajectoryPoses && trajectoryPoses.length > 0) {
        const cIdx = Math.min(currentFrameIndex, trajectoryPoses.length - 1);
        targetCam = trajectoryPoses[cIdx];
      }
    }

    // Position End-Effector Gripper Cursor (TCP)
    if (cursorMeshRef.current) {
      cursorMeshRef.current.position.set(targetGripper[0], targetGripper[1], targetGripper[2]);
      if (isApproachActive) {
        cursorMeshRef.current.material.color.setHex(0xa855f7);
        cursorMeshRef.current.material.emissive.setHex(0x9333ea);
      } else {
        cursorMeshRef.current.material.color.setHex(0xf59e0b);
        cursorMeshRef.current.material.emissive.setHex(0xf59e0b);
      }
    }

    const dx = targetGripper[0] - offset_x;
    const dy = targetGripper[1] - offset_y;
    const dz = targetGripper[2] - offset_z;

    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    const robotX = cosY * dx + sinY * dy;
    const robotY = -sinY * dx + cosY * dy;
    const robotZ = dz;

    const targetPitch = targetGripper[4] || 0;
    const targetRoll = targetGripper[3] || 0;

    const ikRes = solve5DofIK(robotX, robotY, robotZ, targetPitch, targetRoll, L1, L2, L3, L4, jointLimits, q3_safe_max_deg);
    const [q0, q1, q2, q3, q4] = ikRes.q;

    const pShoulder = new THREE.Vector3(0, 0, L1);

    const rElbow = L2 * Math.cos(q1);
    const pElbow = new THREE.Vector3(
      rElbow * Math.cos(q0),
      rElbow * Math.sin(q0),
      L1 + L2 * Math.sin(q1)
    );

    const th2 = q1 + q2;
    const rForearm = L3 * Math.cos(th2);
    const pWrist = new THREE.Vector3(
      pElbow.x + rForearm * Math.cos(q0),
      pElbow.y + rForearm * Math.sin(q0),
      pElbow.z + L3 * Math.sin(th2)
    );

    const th3 = q1 + q2 + q3;
    const rTip = L4 * Math.cos(th3);
    const pTip = new THREE.Vector3(
      pWrist.x + rTip * Math.cos(q0),
      pWrist.y + rTip * Math.sin(q0),
      pWrist.z + L4 * Math.sin(th3)
    );

    if (turretMeshRef.current) {
      turretMeshRef.current.rotation.z = q0;
    }
    if (upperArmMeshRef.current) {
      orientCylinder(upperArmMeshRef.current, pShoulder, pElbow, 0.012);
    }
    if (elbowSphereRef.current) {
      elbowSphereRef.current.position.copy(pElbow);
    }
    if (forearmMeshRef.current) {
      orientCylinder(forearmMeshRef.current, pElbow, pWrist, 0.010);
    }
    if (wristSphereRef.current) {
      wristSphereRef.current.position.copy(pWrist);
    }
    if (gripperMeshRef.current) {
      orientCylinder(gripperMeshRef.current, pWrist, pTip, 0.009);
    }
    if (gripperTipRef.current) {
      gripperTipRef.current.position.copy(pTip);
      const isFeasible = !ikRes.isClamped && ikRes.errorDist < 0.02;
      gripperTipRef.current.material.color.setHex(isFeasible ? 0x10b981 : 0xf59e0b);
      gripperTipRef.current.material.emissive.setHex(isFeasible ? 0x059669 : 0xd97706);
    }

    const tipDir = new THREE.Vector3().subVectors(pTip, pWrist).normalize();
    const lateralDir = new THREE.Vector3(-Math.sin(q0), Math.cos(q0), 0).normalize();
    const upDir = new THREE.Vector3().crossVectors(tipDir, lateralDir).normalize();



    if (reachLineRef.current) {
      if (ikRes.isClamped) {
        reachLineRef.current.visible = true;
        const targetRobotVec = new THREE.Vector3(robotX, robotY, robotZ);
        const pts = [pTip, targetRobotVec];
        reachLineRef.current.geometry.setFromPoints(pts);
        reachLineRef.current.computeLineDistances();
      } else {
        reachLineRef.current.visible = false;
      }
    }

    // 📷 Update Mounted Robot Camera Rig (Fixed rigidly to robot embodiment per gripper_offset)
    const gripperCfg = robotConfig?.gripper_offset || {};
    const fwdM = (gripperCfg.forward_cm !== undefined ? Number(gripperCfg.forward_cm) : 12.8) / 100.0;
    const hgtM = (gripperCfg.height_cm !== undefined ? Number(gripperCfg.height_cm) : 10.9) / 100.0;
    const latM = (gripperCfg.lateral_cm !== undefined ? Number(gripperCfg.lateral_cm) : 0.0) / 100.0;
    const isOffsetEnabled = gripperCfg.enabled !== false;

    // Rigid camera mount position in robot local coordinates (fixed to end-effector):
    const pCamRobot = new THREE.Vector3()
      .copy(pTip)
      .addScaledVector(tipDir, -fwdM)
      .addScaledVector(upDir, hgtM)
      .addScaledVector(lateralDir, -latM);

    // 1. Update Mounting Bracket from wrist joint to camera mount base
    if (mountedBracketRef.current) {
      orientCylinder(mountedBracketRef.current, pWrist, pCamRobot, 0.005);
      mountedBracketRef.current.visible = isOffsetEnabled;
    }

    if (mountedClampRef.current) {
      const clampEnd = pWrist.clone().addScaledVector(tipDir, 0.016);
      orientCylinder(mountedClampRef.current, pWrist, clampEnd, 0.011);
      mountedClampRef.current.visible = isOffsetEnabled;
    }

    // 2. Update Camera Device Body Position & Tilted Orientation
    if (mountedCamMeshRef.current) {
      mountedCamMeshRef.current.position.copy(pCamRobot);
      mountedCamMeshRef.current.visible = isOffsetEnabled;

      if (isOffsetEnabled) {
        // Line-of-sight pointing from camera lens toward gripper TCP pTip:
        const camLookDir = new THREE.Vector3().subVectors(pTip, pCamRobot).normalize();
        const camLatDir = lateralDir.clone();
        const camUpDir = new THREE.Vector3().crossVectors(camLatDir, camLookDir).normalize();

        const camRotMatrix = new THREE.Matrix4().makeBasis(camLatDir, camUpDir, camLookDir);
        mountedCamMeshRef.current.quaternion.setFromRotationMatrix(camRotMatrix);
      }
    }

    // 3. Update Rigid Tool Rod / Optical Sightline (Camera -> TCP)
    if (mountedToolRodRef.current) {
      if (showCameraPath && isOffsetEnabled) {
        mountedToolRodRef.current.visible = true;
        mountedToolRodRef.current.geometry.setFromPoints([pCamRobot, pTip]);
        mountedToolRodRef.current.computeLineDistances();
      } else {
        mountedToolRodRef.current.visible = false;
      }
    }

    // 4. Update Recorded Camera Trajectory Waypoint Marker (on table cyan dashed line)
    if (camWaypointRef.current) {
      if (showCameraPath && targetCam && isOffsetEnabled) {
        camWaypointRef.current.visible = true;
        camWaypointRef.current.position.set(targetCam[0], targetCam[1], targetCam[2]);
      } else {
        camWaypointRef.current.visible = false;
      }
    }

    const qDeg = [q0, q1, q2, q3, q4].map((rad) => Math.round(THREE.MathUtils.radToDeg(rad)));
    const errDistCm = Math.hypot(pTip.x - robotX, pTip.y - robotY, pTip.z - robotZ) * 100.0;
    setIkStatus({
      isFeasible: !ikRes.isClamped && errDistCm < 1.5,
      errorDistCm: Math.round(errDistCm * 10) / 10,
      clampedReason: ikRes.clampedReason,
      jointsDeg: qDeg
    });

  }, [
    trajectoryPoses,
    eePoses,
    gripperStates,
    currentFrameIndex,
    robotConfig,
    showCameraPath,
    showComponentBreakdown,
    trajectoryMode,
    approachEePoses,
    approachGripperStates,
    approachCamPoses,
    isApproachPhase,
    approachFrameIndex
  ]);

  const handleAutoAlign = async (mode = 'start') => {
    setIsAligning(true);
    try {
      const resp = await fetch('/api/robot/auto_align', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, episode_id: episodeId })
      });
      const data = await resp.json();
      if (data.status === 'success' && data.config) {
        if (onUpdateRobotConfig) {
          onUpdateRobotConfig(data.config);
        }
        if (mode === 'recommended') {
          setViewPreset('iso');
        }
      }
    } catch (e) {
      console.error('Auto-align failed:', e);
    } finally {
      setIsAligning(false);
    }
  };

  const { offset_x = 0.038, offset_y = -0.406, yaw_deg = 90.0, robot_type = 'so_arm101_omni_kin' } = robotConfig || {};

  return (
    <div className="w-full h-full relative select-none overflow-hidden group">
      <div
        ref={mountRef}
        className={`w-full h-full ${isOrbitTouchEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{ touchAction: isOrbitTouchEnabled ? 'none' : 'pan-y' }}
      />

      {/* Top Left: Robot Embodiment HUD & Base Initial Position Align Controls */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none max-w-[calc(100%-250px)]">
        {/* Robot Embodiment & Base Coordinates */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-1.5 shadow-lg w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>ArUco (0,0)</span>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-indigo-300">
            🤖 {robot_type.toUpperCase().replace(/_/g, '-')} Base: ({(offset_x * 100).toFixed(0)}cm, {(offset_y * 100).toFixed(0)}cm, {yaw_deg.toFixed(0)}°)
          </span>
        </div>

        {/* Set Robot Initial Position (Auto-Align Base Controls) */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-1 rounded-xl shadow-lg pointer-events-auto w-fit flex-wrap">
          <span className="text-[10px] font-semibold text-slate-400 px-1">Base:</span>
          <button
            onClick={() => handleAutoAlign('recommended')}
            disabled={isAligning}
            className="px-2 py-0.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-semibold text-[10px] flex items-center gap-1 border border-indigo-500/50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            title="Set Recommended Workspace Layout: Base at Y=-40.6cm, Yaw=90°, facing tags beyond reach"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Recommended</span>
          </button>
          <button
            onClick={() => handleAutoAlign('start')}
            disabled={isAligning || trajectoryPoses.length === 0}
            className="px-2 py-0.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-[10px] flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Set Robot Base so the gripper starts directly at the first point of the trajectory"
          >
            <Crosshair className="w-3 h-3 text-indigo-200" />
            <span>To Start</span>
          </button>
          <button
            onClick={() => handleAutoAlign('optimal')}
            disabled={isAligning || trajectoryPoses.length === 0}
            className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[10px] flex items-center gap-1 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            title="Optimize Robot Base position for maximum reach across the entire demonstration"
          >
            <span>Optimal</span>
          </button>
        </div>

        {/* Phase Indicator Badge (Approach vs Demo) */}
        {trajectoryMode === 'initial_aware' && (
          <div className={`backdrop-blur-md border px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-2 shadow-lg transition-all w-fit ${
            isApproachPhase
              ? 'bg-purple-950/90 border-purple-500/60 text-purple-200 animate-pulse'
              : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isApproachPhase ? 'bg-purple-400' : 'bg-emerald-400'}`} />
            <span className="font-bold">
              {isApproachPhase ? '🚀 AUTO APPROACH' : '🎬 DEMO PHASE'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-[10px] text-slate-300">
              {isApproachPhase
                ? `Step ${(approachFrameIndex || 0) + 1}/${approachEePoses?.length || 0} (Home → Start)`
                : `Frame ${currentFrameIndex + 1}/${(eePoses && eePoses.length) || trajectoryPoses.length || 0}`}
            </span>
          </div>
        )}

        {/* Kinematics Reachability & Clamped Indicator */}
        <div className={`backdrop-blur-md border px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-2 shadow-lg transition-all w-fit ${
          ikStatus.isFeasible
            ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200'
            : 'bg-amber-950/85 border-amber-600/70 text-amber-200 animate-pulse'
        }`}>
          {ikStatus.isFeasible ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-semibold">REACHABLE</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold">
                CLAMPED ({ikStatus.errorDistCm}cm {ikStatus.clampedReason})
              </span>
            </>
          )}
          <span className="text-slate-500">|</span>
          <span className="font-mono text-[10px] text-slate-300">
            q: [{ikStatus.jointsDeg.join('°, ')}°]
          </span>
        </div>
      </div>

      {/* Top Right: View Presets, Camera Controls & Layer Toggles */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10 pointer-events-auto">
        {/* Row 1: Camera View Presets (iso, top, front, side) + Zoom + Orbit + Rotate */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl text-[11px] shadow-lg">
          <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
            {['iso', 'top', 'front', 'side'].map((view) => (
              <button
                key={view}
                onClick={() => setViewPreset(view)}
                className={`px-2 py-0.5 rounded font-medium capitalize transition-all text-[10px] ${
                  activeView === view ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
              title="Zoom In 3D Camera"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
              title="Zoom Out 3D Camera"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsOrbitTouchEnabled(!isOrbitTouchEnabled)}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 text-[10px] font-medium border ${
              isOrbitTouchEnabled
                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isOrbitTouchEnabled ? 'Orbit 3D enabled' : 'Scroll page enabled'}
          >
            <Move3d className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isOrbitTouchEnabled ? 'Orbit' : 'Scroll'}</span>
          </button>

          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${
              isAutoRotate ? 'bg-purple-600 text-white animate-pulse' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title={isAutoRotate ? 'Stop Auto-Rotation' : 'Start Auto-Rotation'}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotate ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Row 2: Viewport Visibility Toggles (Zones, Cam Path, Components) */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl text-[11px] shadow-lg">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-medium border ${
              showZones
                ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={showZones ? 'Hide Workspace Layout Zones' : 'Show Workspace Layout Zones (Reference, Manipulation, Reach)'}
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Zones</span>
          </button>

          <button
            onClick={() => setShowCameraPath(!showCameraPath)}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-medium border ${
              showCameraPath
                ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={showCameraPath ? 'Hide Camera Trajectory & Tool Rod' : 'Show Camera Trajectory & Tool Rod'}
          >
            <Camera className="w-3 h-3 text-cyan-400" />
            <span>Cam Path</span>
          </button>

          <button
            onClick={() => setShowComponentBreakdown(!showComponentBreakdown)}
            className={`px-2 py-0.5 rounded-lg transition-all flex items-center gap-1 text-[10px] font-medium border ${
              showComponentBreakdown
                ? 'bg-amber-600/30 text-amber-200 border-amber-500/50 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title={showComponentBreakdown ? 'Hide Component Breakdown' : 'Show Component Breakdown (Arm Body vs End-Effector)'}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Components</span>
          </button>
        </div>
      </div>

      {/* Floating Component Breakdown Overlay (Arm Body vs End-Effector) */}
      {showComponentBreakdown && (
        <div className="absolute top-[86px] right-3 z-20 w-80 bg-slate-950/95 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5 select-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-100 font-mono">
                Component Breakdown
              </span>
            </div>
            <button
              onClick={() => setShowComponentBreakdown(false)}
              className="text-slate-400 hover:text-white text-xs px-1 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* Arm Body Section */}
          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-indigo-900/50 flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex items-center justify-between font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                🦾 Arm Body (5-DOF)
              </span>
              <span className="text-[10px] bg-indigo-950 px-1.5 py-0.5 rounded text-indigo-200">
                L1-L3: 27.5 cm
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex flex-col gap-0.5 mt-0.5">
              <div className="flex justify-between">
                <span>Base & Turret:</span>
                <span className="text-slate-200 font-semibold">Dark Carbon / Indigo</span>
              </div>
              <div className="flex justify-between">
                <span>Arm Booms:</span>
                <span className="text-slate-200 font-semibold">Silver Metallic</span>
              </div>
              <div className="flex justify-between">
                <span>Joint Knuckles:</span>
                <span className="text-slate-200 font-semibold">Gunmetal Slate</span>
              </div>
            </div>
          </div>

          {/* Tool Flange Joint */}
          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              ⚙️ Wrist Roll Joint:
            </span>
            <span className="text-slate-400 font-semibold">Boundary to Gripper</span>
          </div>

          {/* End-Effector Section */}
          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-cyan-900/50 flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex items-center justify-between font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                ✋ End-Effector (Cyan)
              </span>
              <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-200">
                L4: 11.0 cm
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex flex-col gap-0.5 mt-0.5">
              <div className="flex justify-between">
                <span>Gripper Cylinder:</span>
                <span className="text-cyan-300 font-semibold">Industrial Cyan</span>
              </div>
              <div className="flex justify-between">
                <span>Parallel Fingers:</span>
                <span className="text-sky-300 font-semibold">Electric Blue Jaws</span>
              </div>
              <div className="flex justify-between">
                <span>Dynamic State:</span>
                <span className="text-emerald-400 font-bold">
                  {gripperStates && gripperStates[currentFrameIndex] !== undefined
                    ? `${Number(gripperStates[currentFrameIndex]).toFixed(0)}% Open`
                    : '50% (Nominal)'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 text-[9.5px]">
                <span className="text-emerald-400 font-bold">🎯 Tool Center Point (TCP):</span>
                <span className="text-emerald-200">Fingertip Grasp Reticle</span>
              </div>
            </div>
          </div>

          {/* Mounted Camera Rig Section */}
          <div className="bg-slate-900/80 rounded-xl p-2.5 border border-cyan-900/50 flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex items-center justify-between font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                📷 Mounted Camera Rig
              </span>
              <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-200">
                θ: {(robotConfig?.gripper_offset?.pitch_deg ?? 40.4).toFixed(1)}°
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex flex-col gap-0.5 mt-0.5">
              <div className="flex justify-between">
                <span>Forward Distance (d):</span>
                <span className="text-slate-200 font-semibold">{(robotConfig?.gripper_offset?.forward_cm ?? 12.8).toFixed(1)} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Vertical Height (h):</span>
                <span className="text-slate-200 font-semibold">{(robotConfig?.gripper_offset?.height_cm ?? 10.9).toFixed(1)} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Bracket Base:</span>
                <span className="text-slate-200 font-semibold">Fixed to Wrist / Gripper</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 text-[9.5px]">
                <span className="text-cyan-400 font-bold">Rigid Attachment:</span>
                <span className="text-emerald-300">Synchronized with Base & IK</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Left: Trajectory Color Legend & Interaction Guide */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 px-2.5 py-1.5 rounded-xl text-[10px] text-slate-300 shadow-xl flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="font-semibold text-emerald-300">Green:</span>
            <span className="text-slate-400">Start / Reachable</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse" />
            <span className="font-semibold text-amber-300">Yellow:</span>
            <span className="text-slate-400">Current / Clamped</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="font-semibold text-rose-300">Red:</span>
            <span className="text-slate-400">Goal / Out of Reach</span>
          </div>
          {trajectoryMode === 'initial_aware' && approachEePoses && approachEePoses.length > 0 && (
            <>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50" />
                <span className="font-semibold text-purple-300">Purple:</span>
                <span className="text-slate-400">Approach Path</span>
              </div>
            </>
          )}
          {eePoses && eePoses.length > 0 && showCameraPath && (
            <>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-cyan-400" />
                <span className="font-semibold text-cyan-300">Cyan:</span>
                <span className="text-slate-400">Cam Path</span>
              </div>
            </>
          )}
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 px-2.5 py-1 rounded-lg text-[9.5px] text-slate-400 font-mono flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <Compass className="w-3 h-3 text-indigo-400" />
          <span>Scrub timeline to articulate arm • Drag: Rotate • Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
}