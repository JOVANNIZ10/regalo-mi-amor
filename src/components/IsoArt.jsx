/* ------------------------------------------------------------------
   Arte isometrico (2.5D).
   Cada objeto se dibuja con volumen: cara superior + dos caras
   laterales, sombra en el suelo y detalles. Proyeccion 2:1.
------------------------------------------------------------------ */

export const ISO_A = 0.66
export const ISO_B = 0.33
export const FURNITURE_SCALE = 0.85

export function isoPoint(x, y, z = 0) {
  return [(x - y) * ISO_A, (x + y) * ISO_B - z]
}

export function isoExtent(w, d, h, pad = 26) {
  return {
    width: (w + d) * ISO_A + pad * 2,
    top: h + ((w + d) * ISO_B) / 2 + pad,
    bottom: ((w + d) * ISO_B) / 2 + pad,
  }
}

function Face({ points, fill, opacity = 1 }) {
  return (
    <polygon
      points={points.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')}
      fill={fill}
      opacity={opacity}
    />
  )
}

export function IsoBox({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  top,
  left,
  right,
  opacity = 1,
}) {
  const t = [
    isoPoint(x, y, z + h),
    isoPoint(x + w, y, z + h),
    isoPoint(x + w, y + d, z + h),
    isoPoint(x, y + d, z + h),
  ]
  const b1 = isoPoint(x, y + d, z)
  const b2 = isoPoint(x + w, y + d, z)
  const b3 = isoPoint(x + w, y, z)

  return (
    <>
      <Face points={[t[3], t[2], b2, b1]} fill={left} opacity={opacity} />
      <Face points={[t[2], t[1], b3, b2]} fill={right} opacity={opacity} />
      <Face points={t} fill={top} opacity={opacity} />
    </>
  )
}

function Cyl({ x, y, z = 0, r, h, top, side, dark }) {
  const rx = r * ISO_A * 1.3
  const ry = r * ISO_B * 1.3
  const [cx, cyTop] = isoPoint(x, y, z + h)
  const cyBot = isoPoint(x, y, z)[1]

  return (
    <>
      <ellipse cx={cx} cy={cyBot} rx={rx} ry={ry} fill={dark} />
      <rect
        x={cx - rx}
        y={cyTop}
        width={rx * 2}
        height={Math.max(0, cyBot - cyTop)}
        fill={side}
      />
      <ellipse cx={cx} cy={cyTop} rx={rx} ry={ry} fill={top} />
    </>
  )
}

/* ---------- Casa ---------- */
function Sofa({ w, d, h }) {
  const seat = h * 0.55
  const arm = w * 0.12

  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={seat}
        top="#9db1d4"
        left="#6d81aa"
        right="#566a94"
      />
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={seat}
        w={w}
        d={d * 0.3}
        h={h - seat}
        top="#8ba0c9"
        left="#5d719b"
        right="#4b5f88"
      />
      <IsoBox
        x={-w / 2}
        y={-d / 2 + d * 0.3}
        z={seat}
        w={arm}
        d={d * 0.7}
        h={h - seat - 6}
        top="#8ba0c9"
        left="#5d719b"
        right="#4b5f88"
      />
      <IsoBox
        x={w / 2 - arm}
        y={-d / 2 + d * 0.3}
        z={seat}
        w={arm}
        d={d * 0.7}
        h={h - seat - 6}
        top="#8ba0c9"
        left="#5d719b"
        right="#4b5f88"
      />
      <IsoBox
        x={-w / 2 + arm + 4}
        y={-d / 2 + d * 0.34}
        z={seat}
        w={(w - arm * 2 - 12) / 2}
        d={d * 0.62}
        h={10}
        top="#adc0e0"
        left="#7d91ba"
        right="#6579a3"
      />
      <IsoBox
        x={2}
        y={-d / 2 + d * 0.34}
        z={seat}
        w={(w - arm * 2 - 12) / 2}
        d={d * 0.62}
        h={10}
        top="#adc0e0"
        left="#7d91ba"
        right="#6579a3"
      />
    </>
  )
}

function Plant({ w, d }) {
  const r = Math.min(w, d) * 0.34
  return (
    <>
      <Cyl
        x={0}
        y={0}
        z={0}
        r={r}
        h={26}
        top="#c47a5b"
        side="#a9573c"
        dark="#8e4a34"
      />
      <ellipse cx={0} cy={-34} rx={r * 1.5} ry={r * 1.2} fill="#3f7a4f" />
      <ellipse cx={-r * 0.7} cy={-44} rx={r * 1.1} ry={r * 0.9} fill="#4f915f" />
      <ellipse cx={r * 0.8} cy={-40} rx={r * 1.05} ry={r * 0.85} fill="#5da36a" />
      <ellipse cx={0} cy={-54} rx={r * 1.05} ry={r * 0.85} fill="#63ab70" />
      <ellipse cx={-r * 0.2} cy={-48} rx={r * 0.5} ry={r * 0.4} fill="#7fc08c" opacity="0.7" />
    </>
  )
}

