// Shared primitives styled to the Ops Ctrl Tower design language:
// 4px radius, Source Sans, #1c40ca actions, solid semantic badges,
// soft chips on #f6f7f7, card shadow 0 2px 1.5px rgba(114,114,114,.25).

export function Icon({ d, size = 16, className = "", strokeWidth = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {d.split("|").map((path, i) => (
        <path key={i} d={path} />
      ))}
    </svg>
  );
}

export const icons = {
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 6l6 6-6 6",
  arrowRight: "M5 12h14|M13 6l6 6-6 6",
  arrowLeft: "M19 12H5|M11 18l-6-6 6-6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z|M21 21l-4.3-4.3",
  filter: "M4 6h16|M7 12h10|M10 18h4",
  sort: "M7 4v13|M3.5 8L7 4.5 10.5 8|M17 20V7|M13.5 16l3.5 3.5L20.5 16",
  close: "M6 6l12 12|M18 6L6 18",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 11v5|M12 8h.01",
  sparkle: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z|M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z",
  check: "M5 13l4 4L19 7",
  user: "M20 21a8 8 0 1 0-16 0|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  pin: "M12 21s-7-5.1-7-11a7 7 0 0 1 14 0c0 5.9-7 11-7 11z|M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 7v5l3.5 2",
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z|M14 3v5h5|M9 13h6|M9 17h6",
  bell: "M18 9a6 6 0 1 0-12 0c0 7-2 8-2 8h16s-2-1-2-8|M10.3 21a2 2 0 0 0 3.4 0",
  grid: "M4 4h7v7H4z|M13 4h7v7h-7z|M4 13h7v7H4z|M13 13h7v7h-7z",
  trend: "M3 17l6-6 4 4 8-8|M15 7h6v6",
};

const badgeTones = {
  risk: "bg-red text-white",
  warn: "bg-orange text-white",
  ok: "bg-green text-white",
  neutral: "bg-chip text-muted",
  info: "bg-blue text-white",
};

