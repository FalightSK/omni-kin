import React, { useState, useEffect, useRef } from 'react';
import { Camera, Radio, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function MobileLogger({ onUploadSuccess }) {
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [taskPreset, setTaskPreset] = useState('draw 3d circle');
  const [taskCustom, setTaskCustom] = useState('');
  const [statusMsg, setStatusMsg] = useState('Point at ArUco marker on table');
  const [recTime, setRecTime] = useState('00:00.0');
  const [accelData, setAccelData] = useState([0, 0, 9.81]);
  const [gyroData, setGyroData] = useState([0, 0, 0]);
  const [imuHz, setImuHz] = useState(0);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const imuDataRef = useRef([]);
  const imuSampleCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);

  const startCamera = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        await DeviceMotionEvent.requestPermission();
      } catch (e) {
        console.log('Motion permission:', e);
      }
    }

    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setStatusMsg('Point at ArUco marker & press record');
      setupImuListeners();
    } catch (err) {
      console.error(err);
      setStatusMsg('Camera error: ' + err.message);
    }
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

    setInterval(() => {
      setImuHz(imuSampleCountRef.current);
      imuSampleCountRef.current = 0;
    }, 1000);
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
    setStatusMsg('Drawing 3D shape relative to marker...');

    timerIntervalRef.current = setInterval(() => {
      const elapsed = (performance.timeOrigin + performance.now() - startTimeRef.current) / 1000.0;
      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const secs = (elapsed % 60).toFixed(1).padStart(4, '0');
      setRecTime(`${mins}:${secs}`);
    }, 100);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    clearInterval(timerIntervalRef.current);
    setStatusMsg('Uploading raw sensor logs to server...');

    const mediaRecorder = mediaRecorderRef.current;
    if (!mediaRecorder) return;

    mediaRecorder.stop();
    mediaRecorder.onstop = async () => {
      const mimeType = recordedChunksRef.current[0]?.type || 'video/webm';
      const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const task = taskPreset === 'custom' ? taskCustom : taskPreset;

      const formData = new FormData();
      formData.append('video', blob, `recording${ext}`);
      formData.append('imu_data', JSON.stringify(imuDataRef.current));
      formData.append('task', task);

      try {
        setStatusMsg('⚙️ Server is calculating 3D Trajectory (Dual-ArUco PnP + EKF Fusion)...');
        const res = await fetch('/api/recordings/save', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status === 'success') {
          setStatusMsg(`🎉 Server Saved Episode #${data.episode_index} (${data.num_frames} frames)!`);
          if (onUploadSuccess) onUploadSuccess();
        } else {
          setStatusMsg('❌ Server error: ' + (data.message || 'Processing failed'));
        }
      } catch (err) {
        console.error(err);
        setStatusMsg('❌ Upload failed: ' + err.message);
      }
    };
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-60px)] relative overflow-hidden bg-black text-left">
      {/* Viewfinder Video Stream */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Aiming Reticle Box */}
        <div className="absolute w-40 h-40 border-2 border-dashed border-emerald-400/60 rounded-2xl pointer-events-none flex items-end justify-center pb-2">
          <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold">ArUco Anchor</span>
        </div>

        {!isCameraActive && (
          <div className="absolute inset-4 glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 z-20">
            <Camera className="w-12 h-12 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">🎯 ArUco 3D Trajectory Anchor</h2>
              <p className="text-xs text-slate-400 mt-1">Aim camera at printed Dual-ArUco board and record 3D motion in the air.</p>
            </div>
            <button
              onClick={startCamera}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30"
            >
              ⚡ START CAMERA & IMU
            </button>
          </div>
        )}

        {/* HUD Overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none z-10">
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-200">{recTime}</span>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-300">
            IMU: <strong className="text-indigo-400">{imuHz}</strong> Hz
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none z-10 text-[10px] font-mono text-slate-400">
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
            ACC: [{accelData[0].toFixed(1)}, {accelData[1].toFixed(1)}, {accelData[2].toFixed(1)}]
          </div>
          <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800">
            GYR: [{gyroData[0].toFixed(1)}, {gyroData[1].toFixed(1)}, {gyroData[2].toFixed(1)}]
          </div>
        </div>
      </div>

      {/* Control Panel Footer */}
      <div className="glass-card p-4 flex flex-col gap-3 z-20 border-t border-slate-800">
        <div className="flex gap-2">
          <select
            value={taskPreset}
            onChange={(e) => setTaskPreset(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 outline-none"
          >
            <option value="draw 3d circle">draw 3d circle</option>
            <option value="reach to apple">reach to apple</option>
            <option value="reach to banana">reach to banana</option>
            <option value="pick up cup">pick up cup</option>
            <option value="custom">Custom...</option>
          </select>
          {taskPreset === 'custom' && (
            <input
              type="text"
              placeholder="Enter task..."
              value={taskCustom}
              onChange={(e) => setTaskCustom(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
            />
          )}
        </div>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isCameraActive}
          className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 ${
            isRecording
              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-slate-900/50'
              : 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>{isRecording ? 'STOP RECORDING' : 'START RECORDING'}</span>
        </button>

        <p className="text-[11px] text-center text-slate-400 font-medium">{statusMsg}</p>
      </div>
    </div>
  );
}
