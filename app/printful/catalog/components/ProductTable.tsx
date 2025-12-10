import React from 'react';
import {
  CatalogRow,
  MarketplaceKey,
} from '../types';
import { ProductRow } from './ProductRow';

export interface ProductTableProps {
  rows: CatalogRow[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onMarketplaceToggle: (
    externalId: string,
    marketplace: MarketplaceKey,
    value: boolean,
  ) => void;
  onTargetPriceChange: (externalId: string, value: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  rows,
  totalCount,
  isLoading,
  error,
  onRetry,
  onMarketplaceToggle,
  onTargetPriceChange,
}) => {
  const hasAnyRows = rows.length > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
        <div>
          Showing{' '}
          <span className="text-slate-100">
            {rows.length}
          </span>{' '}
          of{' '}
          <span className="text-slate-100">
            {totalCount}
          </span>{' '}
          products
        </div>
      </div>

      <div className="relative flex-1 overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-900/95 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Product
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Variants
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Base cost
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                Amazon
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                eBay
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                Etsy
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                Target price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading &&
              Array.from({ length: 8 }).map((_, index) => (
                <tr
                  key={`skeleton-${index}`}
                  className="animate-pulse"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-md bg-slate-800" />
                      <div className="space-y-2">
                        <div className="h-3 w-40 rounded bg-slate-800" />
                        <div className="flex gap-2">
                          <div className="h-3 w-10 rounded-full bg-slate-800" />
                          <div className="h-3 w-14 rounded-full bg-slate-800" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-10 rounded bg-slate-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-3 w-16 rounded bg-slate-800" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-4 rounded bg-slate-800" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-4 rounded bg-slate-800" />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="h-4 w-4 rounded bg-slate-800" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-8 w-24 rounded bg-slate-800" />
                  </td>
                </tr>
              ))}

            {!isLoading && error && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-300"
                >
                  <div className="space-y-3">
                    <div>{error}</div>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="inline-flex items-center rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-indigo-500 hover:text-indigo-400"
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading && !error && !hasAnyRows && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-300"
                >
                  {totalCount === 0
                    ? 'No products loaded from Printful.'
                    : 'No products match your filters. Clear or adjust filters to see more items.'}
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              hasAnyRows &&
              rows.map((row) => (
                <ProductRow
                  key={row.item.external_id}
                  item={row.item}
                  state={row.state}
                  onMarketplaceToggle={onMarketplaceToggle}
                  onTargetPriceChange={onTargetPriceChange}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
