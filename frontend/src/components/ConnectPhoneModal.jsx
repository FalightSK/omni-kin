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
    if (isOpen && mobileUrl) {
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
  }, [isOpen, mobileUrl]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 bg-[#0d0d0d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700/60 flex items-center justify-center text-neutral-200 shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100 tracking-tight">Connect Mobile Phone</h3>
              <p className="text-[11px] text-neutral-400 font-mono">Scan QR code or open HTTPS link on phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col items-center gap-4">
          {/* QR Code Container */}
          <div className="relative p-3.5 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[216px] min-h-[216px]">
            {qrSvg ? (
              <div
                className="w-48 h-48 rounded-lg overflow-hidden flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : qrError ? (
              <div className="w-48 h-48 flex flex-col items-center justify-center p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-xs text-neutral-800 font-medium mb-1">QR Code unavailable</p>
                <p className="text-[10px] text-neutral-500 mb-2 font-mono">Use the direct link below</p>
                <button
                  onClick={retryQr}
                  className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-300 text-center font-normal">
            Point your smartphone camera at this QR code to open the data collector.
          </p>

          {/* URL with Copy Button */}
          <div className="w-full flex items-center gap-2 bg-[#050505] p-2.5 rounded-xl border border-neutral-800">
            <input
              type="text"
              readOnly
              value={mobileUrl}
              className="flex-1 bg-transparent text-xs font-mono text-neutral-200 outline-none select-all"
            />
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs flex items-center gap-1.5 transition-all"
              title="Copy URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={mobileUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* SSL Bypass Instructions Card */}
          <div className="w-full bg-[#050505] border border-neutral-800/80 rounded-xl p-3.5 text-[11px] text-neutral-300 space-y-2">
            <div className="flex items-center justify-between text-neutral-200 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
                <span className="font-semibold text-xs">One-Time SSL Acceptance</span>
              </div>
              <span className="text-[9px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded-md border border-neutral-800 font-mono">
                Port 8443
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Mobile browsers require HTTPS for camera & motion sensor APIs. On first connection, tap:
            </p>
            <div className="bg-[#0a0a0a] p-2.5 rounded-lg border border-neutral-800 space-y-1 font-mono text-[10px] text-neutral-300">
              <p>• <strong>Android Chrome:</strong> Tap "Advanced" ➔ "Proceed to {currentHost} (unsafe)"</p>
              <p>• <strong>iOS Safari:</strong> Tap "Show Details" ➔ "visit this website" ➔ "Visit Website"</p>
            </div>
            <div className="text-[10px] text-neutral-400 border-t border-neutral-800/80 pt-2 flex items-center justify-between font-mono">
              <span>💡 New certs: <code className="text-neutral-200 bg-neutral-900 px-1 py-0.5 rounded">python generate_cert.py</code></span>
              <span className="text-neutral-500">cert.pem</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800/80 bg-[#0d0d0d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
