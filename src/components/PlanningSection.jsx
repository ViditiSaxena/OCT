import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  articles,
  BACKLOG_PRODUCTION_STAGES,
  BACKLOG_STATUSES,
  BACKLOG_CRITICAL_OVERDUE_DAYS,
  isBacklogCriticalOverdue,
  fmtDate,
  todayConfidence,
  upcomingGroups,
  PROCESSES,
} from "../data/data.js";
import ArticleList from "./ArticleList.jsx";
import {
  Card,
  Icon,
  icons,
  InfoTip,
  InterpChip,
  LinkButton,
  ProgressBar,
} from "./ui.jsx";

function useFiltered(locationFilter, accountFilter) {
  return useMemo(() => {
    let list = articles;
    if (accountFilter) list = list.filter((a) => a.account === accountFilter);
    if (locationFilter) list = list.filter((a) => a.location === locationFilter);
    return list;
  }, [locationFilter, accountFilter]);
}

function ProcessRow({ count, process, chip, onClick }) {
  return (
    <div className="flex items-center gap-2 py-[5px]">
      <button
        onClick={onClick}
        className="flex shrink-0 items-baseline gap-1 rounded-[2px] text-left hover:underline"
        title={`View ${process} articles`}
      >
        <span className="border-b border-slate text-[15px] font-bold leading-5 text-ink">{count}</span>
        <span className="text-[13px] leading-[18px] text-slate">in {process}</span>
      </button>
      <span className="min-w-0" title={chip.text}>
        <InterpChip tone={chip.tone} className="max-w-full italic">
          <span className="truncate">{chip.text}</span>
        </InterpChip>
      </span>
    </div>
  );
}

const PLANNING_CARD_SHELL =
  "planning-card-future relative overflow-hidden border-[#c5d0ff]/80 bg-gradient-to-br from-blue-wash via-white to-[#f3f1ff] shadow-[0_2px_14px_rgba(28,64,202,0.1)]";
const PLANNING_CARD_HOVER =
  "cursor-pointer transition-[box-shadow,border-color,background-color] hover:border-[#c5d0ff] hover:shadow-[0_4px_20px_rgba(28,64,202,0.14)]";

const CARD_TONES = {
  urgent: {
    shell: PLANNING_CARD_SHELL,
    hover: PLANNING_CARD_HOVER,
    title: "text-red",
  },
  watch: {
    shell: PLANNING_CARD_SHELL,
    hover: PLANNING_CARD_HOVER,
    title: "text-orange",
  },
  future: {
    shell: PLANNING_CARD_SHELL,
    hover: PLANNING_CARD_HOVER,
    title:
      "bg-gradient-to-r from-blue-deep via-blue to-[#6366f1] bg-clip-text text-transparent",
  },
};

function CardShell({ children, tone, onClick }) {
  const styles = tone ? CARD_TONES[tone] : null;
  const interactive = Boolean(onClick);

  return (
    <Card
      className={`flex min-w-0 flex-col px-5 pb-4 pt-5 ${styles?.shell ?? ""} ${
        interactive ? styles?.hover ?? "cursor-pointer transition-shadow hover:shadow-card" : ""
      }`}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {tone === "future" && (
        <>
          <div
            className="pointer-events-none absolute -right-8 -top-6 h-28 w-28 rounded-full bg-blue/15 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-10 left-0 h-20 w-20 rounded-full bg-[#8b7cff]/12 blur-2xl"
            aria-hidden="true"
          />
        </>
      )}
      {children}
    </Card>
  );
}

function CardTitle({ tone, children }) {
  const titleClass = tone ? CARD_TONES[tone].title : "text-ink";
  return (
    <p
      className={`flex items-center gap-2 text-[30px] font-semibold leading-8 tracking-[-0.3px] ${titleClass}`}
    >
      {children}
    </p>
  );
}

const BACKLOG_STATUS_DISPLAY = [
  { status: "WIP", label: "WIP", tone: "blue", legendClass: "text-blue" },
  { status: "Pause", label: "Paused", tone: "warn", legendClass: "text-orange" },
  { status: "Held", label: "Held", tone: "neutral", legendClass: "text-slate" },
];

