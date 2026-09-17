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
  RotateCw,
  Hand,
  UploadCloud,
  Scan
} from 'lucide-react';

const QUICK_TASK_SUGGESTIONS = [
  'pick cup',
  'wipe table',
  'open drawer',
  'draw 3d circle',
  'insert peg',
  'fold cloth'
];

export default function MobileLogger({ onUploadSuccess, onExit }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [taskPrompt, setTaskPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omnikin_task_prompt') || 'pick cup';
    }
    return 'pick cup';
  });

  const handleTaskPromptChange = (val) => {
    setTaskPrompt(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omnikin_task_prompt', val);
    }
  };

  const [statusMsg, setStatusMsg] = useState('');
  const [recTime, setRecTime] = useState('00:00.0');
  const [imuHz, setImuHz] = useState(0);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [accelData, setAccelData] = useState([0, 0, 9.81]);
  const [focusPoint, setFocusPoint] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Preview Framing Mode: 'fit' = 100% full sensor FOV (letterbox, zero crop); 'fill' = screen cover (cropped edges)
  const [previewMode, setPreviewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omnikin_preview_mode') || 'fit';
    }
    return 'fit';
  });

  const togglePreviewMode = () => {
    setPreviewMode((prev) => {
      const next = prev === 'fit' ? 'fill' : 'fit';
      if (typeof window !== 'undefined') {
        localStorage.setItem('omnikin_preview_mode', next);
      }
      return next;
    });
  };

  // 1-Hand Gripper State & Telemetry Logging
  const [gripperOpen, setGripperOpen] = useState(true); // true = 100% open, false = 0% closed
  const gripperValRef = useRef(1.0);
  const gripperDataRef = useRef([]);

  // High-Throughput Asynchronous Upload Queue
  const uploadQueueRef = useRef([]);
  const isUploadingRef = useRef(false);
  const [queueCount, setQueueCount] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

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
  const lastUiUpdateTimeRef = useRef(0);

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
    try {
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
    } catch (e) {
      console.log('Fullscreen toggle caught error:', e);
    }
  };

  // Enumerate cameras
  const refreshDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setDevices([]);
        return;
      }
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

    // Check secure context / mediaDevices right away
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const isRemote =
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';
      if (isRemote && window.location.protocol === 'http:') {
        window.location.href = `https://${window.location.hostname}:8443/mobile`;
        return;
      }
      setStatusMsg('Camera access requires HTTPS or localhost context.');
      alert('Camera access requires HTTPS. Please connect to https://' + window.location.hostname + ':8443/mobile');
      return;
    }

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
      if (!selectedId && navigator.mediaDevices?.enumerateDevices) {
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

      // Standard robotics imitation learning 720p widescreen constraints (1280x720 @ 30 FPS)
      // Provides optimal balance of sharpness, low encoding latency, and zero thermal throttling
      const constraints = {
        video: selectedId
          ? { deviceId: { exact: selectedId }, width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 30 } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280, max: 1920 }, height: { ideal: 720, max: 1080 }, frameRate: { ideal: 30 } },
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
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('Video play deferred until user interaction:', playErr);
        }
      }

      // Re-enumerate devices now that camera permission is granted
      try {
        const allDevs = await navigator.mediaDevices.enumerateDevices();
        const videoDevs = allDevs.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevs);

        const [track] = stream.getVideoTracks();
        const activeId = track?.getSettings()?.deviceId || selectedId;
        if (activeId) {
          const idx = videoDevs.findIndex((d) => d.deviceId === activeId);
          if (idx !== -1) setCurrentDeviceIdx(idx);
        }
      } catch (enumErr) {
        console.log('Device enumeration error:', enumErr);
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
    if (!devices || devices.length < 2) return;
    const nextIdx = (currentDeviceIdx + 1) % devices.length;
    setCurrentDeviceIdx(nextIdx);
    setStatusMsg(`Switched to Camera ${nextIdx + 1}`);
    setTimeout(() => setStatusMsg(''), 1500);
    await startCamera(devices[nextIdx].deviceId);
  };

  const setupImuListeners = () => {
    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', (event) => {
        const acc = event.accelerationIncludingGravity || event.acceleration || { x: 0, y: 0, z: 9.81 };
        const rot = event.rotationRate || { alpha: 0, beta: 0, gamma: 0 };

        // Standard W3C mapping: beta=pitch(X), gamma=roll(Y), alpha=yaw(Z)
        const accArr = [acc.x || 0, acc.y || 0, acc.z || 9.81];
        const rotArr = [rot.beta || 0, rot.gamma || 0, rot.alpha || 0];

        // 1. High-frequency sensor capture (100Hz hardware rate directly into ref, ZERO React re-renders)
        if (isRecording) {
          const nowEpoch = performance.timeOrigin + performance.now();
          const elapsedSec = (nowEpoch - startTimeRef.current) / 1000.0;
          const screenAngle =
            (typeof window !== 'undefined' && window.screen?.orientation?.angle !== undefined)
              ? window.screen.orientation.angle
              : (typeof window !== 'undefined' ? (window.orientation || 0) : 0);

          imuDataRef.current.push({
            timestamp: elapsedSec,
            epoch_ms: nowEpoch,
            accel: accArr,
            gyro: rotArr,
            screen_angle: screenAngle
          });
          imuSampleCountRef.current += 1;
        }

        // 2. Throttle React UI updates to 10Hz (every 100ms) to eliminate main-thread lag
        const nowMs = performance.now();
        if (nowMs - lastUiUpdateTimeRef.current >= 100) {
          lastUiUpdateTimeRef.current = nowMs;
          setAccelData(accArr);

          // If accelerometer indicates strong horizontal orientation (|Ax| > 6.0 m/s^2), confirm landscape
          if (Math.abs(accArr[0]) > 6.0) {
            setIsLandscape(true);
          } else if (Math.abs(accArr[1]) > 7.0 && Math.abs(accArr[0]) < 3.5) {
            // Strongly upright portrait
            setIsLandscape(false);
          }
        }
      });
    }

    const interval = setInterval(() => {
      setImuHz(imuSampleCountRef.current);
      imuSampleCountRef.current = 0;
    }, 1000);

    return () => clearInterval(interval);
  };

  const toggleGripper = () => {
    const nextVal = !gripperOpen;
    setGripperOpen(nextVal);
    const numVal = nextVal ? 1.0 : 0.0;
    gripperValRef.current = numVal;

    // Haptic feedback if available on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(35); } catch (_) {}
    }

    if (isRecording) {
      const nowEpoch = performance.timeOrigin + performance.now();
      const elapsedSec = (nowEpoch - startTimeRef.current) / 1000.0;
      gripperDataRef.current.push({
        t: elapsedSec,
        val: numVal
      });
    }
  };

  const processUploadQueue = async () => {
    if (isUploadingRef.current) return;
    if (uploadQueueRef.current.length === 0) return;

    isUploadingRef.current = true;
    while (uploadQueueRef.current.length > 0) {
      const item = uploadQueueRef.current[0];
      setQueueCount(uploadQueueRef.current.length);
      setUploadStatus(`Uploading: ${item.task}`);

      const formData = new FormData();
      formData.append('video', item.blob, `recording${item.ext}`);
      formData.append('imu_data', JSON.stringify(item.imuData));
      formData.append('gripper_data', JSON.stringify(item.gripperData));
      formData.append('task', item.task);
      formData.append('client_take_id', item.id);

      let success = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch('/api/recordings/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (res.ok && data.status === 'queued') {
            console.log(`[OmniKin] Take ${item.id} enqueued on server at position ${data.queue_position}`);
            if (onUploadSuccess) onUploadSuccess();
            success = true;
            break;
          } else {
            console.warn(`[OmniKin] Server returned non-queued status on attempt ${attempt + 1}:`, data);
          }
        } catch (err) {
          console.warn(`[OmniKin] Upload attempt ${attempt + 1} failed:`, err);
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }

      if (success) {
        uploadQueueRef.current.shift();
        setQueueCount(uploadQueueRef.current.length);
      } else {
        console.error(`[OmniKin] Take ${item.id} failed after 3 attempts. Will retry later.`);
        setUploadStatus('Upload paused, retrying soon...');
        await new Promise((r) => setTimeout(r, 3000));
        break;
      }
    }

    isUploadingRef.current = false;
    setUploadStatus('');
  };

  const activeTakeChunksRef = useRef([]);

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const sessionChunks = [];
    activeTakeChunksRef.current = sessionChunks;
    imuDataRef.current = [];
    gripperDataRef.current = [{ t: 0.0, val: gripperValRef.current }];
    startTimeRef.current = performance.timeOrigin + performance.now();
    setIsRecording(true);
    setRecTime('00:00.0');
    setStatusMsg('🔴 Recording demonstration...');

    // Adaptive hardware-accelerated codec selection (prioritizes GPU-accelerated AVC1/H264 over software VP8)
    const preferredMimes = [
      'video/mp4;codecs=avc1',
      'video/mp4',
      'video/webm;codecs=h264',
      'video/webm;codecs=vp9',
      'video/webm'
    ];
    let selectedMime = preferredMimes.find(
      (m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)
    ) || '';

    const recOptions = selectedMime
      ? { mimeType: selectedMime, videoBitsPerSecond: 4000000 }
      : {};

    const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, recOptions);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        sessionChunks.push(e.data);
      }
    };

    // 1000ms timeslice allows mobile hardware encoders to produce coherent GOP blocks without stalling the main thread
    mediaRecorder.start(1000);

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (performance.timeOrigin + performance.now() - startTimeRef.current) / 1000.0;
      const mins = Math.floor(elapsed / 60)
        .toString()
        .padStart(2, '0');
      const secs = (elapsed % 60).toFixed(1).padStart(4, '0');
      setRecTime(`${mins}:${secs}`);
    }, 100);
  };

  const stopRecording = () => {
    // ⚡ Instant Shutter Reset (<200ms): Immediately clears recording state so operator can tap Record again!
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    setStatusMsg('✅ Take saved to queue! Shutter ready.');
    setTimeout(() => setStatusMsg(''), 2200);

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    // Snapshot current sensor logs and session chunk array
    const currentImu = [...imuDataRef.current];
    const currentGripper = [...gripperDataRef.current];
    const currentTask = taskPrompt.trim() || 'demonstration';
    const currentChunks = activeTakeChunksRef.current;

    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      const mimeType = currentChunks[0]?.type || mediaRecorder.mimeType || 'video/webm';
      const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
      const blob = new Blob(currentChunks, { type: mimeType });

      const takeItem = {
        id: `take_${Date.now()}`,
        blob,
        ext,
        imuData: currentImu,
        gripperData: currentGripper,
        task: currentTask,
        createdAt: new Date().toLocaleTimeString()
      };

      uploadQueueRef.current.push(takeItem);
      setQueueCount(uploadQueueRef.current.length);

      // Asynchronously stream to server in background
      processUploadQueue();
    };
  };

  // Hardware Volume Button Shortcut (Optional background trigger, UI buttons remain primary)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'VolumeDown' ||
        e.code === 'VolumeUp' ||
        e.key === 'AudioVolumeDown' ||
        e.key === 'AudioVolumeUp'
      ) {
        try { e.preventDefault(); } catch (_) {}

        if (isRecording) {
          stopRecording();
        } else if (isCameraActive) {
          startRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, isCameraActive, taskPrompt]);

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
    >
      {/* Background Fullscreen Video Feed (Supports 'fit' for 100% full sensor FOV or 'fill' for screen crop) */}
      <div
        onClick={handleTapViewfinder}
        className="absolute inset-0 w-full h-full bg-black overflow-hidden cursor-crosshair z-0 flex items-center justify-center"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full transition-all duration-300 ${
            previewMode === 'fit' ? 'object-contain' : 'object-cover'
          }`}
        />

        {/* Tap-to-Focus Reticle Effect */}
        {focusPoint && (
          <div
            style={{ left: focusPoint.x - 28, top: focusPoint.y - 28 }}
            className="absolute w-14 h-14 border-2 border-amber-400 rounded-lg pointer-events-none animate-ping"
          />
        )}

        {/* Framing border indicator when in 100% FOV Fit mode */}
        {previewMode === 'fit' && isCameraActive && (
          <div className="absolute inset-2 border border-white/10 rounded-xl pointer-events-none flex flex-col justify-between p-2">
            <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>┌ FOV 100%</span>
              <span>┐</span>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
              <span>└ FULL SENSOR</span>
              <span>┘</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Status / Notification Toast */}
      {statusMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-[#0a0a0a]/95 backdrop-blur-md border border-neutral-700 rounded-full text-xs font-semibold text-neutral-200 shadow-2xl flex items-center gap-2 animate-fade-in font-mono">
          <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Real-time Telemetry Floating HUD (Toggled via Activity button) */}
      {showTelemetry && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-black/85 backdrop-blur-md border border-neutral-700 rounded-xl p-2.5 text-[10px] font-mono text-neutral-300 flex gap-4 shadow-xl">
          <div>
            <span className="text-neutral-500 block uppercase text-[8px]">IMU Rate</span>
            <span className="text-emerald-400 font-bold">{imuHz} Hz</span>
          </div>
          <div>
            <span className="text-neutral-500 block uppercase text-[8px]">Accel X (Horizontal Gravity)</span>
            <span className="text-amber-400 font-bold">{accelData[0].toFixed(2)} m/s²</span>
          </div>
          <div>
            <span className="text-neutral-500 block uppercase text-[8px]">Accel Y, Z</span>
            <span>
              {accelData[1].toFixed(1)}, {accelData[2].toFixed(1)}
            </span>
          </div>
        </div>
      )}

      {/* Initial Camera Permission Splash (If camera not active) */}
      {!isCameraActive && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shadow-2xl">
            <Camera className="w-8 h-8 text-neutral-300" />
          </div>

          <div className="max-w-xs">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">3D Motion Camera</h2>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              Hold horizontally over your workspace. Aligned for 16:9 table manipulation capture (Ax ≈ ±9.8 m/s²).
            </p>
          </div>

          {typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? (
            <div className="w-full max-w-xs bg-neutral-950/90 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-200 text-left flex flex-col gap-3 shadow-xl">
              <div className="flex items-center gap-2 text-neutral-200 font-semibold text-xs font-mono uppercase">
                <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>HTTPS Required for Camera</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Mobile browsers block camera and sensors on HTTP. Switch to encrypted HTTPS (Port 8443):
              </p>
              <a
                href={`https://${window.location.hostname}:8443/mobile`}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-center text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 uppercase font-mono"
              >
                <span>Switch to Secure HTTPS</span>
              </a>
              <div className="bg-neutral-900 rounded-xl p-2.5 border border-neutral-800 text-[10px] text-neutral-400 space-y-1">
                <p className="font-semibold text-neutral-300">Self-Signed Cert Steps:</p>
                <p>• <strong>Chrome:</strong> Tap "Advanced" &gt; "Proceed (unsafe)"</p>
                <p>• <strong>Safari:</strong> Tap "Show Details" &gt; "visit this website"</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xs flex flex-col gap-2">
              <button
                onClick={() => startCamera()}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wide shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 uppercase font-mono"
              >
                <span>Launch Camera</span>
              </button>
              <p className="text-[10px] text-neutral-500 font-mono text-center">
                💡 Tip: Tap "Add to Home Screen" in Safari/Chrome to run in 100% native fullscreen without browser bars.
              </p>
            </div>
          )}

          {statusMsg && (
            <div className="max-w-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs p-2.5 rounded-xl">
              {statusMsg}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LANDSCAPE LAYOUT (HORIZONTAL DUAL-EDGE ERGONOMICS)                          */}
      {/* ========================================================================= */}
      {isLandscape ? (
        <div
          className="relative z-30 w-full h-full flex justify-between items-center pointer-events-none"
          style={{
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
            paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
            paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))'
          }}
        >
          {/* LEFT EDGE: STATUS & SECONDARY CONTROLS */}
          <div className="w-20 h-full flex flex-col justify-between items-center py-2 pointer-events-auto select-none">
            {/* Top Left: Exit, Fullscreen & Preview Fit/Fill Mode */}
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

              <button
                onClick={togglePreviewMode}
                className={`h-7 px-2 rounded-full backdrop-blur-md border flex items-center gap-1 text-[10px] font-mono transition-all shadow-lg ${
                  previewMode === 'fit'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-black/60 text-white/80 border-white/20'
                }`}
                title={previewMode === 'fit' ? 'Showing 100% full sensor FOV (Fit). Tap for Fill Screen.' : 'Showing Fill Screen (Cropped). Tap for 100% full sensor FOV.'}
              >
                <Scan className="w-3 h-3" />
                <span>{previewMode === 'fit' ? 'FIT' : 'FILL'}</span>
              </button>
            </div>

            {/* Center Left: Recording Timer, Status Badge & Upload Queue */}
            <div className="flex flex-col items-center gap-2">
              {isRecording ? (
                <div className="bg-rose-600/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-400/50 flex items-center gap-1.5 shadow-xl shadow-rose-600/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span className="font-mono text-xs font-bold text-white tracking-wider">{recTime}</span>
                </div>
              ) : (
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                  <span className="text-[10px] font-semibold text-white/90 font-mono">{imuHz} Hz</span>
                </div>
              )}

              {queueCount > 0 && (
                <div className="bg-[#0a0a0a]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-neutral-700 flex items-center gap-1.5 shadow-lg animate-pulse">
                  <UploadCloud className="w-3.5 h-3.5 text-neutral-300" />
                  <span className="text-[10px] font-mono text-neutral-200 font-bold">{queueCount} in queue</span>
                </div>
              )}
            </div>

            {/* Bottom Left: Camera Lens Switcher & Sensor Toggle */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setShowTelemetry(!showTelemetry)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                  showTelemetry ? 'bg-white text-black border-white shadow-sm' : 'bg-black/60 text-white/80 border-white/20'
                }`}
                title="Toggle Sensor HUD"
              >
                <Activity className="w-4 h-4" />
              </button>

              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  className="h-10 px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1.5 text-white active:scale-90 transition-all shadow-lg text-xs"
                  title="Switch Camera"
                >
                  <SwitchCamera className="w-4 h-4 text-neutral-300" />
                  <span className="font-mono text-[11px] font-semibold">
                    {currentDeviceIdx + 1}/{devices.length}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* CENTER TOP: TASK PROMPT INPUT & QUICK SUGGESTIONS */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex flex-col items-center gap-1.5 max-w-[420px] w-full px-4">
            <div className="w-full relative flex items-center bg-black/80 backdrop-blur-md border border-neutral-700 rounded-full px-3.5 py-1.5 shadow-2xl focus-within:border-white transition-colors">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mr-2 shrink-0">TASK:</span>
              <input
                type="text"
                placeholder="e.g. pick up cup, wipe table..."
                value={taskPrompt}
                onChange={(e) => handleTaskPromptChange(e.target.value)}
                disabled={isRecording}
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-medium"
              />
              {taskPrompt && !isRecording && (
                <button
                  onClick={() => handleTaskPromptChange('')}
                  className="text-neutral-500 hover:text-white text-xs px-1"
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 no-scrollbar">
              {QUICK_TASK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleTaskPromptChange(sug)}
                  disabled={isRecording}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all whitespace-nowrap border ${
                    taskPrompt.toLowerCase() === sug.toLowerCase()
                      ? 'bg-white text-black font-semibold border-white'
                      : 'bg-black/60 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT EDGE: THUMB ERGONOMIC STRIP (GRIPPER + CIRCULAR SHUTTER) */}
          <div className="w-28 h-full flex flex-col justify-center items-center gap-4 py-2 pointer-events-auto select-none">
            {/* Thumb Gripper Toggle Button (1-Handed Manipulation) */}
            <button
              onClick={toggleGripper}
              className={`w-22 py-1.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-95 shadow-lg ${
                gripperOpen
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/15'
                  : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/15'
              }`}
              title="Toggle Gripper Open / Closed"
            >
              <div className="flex items-center gap-1.5">
                <Hand className={`w-3.5 h-3.5 ${gripperOpen ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-[10px] font-extrabold tracking-wider">
                  {gripperOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <span className="text-[8px] font-mono opacity-80">
                {gripperOpen ? '100% GRIP' : '0% GRIP'}
              </span>
            </button>

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
                <div className="flex items-center gap-1.5">
                  <div className="bg-black/60 px-3 py-1 rounded-full border border-white/15 text-xs font-semibold text-white">
                    ArUco Ready ({imuHz} Hz)
                  </div>
                  {queueCount > 0 && (
                    <div className="bg-[#0a0a0a]/90 px-2.5 py-1 rounded-full border border-neutral-700 text-[10px] font-mono text-neutral-200 flex items-center gap-1 animate-pulse">
                      <UploadCloud className="w-3 h-3 text-neutral-300" />
                      <span>{queueCount}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={togglePreviewMode}
                  className={`h-9 px-2.5 rounded-full backdrop-blur-md border flex items-center gap-1 text-[10px] font-mono transition-all ${
                    previewMode === 'fit'
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-black/60 text-white/80 border-white/20'
                  }`}
                  title={previewMode === 'fit' ? 'Showing 100% full sensor FOV (Fit). Tap for Fill Screen.' : 'Showing Fill Screen (Cropped). Tap for 100% full sensor FOV.'}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>{previewMode === 'fit' ? '100% FOV' : 'FILL'}</span>
                </button>

                {devices.length > 1 && (
                  <button
                    onClick={switchCamera}
                    className="h-9 px-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1 text-white active:scale-90 transition-all text-xs"
                    title="Switch Camera"
                  >
                    <SwitchCamera className="w-3.5 h-3.5 text-neutral-300" />
                    <span className="font-mono text-[10px]">{currentDeviceIdx + 1}/{devices.length}</span>
                  </button>
                )}

                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Rotation Hint Banner */}
            <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl px-3 py-1.5 flex items-center justify-center gap-2 text-[11px] text-neutral-300">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
              <span>Rotate phone horizontally for 16:9 table capture</span>
            </div>

            {/* Task Prompt Input & Quick Suggestions (Portrait) */}
            <div className="flex flex-col items-center gap-1.5 w-full mt-1">
              <div className="w-full relative flex items-center bg-black/80 backdrop-blur-md border border-neutral-700 rounded-full px-3.5 py-1 shadow-xl focus-within:border-white transition-colors">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mr-2 shrink-0">TASK:</span>
                <input
                  type="text"
                  placeholder="e.g. pick up cup, wipe table..."
                  value={taskPrompt}
                  onChange={(e) => handleTaskPromptChange(e.target.value)}
                  disabled={isRecording}
                  className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none font-medium"
                />
                {taskPrompt && !isRecording && (
                  <button
                    onClick={() => handleTaskPromptChange('')}
                    className="text-neutral-500 hover:text-white text-xs px-1"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5 no-scrollbar">
                {QUICK_TASK_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleTaskPromptChange(sug)}
                    disabled={isRecording}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all whitespace-nowrap border ${
                      taskPrompt.toLowerCase() === sug.toLowerCase()
                        ? 'bg-white text-black font-semibold border-white'
                        : 'bg-black/60 text-neutral-400 hover:text-white border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Portrait Shutter Bar */}
          <div className="pb-6 flex flex-col items-center gap-3 pointer-events-auto">
            {/* Controls: Gripper Toggle + Circular Shutter */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleGripper}
                className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-lg ${
                  gripperOpen
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/20'
                }`}
                title="Toggle Gripper"
              >
                <Hand className={`w-4 h-4 ${gripperOpen ? 'text-emerald-400' : 'text-amber-400'}`} />
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] font-extrabold">{gripperOpen ? 'OPEN' : 'CLOSED'}</span>
                  <span className="text-[8px] font-mono opacity-80">{gripperOpen ? '100%' : '0%'}</span>
                </div>
              </button>

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
        </div>
      )}
    </div>
  );
}