function Fridge({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#f2f6f9"
        left="#c2ccd5"
        right="#a4b0ba"
      />
      <IsoBox
        x={w / 2 - 6}
        y={-d / 2 + d * 0.25}
        z={h * 0.52}
        w={5}
        d={d * 0.5}
        h={5}
        top="#8b98a4"
        left="#727f8b"
        right="#5f6b76"
      />
      <IsoBox
        x={w / 2 - 5}
        y={-d / 2 + d * 0.18}
        z={h * 0.78}
        w={4}
        d={d * 0.64}
        h={3}
        top="#8b98a4"
        left="#727f8b"
        right="#5f6b76"
      />
      <IsoBox
        x={w / 2 - 2}
        y={-d / 2 + 2}
        z={h * 0.02}
        w={2}
        d={d - 4}
        h={h * 0.48}
        top="#dbe3ea"
        left="#b6c1ca"
        right="#98a5af"
        opacity="0.85"
      />
    </>
  )
}

function Stove({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#d5dde4"
        left="#9aa7b3"
        right="#7c8893"
      />
      {[
        [-w * 0.18, -d * 0.18],
        [w * 0.18, -d * 0.18],
        [-w * 0.18, d * 0.18],
        [w * 0.18, d * 0.18],
      ].map(([bx, by], i) => {
        const [cx, cy] = isoPoint(bx, by, h + 1)
        return (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={w * 0.1} ry={w * 0.05} fill="#3a424b" />
            <ellipse cx={cx} cy={cy} rx={w * 0.06} ry={w * 0.03} fill="#6b7680" />
          </g>
        )
      })}
      <IsoBox
        x={-w / 2 + 6}
        y={d / 2 - 4}
        z={h * 0.3}
        w={w - 12}
        d={4}
        h={h * 0.5}
        top="#b7c1c9"
        left="#8b98a4"
        right="#75828d"
      />
    </>
  )
}

