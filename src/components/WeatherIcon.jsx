import { useId } from "react";
import { getCondition } from "../lib/weather";

// One cloud silhouette (x 10–57, y 17–46 in a 64×64 box), reused at different sizes.
const CLOUD = "M18 46h28a9 9 0 0 0 1.5-17.9A13 13 0 0 0 22.4 26A10 10 0 0 0 18 46z";

const HAZE_COLORS = { fog: "#CBD5E1", smoke: "#94A3B8", haze: "#FDE68A", dust: "#E9C46A" };

function Sun({ cx, cy, r, fill, animated }) {
  const rays = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    rays.push(
      <line
        key={i}
        x1={cx + Math.cos(a) * (r + 4)}
        y1={cy + Math.sin(a) * (r + 4)}
        x2={cx + Math.cos(a) * (r + 8.5)}
        y2={cy + Math.sin(a) * (r + 8.5)}
      />
    );
  }
  return (
    <g>
      <g
        stroke="#FBBF24"
        strokeWidth="3"
        strokeLinecap="round"
        className={animated ? "motion-safe:animate-spin-slow" : undefined}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {rays}
      </g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
    </g>
  );
}

function Moon({ cx, cy, r, fill, maskId }) {
  return (
    <g>
      <mask id={maskId}>
        <rect width="64" height="64" fill="#fff" />
        <circle cx={cx + r * 0.4} cy={cy - r * 0.3} r={r * 0.9} fill="#000" />
      </mask>
      <circle cx={cx} cy={cy} r={r} fill={fill} mask={`url(#${maskId})`} />
    </g>
  );
}

