import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request, { params }: { params: { size: string } }) {
  const unwrappedParams = await params;
  const size = parseInt(unwrappedParams.size) || 192;
  
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f5c563',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: size * 0.6, fontWeight: 800, color: '#000000', fontFamily: 'sans-serif' }}>C</span>
      </div>
    ),
    { width: size, height: size }
  );
}
