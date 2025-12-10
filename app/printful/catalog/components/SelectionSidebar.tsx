/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
  MarketplaceKey,
  SelectionSummary,
  formatCurrency,
} from '../types';

export interface SelectionSidebarProps {
  selection: SelectionSummary;
  onClearSelection: () => void;
  onDeselectItem: (externalId: string) => void;
  onSaveSelection: () => void;
}

const MARKETPLACE_LABELS: Record<MarketplaceKey, string> = {
  amazon: 'Amazon',
  ebay: 'eBay',
  etsy: 'Etsy',
};

export const SelectionSidebar: React.FC<SelectionSidebarProps> = ({
  selection,
  onClearSelection,
  onDeselectItem,
  onSaveSelection,
}) => {
  const hasSelection = selection.totalSelected > 0;

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Selection
          </h2>
          <p className="text-xs text-slate-400">
            {selection.totalSelected} product
            {selection.totalSelected === 1 ? '' : 's'} selected
          </p>
        </div>
        <button
          type="button"
          onClick={onClearSelection}
          disabled={!hasSelection}
          className="text-xs text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline disabled:cursor-not-allowed disabled:text-slate-600"
        >
          Clear
        </button>
      </header>

      <div className="mb-3 space-y-1 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
        {(Object.keys(MARKETPLACE_LABELS) as MarketplaceKey[]).map(
          (mp) => (
            <div
              key={mp}
              className="flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {MARKETPLACE_LABELS[mp]}
              </span>
              <span className="font-mono text-[11px] text-slate-200">
                {selection.counts[mp]} ×{' '}
                {formatCurrency(selection.totals[mp] || null, 'GBP')}
              </span>
            </div>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={onSaveSelection}
        disabled={!hasSelection}
        className="mb-3 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        Save selection to Scarlette
      </button>

      <div className="flex-1 overflow-auto">
        {!hasSelection && (
          <p className="text-xs text-slate-400">
            Turn on marketplaces and set a target price on rows in
            the table. Selected products will appear here.
          </p>
        )}

        {hasSelection && (
          <div className="space-y-3">
            {selection.items.map((item) => (
              <div
                key={item.externalId}
                className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-2"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 bg-slate-900">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] text-slate-600">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-xs font-medium text-slate-100">
                      {item.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        onDeselectItem(item.externalId)
                      }
                      className="text-xs text-slate-500 hover:text-slate-200"
                      aria-label="Remove from selection"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(Object.keys(
                      MARKETPLACE_LABELS,
                    ) as MarketplaceKey[])
                      .filter((mp) => item.marketplaces[mp])
                      .map((mp) => (
                        <span
                          key={mp}
                          className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-200"
                        >
                          {MARKETPLACE_LABELS[mp]}
                        </span>
                      ))}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-300">
                    {formatCurrency(
                      item.targetPrice,
                      item.currency ?? 'GBP',
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
