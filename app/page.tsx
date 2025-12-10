"use client";

import { useEffect, useState } from "react";

type MarginCheckItemInput = {
  cost: string;
  price: string;
};

type MarginCheckItemResult = {
  cost: number;
  price: number;
  fee_pct: number;
  extra_flat_fee: number;
  fee_amount: number;
  net_after_fees: number;
  net_margin: number;
  margin_pct: number;
};

type MarginCheckResponse = {
  items: MarginCheckItemResult[];
};

export default function ScarletteOSConsole() {
  const [backendUrl, setBackendUrl] = useState("http://127.0.0.1:8000");
  const [feePct, setFeePct] = useState("15");
  const [extraFlatFee, setExtraFlatFee] = useState("0.30");
  const [items, setItems] = useState<MarginCheckItemInput[]>([
    { cost: "5", price: "14.99" },
    { cost: "8", price: "19.99" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [healthOk, setHealthOk] = useState<null | boolean>(null);
  const [result, setResult] = useState<MarginCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick health ping so the console shows backend status.
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${backendUrl}/health`);
        setHealthOk(res.ok);
      } catch (e) {
        setHealthOk(false);
      }
    };

    checkHealth();
  }, [backendUrl]);

  const updateItem = (index: number, field: "cost" | "price", value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addRow = () => {
    setItems((prev) => [...prev, { cost: "", price: "" }]);
  };

  const removeRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const runMarginCheck = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        items: items
          .map((item) => ({
            cost: parseFloat(item.cost),
            price: parseFloat(item.price),
          }))
          .filter(
            (item) =>
              !Number.isNaN(item.cost) &&
              !Number.isNaN(item.price) &&
              item.cost >= 0 &&
              item.price > 0,
          ),
        fee_pct: parseFloat(feePct),
        extra_flat_fee: parseFloat(extraFlatFee),
      };

      if (payload.items.length === 0) {
        setError("Add at least one item with cost and price.");
        setIsRunning(false);
        return;
      }

      const res = await fetch(`${backendUrl}/os/pricing/margin-check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Backend returned ${res.status} ${res.statusText}: ${text}`,
        );
      }

      const data = (await res.json()) as MarginCheckResponse;
      setResult(data);
    } catch (e: any) {
      // Simple error surface. If this is CORS, message in devtools will say so.
      setError(e?.message ?? "Unknown error running margin check.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-sm flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
            ScarletteOS
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-100">
            Control Console
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 text-sm">
          <div>
            <div className="px-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
              System
            </div>
            <ul className="space-y-1">
              <li className="px-2 py-1.5 rounded-lg bg-slate-800/60 text-slate-50">
                Dashboard
              </li>
              <li className="px-2 py-1.5 rounded-lg text-slate-400">
                Sessions
              </li>
              <li className="px-2 py-1.5 rounded-lg text-slate-400">
                Logs
              </li>
            </ul>
          </div>

          <div>
            <div className="px-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
              OS Pipelines
            </div>
            <ul className="space-y-1">
              <li className="px-2 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-200 border border-emerald-500/40">
                Pricing OS
              </li>
              <li className="px-2 py-1.5 rounded-lg text-slate-400">
                Markets OS
              </li>
              <li className="px-2 py-1.5 rounded-lg text-slate-400">
                Listings OS
              </li>
            </ul>
          </div>

          <div>
            <div className="px-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500 mb-1">
              Config
            </div>
            <ul className="space-y-1">
              <li className="px-2 py-1.5 rounded-lg text-slate-400">
                Codex Specs
              </li>
              <li className="px-2 py-1.5 rounded-lg text-slate-400">
                Secrets &amp; Keys
              </li>
            </ul>
          </div>
        </nav>

        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500">
          v0.1 • Local Dev
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex h-6 items-center rounded-full border border-slate-700 bg-slate-900 px-2 text-[0.7rem] uppercase tracking-[0.16em] text-slate-400">
              Pricing OS • Margin Check
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Backend</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[0.7rem] ${
                  healthOk === null
                    ? "border-slate-600 text-slate-400"
                    : healthOk
                    ? "border-emerald-500/60 text-emerald-300"
                    : "border-rose-500/60 text-rose-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    healthOk === null
                      ? "bg-slate-500"
                      : healthOk
                      ? "bg-emerald-400"
                      : "bg-rose-400"
                  }`}
                />
                {healthOk === null
                  ? "Checking..."
                  : healthOk
                  ? "Online"
                  : "Offline"}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-1 text-slate-500">
              <span className="text-[0.7rem]">API:</span>
              <code className="text-[0.7rem] bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {backendUrl}
              </code>
            </div>
          </div>
        </header>

        {/* Body */}
        <section className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 p-6">
          {/* Pricing input panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-base font-semibold text-slate-50">
                  Instant Margin Check
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Send raw cost/price data to ScarletteOS and get clean
                  margins back from <code>/os/pricing/margin-check</code>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Fee % (platform)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-sm outline-none focus:border-emerald-500/70 focus:ring-0"
                  value={feePct}
                  onChange={(e) => setFeePct(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Extra flat fee (GBP)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-sm outline-none focus:border-emerald-500/70 focus:ring-0"
                  value={extraFlatFee}
                  onChange={(e) => setExtraFlatFee(e.target.value)}
                />
              </div>
              <div className="flex items-end justify-end">
                <button
                  onClick={runMarginCheck}
                  disabled={isRunning}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isRunning ? "Running…" : "Run Margin Check"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-950/80">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 border-b border-slate-800">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 border-b border-slate-800">
                      Cost (GBP)
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 border-b border-slate-800">
                      Price (GBP)
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-400 border-b border-slate-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="odd:bg-slate-950 even:bg-slate-950/60">
                      <td className="px-3 py-2 text-xs text-slate-500 align-middle">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          className="w-full rounded-md border border-slate-800 bg-slate-900/80 px-2 py-1 text-xs outline-none focus:border-emerald-500/70"
                          value={item.cost}
                          onChange={(e) =>
                            updateItem(idx, "cost", e.target.value)
                          }
                          placeholder="e.g. 5"
                        />
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <input
                          className="w-full rounded-md border border-slate-800 bg-slate-900/80 px-2 py-1 text-xs outline-none focus:border-emerald-500/70"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(idx, "price", e.target.value)
                          }
                          placeholder="e.g. 14.99"
                        />
                      </td>
                      <td className="px-3 py-2 text-right align-middle">
                        <button
                          onClick={() => removeRow(idx)}
                          className="text-[0.7rem] text-slate-500 hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} className="px-3 py-2 text-xs">
                      <button
                        onClick={addRow}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-700 px-2 py-1 text-[0.7rem] text-slate-400 hover:border-emerald-500/60 hover:text-emerald-300"
                      >
                        + Add item
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {error && (
              <div className="mt-3 rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
                {error}
              </div>
            )}
          </div>

          {/* Results panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] text-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Result snapshot
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Live view of ScarletteOS margin computation.
                </p>
              </div>
            </div>

            {!result && !error && (
              <div className="mt-4 text-xs text-slate-500">
                Run a margin check to see per-item margins and fees.
              </div>
            )}

            {result && (
              <div className="space-y-3 mt-2">
                {result.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-xs text-slate-400">
                        Item #{idx + 1}
                      </div>
                      <div className="text-xs text-emerald-300 font-medium">
                        {item.margin_pct.toFixed(2)}% margin
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-slate-300">
                      <div>
                        <div className="text-slate-500">Price</div>
                        <div>£{item.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Cost</div>
                        <div>£{item.cost.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Fees</div>
                        <div>
                          £{item.fee_amount.toFixed(2)} ({item.fee_pct}% + £
                          {item.extra_flat_fee.toFixed(2)})
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">Net margin</div>
                        <div>£{item.net_margin.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result && (
              <div className="mt-4">
                <div className="text-[0.7rem] text-slate-500 mb-1">
                  Raw JSON (debug)
                </div>
                <pre className="text-[0.65rem] leading-relaxed max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-slate-300">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