function Bathtub({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#f7fbfd"
        left="#cdd7de"
        right="#b0bcc5"
      />
      <polygon
        points={[
          isoPoint(-w * 0.38, -d * 0.3, h + 1),
          isoPoint(w * 0.32, -d * 0.3, h + 1),
          isoPoint(w * 0.32, d * 0.3, h + 1),
          isoPoint(-w * 0.38, d * 0.3, h + 1),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#8fd0e8"
      />
      <polygon
        points={[
          isoPoint(-w * 0.34, -d * 0.24, h + 1),
          isoPoint(w * 0.2, -d * 0.24, h + 1),
          isoPoint(w * 0.2, d * 0.24, h + 1),
          isoPoint(-w * 0.34, d * 0.24, h + 1),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#a9dcee"
        opacity="0.7"
      />
      <Cyl
        x={w * 0.4}
        y={0}
        z={h}
        r={8}
        h={14}
        top="#e8eef3"
        side="#c2ccd5"
        dark="#a4b0ba"
      />
    </>
  )
}

function Shelf({ w, d, h }) {
  const bookColors = ['#c05a5a', '#d9b25f', '#5d8fc0', '#8a5f9e', '#4f915f']
  const rows = [0.1, 0.42, 0.74]
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#7a5233"
        left="#5a3a22"
        right="#452a16"
      />
      {rows.map((row, r) => (
        <IsoBox
          key={r}
          x={-w / 2 + 6}
          y={d / 2 - 6}
          z={h * row}
          w={w - 12}
          d={6}
          h={4}
          top="#a87646"
          left="#7a5233"
          right="#5a3a22"
        />
      ))}
      {Array.from({ length: 9 }).map((_, i) => {
        const row = i % 3
        const col = Math.floor(i / 3)
        return (
          <IsoBox
            key={i}
            x={-w / 2 + 10 + col * (w / 3.4)}
            y={d / 2 - 10}
            z={h * rows[row] + 4}
            w={w / 5.5}
            d={6}
            h={h * 0.2}
            top={bookColors[(i + 2) % bookColors.length]}
            left={bookColors[i % bookColors.length]}
            right={bookColors[(i + 1) % bookColors.length]}
          />
        )
      })}
    </>
  )
}

function Table({ w, d, h }) {
  const leg = 10
  return (
    <>
      {[
        [-w / 2 + 6, -d / 2 + 6],
        [w / 2 - leg - 6, -d / 2 + 6],
        [-w / 2 + 6, d / 2 - leg - 6],
        [w / 2 - leg - 6, d / 2 - leg - 6],
      ].map(([lx, ly], i) => (
        <IsoBox
          key={i}
          x={lx}
          y={ly}
          z={0}
          w={leg}
          d={leg}
          h={h - 12}
          top="#6b4526"
          left="#4a2f1a"
          right="#3a2413"
        />
      ))}
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={h - 10}
        w={w}
        d={d}
        h={10}
        top="#a87646"
        left="#7a5233"
        right="#5f3d20"
      />
      <IsoBox
        x={-w * 0.2}
        y={-d * 0.18}
        z={h}
        w={w * 0.22}
        d={d * 0.3}
        h={4}
        top="#d9b25f"
        left="#b8933f"
        right="#9a7830"
      />
    </>
  )
}

function Wardrobe({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#8a5f3a"
        left="#6b4526"
        right="#4f321a"
      />
      <IsoBox
        x={-w / 2 + 4}
        y={d / 2 - 4}
        z={4}
        w={w - 8}
        d={4}
        h={h - 8}
        top="#7d5333"
        left="#5a3a22"
        right="#452a16"
      />
      <IsoBox
        x={-w / 2 + w * 0.46}
        y={d / 2 - 2}
        z={6}
        w={4}
        d={2}
        h={h - 12}
        top="#3a2413"
        left="#3a2413"
        right="#3a2413"
      />
      <circle
        cx={isoPoint(-w * 0.08, d / 2, h * 0.55)[0]}
        cy={isoPoint(-w * 0.08, d / 2, h * 0.55)[1]}
        r={4}
        fill="#d9b25f"
      />
      <circle
        cx={isoPoint(w * 0.08, d / 2, h * 0.55)[0]}
        cy={isoPoint(w * 0.08, d / 2, h * 0.55)[1]}
        r={4}
        fill="#d9b25f"
      />
    </>
  )
}

/* ---------- Jardin ---------- */
function Fountain({ w, d, h }) {
  const r = Math.min(w, d) * 0.46
  return (
    <>
      <Cyl
        x={0}
        y={0}
        z={0}
        r={r}
        h={h * 0.5}
        top="#d6cfbe"
        side="#b3ab99"
        dark="#918a79"
      />
      <Cyl
        x={0}
        y={0}
        z={h * 0.5}
        r={r * 0.82}
        h={4}
        top="#6fb3d0"
        side="#5d9cb8"
        dark="#4a849e"
      />
      <Cyl
        x={0}
        y={0}
        z={h * 0.5}
        r={r * 0.24}
        h={h * 0.42}
        top="#e3dccb"
        side="#c4bcaa"
        dark="#a49b88"
      />
      <path
        d={`M 0 ${-h * 0.92} C -${r * 0.3} ${-h * 1.05} -${r * 0.1} ${-h * 1.15} 0 ${-h * 1.25}`}
        stroke="#d7ecf4"
        strokeWidth="4"
        fill="none"
        opacity="0.9"
      />
      <path
        d={`M -4 ${-h * 0.95} C -${r * 0.5} ${-h * 0.85} -${r * 0.55} ${-h * 0.7} -${r * 0.4} ${-h * 0.6}`}
        stroke="#d7ecf4"
        strokeWidth="3"
        fill="none"
        opacity="0.75"
      />
    </>
  )
}

function Greenhouse({ w, d, h }) {
  const base = 18
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={base}
        top="#9aa7b3"
        left="#7c8893"
        right="#66727d"
      />
      <ellipse
        cx={-w * 0.2}
        cy={-h * 0.32}
        rx={w * 0.1}
        ry={h * 0.16}
        fill="#4f915f"
      />
      <ellipse
        cx={w * 0.16}
        cy={-h * 0.26}
        rx={w * 0.11}
        ry={h * 0.14}
        fill="#3f7a4f"
      />
      <IsoBox
        x={-w / 2 + 4}
        y={-d / 2 + 4}
        z={base}
        w={w - 8}
        d={d - 8}
        h={h - base}
        top="#cfe8f2"
        left="#a9d3e4"
        right="#8fc0d5"
        opacity="0.28"
      />
      <IsoBox
        x={-w / 2 + 4}
        y={-d / 2 + 4}
        z={h - 4}
        w={w - 8}
        d={d - 8}
        h={4}
        top="#ffffff"
        left="#e8f4f8"
        right="#d6e9f0"
        opacity="0.85"
      />
      <IsoBox
        x={-4}
        y={-d / 2 + 4}
        z={base}
        w={8}
        d={d - 8}
        h={h - base}
        top="#ffffff"
        left="#e8f4f8"
        right="#d6e9f0"
        opacity="0.9"
      />
      <IsoBox
        x={-w / 2 + 4}
        y={-4}
        z={base}
        w={w - 8}
        d={8}
        h={h - base}
        top="#ffffff"
        left="#e8f4f8"
        right="#d6e9f0"
        opacity="0.9"
      />
    </>
  )
}

function Shed({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#a87646"
        left="#7a5233"
        right="#5f3d20"
      />
      <IsoBox
        x={-w / 2 - 8}
        y={-d / 2 - 8}
        z={h}
        w={w + 16}
        d={d + 16}
        h={16}
        top="#c08a55"
        left="#8a5f3a"
        right="#6b4526"
      />
      <IsoBox
        x={-w / 2 - 2}
        y={-2}
        z={h + 16}
        w={w + 4}
        d={4}
        h={10}
        top="#d9b58a"
        left="#a87646"
        right="#8a5f3a"
      />
      <IsoBox
        x={-w * 0.2}
        y={d / 2 - 4}
        z={6}
        w={w * 0.4}
        d={4}
        h={h * 0.62}
        top="#4a2f1a"
        left="#3a2413"
        right="#2a1a0d"
      />
    </>
  )
}

function Bench({ w, d, h }) {
  const seat = h * 0.55
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={seat - 8}
        w={w}
        d={d}
        h={8}
        top="#a87646"
        left="#7a5233"
        right="#5f3d20"
      />
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={seat}
        w={w}
        d={d * 0.24}
        h={h - seat}
        top="#b98a55"
        left="#8a5f3a"
        right="#6b4526"
      />
      {[-w * 0.34, w * 0.34].map((lx, i) => (
        <IsoBox
          key={i}
          x={lx - 5}
          y={-d * 0.2}
          z={0}
          w={10}
          d={d * 0.5}
          h={seat - 8}
          top="#4a2f1a"
          left="#3a2413"
          right="#2a1a0d"
        />
      ))}
    </>
  )
}

function Flowerbed({ w, d, h }) {
  const colors = ['#e8a2c0', '#ffd479', '#c05a5a', '#8a5f9e', '#f2f0e6']
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#5a3a22"
        left="#4a2f1a"
        right="#3a2413"
      />
      {Array.from({ length: 10 }).map((_, i) => {
        const fx = -w / 2 + 16 + (i % 5) * (w / 5.6)
        const fy = -d / 4 + Math.floor(i / 5) * (d / 2.6)
        const [cx, cy] = isoPoint(fx, fy, h + 6)
        return (
          <g key={i}>
            <circle cx={cx} cy={cy + 4} r={7} fill="#3f7a4f" />
            <circle cx={cx} cy={cy} r={5} fill={colors[i % colors.length]} />
          </g>
        )
      })}
    </>
  )
}

