// Mã QR minh họa (không mã hóa dữ liệu thật) — dùng cho prototype VietQR
export function FakeQR({ seed, size = 180 }: { seed: string; size?: number }) {
  const N = 29;
  let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  const cells: [number, number][] = [];
  const finder = (x: number, y: number) => x < 8 && y < 8 || x > N - 9 && y < 8 || x < 8 && y > N - 9;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!finder(x, y) && rnd() < 0.48) cells.push([x, y]);
  const F = ({ x, y }: { x: number; y: number }) => <g transform={`translate(${x},${y})`}><rect width={7} height={7} fill="#000" /><rect x={1} y={1} width={5} height={5} fill="#fff" /><rect x={2} y={2} width={3} height={3} fill="#000" /></g>;
  return (
    <svg width={size} height={size} viewBox={`-2 -2 ${N + 4} ${N + 4}`} role="img" aria-label="Mã VietQR thanh toán (minh họa)" style={{ background: '#fff', borderRadius: 8 }}>
      <rect x={-2} y={-2} width={N + 4} height={N + 4} fill="#fff" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill="#000" />)}
      <F x={0} y={0} /><F x={N - 7} y={0} /><F x={0} y={N - 7} />
      <rect x={N / 2 - 3} y={N / 2 - 2} width={6} height={4} rx={0.8} fill="#fff" />
      <text x={N / 2} y={N / 2 + 1} fontSize={2.4} fontWeight={700} textAnchor="middle" fill="#0f6cbd">QR</text>
    </svg>
  );
}
