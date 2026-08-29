import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Viewport3D({ trajectoryPoses = [], currentFrameIndex = 0 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const tubeMeshRef = useRef(null);
  const cursorMeshRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.01,
      50
    );
    camera.position.set(0.40, -0.45, 0.40);
    camera.up.set(0, 0, 1); // Z is Up
    camera.lookAt(0.075, 0.025, 0.05);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1.0, -1.0, 2.0);
    scene.add(dirLight);

    // 5. Workstation Tabletop Mesh
    const tableGeo = new THREE.BoxGeometry(0.80, 0.60, 0.02);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0.15, 0.10, -0.01);
    scene.add(tableMesh);

    // Tabletop Grid
    const gridHelper = new THREE.GridHelper(0.80, 16, 0x475569, 0x334155);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0.15, 0.10, 0.001);
    scene.add(gridHelper);

    // 6. Dual-ArUco Board Meshes
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
    const axesGizmo = new THREE.AxesHelper(0.08);
    axesGizmo.position.set(0, 0, 0.005);
    scene.add(axesGizmo);

    // 7. Animated End-Effector Cursor Sphere
    const cursorGeo = new THREE.SphereGeometry(0.012, 32, 32);
    const cursorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
    const cursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
    cursorMeshRef.current = cursorMesh;
    scene.add(cursorMesh);

    // Render loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

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
      const tubeGeo = new THREE.TubeGeometry(curve, Math.max(20, trajectoryPoses.length), 0.004, 8, false);
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

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden glass-card">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-300 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>3D World Frame: Dual-ArUco Table Origin (0,0,0)</span>
      </div>
    </div>
  );
}