function BacklogStageRow({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/stage w-full rounded-[3px] py-[2px] text-left text-[18px] leading-[24px] text-slate transition-colors hover:text-ink hover:underline ${
        active ? "bg-red-soft/50 px-2 text-ink underline" : ""
      }`}
    >
      <span className="font-bold">{count}</span> in {label}
    </button>
  );
}

const BACKLOG_TABLE_COLS =
  "grid-cols-[minmax(80px,0.9fr)_72px_minmax(88px,1fr)_minmax(88px,1fr)_minmax(96px,1.1fr)_88px_minmax(72px,0.8fr)]";

const TABLE_HEADER_CELL =
  "inline-flex min-w-0 items-center gap-1 text-left transition-colors hover:text-slate";

function HeaderFilter({ label, value, onChange, options }) {
  const active = value !== "All";
  const current = options.find((o) => o.value === value);

  return (
    <span className={`group/header relative ${TABLE_HEADER_CELL} cursor-pointer`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter ${label}${active ? `: ${current?.label ?? value}` : ""}`}
        title={active ? `${label}: ${current?.label ?? value}` : `Filter ${label}`}
        className="absolute inset-0 z-[1] cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none shrink-0">{label}</span>
      <span className="pointer-events-none inline-flex size-4 shrink-0 items-center justify-center">
        <Icon
          d={icons.filter}
          size={11}
          className="text-muted transition-colors group-hover/header:text-slate"
        />
      </span>
    </span>
  );
}

function FilterChip({ label, value, onRemove }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-[4px] border border-blue/25 bg-blue-soft py-[3px] pl-2 pr-1 text-[12px] leading-4 text-blue">
      <span className="min-w-0 truncate">
        <span className="font-semibold">{label}:</span> {value}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="inline-flex shrink-0 rounded-[2px] p-0.5 text-blue/80 transition-colors hover:bg-blue/10 hover:text-blue"
      >
        <Icon d={icons.close} size={12} />
      </button>
    </span>
  );
}

