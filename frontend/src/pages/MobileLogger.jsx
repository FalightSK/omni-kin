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
  SwitchCamera,
  Maximize2,
  Minimize2,
  RotateCw
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
  const containerRef = useRef(null);
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Orientation State: Checks window aspect ratio and Accelerometer Ax (|Ax| >= 6.0 m/s^2)
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= window.innerHeight : true
  );

  // Camera devices
  const [devices, setDevices] = useState([]);
  const [currentDeviceIdx, setCurrentDeviceIdx] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const imuDataRef = useRef([]);
  const imuSampleCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);

  // Listen to screen orientation & window resize
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const landscapeByRatio = window.innerWidth >= window.innerHeight;
        const landscapeByScreen =
          window.screen?.orientation?.type?.includes('landscape') ||
          Math.abs(window.orientation || 0) === 90;
        setIsLandscape(landscapeByRatio || landscapeByScreen);
      }
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', checkOrientation);
    }

    const checkFs = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', checkFs);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
      document.removeEventListener('fullscreenchange', checkFs);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

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
    // Attempt automatic fullscreen to hide mobile URL bar
    toggleFullscreen();

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

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }

      // 16:9 ideal widescreen constraints for landscape data capture
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

        // If accelerometer indicates strong horizontal orientation (|Ax| > 6.0 m/s^2), confirm landscape
        if (Math.abs(accArr[0]) > 6.0) {
          setIsLandscape(true);
        } else if (Math.abs(accArr[1]) > 7.0 && Math.abs(accArr[0]) < 3.5) {
          // Strongly upright portrait
          setIsLandscape(false);
        }

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

  const handleTapViewfinder = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => setFocusPoint(null), 1200);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-[100dvh] bg-black select-none overflow-hidden touch-manipulation z-50 flex flex-col justify-between"
      style={{
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
      }}
    >
      {/* Background Fullscreen Video Feed */}
      <div
        onClick={handleTapViewfinder}
        className="absolute inset-0 w-full h-full bg-black overflow-hidden cursor-crosshair z-0"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* 16:9 Widescreen Framing Reticle Guide */}
        <div className="absolute inset-3 md:inset-6 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
          <div className="flex justify-between items-start text-[9px] font-mono text-white/40 tracking-wider">
            <span>[ 16:9 ARUCO RECORDING ZONE ]</span>
            <span>AX: {accelData[0] >= 0 ? `+${accelData[0].toFixed(1)}` : accelData[0].toFixed(1)} m/s²</span>
          </div>
          <div className="flex justify-between items-end text-[9px] font-mono text-white/40">
            <span>Z=0 TABLE COPLANAR</span>
            <span>1080P WIDE</span>
          </div>
        </div>

        {/* Tap-to-Focus Reticle Effect */}
        {focusPoint && (
          <div
            style={{ left: focusPoint.x - 28, top: focusPoint.y - 28 }}
            className="absolute w-14 h-14 border-2 border-amber-400 rounded-lg pointer-events-none animate-ping"
          />
        )}
      </div>

      {/* Floating Status / Notification Toast */}
      {statusMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-slate-900/90 backdrop-blur-md border border-indigo-500/50 rounded-full text-xs font-semibold text-indigo-200 shadow-2xl flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Real-time Telemetry Floating HUD (Toggled via Activity button) */}
      {showTelemetry && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 flex gap-4 shadow-xl">
          <div>
            <span className="text-slate-500 block uppercase text-[8px]">IMU Rate</span>
            <span className="text-emerald-400 font-bold">{imuHz} Hz</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[8px]">Accel X (Horizontal Gravity)</span>
            <span className="text-amber-400 font-bold">{accelData[0].toFixed(2)} m/s²</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[8px]">Accel Y, Z</span>
            <span>
              {accelData[1].toFixed(1)}, {accelData[2].toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Initial Camera Permission Splash (If camera not active) */}
      {!isCameraActive && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-600/40">
            <Camera className="w-10 h-10 text-white" />
          </div>

          <div className="max-w-xs">
            <h2 className="text-lg font-bold text-white tracking-wide">3D Motion Camera</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Hold horizontally over your workspace. Aligned for 16:9 table manipulation capture ($A_x \approx \pm 9.8\,\text{m/s}^2$).
            </p>
          </div>

          <button
            onClick={() => startCamera()}
            className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>LAUNCH CAMERA & FULLSCREEN</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LANDSCAPE LAYOUT (HORIZONTAL DUAL-EDGE ERGONOMICS)                          */}
      {/* ========================================================================= */}
      {isLandscape ? (
        <div className="relative z-30 w-full h-full flex justify-between items-center pointer-events-none">
          {/* LEFT EDGE: STATUS & SECONDARY CONTROLS */}
          <div className="w-20 h-full flex flex-col justify-between items-center py-2 pointer-events-auto select-none">
            {/* Top Left: Exit & Fullscreen */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={onExit}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg"
                title="Back to Desktop Dashboard"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 active:scale-90 transition-all shadow-lg"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Center Left: Recording Timer or Status Badge */}
            <div className="flex flex-col items-center gap-2">
              {isRecording ? (
                <div className="bg-rose-600/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-400/50 flex items-center gap-1.5 shadow-xl shadow-rose-600/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span className="font-mono text-xs font-bold text-white tracking-wider">{recTime}</span>
                </div>
              ) : (
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[10px] font-semibold text-white/90 font-mono">{imuHz} Hz</span>
                </div>
              )}
            </div>

            {/* Bottom Left: Camera Lens Switcher & Sensor Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                  showTelemetry ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-black/60 text-white/80 border-white/20'
                }`}
                title="Toggle Sensor HUD"
              >
                <Activity className="w-4 h-4" />
              </button>

              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg"
                  title="Switch Camera Lens"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* CENTER TOP: CUSTOM TASK PROMPT INPUT */}
          {TASK_MODES[activeModeIdx]?.id === 'custom' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-72">
              <input
                type="text"
                placeholder="Type task prompt..."
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                className="w-full bg-black/80 backdrop-blur-md border border-white/30 rounded-full px-4 py-1.5 text-xs text-white placeholder-slate-400 outline-none text-center shadow-xl focus:border-indigo-400 transition-colors"
              />
            </div>
          )}

          {/* RIGHT EDGE: THUMB ERGONOMIC STRIP (MODES + CIRCULAR SHUTTER) */}
          <div className="w-28 h-full flex flex-col justify-center items-center gap-3 py-2 pointer-events-auto select-none">
            {/* Task Mode Carousel Tabs (Right Next to Thumb) */}
            <div className="flex flex-col items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
              {TASK_MODES.map((mode, idx) => {
                const isSelected = idx === activeModeIdx;
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      if (!isRecording) setActiveModeIdx(idx);
                    }}
                    disabled={isRecording}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-500/90 text-black shadow-md shadow-amber-500/30 font-extrabold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* Large 76px Circular Shutter Button Under Right Thumb */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isCameraActive}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1.5 active:scale-95 transition-transform disabled:opacity-40 shadow-2xl"
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
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* PORTRAIT FALLBACK (WITH ROTATE RECOMMENDATION BANNER)                     */
        /* ========================================================================= */
        <div className="relative z-30 w-full h-full flex flex-col justify-between pointer-events-none">
          {/* Top Bar with Rotation Advice Banner */}
          <div className="pt-2 px-3 flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={onExit}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {isRecording ? (
                <div className="bg-rose-600/90 px-3 py-1 rounded-full border border-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span className="font-mono text-xs font-bold text-white">{recTime}</span>
                </div>
              ) : (
                <div className="bg-black/60 px-3 py-1 rounded-full border border-white/15 text-xs font-semibold text-white">
                  ArUco Ready ({imuHz} Hz)
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Rotation Hint Banner */}
            <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 text-[11px] text-amber-200">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Rotate phone horizontally for 16:9 table capture</span>
            </div>
          </div>

          {/* Bottom Portrait Shutter Bar */}
          <div className="pb-6 flex flex-col items-center gap-3 pointer-events-auto bg-gradient-to-t from-black via-black/80 to-transparent">
            {/* Mode Tabs */}
            <div className="flex gap-2 text-xs font-bold">
              {TASK_MODES.map((mode, idx) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveModeIdx(idx)}
                  className={`px-2.5 py-1 rounded-full ${
                    idx === activeModeIdx ? 'bg-amber-400 text-black font-extrabold' : 'text-slate-400'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Circular Shutter Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isCameraActive}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1.5 active:scale-95 transition-transform"
            >
              <div
                className={`transition-all duration-300 ${
                  isRecording
                    ? 'w-7 h-7 rounded-md bg-rose-600 animate-pulse'
                    : 'w-full h-full rounded-full bg-rose-600'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
