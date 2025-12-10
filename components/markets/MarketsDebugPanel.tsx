// components/markets/MarketsDebugPanel.tsx

import React from "react";

interface MarketsDebugPanelProps {
  rawResponse: unknown;
}

export const MarketsDebugPanel: React.FC<MarketsDebugPanelProps> = ({
  rawResponse,
}) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-inner shadow-black/40">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-slate-100">
          Raw response debug
        </h2>
        <span className="text-xs text-slate-500">
          Mirror of /os/markets/scan payload (for inspection and dev).
        </span>
      </div>
      <pre className="max-h-72 overflow-auto rounded-lg bg-black/40 p-3 text-[11px] leading-snug text-slate-300">
        {rawResponse ? JSON.stringify(rawResponse, null, 2) : "// no scan yet"}
      </pre>
    </section>
  );
};