function BacklogArticleTable({
  articles,
  stageFilter,
  onStageFilter,
  statusFilter: statusFilterProp,
  onStatusFilter,
  criticalOverdueFilter,
  onCriticalOverdueFilter,
  scrollClassName = "max-h-[280px]",
}) {
  const navigate = useNavigate();
  const [dueSortDir, setDueSortDir] = useState(1);
  const [journalFilter, setJournalFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [processFilter, setProcessFilter] = useState("All");

  const stageValue = stageFilter ?? "All";
  const setStageValue = (v) => onStageFilter(v === "All" ? null : v);
  const statusValue = statusFilterProp ?? "All";
  const setStatusValue = (v) => onStatusFilter(v === "All" ? null : v);

  const journalOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...[...new Set(articles.map((a) => a.journal))].sort().map((j) => ({ value: j, label: j })),
    ],
    [articles]
  );
  const departmentOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...[...new Set(articles.map((a) => a.department))].sort().map((d) => ({ value: d, label: d })),
    ],
    [articles]
  );
  const processOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...[...new Set(articles.map((a) => a.processName))].sort().map((p) => ({ value: p, label: p })),
    ],
    [articles]
  );
  const statusOptions = useMemo(
    () => [{ value: "All", label: "All" }, ...BACKLOG_STATUSES.map((s) => ({ value: s, label: s }))],
    []
  );
  const stageOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...BACKLOG_PRODUCTION_STAGES.map((s) => ({ value: s, label: s })),
    ],
    []
  );

  const filtered = useMemo(() => {
    let list = articles;
    if (criticalOverdueFilter) list = list.filter(isBacklogCriticalOverdue);
    if (stageValue !== "All") list = list.filter((a) => a.productionStage === stageValue);
    if (journalFilter !== "All") list = list.filter((a) => a.journal === journalFilter);
    if (departmentFilter !== "All") list = list.filter((a) => a.department === departmentFilter);
    if (processFilter !== "All") list = list.filter((a) => a.processName === processFilter);
    if (statusValue !== "All") list = list.filter((a) => a.status === statusValue);
    return list;
  }, [articles, criticalOverdueFilter, stageValue, journalFilter, departmentFilter, processFilter, statusValue]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) => (a.dueOffset - b.dueOffset) * dueSortDir || a.id.localeCompare(b.id)
    );
  }, [filtered, dueSortDir]);

  const activeFilters = useMemo(() => {
    const items = [];
    if (criticalOverdueFilter) {
      items.push({
        key: "criticalOverdue",
        label: "Overdue",
        value: `${BACKLOG_CRITICAL_OVERDUE_DAYS}+ days`,
        onRemove: () => onCriticalOverdueFilter(false),
      });
    }
    if (stageValue !== "All") {
      items.push({
        key: "stage",
        label: "Stage",
        value: stageValue,
        onRemove: () => setStageValue("All"),
      });
    }
    if (journalFilter !== "All") {
      items.push({
        key: "journal",
        label: "JID",
        value: journalFilter,
        onRemove: () => setJournalFilter("All"),
      });
    }
    if (departmentFilter !== "All") {
      items.push({
        key: "department",
        label: "Department",
        value: departmentFilter,
        onRemove: () => setDepartmentFilter("All"),
      });
    }
    if (processFilter !== "All") {
      items.push({
        key: "process",
        label: "Process",
        value: processFilter,
        onRemove: () => setProcessFilter("All"),
      });
    }
    if (statusValue !== "All") {
      items.push({
        key: "status",
        label: "Status",
        value: statusValue,
        onRemove: () => setStatusValue("All"),
      });
    }
    return items;
  }, [criticalOverdueFilter, stageValue, journalFilter, departmentFilter, processFilter, statusValue, onCriticalOverdueFilter]);

  const clearAllFilters = () => {
    onCriticalOverdueFilter(false);
    setStageValue("All");
    setJournalFilter("All");
    setDepartmentFilter("All");
    setProcessFilter("All");
    setStatusValue("All");
  };

  if (articles.length === 0) {
    return <p className="py-4 text-[13px] text-muted">No backlog articles match the current filters.</p>;
  }

  return (
    <div>
      {activeFilters.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 px-2">
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              value={filter.value}
              onRemove={filter.onRemove}
            />
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[12px] font-semibold text-blue transition-colors hover:text-blue-deep hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <div
          className={`min-w-[760px] grid ${BACKLOG_TABLE_COLS} gap-x-2 border-b border-line-soft px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.02em] text-faint`}
        >
        <span>AID</span>
        <HeaderFilter
          label="JID"
          value={journalFilter}
          onChange={setJournalFilter}
          options={journalOptions}
        />
        <HeaderFilter label="Stage" value={stageValue} onChange={setStageValue} options={stageOptions} />
        <HeaderFilter
          label="Department"
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={departmentOptions}
        />
        <HeaderFilter
          label="Process"
          value={processFilter}
          onChange={setProcessFilter}
          options={processOptions}
        />
        <button
          type="button"
          onClick={() => setDueSortDir((d) => -d)}
          className={`group/header ${TABLE_HEADER_CELL}`}
          title={
            dueSortDir === 1
              ? "Sorted oldest to newest — click for newest to oldest"
              : "Sorted newest to oldest — click for oldest to newest"
          }
          aria-label={
            dueSortDir === 1
              ? "Due date: oldest to newest. Click to sort newest to oldest."
              : "Due date: newest to oldest. Click to sort oldest to newest."
          }
        >
          Due date
          <Icon
            d={icons.sort}
            size={12}
            className={`text-muted transition-[color,transform] group-hover/header:text-slate ${dueSortDir === -1 ? "rotate-180" : ""}`}
          />
        </button>
        <HeaderFilter
          label="Status"
          value={statusValue}
          onChange={setStatusValue}
          options={statusOptions}
        />
        </div>
        <div className={`overflow-y-auto ${scrollClassName}`}>
        {sorted.length === 0 ? (
          <p className="py-4 text-[13px] text-muted">No backlog articles match the current filters.</p>
        ) : (
          sorted.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => navigate(`/article/${a.id}`)}
              className={`grid w-full ${BACKLOG_TABLE_COLS} gap-x-2 border-b border-line-soft bg-white px-2 py-[7px] text-left text-[12px] leading-[17px] transition-colors last:border-b-0 hover:bg-blue-wash`}
            >
              <span className="truncate font-semibold text-blue">{a.id}</span>
              <span className="truncate text-muted">{a.journal}</span>
              <span className="truncate text-slate" title={a.productionStage}>
                {a.productionStage}
              </span>
              <span className="truncate text-slate" title={a.department}>
                {a.department}
              </span>
              <span className="truncate font-medium text-ink" title={a.processName}>
                {a.processName}
              </span>
              <span className="text-muted">{fmtDate(a.dueOffset)}</span>
              <span className="truncate text-slate">{a.status}</span>
            </button>
          ))
        )}
        </div>
      </div>
    </div>
  );
}