export function Badge({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-[4px] px-2 py-[5px] text-[12px] font-semibold uppercase leading-none tracking-[-0.12px] ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const chipTones = {
  risk: "bg-red-soft text-red border border-red-line/60",
  warn: "bg-orange-soft text-[#9a4a08] border border-orange-line/60",
  ok: "bg-green-soft text-green border border-green-line/60",
  neutral: "bg-chip text-muted border border-line-soft",
};

// Interpretation chip — every number gets context
export function InterpChip({ tone = "neutral", children, className = "" }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-[4px] px-2 py-[3px] text-[13px] leading-[18px] ${chipTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Info icon with a hover tooltip
export function InfoTip({ text }) {
  return (
    <span className="group/tip relative inline-flex items-center">
      <Icon d={icons.info} size={15} className="cursor-help text-faint transition-colors hover:text-muted" />
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute left-1/2 top-full z-40 mt-[6px] w-[230px] -translate-x-1/2 rounded-[4px] bg-ink px-3 py-2 text-[12px] font-normal normal-case leading-4 tracking-normal text-white opacity-0 shadow-pop transition-all duration-150 group-hover/tip:visible group-hover/tip:opacity-100"
      >
        <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-ink" />
        {text}
      </span>
    </span>
  );
}

export function DotLegend({ tone, label }) {
  const colors = { risk: "bg-red", warn: "bg-orange", ok: "bg-green" };
  return (
    <span className="flex items-center gap-1">
      <span className={`size-[7px] rounded-full ${colors[tone]}`} />
      <span className="text-[13px] font-semibold tracking-[-0.13px] text-slate">{label}</span>
    </span>
  );
}

export function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`rounded-[4px] border border-line-soft bg-white shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, className = "" }) {
  return (
    <p className={`text-[14px] font-semibold leading-6 tracking-[-0.14px] text-muted ${className}`}>
      {children}
    </p>
  );
}

export function GhostButton({ children, className = "", active = false, ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-1 rounded-[4px] border px-2 py-[5px] text-[13px] font-semibold leading-4 transition-colors ${
        active
          ? "border-blue bg-blue-soft text-blue"
          : "border-line-strong bg-white text-slate hover:border-line-bold hover:bg-chip"
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-[2px] text-[13px] font-semibold text-blue hover:text-blue-deep hover:underline ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-1 rounded-[4px] bg-blue px-3 py-[7px] text-[14px] font-semibold leading-5 text-white transition-colors hover:bg-blue-deep ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ children, className = "", ...rest }) {
  return (
    <button
      className={`inline-flex items-center gap-1 rounded-[4px] border-2 border-blue bg-white px-2 py-[5px] text-[14px] font-semibold leading-5 text-blue transition-colors hover:bg-blue-wash ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Select({ value, onChange, options, label, className = "" }) {
  return (
    <label className={`inline-flex items-center gap-1 text-[13px] leading-4 ${className}`}>
      {label && <span className="font-semibold text-slate">{label}</span>}
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-[4px] border border-line-strong bg-white py-[5px] pl-2 pr-6 text-[13px] text-slate outline-none hover:border-line-bold focus:border-blue"
        >
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
        <Icon d={icons.chevronDown} size={14} className="pointer-events-none absolute right-1.5 text-muted" />
      </span>
    </label>
  );
}

export function SearchInput({ value, onChange, placeholder, className = "" }) {
  return (
    <span className={`relative inline-flex items-center ${className}`}>
      <Icon d={icons.search} size={14} className="absolute left-2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-[4px] border border-line-strong bg-white py-[5px] pl-7 pr-2 text-[13px] text-slate outline-none placeholder:text-faint hover:border-line-bold focus:border-blue"
      />
    </span>
  );
}

export function ProgressBar({ segments, className = "" }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const colors = { ok: "bg-green", warn: "bg-orange", risk: "bg-red", neutral: "bg-line-bold", blue: "bg-blue" };
  return (
    <div className={`flex h-[6px] w-full overflow-hidden rounded-full bg-line-soft ${className}`}>
      {segments.map((s, i) => (
        <div
          key={i}
          className={`${colors[s.tone]} transition-all`}
          style={{ width: `${(s.value / total) * 100}%` }}
        />
      ))}
    </div>
  );
}

export function Sparkline({ data, tone = "blue", width = 120, height = 32 }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * (width - 4) + 2},${height - 3 - ((v - min) / range) * (height - 6)}`)
    .join(" ");
  const colors = { blue: "#1c40ca", ok: "#007a39", warn: "#e66605", risk: "#990800" };
  return (
    <svg width={width} height={height} className="block">
      <polyline points={pts} fill="none" stroke={colors[tone]} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const [x, y] = pts.split(" ")[i].split(",");
        return i === data.length - 1 ? <circle key={i} cx={x} cy={y} r="2.5" fill={colors[tone]} /> : null;
      })}
    </svg>
  );
}

export function MiniBars({ data, tone = "blue", width = 120, height = 32 }) {
  const max = Math.max(...data) || 1;
  const bw = width / data.length - 3;
  const colors = { blue: "#1c40ca", ok: "#007a39", warn: "#e66605" };
  return (
    <svg width={width} height={height} className="block">
      {data.map((v, i) => {
        const h = Math.max(2, (v / max) * (height - 4));
        return (
          <rect
            key={i}
            x={i * (bw + 3)}
            y={height - h}
            width={bw}
            height={h}
            rx="1.5"
            fill={i === data.length - 1 ? colors[tone] : "#d7d9db"}
          />
        );
      })}
    </svg>
  );
}

const capacityToneMap = {
  Available: "ok",
  "Fully Allocated": "neutral",
  Overloaded: "risk",
  "On Leave": "warn",
  Absent: "warn",
};

export function CapacityDot({ status }) {
  const colors = {
    Available: "bg-green",
    "Fully Allocated": "bg-blue",
    Overloaded: "bg-red",
    "On Leave": "bg-orange",
    Absent: "bg-line-bold",
  };
  return <span className={`inline-block size-2 rounded-full ${colors[status]}`} />;
}

export function capacityTone(status) {
  return capacityToneMap[status] ?? "neutral";
}

export function riskTone(risk) {
  return risk === "High" ? "risk" : risk === "Medium" ? "warn" : "ok";
}
