// Every theme stays dark enough behind white text; layers cross-fade when the weather changes.
const THEMES = {
  default: "from-indigo-600 via-blue-800 to-slate-900",
  "clear-day": "from-sky-500 via-blue-600 to-indigo-800",
  "clear-night": "from-indigo-900 via-slate-900 to-black",
  "cloudy-day": "from-slate-500 via-slate-600 to-slate-800",
  "cloudy-night": "from-slate-700 via-slate-900 to-black",
  "rain-day": "from-slate-600 via-blue-900 to-slate-900",
  "rain-night": "from-slate-800 via-blue-900 to-black",
  storm: "from-slate-700 via-violet-900 to-black",
  "snow-day": "from-sky-700 via-slate-600 to-slate-800",
  "snow-night": "from-slate-700 via-sky-900 to-black",
  "fog-day": "from-zinc-500 via-zinc-600 to-zinc-800",
  "fog-night": "from-zinc-700 via-zinc-900 to-black",
  "dust-day": "from-amber-700 via-orange-900 to-stone-900",
  "dust-night": "from-stone-700 via-stone-900 to-black",
};

export default function Background({ theme }) {
  const night = theme.endsWith("night") || theme === "storm";
  const sunny = theme === "clear-day";

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden bg-slate-900">
      {Object.entries(THEMES).map(([key, gradient]) => (
        <div
          key={key}
          className={`absolute inset-0 bg-gradient-to-b ${gradient} transition-opacity duration-1000 motion-reduce:transition-none ${
            key === theme ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div
        className={`stars absolute inset-0 transition-opacity duration-1000 ${night ? "opacity-70" : "opacity-0"}`}
      />
      <div
        className={`absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl transition-all duration-1000 ${
          sunny ? "bg-white/25" : "bg-white/10"
        }`}
      />
      <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-white/5 blur-3xl" />
    </div>
  );
}
