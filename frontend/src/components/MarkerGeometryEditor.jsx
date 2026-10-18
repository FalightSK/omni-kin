import React, { useEffect, useState } from 'react';

const AXES = [
  { key: 'xyz_mm', title: 'Position', labels: ['X', 'Y', 'Z'], unit: 'mm', step: '0.1' },
  { key: 'rpy_deg', title: 'Orientation', labels: ['Roll', 'Pitch', 'Yaw'], unit: '°', step: '0.5' },
];

function toDraft(value) {
  return Object.fromEntries([2, 3].map((id) => {
    const entry = value?.[String(id)] || value?.[id] || {};
    return [String(id), Object.fromEntries(AXES.map(({ key }) => [
      key,
      Array.from({ length: 3 }, (_, i) => entry[key]?.[i] ?? ''),
    ]))];
  }));
}

export default function MarkerGeometryEditor({ value, onChange, disabled = false }) {
  const [draft, setDraft] = useState(() => toDraft(value));

  useEffect(() => {
    setDraft(toDraft(value));
  }, [JSON.stringify(value)]);

  const update = (markerId, key, axis, nextValue) => {
    const next = {
      ...draft,
      [markerId]: {
        ...draft[markerId],
        [key]: draft[markerId][key].map((item, index) => index === axis ? nextValue : item),
      },
    };
    setDraft(next);
    const complete = [2, 3].every((id) => AXES.every(({ key: field }) =>
      next[String(id)][field].every((item) => item !== '' && Number.isFinite(Number(item)))
    ));
    if (complete) {
      onChange?.(Object.fromEntries([2, 3].map((id) => [String(id), Object.fromEntries(
        AXES.map(({ key: field }) => [field, next[String(id)][field].map(Number)])
      )])));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {[2, 3].map((markerId) => (
        <section key={markerId} className="rounded-xl border border-neutral-800 bg-[#050505] p-3">
          <h4 className="mb-3 text-xs font-semibold tracking-wide text-neutral-200">JAW ARUCO · ID {markerId}</h4>
          {AXES.map(({ key, title, labels, unit, step }) => (
            <div key={key} className="mb-3 last:mb-0">
              <div className="mb-1.5 text-[10px] uppercase tracking-wider text-neutral-500">{title} · {unit}</div>
              <div className="grid grid-cols-3 gap-2">
                {labels.map((label, axis) => (
                  <label key={label} className="text-[10px] text-neutral-500">
                    {label}
                    <input
                      type="number"
                      step={step}
                      value={draft[String(markerId)][key][axis]}
                      disabled={disabled}
                      onChange={(event) => update(String(markerId), key, axis, event.target.value)}
                      className="mt-1 w-full rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs font-mono text-white outline-none focus:border-neutral-500 disabled:opacity-50"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
