import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, Compass, ZoomIn, ZoomOut, Move3d, Crosshair, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

// ==============================================================================
// 5-DOF Robot Inverse Kinematics Engine (with Impossible Kinematics Handling)
// ==============================================================================
function solve5DofIK(targetX, targetY, targetZ, targetPitch, targetRoll, L1, L2, L3, L4, jointLimits) {
  const q0 = Math.atan2(targetY, targetX);
  const r = Math.hypot(targetX, targetY);
  const zEff = Math.max(0.012, targetZ); // Enforce table surface clearance

  const maxReachWrist = (L2 + L3) * 0.995;
  const minReachWrist = Math.max(0.020, Math.abs(L2 - L3) + 0.010);

  let bestQ = null;
  let bestErr = 1e9;
  let wasClamped = false;
  let clampedReason = '';

  const pitchCandidates = [targetPitch || 0];
  for (let d = 5; d <= 70; d += 5) {
    const rad = THREE.MathUtils.degToRad(d);
    pitchCandidates.push((targetPitch || 0) - rad);
    pitchCandidates.push((targetPitch || 0) + rad);
  }

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
      const score = posErr * 100.0 + pitchDiff * 0.1;

      if (score < bestErr) {
        bestErr = score;
        bestQ = qRad;
        wasClamped = iterClamped;
        clampedReason = iterReason;
        if (posErr < 0.005 && !iterClamped) break;
      }
    }
  }

  if (!bestQ) {
    wasClamped = true;
    clampedReason = 'JOINT_LIMIT';
    let rw = r - L4 * Math.cos(targetPitch || 0);
    let zw = (zEff - L1) - L4 * Math.sin(targetPitch || 0);
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
    const q3 = (targetPitch || 0) - (q1 + q2);
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

export default function Viewport3D({
  trajectoryPoses = [],
  currentFrameIndex = 0,
  robotConfig = { robot_type: 'so101', offset_x: 0.20, offset_y: 0.00, offset_z: 0.00, yaw_deg: 0.0 },
  onUpdateRobotConfig = null,
  episodeId = null
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const tubeMeshRef = useRef(null);
  const cursorMeshRef = useRef(null);
  const robotGroupRef = useRef(null);

  // Dynamic Articulated Robot Arm Meshes
  const turretMeshRef = useRef(null);
  const upperArmMeshRef = useRef(null);
  const forearmMeshRef = useRef(null);
  const gripperMeshRef = useRef(null);
  const elbowSphereRef = useRef(null);
  const wristSphereRef = useRef(null);
  const gripperTipRef = useRef(null);
  const fingerLeftRef = useRef(null);
  const fingerRightRef = useRef(null);
  const reachLineRef = useRef(null);

  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState('iso');
  const [isOrbitTouchEnabled, setIsOrbitTouchEnabled] = useState(true);
  const [isAligning, setIsAligning] = useState(false);

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
    camera.position.set(0.42, -0.48, 0.42);
    camera.up.set(0, 0, 1);
    camera.lookAt(0.15, 0.05, 0.08);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.15, 0.05, 0.08);
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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.80);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(1.0, -1.0, 2.0);
    scene.add(dirLight);

    const tableGeo = new THREE.BoxGeometry(0.90, 0.70, 0.02);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0.18, 0.12, -0.01);
    scene.add(tableMesh);

    const gridHelper = new THREE.GridHelper(0.90, 18, 0x475569, 0x334155);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0.18, 0.12, 0.001);
    scene.add(gridHelper);

    const tagAGeo = new THREE.PlaneGeometry(0.10, 0.10);
    const tagAMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const tagAMesh = new THREE.Mesh(tagAGeo, tagAMat);
    tagAMesh.position.set(0.05, 0.05, 0.002);
    scene.add(tagAMesh);

    const tagBGeo = new THREE.PlaneGeometry(0.05, 0.05);
    const tagBMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide });
    const tagBMesh = new THREE.Mesh(tagBGeo, tagBMat);
    tagBMesh.position.set(0.175, 0.025, 0.002);
    scene.add(tagBMesh);

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
        0.0035,
        8,
        false
      );
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        emissive: 0x4f46e5,
        emissiveIntensity: 0.35,
        roughness: 0.3
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMeshRef.current = tubeMesh;
      scene.add(tubeMesh);
    }
  }, [trajectoryPoses]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (robotGroupRef.current) {
      scene.remove(robotGroupRef.current);
      robotGroupRef.current = null;
    }

    const {
      offset_x = 0.20,
      offset_y = 0.00,
      offset_z = 0.00,
      yaw_deg = 0.0,
      robot_type = 'so101'
    } = robotConfig || {};
    const yawRad = THREE.MathUtils.degToRad(yaw_deg);
    const is101 = robot_type.toLowerCase() === 'so101';

    const L1 = is101 ? 0.118 : 0.115;

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

    const armMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.3 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const gripperTipMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.7,
      metalness: 0.6
    });

    const pillarGeo = new THREE.CylinderGeometry(0.015, 0.017, L1, 16);
    pillarGeo.rotateX(Math.PI / 2);
    const pillar = new THREE.Mesh(pillarGeo, armMat);
    pillar.position.set(0, 0, L1 / 2);
    robotGroup.add(pillar);

    const shoulderSphereGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const shoulderSphere = new THREE.Mesh(shoulderSphereGeo, jointMat);
    shoulderSphere.position.set(0, 0, L1);
    robotGroup.add(shoulderSphere);

    const unitCylGeo = new THREE.CylinderGeometry(1, 1, 1, 16);

    const upperArm = new THREE.Mesh(unitCylGeo, armMat);
    upperArmMeshRef.current = upperArm;
    robotGroup.add(upperArm);

    const elbowSphere = new THREE.Mesh(shoulderSphereGeo, jointMat);
    elbowSphereRef.current = elbowSphere;
    robotGroup.add(elbowSphere);

    const forearm = new THREE.Mesh(unitCylGeo, armMat);
    forearmMeshRef.current = forearm;
    robotGroup.add(forearm);

    const wristSphereGeo = new THREE.SphereGeometry(0.014, 16, 16);
    const wristSphere = new THREE.Mesh(wristSphereGeo, jointMat);
    wristSphereRef.current = wristSphere;
    robotGroup.add(wristSphere);

    const gripperBase = new THREE.Mesh(unitCylGeo, armMat);
    gripperMeshRef.current = gripperBase;
    robotGroup.add(gripperBase);

    const tipSphereGeo = new THREE.SphereGeometry(0.012, 16, 16);
    const gripperTip = new THREE.Mesh(tipSphereGeo, gripperTipMat);
    gripperTipRef.current = gripperTip;
    robotGroup.add(gripperTip);

    const fingerGeo = new THREE.BoxGeometry(0.024, 0.005, 0.012);
    const fingerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
    const fingerLeft = new THREE.Mesh(fingerGeo, fingerMat);
    const fingerRight = new THREE.Mesh(fingerGeo, fingerMat);
    fingerLeftRef.current = fingerLeft;
    fingerRightRef.current = fingerRight;
    robotGroup.add(fingerLeft);
    robotGroup.add(fingerRight);

    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const lineMat = new THREE.LineDashedMaterial({ color: 0xf59e0b, dashSize: 0.015, gapSize: 0.01 });
    const reachLine = new THREE.Line(lineGeo, lineMat);
    reachLine.computeLineDistances();
    reachLine.visible = false;
    reachLineRef.current = reachLine;
    robotGroup.add(reachLine);

  }, [robotConfig]);

  useEffect(() => {
    if (!robotGroupRef.current) return;

    const {
      offset_x = 0.20,
      offset_y = 0.00,
      offset_z = 0.00,
      yaw_deg = 0.0,
      robot_type = 'so101'
    } = robotConfig || {};
    const yawRad = THREE.MathUtils.degToRad(yaw_deg);
    const is101 = robot_type.toLowerCase() === 'so101';

    const L1 = is101 ? 0.118 : 0.115;
    const L2 = is101 ? 0.140 : 0.135;
    const L3 = is101 ? 0.145 : 0.140;
    const L4 = is101 ? 0.110 : 0.105;

    const jointLimits = [
      [-Math.PI, Math.PI],
      [-1.745, 1.745],
      [-2.618, 2.618],
      [-1.745, 1.745],
      [-Math.PI, Math.PI]
    ];

    let targetAruco = [0.15, 0.05, 0.15, 0, 0, 0];
    if (trajectoryPoses && trajectoryPoses.length > 0) {
      const idx = Math.min(currentFrameIndex, trajectoryPoses.length - 1);
      targetAruco = trajectoryPoses[idx];
    }

    if (cursorMeshRef.current) {
      cursorMeshRef.current.position.set(targetAruco[0], targetAruco[1], targetAruco[2]);
    }

    const dx = targetAruco[0] - offset_x;
    const dy = targetAruco[1] - offset_y;
    const dz = targetAruco[2] - offset_z;

    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    const robotX = cosY * dx + sinY * dy;
    const robotY = -sinY * dx + cosY * dy;
    const robotZ = dz;

    const targetPitch = targetAruco[4] || 0;
    const targetRoll = targetAruco[3] || 0;

    const ikRes = solve5DofIK(robotX, robotY, robotZ, targetPitch, targetRoll, L1, L2, L3, L4, jointLimits);
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

    if (fingerLeftRef.current && fingerRightRef.current) {
      const tipDir = new THREE.Vector3().subVectors(pTip, pWrist).normalize();
      const lateralDir = new THREE.Vector3(-Math.sin(q0), Math.cos(q0), 0);
      fingerLeftRef.current.position.copy(pTip).addScaledVector(lateralDir, 0.014);
      fingerRightRef.current.position.copy(pTip).addScaledVector(lateralDir, -0.014);
      fingerLeftRef.current.quaternion.setFromUnitVectors(_up, tipDir);
      fingerRightRef.current.quaternion.setFromUnitVectors(_up, tipDir);
    }

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

    const qDeg = [q0, q1, q2, q3, q4].map((rad) => Math.round(THREE.MathUtils.radToDeg(rad)));
    const errDistCm = Math.hypot(pTip.x - robotX, pTip.y - robotY, pTip.z - robotZ) * 100.0;
    setIkStatus({
      isFeasible: !ikRes.isClamped && errDistCm < 1.5,
      errorDistCm: Math.round(errDistCm * 10) / 10,
      clampedReason: ikRes.clampedReason,
      jointsDeg: qDeg
    });

  }, [trajectoryPoses, currentFrameIndex, robotConfig]);

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
      }
    } catch (e) {
      console.error('Auto-align failed:', e);
    } finally {
      setIsAligning(false);
    }
  };

  const { offset_x = 0.20, offset_y = 0.00, yaw_deg = 0.0, robot_type = 'so101' } = robotConfig || {};

  return (
    <div className="w-full h-full relative select-none overflow-hidden group">
      <div
        ref={mountRef}
        className={`w-full h-full ${isOrbitTouchEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
        style={{ touchAction: isOrbitTouchEnabled ? 'none' : 'pan-y' }}
      />

      {/* Top Left: ArUco Origin & Live Articulated Robot Arm Status HUD */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ArUco (0,0)</span>
          <span className="text-slate-600">|</span>
          <span className="font-semibold text-indigo-300">
            🤖 {robot_type.toUpperCase()} Base: ({(offset_x * 100).toFixed(0)}cm, {(offset_y * 100).toFixed(0)}cm, {yaw_deg.toFixed(0)}°)
          </span>
        </div>

        <div className={`backdrop-blur-md border px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-2 shadow-lg transition-all ${
          ikStatus.isFeasible
            ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-200'
            : 'bg-amber-950/85 border-amber-600/70 text-amber-200 animate-pulse'
        }`}>
          {ikStatus.isFeasible ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold">REACHABLE</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
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

      {/* Top Right: View Controls, Auto-Align Buttons, Zoom & Mode */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 p-1 rounded-xl text-[11px] z-10 shadow-lg flex-wrap justify-end">
        <div className="flex items-center gap-1 pr-1 border-r border-slate-700/80">
          <button
            onClick={() => handleAutoAlign('start')}
            disabled={isAligning || trajectoryPoses.length === 0}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-medium text-[10px] flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Set Robot Base so the gripper starts directly at the first point of the trajectory"
          >
            <Crosshair className="w-3 h-3 text-indigo-200" />
            <span>Align to Start</span>
          </button>
          <button
            onClick={() => handleAutoAlign('optimal')}
            disabled={isAligning || trajectoryPoses.length === 0}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[10px] flex items-center gap-1 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            title="Optimize Robot Base position for maximum reach across the entire demonstration"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Optimal Fit</span>
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
          {['iso', 'top', 'front', 'side'].map((view) => (
            <button
              key={view}
              onClick={() => setViewPreset(view)}
              className={`px-2 py-0.5 rounded font-medium capitalize transition-all ${
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

      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 font-mono pointer-events-none z-10 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
        <Compass className="w-3 h-3 text-indigo-400" />
        <span>Scrub trajectory to articulate arm • Drag: Rotate • Ctrl+Scroll: Zoom</span>
      </div>
    </div>
  );
}