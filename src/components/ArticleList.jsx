import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeById, fmtDate, PROCESSES } from "../data/data.js";
import {
  Badge,
  GhostButton,
  Icon,
  icons,
  LinkButton,
  SearchInput,
  Select,
  riskTone,
} from "./ui.jsx";

const SORTS = [
  { value: "due", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "effort", label: "Effort remaining" },
  { value: "risk", label: "Risk" },
];

const prRank = { High: 0, Medium: 1, Low: 2 };
const riskRank = { High: 0, Medium: 1, Low: 2 };

export default function ArticleList({
  articles,
  allowGroup = false,
  initialVisible = 8,
  emptyText = "No articles match the current filters.",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All");
  const [sort, setSort] = useState("due");
  const [dir, setDir] = useState(1);
  const [groupBy, setGroupBy] = useState("none");
  const [visible, setVisible] = useState(initialVisible);
  const [openGroups, setOpenGroups] = useState({});

  const filtered = useMemo(() => {
    let list = articles;
    if (stage !== "All") list = list.filter((a) => a.workStage === stage);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.customer.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          (a.owner && employeeById[a.owner].name.toLowerCase().includes(q))
      );
    }
    const sorted = [...list].sort((a, b) => {
      let v = 0;
      if (sort === "due") v = a.dueOffset - b.dueOffset;
      if (sort === "priority") v = prRank[a.priority] - prRank[b.priority];
      if (sort === "effort") v = b.effortRemaining - a.effortRemaining;
      if (sort === "risk") v = riskRank[a.risk] - riskRank[b.risk];
      return v * dir || a.id.localeCompare(b.id);
    });
    return sorted;
  }, [articles, stage, query, sort, dir]);

  const groups = useMemo(() => {
    if (groupBy === "none") return null;
    const map = new Map();
    filtered.forEach((a) => {
      const key =
        groupBy === "customer" ? a.customer : groupBy === "location" ? a.location ?? "Unassigned" : a.workStage;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [filtered, groupBy]);

  const row = (a) => (
    <button
      key={a.id}
      onClick={() => navigate(`/article/${a.id}`)}
      className="grid w-full grid-cols-[88px_minmax(0,1fr)_100px_92px_86px_80px_60px] items-center gap-2 border-b border-line-soft px-2 py-[7px] text-left text-[13px] leading-[18px] transition-colors last:border-b-0 hover:bg-blue-wash"
    >
      <span className="font-semibold text-blue">{a.id}</span>
      <span className="truncate text-slate" title={a.title}>
        {a.title}
      </span>
      <span className="truncate text-muted">{a.customer}</span>
      <span className="text-slate">{a.workStage}</span>
      <span className="text-muted">{a.status === "Completed" ? "Done" : fmtDate(a.dueOffset)}</span>
      <span className="truncate text-muted">{a.owner ? employeeById[a.owner].name.split(" ")[0] : "—"}</span>
      <Badge tone={riskTone(a.risk)} className="justify-self-start !px-1.5 !text-[11px]">
        {a.risk}
      </Badge>
    </button>
  );

  const shown = groups ? filtered : filtered.slice(0, visible);

  return (
    <div className="anim-in">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <SearchInput value={query} onChange={setQuery} placeholder="Search ID, customer, owner…" className="w-56" />
        <Select
          label="Process:"
          value={stage}
          onChange={setStage}
          options={["All", ...PROCESSES]}
        />
        <Select label="Sort:" value={sort} onChange={setSort} options={SORTS} />
        <GhostButton onClick={() => setDir((d) => -d)} title="Toggle sort direction">
          <Icon d={icons.sort} size={13} />
          {dir === 1 ? "Asc" : "Desc"}
        </GhostButton>
        {allowGroup && (
          <Select
            label="Group by:"
            value={groupBy}
            onChange={setGroupBy}
            options={[
              { value: "none", label: "None" },
              { value: "customer", label: "Customer" },
              { value: "location", label: "Location" },
              { value: "process", label: "Process" },
            ]}
          />
        )}
        <span className="ml-auto text-[12px] text-faint">
          {filtered.length} article{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[88px_minmax(0,1fr)_100px_92px_86px_80px_60px] gap-2 border-b border-line px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.02em] text-faint">
            <span>ID</span>
            <span>Article</span>
            <span>Customer</span>
            <span>Process</span>
            <span>Due</span>
            <span>Owner</span>
            <span>Risk</span>
          </div>

          {filtered.length === 0 && <p className="px-2 py-4 text-[13px] text-muted">{emptyText}</p>}

          {!groups && <div className="max-h-[340px] overflow-y-auto">{shown.map(row)}</div>}

          {groups && (
            <div className="max-h-[380px] overflow-y-auto">
              {groups.map(([key, items]) => {
                const open = openGroups[key] ?? false;
                return (
                  <div key={key} className="border-b border-line-soft last:border-b-0">
                    <button
                      onClick={() => setOpenGroups((g) => ({ ...g, [key]: !open }))}
                      className="flex w-full items-center gap-2 px-2 py-2 text-left hover:bg-chip"
                    >
                      <Icon d={open ? icons.chevronDown : icons.chevronRight} size={14} className="text-muted" />
                      <span className="text-[13px] font-semibold text-slate">{key}</span>
                      <span className="rounded-full bg-chip px-2 py-[2px] text-[12px] font-semibold text-muted">
                        {items.length}
                      </span>
                    </button>
                    {open && <div className="anim-in pb-1 pl-4">{items.slice(0, 12).map(row)}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!groups && filtered.length > visible && (
        <div className="pt-2">
          <LinkButton onClick={() => setVisible((v) => v + 24)}>
            Show {Math.min(24, filtered.length - visible)} more
            <Icon d={icons.chevronDown} size={14} />
          </LinkButton>
        </div>
      )}
    </div>
  );
}
