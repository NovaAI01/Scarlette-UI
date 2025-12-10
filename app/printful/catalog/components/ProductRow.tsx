/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
  MarketplaceKey,
  PrintfulCatalogItem,
  RowState,
  formatCurrency,
  getBasePrice,
  parseTargetPrice,
} from '../types';

export interface ProductRowProps {
  item: PrintfulCatalogItem;
  state: RowState;
  onMarketplaceToggle: (
    externalId: string,
    marketplace: MarketplaceKey,
    value: boolean,
  ) => void;
  onTargetPriceChange: (externalId: string, value: string) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  item,
  state,
  onMarketplaceToggle,
  onTargetPriceChange,
}) => {
  const numericTarget = parseTargetPrice(state.targetPrice);
  const hasValidTarget =
    numericTarget != null && numericTarget > 0;
  const hasAnyMarketplace =
    state.marketplaces.amazon ||
    state.marketplaces.ebay ||
    state.marketplaces.etsy;
  const isSelected = hasValidTarget && hasAnyMarketplace;

  const basePrice = getBasePrice(item);
  const basePriceLabel = formatCurrency(basePrice, item.currency);

  const handleToggle =
    (marketplace: MarketplaceKey) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onMarketplaceToggle(item.external_id, marketplace, e.target.checked);
    };

  const handleTargetPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onTargetPriceChange(item.external_id, e.target.value);
  };

  const rowClassName = [
    'transition-colors',
    isSelected ? 'bg-slate-900/70' : '',
    'hover:bg-slate-900/90',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <tr className={rowClassName}>
      {/* Product */}
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-800 bg-slate-900">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-600">
                No image
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-100">
              {item.name}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </td>

      {/* Variants (placeholder for now) */}
      <td className="px-4 py-3 align-top text-xs text-slate-400">
        N/A
      </td>

      {/* Base cost */}
      <td className="px-4 py-3 align-top text-sm text-slate-100">
        {basePriceLabel}
      </td>

      {/* Amazon */}
      <td className="px-4 py-3 align-top">
        <label className="flex items-center justify-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={state.marketplaces.amazon}
            onChange={handleToggle('amazon')}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="hidden lg:inline">Amazon</span>
        </label>
      </td>

      {/* eBay */}
      <td className="px-4 py-3 align-top">
        <label className="flex items-center justify-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={state.marketplaces.ebay}
            onChange={handleToggle('ebay')}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="hidden lg:inline">eBay</span>
        </label>
      </td>

      {/* Etsy */}
      <td className="px-4 py-3 align-top">
        <label className="flex items-center justify-center gap-2 text-xs text-slate-300">
          <input
            type="checkbox"
            checked={state.marketplaces.etsy}
            onChange={handleToggle('etsy')}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="hidden lg:inline">Etsy</span>
        </label>
      </td>

      {/* Target price */}
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {item.currency ?? 'GBP'}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={state.targetPrice}
            onChange={handleTargetPriceChange}
            placeholder="0.00"
            className="w-24 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-1 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </td>
    </tr>
  );
};