export function IsoTree({ w }) {
  const r = w * 0.3
  return (
    <>
      <Cyl
        x={0}
        y={0}
        z={0}
        r={w * 0.07}
        h={w * 0.42}
        top="#8a5f3a"
        side="#6b4526"
        dark="#4a2f1a"
      />
      <ellipse cx={0} cy={-w * 0.46} rx={r * 1.5} ry={r * 1.2} fill="#24503a" />
      <ellipse cx={-r * 0.6} cy={-w * 0.56} rx={r * 1.15} ry={r * 0.95} fill="#357045" />
      <ellipse cx={r * 0.7} cy={-w * 0.54} rx={r * 1.1} ry={r * 0.9} fill="#3f7a4f" />
      <ellipse cx={0} cy={-w * 0.66} rx={r * 1.05} ry={r * 0.85} fill="#4f915f" />
      <ellipse cx={-r * 0.2} cy={-w * 0.6} rx={r * 0.5} ry={r * 0.4} fill="#63ab70" opacity="0.7" />
    </>
  )
}

function Well({ w, d, h }) {
  const r = Math.min(w, d) * 0.4
  return (
    <>
      <Cyl
        x={0}
        y={0}
        z={0}
        r={r}
        h={h * 0.55}
        top="#b9b2a2"
        side="#948d7d"
        dark="#77705f"
      />
      <Cyl
        x={0}
        y={0}
        z={h * 0.55}
        r={r * 0.72}
        h={3}
        top="#3a3a44"
        side="#2a2a34"
        dark="#1e1e28"
      />
      {[-r * 0.7, r * 0.7].map((px, i) => (
        <IsoBox
          key={i}
          x={px - 5}
          y={-6}
          z={h * 0.55}
          w={10}
          d={12}
          h={h * 0.45}
          top="#8a5f3a"
          left="#6b4526"
          right="#4a2f1a"
        />
      ))}
      <IsoBox
        x={-r * 1.05}
        y={-r * 0.55}
        z={h}
        w={r * 2.1}
        d={r * 1.1}
        h={8}
        top="#c08a55"
        left="#8a5f3a"
        right="#6b4526"
      />
    </>
  )
}

function Statue({ w, d, h }) {
  const base = h * 0.32
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={base}
        top="#b9b2a2"
        left="#948d7d"
        right="#77705f"
      />
      <ellipse
        cx={0}
        cy={-base - h * 0.18}
        rx={w * 0.22}
        ry={h * 0.16}
        fill="#cfc9ba"
      />
      <circle cx={0} cy={-base - h * 0.4} r={w * 0.12} fill="#d8d2c4" />
      <polygon
        points={[
          isoPoint(w * 0.1, 0, base + h * 0.4),
          isoPoint(w * 0.24, 0, base + h * 0.36),
          isoPoint(w * 0.1, 0, base + h * 0.34),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#c9a86a"
      />
    </>
  )
}

/* ---------- Calabozo ---------- */
function Safe({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#b9c0c7"
        left="#7e8790"
        right="#5f6871"
      />
      <IsoBox
        x={-w * 0.36}
        y={d / 2 - 5}
        z={h * 0.1}
        w={w * 0.72}
        d={5}
        h={h * 0.8}
        top="#4a5158"
        left="#3a4046"
        right="#2d3237"
      />
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const [cx, cy] = isoPoint(
            -w * 0.12 + col * w * 0.12,
            d / 2 + 2,
            h * 0.62 - row * h * 0.14
          )
          return (
            <circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r={3.2}
              fill="#cfd8e0"
            />
          )
        })
      )}
      <circle
        cx={isoPoint(w * 0.28, d / 2 + 2, h * 0.46)[0]}
        cy={isoPoint(w * 0.28, d / 2 + 2, h * 0.46)[1]}
        r={5}
        fill="#d9b25f"
      />
    </>
  )
}

function Paper({ w, d }) {
  const lines = [-0.28, -0.1, 0.08, 0.24]
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={2}
        top="#f4f0e6"
        left="#d8d0bf"
        right="#c3baa8"
      />
      {lines.map((t, i) => {
        const a = isoPoint(-w * 0.3, d * t + 2, 3)
        const b = isoPoint(w * (i === lines.length - 1 ? 0.05 : 0.3), d * t + 2, 3)
        return (
          <line
            key={i}
            x1={a[0]}
            y1={a[1]}
            x2={b[0]}
            y2={b[1]}
            stroke="#8b8172"
            strokeWidth="2"
            opacity="0.7"
          />
        )
      })}
      <circle
        cx={isoPoint(w * 0.22, d * 0.28, 3)[0]}
        cy={isoPoint(w * 0.22, d * 0.28, 3)[1]}
        r={5}
        fill="#c05a5a"
        opacity="0.8"
      />
    </>
  )
}

