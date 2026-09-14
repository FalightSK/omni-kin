import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, ExternalLink, ShieldCheck, Smartphone, AlertTriangle, RefreshCw } from 'lucide-react';

export default function ConnectPhoneModal({ isOpen, onClose }) {
  const [serverInfo, setServerInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [qrSvg, setQrSvg] = useState('');
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/server/info')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => setServerInfo(data))
        .catch((err) => console.error('Failed to load server info', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHost =
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
      ? window.location.hostname
      : serverInfo?.local_ip || '127.0.0.1';

  const mobileUrl = serverInfo?.mobile_url
    ? typeof window !== 'undefined' &&
      window.location.hostname &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
      ? serverInfo.mobile_url.replace(
          /https?:\/\/[^:/]+/,
          (match) => match.split('://')[0] + '://' + window.location.hostname
        )
      : serverInfo.mobile_url
    : `https://${currentHost}:8443/mobile`;

  useEffect(() => {
    if (mobileUrl) {
      setQrError(false);
      QRCode.toString(mobileUrl, {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
        .then((svg) => setQrSvg(svg))
        .catch((err) => {
          console.error('Failed to generate client QR code', err);
          setQrError(true);
        });
    }
  }, [mobileUrl]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(mobileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const retryQr = () => {
    setQrError(false);
    QRCode.toString(mobileUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => {
        console.error('Failed to retry client QR code', err);
        setQrError(true);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Connect Mobile Phone</h3>
              <p className="text-[11px] text-slate-400">Scan QR code or open HTTPS link on phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* QR Code Container */}
          <div className="relative p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[216px] min-h-[216px]">
            {qrSvg ? (
              <div
                className="w-48 h-48 rounded-lg overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : qrError ? (
              <div className="w-48 h-48 flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-xs text-slate-700 font-medium mb-1">QR Code unavailable</p>
                <p className="text-[10px] text-slate-500 mb-2">Use the direct link below</p>
                <button
                  onClick={retryQr}
                  className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}
          </div>

          <p className="text-xs text-slate-300 text-center font-medium">
            Point your smartphone camera at this QR code to open the data collector.
          </p>

          {/* URL with Copy Button */}
          <div className="w-full flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="flex-1 bg-transparent text-xs font-mono text-purple-300 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-all"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={mobileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* SSL Bypass Instructions Card */}
          <div className="w-full bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>One-Time SSL Acceptance</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              Mobile browsers require HTTPS for camera and motion sensors. Because this server uses a local self-signed certificate, your phone browser will show a warning:
            </p>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-1 font-mono text-[10px] text-slate-300">
              <p>• <strong>Android Chrome:</strong> Tap "Advanced" ➔ "Proceed to {serverInfo?.local_ip || 'IP'} (unsafe)"</p>
              <p>• <strong>iOS Safari:</strong> Tap "Show Details" ➔ "visit this website" ➔ "Visit Website"</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
