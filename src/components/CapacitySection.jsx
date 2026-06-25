import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleById, employeeServesAccount, employees, fmtDate, getLocations } from "../data/data.js";
import {
  Badge,
  CapacityDot,
  Card,
  capacityTone,
  GhostButton,
  Icon,
  icons,
  ProgressBar,
  SearchInput,
  SectionLabel,
  Select,
  Sparkline,
} from "./ui.jsx";

const pressureTone = { High: "risk", Elevated: "warn", Balanced: "ok" };

export function LocationCards({ selected, accountFilter, onSelect }) {
  const locations = useMemo(() => getLocations(accountFilter), [accountFilter]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {locations.map((loc) => {
        const active = selected === loc.name;
        return (
          <Card
            key={loc.name}
            className={`cursor-pointer px-5 pb-4 pt-4 transition-all hover:border-line-bold ${
              active ? "!border-blue ring-1 ring-blue" : ""
            }`}
            onClick={() => onSelect(active ? null : loc.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelect(active ? null : loc.name)}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-[6px]">
                <Icon d={icons.pin} size={15} className="text-muted" />
                <span className="text-[16px] font-semibold leading-6 text-ink">{loc.name}</span>
              </span>
              <Badge tone={pressureTone[loc.pressure]}>{loc.pressure} pressure</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] leading-[18px]">
              <span className="text-muted">
                <b className="font-semibold text-ink">{loc.total}</b> people
              </span>
              <span className="text-muted">
                <b className="font-semibold text-green">{loc.present}</b> present
              </span>
              <span className="text-muted">
                <b className="font-semibold text-orange">{loc.leave}</b> on leave
              </span>
              <span className="text-muted">
                <b className="font-semibold text-slate">{loc.absent}</b> absent
              </span>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[12px] leading-4">
                <span className="text-muted">Utilization</span>
                <span className="font-semibold text-ink">{loc.utilization}%</span>
              </div>
              <ProgressBar
                segments={[
                  { value: loc.assignedHours, tone: loc.utilization > 95 ? "warn" : "blue" },
                  { value: Math.max(loc.freeHours, 0), tone: "neutral" },
                ]}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[12px] leading-4 text-muted">
              <span>
                <b className="font-semibold text-green">{loc.freeHours}h</b> available capacity
              </span>
              <span>
                <b className={`font-semibold ${loc.overtimeHours > 0 ? "text-orange" : "text-ink"}`}>
                  {loc.overtimeHours}h
                </b>{" "}
                overtime in plan
              </span>
            </div>

            <p className="mt-2 border-t border-line-soft pt-2 text-[12px] font-semibold text-blue">
              {active ? "Filtering workspace by " + loc.name + " — click to clear" : "Click to focus workspace on " + loc.name}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

const ROW_COLS =
  "grid-cols-[minmax(150px,1.3fr)_110px_100px_96px_64px_minmax(130px,1fr)_120px]";

function EmployeeHoverCard({ emp }) {
  const arts = emp.articles.map((id) => articleById[id]);
  return (
    <div className="pointer-events-none invisible absolute left-6 top-full z-30 w-[300px] pt-1 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
      <div className="rounded-[4px] border border-line-soft bg-white p-3 shadow-pop">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">{emp.name}</span>
          <Badge tone={capacityTone(emp.capacityStatus)} className="!px-1.5 !text-[10px]">
            {emp.capacityStatus}
          </Badge>
        </div>
        <p className="mt-[2px] text-[12px] text-muted">
          {emp.role} · {emp.team} · {emp.shift}
        </p>

        <div className="mt-2 border-t border-line-soft pt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.02em] text-faint">
            Assigned today ({arts.length})
          </p>
          {arts.length === 0 && <p className="text-[12px] text-muted">No work in hand.</p>}
          {arts.slice(0, 4).map((a) => (
            <div key={a.id} className="flex items-center justify-between py-[2px] text-[12px]">
              <span className="font-semibold text-blue">{a.id}</span>
              <span className="text-muted">
                {a.workStage} · due {fmtDate(a.dueOffset)}
              </span>
            </div>
          ))}
          {arts.length > 4 && <p className="text-[11px] text-faint">+{arts.length - 4} more</p>}
        </div>

        <div className="mt-2 flex gap-4 border-t border-line-soft pt-2">
          <div>
            <p className="mb-[2px] text-[11px] font-semibold uppercase tracking-[0.02em] text-faint">
              Capacity trend
            </p>
            <Sparkline data={emp.trends.utilization} tone="blue" width={120} height={26} />
          </div>
          <div>
            <p className="mb-[2px] text-[11px] font-semibold uppercase tracking-[0.02em] text-faint">
              Productivity
            </p>
            <Sparkline data={emp.trends.productivity} tone="ok" width={120} height={26} />
          </div>
        </div>
      </div>
    </div>
  );
}

const statusText = {
  Available: "text-green",
  "Fully Allocated": "text-blue",
  Overloaded: "text-red",
  "On Leave": "text-orange",
  Absent: "text-faint",
};

function EmployeeRow({ emp }) {
  const navigate = useNavigate();
  const pct = Math.min(100, Math.round((emp.assignedHours / 8) * 100));

  return (
    <div className="group relative">
      <button
        onClick={() => navigate(`/employee/${emp.id}`)}
        className={`grid w-full ${ROW_COLS} items-center gap-2 border-b border-line-soft bg-white px-2 py-[7px] text-left text-[13px] leading-[18px] transition-colors hover:bg-blue-wash`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <CapacityDot status={emp.capacityStatus} />
          <span className="truncate font-semibold text-ink">{emp.name}</span>
        </span>
        <span className="truncate text-slate">{emp.process}</span>
        <span className="truncate text-muted">{emp.location}</span>
        <span className="truncate text-muted">{emp.team}</span>
        <span className="text-slate">{emp.articles.length}</span>
        <span className="flex items-center gap-2">
          {emp.status === "Present" ? (
            <>
              <span className="h-[5px] w-[72px] shrink-0 overflow-hidden rounded-full bg-line-soft">
                <span
                  className={`block h-full rounded-full ${
                    emp.capacityStatus === "Overloaded"
                      ? "bg-red"
                      : emp.capacityStatus === "Fully Allocated"
                        ? "bg-blue"
                        : "bg-green"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="whitespace-nowrap text-muted">
                <b className="font-semibold text-ink">{emp.assignedHours}h</b> / 8h
              </span>
            </>
          ) : (
            <span className="text-faint">—</span>
          )}
        </span>
        <span className={`font-semibold ${statusText[emp.capacityStatus]}`}>{emp.capacityStatus}</span>
      </button>
      <EmployeeHoverCard emp={emp} />
    </div>
  );
}

const STATUS_FILTERS = ["All", "Available", "Fully Allocated", "Overloaded", "On Leave", "Absent"];

export function EmployeeGrid({ locationFilter, accountFilter }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [groupBy, setGroupBy] = useState("location");
  const [sort, setSort] = useState("workload");

  const list = useMemo(() => {
    let l = employees;
    if (accountFilter) l = l.filter((e) => employeeServesAccount(e, accountFilter));
    if (locationFilter) l = l.filter((e) => e.location === locationFilter);
    if (status !== "All") l = l.filter((e) => e.capacityStatus === status);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      l = l.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.process.toLowerCase().includes(q) ||
          e.team.toLowerCase().includes(q)
      );
    }
    return [...l].sort((a, b) =>
      sort === "workload"
        ? b.assignedHours - a.assignedHours
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : b.utilization - a.utilization
    );
  }, [locationFilter, accountFilter, status, query, sort]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [["All employees", list]];
    const keyFn = {
      location: (e) => e.location,
      team: (e) => e.team,
      process: (e) => e.process,
      shift: (e) => e.shift,
    }[groupBy];
    const map = new Map();
    list.forEach((e) => {
      const k = keyFn(e);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [list, groupBy]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SearchInput value={query} onChange={setQuery} placeholder="Search people, process, team…" className="w-60" />
        <Select label="Status:" value={status} onChange={setStatus} options={STATUS_FILTERS} />
        <Select
          label="Group by:"
          value={groupBy}
          onChange={setGroupBy}
          options={[
            { value: "location", label: "Location" },
            { value: "team", label: "Team" },
            { value: "process", label: "Process" },
            { value: "shift", label: "Shift" },
            { value: "none", label: "None" },
          ]}
        />
        <Select
          label="Sort:"
          value={sort}
          onChange={setSort}
          options={[
            { value: "workload", label: "Workload" },
            { value: "utilization", label: "Utilization" },
            { value: "name", label: "Name" },
          ]}
        />
        <span className="ml-auto flex flex-wrap items-center gap-3 text-[12px] text-muted">
          {["Available", "Fully Allocated", "Overloaded", "On Leave"].map((s) => (
            <span key={s} className="flex items-center gap-1">
              <CapacityDot status={s} /> {s}
            </span>
          ))}
        </span>
      </div>

      <div className="rounded-[4px] border border-line-soft bg-white shadow-card">
        <div
          className={`grid ${ROW_COLS} gap-2 border-b border-line px-2 pb-[6px] pt-2 text-[11px] font-semibold uppercase tracking-[0.02em] text-faint`}
        >
          <span className="pl-4">Employee</span>
          <span>Process</span>
          <span>Location</span>
          <span>Team</span>
          <span>Articles</span>
          <span>Workload</span>
          <span>Status</span>
        </div>

        {list.length === 0 && (
          <p className="py-6 text-center text-[13px] text-muted">No employees match the current filters.</p>
        )}

        {groups.map(([key, emps]) => (
          <div key={key} className="last:[&_.group:last-child_button]:border-b-0">
            {groupBy !== "none" && (
              <p className="flex items-center gap-2 border-b border-line-soft bg-canvas px-2 py-[6px] text-[13px] font-semibold text-slate">
                {key}
                <span className="rounded-full bg-chip px-2 py-[2px] text-[12px] font-semibold text-muted">
                  {emps.length}
                </span>
                <span className="text-[12px] font-normal text-faint">
                  {emps.filter((e) => e.capacityStatus === "Available").length} with available capacity
                </span>
              </p>
            )}
            {emps.map((e) => (
              <EmployeeRow key={e.id} emp={e} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CapacityHeader({ locationFilter, accountFilter, onClear }) {
  const locations = useMemo(() => getLocations(accountFilter), [accountFilter]);
  const totalFree = locations.reduce((s, l) => s + l.freeHours, 0);
  const demand = locations.reduce((s, l) => s + l.assignedHours + l.overtimeHours, 0);
  const can = totalFree >= 0;
  const hasFilters = Boolean(accountFilter || locationFilter);

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <div>
        <SectionLabel className="!text-[18px] !text-slate">Capacity</SectionLabel>
        <p className="text-[15px] leading-5 text-muted">
          Can today's workload be completed with available people?{" "}
          <b className={`font-semibold ${can ? "text-green" : "text-red"}`}>
            {can ? `Yes — ${totalFree}h of capacity remains unallocated` : "Not without intervention"}
          </b>{" "}
          <span className="text-muted">({demand}h of work in hand across both locations)</span>
        </p>
      </div>
      {hasFilters && (
        <GhostButton active onClick={onClear}>
          {accountFilter && (
            <>
              Account: {accountFilter}
              {locationFilter && " · "}
            </>
          )}
          {locationFilter && (
            <>
              <Icon d={icons.pin} size={13} />
              Operations: {locationFilter}
            </>
          )}
          <Icon d={icons.close} size={12} />
        </GhostButton>
      )}
    </div>
  );
}