function Bed({ w, d, h }) {
  const frame = 10
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={frame}
        top="#8a5f3a"
        left="#6b4526"
        right="#4f321a"
      />
      <IsoBox
        x={-w / 2 + 6}
        y={-d / 2 + 6}
        z={frame}
        w={w - 12}
        d={d - 12}
        h={h * 0.42}
        top="#f2f0ea"
        left="#d8d4cb"
        right="#bdb8ae"
      />
      <IsoBox
        x={-w / 2 + 10}
        y={-d / 2 + 10}
        z={frame + h * 0.42}
        w={w * 0.34}
        d={d - 20}
        h={h * 0.2}
        top="#ffffff"
        left="#e8e5de"
        right="#d0ccc3"
      />
      <IsoBox
        x={-w / 2 + w * 0.42}
        y={-d / 2 + 6}
        z={frame + h * 0.4}
        w={w * 0.52}
        d={d - 12}
        h={h * 0.16}
        top="#b8524f"
        left="#95433f"
        right="#7a3633"
      />
      <IsoBox
        x={w / 2 - 12}
        y={-d / 2}
        z={0}
        w={12}
        d={d}
        h={h * 0.9}
        top="#6b4526"
        left="#4f321a"
        right="#3a2413"
      />
    </>
  )
}

/* ---------- Bosque ---------- */
function Log({ w, d, h }) {
  const r = d / 2
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#a87646"
        left="#7a5233"
        right="#5f3d20"
      />
      {[-w / 2 + 8, 0, w / 2 - 8].map((lx, i) => (
        <IsoBox
          key={i}
          x={lx - 3}
          y={-d / 2}
          z={h * 0.15}
          w={6}
          d={d}
          h={h * 0.8}
          top="#8a5f3a"
          left="#6b4526"
          right="#4a2f1a"
          opacity="0.55"
        />
      ))}
      <ellipse cx={w / 2 - 2} cy={-h * 0.5} rx={r * 0.5} ry={h * 0.42} fill="#c9a86a" />
      <ellipse
        cx={w / 2 - 2}
        cy={-h * 0.5}
        rx={r * 0.28}
        ry={h * 0.26}
        fill="none"
        stroke="#8a5f3a"
        strokeWidth="2"
      />
    </>
  )
}

