import { Link } from "react-router-dom";
import { Icon, icons } from "./ui.jsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-white px-4 py-3 shadow-[0px_1px_0px_#c2c6ca]">
      <Link to="/" className="flex items-center gap-3 no-underline">
        <span className="flex size-9 items-center justify-center rounded-[4px] bg-blue text-white">
          <Icon d={icons.grid} size={18} strokeWidth={2} />
        </span>
        <span className="leading-none">
          <span className="block text-[15px] font-bold uppercase tracking-[0.02em] text-ink">
            Ops Control
          </span>
          <span className="block text-[15px] font-bold uppercase tracking-[0.02em] text-ink">
            Tower
          </span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-[13px] text-muted sm:block">
          Wednesday, June 10, 2026 · Day shift
        </span>
        <span className="flex items-center gap-3 rounded-[4px] border border-line-strong px-3 py-[6px]">
          <span className="text-[13px] font-semibold text-slate">Account Head</span>
          <span className="flex size-6 items-center justify-center rounded-full bg-[#614655] text-[12px] font-semibold text-white">
            KG
          </span>
        </span>
      </div>
    </header>
  );
}
