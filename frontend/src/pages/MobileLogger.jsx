import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  ChevronLeft,
  RefreshCw,
  FlipHorizontal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  SwitchCamera
} from 'lucide-react';

const TASK_MODES = [
  { id: 'draw 3d circle', label: 'CIRCLE' },
  { id: 'reach to apple', label: 'APPLE' },
  { id: 'reach to banana', label: 'BANANA' },
  { id: 'pick up cup', label: 'PICK CUP' },
  { id: 'custom', label: 'CUSTOM' }
];

export default function MobileLogger({ onUploadSuccess, onExit }) {
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeModeIdx, setActiveModeIdx] = useState(0);
  const [customTask, setCustomTask] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [recTime, setRecTime] = useState('00:00.0');
  const [imuHz, setImuHz] = useState(0);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [accelData, setAccelData] = useState([0, 0, 9.81]);
  const [gyroData, setGyroData] = useState([0, 0, 0]);
  const [focusPoint, setFocusPoint] = useState(null);

  // Camera devices
  const [devices, setDevices] = useState([]);
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const imuDataRef = useRef([]);
  const imuSampleCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);

  // Enumerate cameras
  const refreshDevices = async () => {
    try {
      const allDevs = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevs.filter((d) => d.kind === 'videoinput');
      setDevices(videoDevs);
    } catch (e) {
      console.log('Error enumerating devices:', e);
    }
  };

  const startCamera = async (targetDeviceId = null) => {
    // Request motion permission if iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        await DeviceMotionEvent.requestPermission();
      } catch (e) {
        console.log('Motion permission:', e);
      }
    }

    try {
      await refreshDevices();

      // Find widest available rear camera if targetDeviceId is not provided
      let selectedId = targetDeviceId;
      if (!selectedId) {
        try {
          const devList = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = devList.filter((d) => d.kind === 'videoinput');
          const wideCam = videoDevs.find(
            (d) =>
              (d.label.toLowerCase().includes('wide') ||
                d.label.toLowerCase().includes('ultra') ||
                d.label.toLowerCase().includes('0.5')) &&
              !d.label.toLowerCase().includes('front')
          );
          if (wideCam) selectedId = wideCam.deviceId;
        } catch (e) {
          console.log(e);
        }
      }

      // Stop existing stream if any
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }

      const constraints = {
        video: selectedId
          ? { deviceId: { exact: selectedId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Try setting minimum zoom for widest angle
      try {
        const [track] = stream.getVideoTracks();
        if (track && track.getCapabilities) {
          const cap = track.getCapabilities();
          if (cap.zoom && cap.zoom.min !== undefined) {
            await track.applyConstraints({ advanced: [{ zoom: cap.zoom.min }] });
          }
        }
      } catch (zoomErr) {
        console.log('Wide zoom constraint error:', zoomErr);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      setStatusMsg('');
      setupImuListeners();
    } catch (err) {
      console.error(err);
      setStatusMsg('Camera error: ' + err.message);
    }
  };

  const switchCamera = async () => {
    if (devices.length < 2) return;
    const nextIdx = (currentDeviceIdx + 1) % devices.length;
    setCurrentDeviceIdx(nextIdx);
    await startCamera(devices[nextIdx].deviceId);
  };

  const setupImuListeners = () => {
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        const acc = event.accelerationIncludingGravity || event.acceleration || { x: 0, y: 0, z: 9.81 };
        const rot = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

        const accArr = [acc.x || 0, acc.y || 0, acc.z || 9.81];
        const rotArr = [rot.alpha || 0, rot.beta || 0, rot.gamma || 0];

        setAccelData(accArr);
        setGyroData(rotArr);

        if (isRecording) {
          const nowEpoch = performance.timeOrigin + performance.now();
          const elapsedSec = (nowEpoch - startTimeRef.current) / 1000.0;
          imuDataRef.current.push({
            timestamp: elapsedSec,
            epoch_ms: nowEpoch,
            accel: accArr,
            gyro: rotArr
          });
          imuSampleCountRef.current += 1;
        }
      });
    }

    const interval = setInterval(() => {
      setImuHz(imuSampleCountRef.current);
      imuSampleCountRef.current = 0;
    }, 1000);

    return () => clearInterval(interval);
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    recordedChunksRef.current = [];
    imuDataRef.current = [];
    startTimeRef.current = performance.timeOrigin + performance.now();
    setIsRecording(true);

    let mimeType = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.start(30);

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (performance.timeOrigin + performance.now() - startTimeRef.current) / 1000.0;
      const mins = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, '0');
      const secs = (elapsed % 60).toFixed(1).padStart(4, '0');
      setRecTime(`${mins}:${secs}`);
    }, 100);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    setStatusMsg('Processing 3D motion & sensor logs...');

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.stop();
    mediaRecorder.onstop = async () => {
      const mimeType = recordedChunksRef.current[0]?.type || 'video/webm';
      const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });

      const selectedMode = TASK_MODES[activeModeIdx];
      const task = selectedMode.id === 'custom' ? customTask || 'custom motion' : selectedMode.id;

      const formData = new FormData();
      formData.append('video', blob, `recording${ext}`);
      formData.append('imu_data', JSON.stringify(imuDataRef.current));
      formData.append('task', task);

      try {
        const res = await fetch('/api/recordings/save', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status === 'success') {
          setStatusMsg(`Episode #${data.episode_index} Saved (${data.num_frames} frames)`);
          if (onUploadSuccess) onUploadSuccess();
          setTimeout(() => setStatusMsg(''), 3500);
        } else {
          setStatusMsg('Error: ' + (data.message || 'Processing failed'));
        }
      } catch (err) {
        console.error(err);
        setStatusMsg('Upload failed: ' + err.message);
      }
    };
  };

  // Screen tap to focus animation
  const handleTapViewfinder = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => setFocusPoint(null), 1200);
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] bg-black select-none overflow-hidden touch-manipulation flex flex-col justify-between z-50">
      {/* Background Fullscreen Video Feed */}
      <div
        onClick={handleTapViewfinder}
        className="absolute inset-0 w-full h-full bg-black overflow-hidden cursor-crosshair"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Tap-to-Focus Reticle Effect */}
        {focusPoint && (
          <div
            style={{ left: focusPoint.x - 30, top: focusPoint.y - 30 }}
            className="absolute w-16 h-16 border-2 border-amber-400/90 rounded-sm pointer-events-none animate-ping"
          />
        )}
      </div>

      {/* Top Bar Overlay (Camera App Style) */}
      <div className="relative z-30 pt-safe px-4 pt-3 pb-2 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Left: Exit/Back to Dashboard */}
        <button
          onClick={onExit}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 active:scale-95 transition-all shadow-md"
          title="Back to Dashboard"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center: Recording Timer or Status Badge */}
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="bg-rose-600/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-rose-400/40 flex items-center gap-2 shadow-lg shadow-rose-600/30">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="font-mono text-sm font-bold text-white tracking-wider">{recTime}</span>
            </div>
          ) : (
            <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-xs font-semibold text-white/90 tracking-wide">
                {isCameraActive ? 'ArUco + EKF Active' : 'Camera Standby'}
              </span>
            </div>
          )}
        </div>

        {/* Right: IMU / Flip Camera Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
              showTelemetry
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-black/40 text-white/80 border-white/10'
            }`}
            title="Toggle Sensor HUD"
          >
            <Activity className="w-4 h-4" />
          </button>

          {devices.length > 1 && (
            <button
              onClick={switchCamera}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 active:scale-95 transition-all"
              title="Switch Camera Lens"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Status / Upload Toast */}
      {statusMsg && (
        <div className="relative z-30 mx-auto px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-indigo-500/40 rounded-full text-xs font-medium text-indigo-200 shadow-xl animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Real-time Telemetry Floating HUD (Optional Toggle) */}
      {showTelemetry && (
        <div className="relative z-30 mx-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 text-[11px] font-mono text-slate-300 flex justify-between">
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">IMU Rate</span>
            <span className="text-emerald-400 font-bold">{imuHz} Hz</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Accel [X, Y, Z]</span>
            <span>
              {accelData[0].toFixed(1)}, {accelData[1].toFixed(1)}, {accelData[2].toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase">Gyro [α, β, γ]</span>
            <span>
              {gyroData[0].toFixed(1)}, {gyroData[1].toFixed(1)}, {gyroData[2].toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Initial Camera Permission Splash (If camera not active) */}
      {!isCameraActive && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/40">
            <Camera className="w-10 h-10 text-white" />
          </div>

          <div className="max-w-xs">
            <h2 className="text-lg font-bold text-white tracking-wide">3D Motion Camera</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Captures high-frequency IMU motion & wide-angle video anchored to your ArUco desk marker.
            </p>
          </div>

          <button
            onClick={() => startCamera()}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>LAUNCH CAMERA</span>
          </button>
        </div>
      )}

      {/* Bottom Camera App Bar (Shutter, Modes, Custom Task Input) */}
      <div className="relative z-30 pb-safe pb-6 pt-2 flex flex-col items-center bg-gradient-to-t from-black via-black/80 to-transparent">
        {/* Custom Task Input (Appears only if CUSTOM mode is active) */}
        {TASK_MODES[activeModeIdx]?.id === 'custom' && (
          <div className="w-full px-6 mb-3">
            <input
              type="text"
              placeholder="Type task description..."
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-slate-400 outline-none text-center focus:border-indigo-400 transition-colors"
            />
          </div>
        )}

        {/* Mode Carousel (Standard Camera App Tabs) */}
        <div className="w-full overflow-x-auto no-scrollbar flex items-center justify-center gap-5 py-2 px-4 text-xs font-semibold tracking-wider">
          {TASK_MODES.map((mode, idx) => {
            const isSelected = idx === activeModeIdx;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  if (!isRecording) setActiveModeIdx(idx);
                }}
                disabled={isRecording}
                className={`transition-all whitespace-nowrap flex flex-col items-center gap-1 ${
                  isSelected ? 'text-amber-400 scale-105 font-bold' : 'text-slate-400/80 hover:text-white'
                }`}
              >
                <span>{mode.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm" />}
              </button>
            );
          })}
        </div>

        {/* Shutter Button Row */}
        <div className="w-full px-8 mt-2 flex items-center justify-between max-w-sm">
          {/* Left Dummy / Preset Indicator */}
          <div className="w-12 h-12 flex items-center justify-center text-slate-400 text-xs font-mono">
            <span>{activeModeIdx + 1}/{TASK_MODES.length}</span>
          </div>

          {/* Center: Authentic Camera Circular Shutter Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isCameraActive}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 active:scale-95 transition-transform disabled:opacity-40"
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <div
              className={`transition-all duration-300 ${
                isRecording
                  ? 'w-7 h-7 rounded-md bg-rose-600 animate-pulse'
                  : 'w-full h-full rounded-full bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/50'
              }`}
            />
          </button>

          {/* Right: Camera Orientation or Lens Indicator */}
          <div className="w-12 h-12 flex items-center justify-center text-slate-400">
            <span className="text-[10px] font-mono border border-white/20 px-1.5 py-0.5 rounded">
              {devices.length > 0 ? `CAM ${currentDeviceIdx + 1}` : 'WIDE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