function Sparkle({ x, y, s, delay, animated }) {
  return (
    <path
      d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}z`}
      fill="#FEF3C7"
      className={animated ? "motion-safe:animate-twinkle" : undefined}
      style={{ animationDelay: delay }}
    />
  );
}

const Cloud = ({ fill, transform }) => <path d={CLOUD} fill={fill} transform={transform} />;

function Floating({ animated, children }) {
  return <g className={animated ? "motion-safe:animate-float" : undefined}>{children}</g>;
}

function Drops({ drops, color, width, animated, className = "motion-safe:animate-drop" }) {
  return (
    <g stroke={color} strokeWidth={width} strokeLinecap="round">
      {drops.map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={animated ? className : undefined}
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </g>
  );
}

function Flake({ x, y, delay, animated }) {
  const s = 3.5;
  return (
    <g
      stroke="#F8FAFC"
      strokeWidth="2"
      strokeLinecap="round"
      className={animated ? "motion-safe:animate-flake" : undefined}
      style={{ animationDelay: delay }}
    >
      <path d={`M${x} ${y - s}v${2 * s}`} />
      <path d={`M${x - s * 0.87} ${y - s / 2}l${s * 1.74} ${s}`} />
      <path d={`M${x - s * 0.87} ${y + s / 2}l${s * 1.74} ${-s}`} />
    </g>
  );
}

function HazeLines({ color, lines, animated }) {
  return (
    <g stroke={color} strokeWidth="4" strokeLinecap="round">
      {lines.map(([x1, x2, y], i) => (
        <path
          key={i}
          d={`M${x1} ${y}H${x2}`}
          className={animated ? "motion-safe:animate-drift" : undefined}
          style={{ animationDelay: `${i * -1.3}s` }}
        />
      ))}
    </g>
  );
}

function Scene({ kind, night, ids, animated }) {
  const sun = `url(#${ids.sun})`;
  const moon = `url(#${ids.moon})`;
  const light = `url(#${ids.cloudLight})`;
  const gray = `url(#${ids.cloudGray})`;
  const dark = `url(#${ids.cloudDark})`;
  const raised = "translate(0 -6)";

  switch (kind) {
    case "clear":
      return night ? (
        <>
          <Moon cx={32} cy={33} r={16} fill={moon} maskId={ids.mask} />
          <Sparkle x={49} y={15} s={4} delay="0s" animated={animated} />
          <Sparkle x={14} y={20} s={2.5} delay="-1s" animated={animated} />
          <Sparkle x={52} y={45} s={2} delay="-1.8s" animated={animated} />
        </>
      ) : (
        <Sun cx={32} cy={32} r={12} fill={sun} animated={animated} />
      );
    case "partly":
      return (
        <>
          {night ? (
            <Moon cx={25} cy={24} r={12} fill={moon} maskId={ids.mask} />
          ) : (
            <Sun cx={24} cy={24} r={9} fill={sun} animated={animated} />
          )}
          <Floating animated={animated}>
            <Cloud fill={light} transform="translate(14 16) scale(0.8)" />
          </Floating>
        </>
      );
    case "cloudy":
      return (
        <Floating animated={animated}>
          <Cloud fill={light} transform="translate(0 2)" />
        </Floating>
      );
    case "overcast":
      return (
        <>
          <Cloud fill={gray} transform="translate(2 2) scale(0.75)" />
          <Floating animated={animated}>
            <Cloud fill={light} transform="translate(10 12) scale(0.85)" />
          </Floating>
        </>
      );
    case "drizzle":
      return (
        <>
          <Cloud fill={gray} transform={raised} />
          <Drops
            color="#7DD3FC"
            width={2.5}
            animated={animated}
            drops={[[22, 45, 21, 49], [30, 47, 29, 51], [38, 45, 37, 49], [46, 47, 45, 51]]}
          />
        </>
      );
    case "rain":
    case "heavyRain":
      return (
        <>
          <Cloud fill={kind === "heavyRain" ? dark : gray} transform={raised} />
          <Drops
            color="#38BDF8"
            width={3}
            animated={animated}
            drops={
              kind === "heavyRain"
                ? [[20, 44, 16, 54], [29, 44, 25, 54], [38, 44, 34, 54], [47, 44, 43, 54]]
                : [[24, 45, 21, 53], [33, 45, 30, 53], [42, 45, 39, 53]]
            }
          />
        </>
      );
    case "thunder":
      return (
        <>
          <Cloud fill={dark} transform={raised} />
          <polygon
            points="35,36 25,50 32,50 28,60 41,44 34,44 38,36"
            fill="#FACC15"
            className={animated ? "motion-safe:animate-flash" : undefined}
          />
        </>
      );
    case "snow":
      return (
        <>
          <Cloud fill={light} transform={raised} />
          <Flake x={22} y={48} delay="0s" animated={animated} />
          <Flake x={32} y={54} delay="-0.8s" animated={animated} />
          <Flake x={42} y={48} delay="-1.6s" animated={animated} />
        </>
      );
    case "sleet":
      return (
        <>
          <Cloud fill={gray} transform={raised} />
          <Drops color="#38BDF8" width={3} animated={animated} drops={[[25, 45, 22, 53]]} />
          <Flake x={39} y={50} delay="-0.6s" animated={animated} />
        </>
      );
    case "wind":
      return (
        <g
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="4"
          strokeLinecap="round"
          className={animated ? "motion-safe:animate-drift" : undefined}
        >
          <path d="M8 26h28a6 6 0 1 0-6-6" />
          <path d="M8 34h38a6 6 0 1 1-6 6" />
          <path d="M8 42h20" />
        </g>
      );
    default: {
      // fog, haze, smoke, dust
      const color = HAZE_COLORS[kind] ?? HAZE_COLORS.fog;
      const withSky = kind === "haze" || kind === "dust";
      return (
        <>
          {withSky && !night && <Sun cx={32} cy={22} r={9} fill={sun} animated={animated} />}
          {withSky && night && <Moon cx={32} cy={22} r={11} fill={moon} maskId={ids.mask} />}
          {!withSky && <Cloud fill={gray} transform="translate(0 -8)" />}
          <HazeLines
            color={color}
            animated={animated}
            lines={[[14, 50, 45], [20, 46, 52]]}
          />
        </>
      );
    }
  }
}

export default function WeatherIcon({ id, icon, label, animated = true, className = "h-12 w-12" }) {
  const uid = useId().replace(/:/g, "");
  const ids = {
    sun: `${uid}-sun`,
    moon: `${uid}-moon`,
    cloudLight: `${uid}-cl`,
    cloudGray: `${uid}-cg`,
    cloudDark: `${uid}-cd`,
    mask: `${uid}-mask`,
  };
  const { kind, night } = getCondition(id, icon);

  return (
    <svg
      viewBox="0 0 64 64"
      className={`overflow-visible ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={ids.sun} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id={ids.moon} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FEF9C3" />
          <stop offset="1" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id={ids.cloudLight} x1="0" y1="17" x2="0" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#CBD5E1" />
        </linearGradient>
        <linearGradient id={ids.cloudGray} x1="0" y1="17" x2="0" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id={ids.cloudDark} x1="0" y1="17" x2="0" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#94A3B8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      <Scene kind={kind} night={night} ids={ids} animated={animated} />
    </svg>
  );
}