function Tent({ w, d, h }) {
  const ridge = [-w / 2, 0, h]
  const ridge2 = [w / 2, 0, h]
  return (
    <>
      <polygon
        points={[
          isoPoint(...ridge),
          isoPoint(...ridge2),
          isoPoint(w / 2, -d / 2, 0),
          isoPoint(-w / 2, -d / 2, 0),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#8f3a38"
      />
      <polygon
        points={[
          isoPoint(...ridge),
          isoPoint(...ridge2),
          isoPoint(w / 2, d / 2, 0),
          isoPoint(-w / 2, d / 2, 0),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#b8524f"
      />
      <polygon
        points={[
          isoPoint(w / 2, -d / 2, 0),
          isoPoint(w / 2, d / 2, 0),
          isoPoint(w / 2, 0, h),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#a14542"
      />
      <polygon
        points={[
          isoPoint(w / 2, d * 0.16, 0),
          isoPoint(w / 2, d * 0.42, 0),
          isoPoint(w / 2, 0, h * 0.62),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#5e2322"
      />
      <line
        x1={isoPoint(...ridge)[0]}
        y1={isoPoint(...ridge)[1]}
        x2={isoPoint(...ridge2)[0]}
        y2={isoPoint(...ridge2)[1]}
        stroke="#d97a6a"
        strokeWidth="3"
      />
    </>
  )
}

function Campfire({ w, d, h }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const [cx, cy] = isoPoint(Math.cos(a) * w * 0.42, Math.sin(a) * d * 0.42, 0)
        return (
          <ellipse key={i} cx={cx} cy={cy} rx={w * 0.08} ry={d * 0.05} fill="#9aa7b3" />
        )
      })}
      <IsoBox
        x={-w * 0.22}
        y={-d * 0.06}
        z={0}
        w={w * 0.44}
        d={d * 0.12}
        h={10}
        top="#8a5f3a"
        left="#5f3d20"
        right="#4a2f1a"
      />
      <IsoBox
        x={-w * 0.06}
        y={-d * 0.24}
        z={0}
        w={w * 0.12}
        d={d * 0.48}
        h={10}
        top="#7a5233"
        left="#5a3a22"
        right="#452a16"
      />
      <path
        d={`M 0 ${-h * 0.1} C -${w * 0.14} ${-h * 0.5} -${w * 0.04} ${-h * 0.8} 0 ${-h}
            C ${w * 0.06} ${-h * 0.7} ${w * 0.14} ${-h * 0.4} 0 ${-h * 0.1} Z`}
        fill="#ff9a3c"
      />
      <path
        d={`M 0 ${-h * 0.18} C -${w * 0.06} ${-h * 0.44} -${w * 0.02} ${-h * 0.6} 0 ${-h * 0.72}
            C ${w * 0.04} ${-h * 0.55} ${w * 0.06} ${-h * 0.36} 0 ${-h * 0.18} Z`}
        fill="#ffe6a3"
      />
    </>
  )
}

function Rock({ w, d, h }) {
  return (
    <>
      <ellipse cx={-w * 0.16} cy={-h * 0.34} rx={w * 0.3} ry={h * 0.4} fill="#7c8792" />
      <ellipse cx={w * 0.2} cy={-h * 0.3} rx={w * 0.26} ry={h * 0.34} fill="#8d99a5" />
      <ellipse cx={0} cy={-h * 0.5} rx={w * 0.28} ry={h * 0.36} fill="#9aa7b3" />
      <ellipse cx={-w * 0.06} cy={-h * 0.58} rx={w * 0.16} ry={h * 0.2} fill="#b3bdc7" opacity="0.7" />
    </>
  )
}

function Cart({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={h * 0.35}
        w={w}
        d={d}
        h={h * 0.45}
        top="#a87646"
        left="#7a5233"
        right="#5f3d20"
      />
      {[-w * 0.24, w * 0.24].map((lx, i) => (
        <ellipse
          key={i}
          cx={isoPoint(lx, d * 0.52, h * 0.3)[0]}
          cy={isoPoint(lx, d * 0.52, h * 0.3)[1]}
          rx={w * 0.13}
          ry={h * 0.22}
          fill="#4a2f1a"
        />
      ))}
      {[-w * 0.24, w * 0.24].map((lx, i) => (
        <ellipse
          key={`i${i}`}
          cx={isoPoint(lx, d * 0.52, h * 0.3)[0]}
          cy={isoPoint(lx, d * 0.52, h * 0.3)[1]}
          rx={w * 0.06}
          ry={h * 0.1}
          fill="#8a5f3a"
        />
      ))}
      <IsoBox
        x={-w / 2 - w * 0.3}
        y={-4}
        z={h * 0.35}
        w={w * 0.34}
        d={8}
        h={8}
        top="#8a5f3a"
        left="#6b4526"
        right="#4a2f1a"
      />
    </>
  )
}

function Stump({ w, d, h }) {
  return (
    <>
      <Cyl
        x={0}
        y={0}
        z={0}
        r={Math.min(w, d) * 0.42}
        h={h}
        top="#c9a86a"
        side="#8a5f3a"
        dark="#6b4526"
      />
      <ellipse
        cx={0}
        cy={-h}
        rx={Math.min(w, d) * 0.42 * ISO_A * 0.6}
        ry={Math.min(w, d) * 0.42 * ISO_B * 0.6}
        fill="none"
        stroke="#a8843f"
        strokeWidth="2"
      />
      <ellipse
        cx={0}
        cy={-h}
        rx={Math.min(w, d) * 0.42 * ISO_A * 0.3}
        ry={Math.min(w, d) * 0.42 * ISO_B * 0.3}
        fill="none"
        stroke="#a8843f"
        strokeWidth="2"
      />
    </>
  )
}

function Signpost({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-6}
        y={-6}
        z={0}
        w={12}
        d={12}
        h={h}
        top="#8a5f3a"
        left="#6b4526"
        right="#4a2f1a"
      />
      <IsoBox
        x={-w / 2}
        y={-6}
        z={h * 0.6}
        w={w}
        d={12}
        h={h * 0.28}
        top="#c08a55"
        left="#8a5f3a"
        right="#6b4526"
      />
      <IsoBox
        x={-w * 0.36}
        y={6}
        z={h * 0.66}
        w={w * 0.72}
        d={2}
        h={h * 0.1}
        top="#e8dcc8"
        left="#d4c5a8"
        right="#b9a98c"
      />
    </>
  )
}

/* ---------- Calabozo ---------- */
function Barrel({ w, d, h }) {
  const r = Math.min(w, d) * 0.4
  return (
    <>
      <Cyl x={0} y={0} z={0} r={r} h={h} top="#a87646" side="#8a5f3a" dark="#6b4526" />
      {[0.22, 0.72].map((t, i) => (
        <Cyl
          key={i}
          x={0}
          y={0}
          z={h * t}
          r={r * 1.03}
          h={5}
          top="#6b7078"
          side="#565b62"
          dark="#44484e"
        />
      ))}
      {[-0.55, 0, 0.55].map((t, i) => {
        const [cx, cy] = isoPoint(0, 0, h * 0.5)
        return (
          <line
            key={i}
            x1={cx + t * r * 1.2}
            y1={cy - h * 0.42}
            x2={cx + t * r * 1.2}
            y2={cy + h * 0.42}
            stroke="#6b4526"
            strokeWidth="2"
            opacity="0.6"
          />
        )
      })}
    </>
  )
}

function Chest({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h * 0.62}
        top="#8a5f3a"
        left="#6b4526"
        right="#4f321a"
      />
      <IsoBox
        x={-w / 2 - 2}
        y={-d / 2 - 2}
        z={h * 0.62}
        w={w + 4}
        d={d + 4}
        h={h * 0.2}
        top="#a87646"
        left="#7a5233"
        right="#5f3d20"
      />
      {[-w * 0.28, w * 0.28].map((bx, i) => (
        <IsoBox
          key={i}
          x={bx - 5}
          y={-d / 2}
          z={0}
          w={10}
          d={d + 2}
          h={h * 0.84}
          top="#c9a86a"
          left="#b8933f"
          right="#9a7830"
        />
      ))}
      <IsoBox
        x={-9}
        y={d / 2 - 2}
        z={h * 0.52}
        w={18}
        d={3}
        h={h * 0.22}
        top="#d9b25f"
        left="#b8933f"
        right="#9a7830"
      />
    </>
  )
}

function Torch({ w, d, h }) {
  const [cx, cy] = isoPoint(0, 0, h * 0.42)
  return (
    <>
      <circle cx={cx} cy={cy} r={h * 0.5} fill="#ffd27a" opacity="0.18" />
      <IsoBox
        x={-8}
        y={-8}
        z={0}
        w={16}
        d={16}
        h={h * 0.42}
        top="#6b4526"
        left="#4a2f1a"
        right="#3a2413"
      />
      <path
        d={`M ${cx} ${cy - h * 0.16} C ${cx - w * 0.16} ${cy - h * 0.44} ${cx - w * 0.04} ${cy - h * 0.62} ${cx} ${cy - h * 0.72}
            C ${cx + w * 0.06} ${cy - h * 0.55} ${cx + w * 0.16} ${cy - h * 0.34} ${cx} ${cy - h * 0.16} Z`}
        fill="#ff9a3c"
      />
      <path
        d={`M ${cx} ${cy - h * 0.24} C ${cx - w * 0.05} ${cy - h * 0.4} ${cx} ${cy - h * 0.48} ${cx} ${cy - h * 0.54}
            C ${cx + w * 0.04} ${cy - h * 0.42} ${cx + w * 0.06} ${cy - h * 0.32} ${cx} ${cy - h * 0.24} Z`}
        fill="#ffe6a3"
      />
    </>
  )
}

function Skull({ w, d, h }) {
  return (
    <>
      <ellipse cx={0} cy={-h * 0.42} rx={w * 0.3} ry={h * 0.42} fill="#e8e3d6" />
      <ellipse cx={-w * 0.08} cy={-h * 0.5} rx={w * 0.12} ry={h * 0.14} fill="#2a2620" />
      <ellipse cx={w * 0.1} cy={-h * 0.5} rx={w * 0.12} ry={h * 0.14} fill="#2a2620" />
      <ellipse cx={0} cy={-h * 0.28} rx={w * 0.09} ry={h * 0.08} fill="#2a2620" />
      <polygon
        points={[
          isoPoint(-w * 0.16, 0, h * 0.2),
          isoPoint(w * 0.16, 0, h * 0.2),
          isoPoint(w * 0.12, 0, h * 0.02),
          isoPoint(-w * 0.12, 0, h * 0.02),
        ]
          .map((p) => `${p[0]},${p[1]}`)
          .join(' ')}
        fill="#d8d2c4"
      />
      <line
        x1={isoPoint(-w * 0.04, 0, h * 0.16)[0]}
        y1={isoPoint(-w * 0.04, 0, h * 0.16)[1]}
        x2={isoPoint(-w * 0.04, 0, h * 0.04)[0]}
        y2={isoPoint(-w * 0.04, 0, h * 0.04)[1]}
        stroke="#b8b2a2"
        strokeWidth="2"
      />
      <line
        x1={isoPoint(w * 0.04, 0, h * 0.16)[0]}
        y1={isoPoint(w * 0.04, 0, h * 0.16)[1]}
        x2={isoPoint(w * 0.04, 0, h * 0.04)[0]}
        y2={isoPoint(w * 0.04, 0, h * 0.04)[1]}
        stroke="#b8b2a2"
        strokeWidth="2"
      />
    </>
  )
}

function Straw({ w, d, h }) {
  return (
    <>
      <ellipse cx={0} cy={-h * 0.24} rx={w * 0.44} ry={d * 0.36} fill="#b8944a" />
      <ellipse cx={0} cy={-h * 0.4} rx={w * 0.38} ry={d * 0.3} fill="#c9a55a" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        const x = Math.cos(a) * w * 0.3
        const y = Math.sin(a) * d * 0.24
        return (
          <line
            key={i}
            x1={isoPoint(x, y, h * 0.3)[0]}
            y1={isoPoint(x, y, h * 0.3)[1]}
            x2={isoPoint(x * 1.5, y * 1.4, h * 0.02)[0]}
            y2={isoPoint(x * 1.5, y * 1.4, h * 0.02)[1]}
            stroke="#a8843f"
            strokeWidth="2"
            opacity="0.8"
          />
        )
      })}
    </>
  )
}