function BacklogArticlesModal({
  articles,
  stageFilter,
  onStageFilter,
  statusFilter,
  onStatusFilter,
  criticalOverdueFilter,
  onCriticalOverdueFilter,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[5vh]"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="anim-in flex max-h-[90vh] w-full max-w-[920px] flex-col rounded-[4px] border border-line-soft bg-white shadow-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backlog-modal-title"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p id="backlog-modal-title" className="text-[20px] font-semibold leading-7 tracking-[-0.2px] text-ink">
              Backlog article details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[4px] p-1 text-muted hover:bg-chip"
            aria-label="Close"
          >
            <Icon d={icons.close} size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-5 py-3">
          <BacklogArticleTable
            articles={articles}
            stageFilter={stageFilter}
            onStageFilter={onStageFilter}
            statusFilter={statusFilter}
            onStatusFilter={onStatusFilter}
            criticalOverdueFilter={criticalOverdueFilter}
            onCriticalOverdueFilter={onCriticalOverdueFilter}
            scrollClassName="max-h-[calc(90vh-120px)]"
          />
        </div>
      </div>
    </div>
  );
}

export function OverdueCard({ locationFilter, accountFilter }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [criticalOverdueFilter, setCriticalOverdueFilter] = useState(false);
  const pool = useFiltered(locationFilter, accountFilter).filter((a) => a.bucket === "overdue");

  const byProductionStage = (stage) => pool.filter((a) => a.productionStage === stage).length;
  const byBacklogStatus = (status) => pool.filter((a) => a.status === status).length;
  const criticalOverdueCount = pool.filter(isBacklogCriticalOverdue).length;

  const openModal = ({ stage = null, status = null, criticalOverdue = false } = {}) => {
    setStageFilter(stage);
    setStatusFilter(status);
    setCriticalOverdueFilter(criticalOverdue);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setStageFilter(null);
    setStatusFilter(null);
    setCriticalOverdueFilter(false);
  };

  return (
    <CardShell tone="urgent" onClick={() => openModal()}>
      <CardTitle tone="urgent">
        {pool.length} Backlog
        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <InfoTip text="Backlog articles are articles that have gone past their due dates and are still in active work." />
        </span>
      </CardTitle>

      <div className="mt-3">
        <ProgressBar
          segments={BACKLOG_STATUS_DISPLAY.map(({ status, tone }) => ({
            value: byBacklogStatus(status),
            tone,
          }))}
        />
        <div className="mt-[6px] flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-4 text-muted">
          {BACKLOG_STATUS_DISPLAY.map(({ status, label, legendClass }) => {
            const count = byBacklogStatus(status);
            return (
              <button
                key={status}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal({ status });
                }}
                disabled={count === 0}
                className={`rounded-[2px] transition-colors hover:underline disabled:cursor-default disabled:opacity-60 disabled:hover:no-underline ${
                  modalOpen && statusFilter === status ? "bg-red-soft/50 px-1" : ""
                }`}
                title={`View ${count} ${label} article${count === 1 ? "" : "s"}`}
              >
                <b className={`font-semibold ${legendClass}`}>{count}</b> {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openModal({ criticalOverdue: true });
          }}
          disabled={criticalOverdueCount === 0}
          className={`inline-flex max-w-full items-center rounded-[4px] border border-red-line/60 bg-red-soft px-2 py-[3px] text-left text-[13px] leading-[18px] italic text-red transition-colors hover:border-red-line hover:bg-[#f5d0cb] disabled:cursor-default disabled:opacity-60 disabled:hover:border-red-line/60 disabled:hover:bg-red-soft ${
            modalOpen && criticalOverdueFilter ? "ring-1 ring-red-line" : ""
          }`}
          title={`View ${criticalOverdueCount} article${criticalOverdueCount === 1 ? "" : "s"} over ${BACKLOG_CRITICAL_OVERDUE_DAYS} days past due`}
        >
          <span>
            <span className="font-bold italic">Critical:</span> There are{" "}
            <span className="font-bold not-italic">{criticalOverdueCount}</span> articles which are over{" "}
            {BACKLOG_CRITICAL_OVERDUE_DAYS} days past due date
          </span>
        </button>
      </div>

      <div className="mt-3 border-t border-line-soft pt-2">
        {BACKLOG_PRODUCTION_STAGES.map((stage) => (
          <BacklogStageRow
            key={stage}
            label={stage}
            count={byProductionStage(stage)}
            active={modalOpen && stageFilter === stage}
            onClick={(e) => {
              e.stopPropagation();
              openModal({ stage });
            }}
          />
        ))}
      </div>

      <div className="mt-auto pt-3">
        <LinkButton
          onClick={(e) => {
            e.stopPropagation();
            openModal();
          }}
        >
          View article details
          <Icon d={icons.arrowRight} size={15} />
        </LinkButton>
      </div>

      {modalOpen && (
        <BacklogArticlesModal
          articles={pool}
          stageFilter={stageFilter}
          onStageFilter={setStageFilter}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          criticalOverdueFilter={criticalOverdueFilter}
          onCriticalOverdueFilter={setCriticalOverdueFilter}
          onClose={closeModal}
        />
      )}
    </CardShell>
  );
}

export function DueTodayCard({ locationFilter, accountFilter }) {
  const [open, setOpen] = useState(false);
  const pool = useFiltered(locationFilter, accountFilter).filter((a) => a.bucket === "today");
  const completed = pool.filter((a) => a.status === "Completed").length;
  const wip = pool.filter((a) => a.status === "In Progress").length;
  const notStarted = pool.filter((a) => a.status === "Not Started").length;
  const openArts = pool.filter((a) => a.status !== "Completed");
  const byStage = (p) => openArts.filter((a) => a.workStage === p).length;

  return (
    <CardShell tone="watch">
      <CardTitle tone="watch">
        {pool.length} On Due
        <InfoTip text="Articles whose committed delivery date is today. They must be delivered by the 6 PM cut-off." />
      </CardTitle>
      <p className="mt-1 text-[13px] leading-[18px] text-muted">All must be delivered by 6 PM.</p>

      <div className="mt-3">
        <ProgressBar
          segments={[
            { value: completed, tone: "ok" },
            { value: wip, tone: "blue" },
            { value: notStarted, tone: "neutral" },
          ]}
        />
        <div className="mt-[6px] flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-4 text-muted">
          <span>
            <b className="font-semibold text-green">{completed}</b> Completed
          </span>
          <span>
            <b className="font-semibold text-blue">{wip}</b> In Progress
          </span>
          <span>
            <b className="font-semibold text-slate">{notStarted}</b> Not Started
          </span>
        </div>
      </div>

      <div className="mt-3 border-t border-line-soft pt-2">
        <p className="mb-1 text-[12px] font-semibold tracking-[0.02em] text-faint">
          Work in Progress ({openArts.length})
        </p>
        {PROCESSES.map((p) => (
          <ProcessRow
            key={p}
            count={byStage(p)}
            process={p}
            chip={todayConfidence[p]}
            onClick={() => setOpen(true)}
          />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-3">
        <LinkButton onClick={() => setOpen((o) => !o)}>
          {open ? "Hide workload breakdown" : "View workload breakdown"}
          <Icon d={open ? icons.chevronDown : icons.arrowRight} size={15} />
        </LinkButton>
        <span className="text-[12px] text-faint">{Math.round((completed / pool.length) * 100) || 0}% complete</span>
      </div>

      {open && (
        <div className="mt-3 border-t border-line pt-3">
          <ArticleList articles={openArts} initialVisible={10} />
        </div>
      )}
    </CardShell>
  );
}

export function UpcomingCard({ locationFilter, accountFilter }) {
  const [tab, setTab] = useState("tomorrow");
  const [open, setOpen] = useState(false);
  const filteredAll = useFiltered(locationFilter, accountFilter);

  const group = upcomingGroups.find((g) => g.key === tab);
  const pool = group.articles.filter((a) => filteredAll.includes(a));
  const openArts = pool.filter((a) => a.status !== "Completed");
  const completed = pool.length - openArts.length;
  const effort = openArts.reduce((s, a) => s + a.effortRemaining, 0);
  const byStage = (p) => openArts.filter((a) => a.workStage === p).length;

  // The whole upcoming week (next 7 days, cumulative) for the card headline
  const weekPool = upcomingGroups
    .find((g) => g.key === "next7")
    .articles.filter((a) => filteredAll.includes(a));

  return (
    <CardShell tone="future">
      <CardTitle tone="future">
        {weekPool.length} Upcoming Due
        <InfoTip text="Anticipated downstream load — articles due tomorrow and across the next 7 days, before they become work in hand." />
      </CardTitle>
      <p className="mt-1 text-[13px] leading-[18px] tracking-[0.01em] text-[#4a5580]">
        Forecast for the next 7 days, before this work lands in hand.
      </p>

      <div className="mb-1 mt-3 flex rounded-[4px] border border-[#c5d0ff]/60 bg-white/60 p-[2px] backdrop-blur-[2px]">
        {upcomingGroups.map((g) => (
          <button
            key={g.key}
            onClick={() => setTab(g.key)}
            className={`flex-1 rounded-[3px] px-2 py-[5px] text-[13px] font-semibold leading-4 transition-colors ${
              tab === g.key
                ? "bg-gradient-to-r from-blue-soft to-[#ebe8ff] text-blue"
                : "text-muted hover:bg-chip"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mt-1 text-[13px] leading-[18px] text-muted">
        <b className="font-semibold text-ink">{pool.length}</b> articles · ~{effort}h expected workload
        {completed > 0 && ` · ${completed} already completed`}
      </p>

      <div className="mt-3 flex flex-col gap-[6px]">
        <InterpChip tone={group.confidence.tone} className="self-start italic">
          Confidence: {group.confidence.text}
        </InterpChip>
        <InterpChip tone={group.readiness.tone} className="self-start italic">
          Capacity: {group.readiness.text}
        </InterpChip>
      </div>

      <div className="mt-3 border-t border-line-soft pt-2">
        {PROCESSES.map((p) => (
          <div key={p} className="flex items-center justify-between py-[3px] text-[13px]">
            <span className="text-slate">{p}</span>
            <span className="font-semibold text-ink">{byStage(p)}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-3">
        <LinkButton onClick={() => setOpen((o) => !o)}>
          {open ? "Hide forecast detail" : "Explore forecast"}
          <Icon d={open ? icons.chevronDown : icons.arrowRight} size={15} />
        </LinkButton>
        <span className="text-[12px] text-faint">Group by customer, location or process</span>
      </div>

      {open && (
        <div className="mt-3 border-t border-line pt-3">
          <ArticleList articles={pool} allowGroup initialVisible={10} />
        </div>
      )}
    </CardShell>
  );
}
