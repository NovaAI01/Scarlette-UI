import { NextResponse } from 'next/server';

interface PrintfulCatalogItem {
  provider: 'printful';
  external_id: string;
  name: string;
  sku: string | null;
  currency: string | null;
  retail_price: number | string | null;
  image_url: string | null;
  tags: string[];
}

const SCARLETTE_API_BASE =
  process.env.SCARLETTE_API_BASE ??
  process.env.NEXT_PUBLIC_SCARLETTE_API_BASE ??
  'http://127.0.0.1:8100';

export async function GET(_req: Request) {
  try {
    const response = await fetch(
      `${SCARLETTE_API_BASE}/catalog/printful`,
      {
        headers: {
          Accept: 'application/json',
        },
        // Always fresh in dev; can later switch to caching if needed
        next: { revalidate: 0 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            'Failed to fetch Printful catalog from Scarlette.',
        },
        { status: response.status },
      );
    }

    const items =
      (await response.json()) as PrintfulCatalogItem[];

    return NextResponse.json({ items });
  } catch (error) {
    console.error(
      '[API] /api/printful/catalog error',
      error,
    );
    return NextResponse.json(
      {
        error:
          'Unexpected error while fetching Printful catalog.',
      },
      { status: 500 },
    );
  }
}