function Chains({ w, d, h }) {
  const [cx, cy] = isoPoint(0, 0, h * 0.9)
  return (
    <>
      <IsoBox
        x={-w * 0.4}
        y={-d * 0.4}
        z={0}
        w={w * 0.8}
        d={d * 0.8}
        h={h * 0.55}
        top="#5c5c66"
        left="#44444f"
        right="#33333c"
      />
      {[0.2, 0.36, 0.52].map((t, i) => (
        <ellipse
          key={i}
          cx={cx + (i % 2 === 0 ? 0 : w * 0.05)}
          cy={cy + h * t * 0.3}
          rx={w * 0.06}
          ry={h * 0.05}
          fill="none"
          stroke="#9aa7b3"
          strokeWidth="4"
        />
      ))}
      <circle cx={cx} cy={cy + h * 0.18} r={w * 0.11} fill="#d9b25f" />
      <circle
        cx={cx}
        cy={cy + h * 0.18}
        r={w * 0.055}
        fill="none"
        stroke="#9a7830"
        strokeWidth="2"
      />
    </>
  )
}

function Cage({ w, d, h }) {
  const bars = 5
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={12}
        top="#6b7078"
        left="#565b62"
        right="#44484e"
      />
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={h - 12}
        w={w}
        d={d}
        h={12}
        top="#8d99a5"
        left="#6b7078"
        right="#565b62"
      />
      {[
        [-w / 2, -d / 2],
        [w / 2 - 8, -d / 2],
        [-w / 2, d / 2 - 8],
        [w / 2 - 8, d / 2 - 8],
      ].map(([px, py], i) => (
        <IsoBox
          key={`post${i}`}
          x={px}
          y={py}
          z={12}
          w={8}
          d={8}
          h={h - 24}
          top="#8d99a5"
          left="#6b7078"
          right="#565b62"
        />
      ))}
      {Array.from({ length: bars }).map((_, i) => {
        const bx = -w / 2 + ((i + 1) / (bars + 1)) * w
        return (
          <IsoBox
            key={i}
            x={bx - 3}
            y={d / 2 - 8}
            z={12}
            w={6}
            d={6}
            h={h - 24}
            top="#cfd8e0"
            left="#9aa7b3"
            right="#7c8792"
          />
        )
      })}
      {Array.from({ length: bars }).map((_, i) => {
        const by = -d / 2 + ((i + 1) / (bars + 1)) * d
        return (
          <IsoBox
            key={`s${i}`}
            x={w / 2 - 8}
            y={by - 3}
            z={12}
            w={6}
            d={6}
            h={h - 24}
            top="#cfd8e0"
            left="#9aa7b3"
            right="#7c8792"
          />
        )
      })}
    </>
  )
}

function DoorArt({ w, d, h }) {
  return (
    <>
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={h}
        top="#6b4526"
        left="#8a5f3a"
        right="#5a3a22"
      />
      <IsoBox
        x={-w / 2 + 6}
        y={d / 2 - 4}
        z={6}
        w={w - 12}
        d={4}
        h={h - 12}
        top="#7a5233"
        left="#5f3d20"
        right="#4a2f1a"
      />
      <circle
        cx={isoPoint(w * 0.32, d / 2 + 1, h * 0.5)[0]}
        cy={isoPoint(w * 0.32, d / 2 + 1, h * 0.5)[1]}
        r={5}
        fill="#e8c56b"
      />
    </>
  )
}

function GateArt({ w, d, h }) {
  return (
    <>
      {[-w * 0.42, -w * 0.14, w * 0.14, w * 0.42].map((bx, i) => (
        <IsoBox
          key={i}
          x={bx - 4}
          y={-d / 2}
          z={0}
          w={8}
          d={d}
          h={h}
          top="#cfd8e0"
          left="#9aa7b3"
          right="#7c8792"
        />
      ))}
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={h * 0.8}
        w={w}
        d={d}
        h={8}
        top="#7c8792"
        left="#5f6a75"
        right="#4c565f"
      />
      <IsoBox
        x={-w / 2}
        y={-d / 2}
        z={0}
        w={w}
        d={d}
        h={8}
        top="#7c8792"
        left="#5f6a75"
        right="#4c565f"
      />
    </>
  )
}

/* ---------- Catalogo ---------- */
const ART = {
  sofa: { d: 0.5, h: 66, Draw: Sofa },
  plant: { d: 0.6, h: 62, Draw: Plant },
  fridge: { d: 0.72, h: 150, Draw: Fridge },
  stove: { d: 0.8, h: 84, Draw: Stove },
  bathtub: { d: 0.5, h: 54, Draw: Bathtub },
  shelf: { d: 0.34, h: 128, Draw: Shelf },
  table: { d: 0.62, h: 68, Draw: Table },
  wardrobe: { d: 0.5, h: 158, Draw: Wardrobe },
  fountain: { d: 1, h: 78, Draw: Fountain },
  greenhouse: { d: 0.64, h: 108, Draw: Greenhouse },
  shed: { d: 0.72, h: 104, Draw: Shed },
  bench: { d: 0.36, h: 58, Draw: Bench },
  flowerbed: { d: 0.52, h: 30, Draw: Flowerbed },
  well: { d: 0.9, h: 92, Draw: Well },
  statue: { d: 0.62, h: 132, Draw: Statue },
  log: { d: 0.46, h: 48, Draw: Log },
  tent: { d: 0.76, h: 104, Draw: Tent },
  campfire: { d: 1, h: 62, Draw: Campfire },
  rock: { d: 0.82, h: 74, Draw: Rock },
  cart: { d: 0.62, h: 78, Draw: Cart },
  stump: { d: 0.9, h: 44, Draw: Stump },
  sign: { d: 0.38, h: 118, Draw: Signpost },
  barrel: { d: 1, h: 86, Draw: Barrel },
  chest: { d: 0.68, h: 66, Draw: Chest },
  torch: { d: 1, h: 96, Draw: Torch },
  skull: { d: 0.8, h: 44, Draw: Skull },
  straw: { d: 0.6, h: 34, Draw: Straw },
  chains: { d: 0.6, h: 96, Draw: Chains },
  safe: { d: 0.8, h: 74, Draw: Safe },
  paper: { d: 0.66, h: 2, Draw: Paper },
  bed: { d: 0.62, h: 90, Draw: Bed },
  tree: { d: 0.9, h: 190, Draw: ({ w }) => <IsoTree w={w} /> },
  cage: { d: 1, h: 176, Draw: Cage },
  door: { d: 0.14, h: 112, Draw: DoorArt },
  gate: { d: 0.14, h: 100, Draw: GateArt },
}

export function isoFrameFor(name, w) {
  const spec = ART[name]
  if (!spec) return null
  const aw = w * FURNITURE_SCALE
  const d = aw * spec.d
  const h = spec.h * FURNITURE_SCALE
  return { ...isoExtent(aw, d, h), d, h, spec, aw }
}

export function IsoArt({ name, w }) {
  const frame = isoFrameFor(name, w)
  if (!frame) return null

  return (
    <svg
      className="iso-art"
      viewBox={`${-frame.width / 2} ${-frame.top} ${frame.width} ${frame.top + frame.bottom}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx={0}
        cy={0}
        rx={frame.width * 0.3}
        ry={frame.width * 0.12}
        fill="rgba(0,0,0,0.22)"
      />
      {frame.spec.Draw({ w: frame.aw, d: frame.d, h: frame.h })}
    </svg>
  )
}
