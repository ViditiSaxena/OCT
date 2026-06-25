import { Link, useNavigate, useParams } from "react-router-dom";
import {
  articleById,
  employeeById,
  employeeRecommendations,
  fmtDate,
} from "../data/data.js";
import {
  Badge,
  Card,
  capacityTone,
  Icon,
  icons,
  InterpChip,
  LinkButton,
  MiniBars,
  ProgressBar,
  riskTone,
  SectionLabel,
  Sparkline,
} from "../components/ui.jsx";

function WorkList({ title, items, emptyText }) {
  return (
    <div>
      <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.02em] text-faint">
        {title} ({items.length})
      </p>
      {items.length === 0 && <p className="pb-2 text-[13px] text-muted">{emptyText}</p>}
      <div className="flex flex-col gap-1">
        {items.map((a) => (
          <Link
            key={a.id}
            to={`/article/${a.id}`}
            className="flex items-center justify-between gap-2 rounded-[4px] border border-line-soft px-3 py-2 text-[13px] hover:border-blue hover:bg-blue-wash"
          >
            <span className="font-semibold text-blue">{a.id}</span>
            <span className="min-w-0 flex-1 truncate text-muted">{a.title}</span>
            <span className="shrink-0 text-muted">
              {a.workStage} · {a.status === "Completed" ? "Done" : `due ${fmtDate(a.dueOffset)}`}
            </span>
            <Badge tone={riskTone(a.risk)} className="!px-1.5 !text-[10px]">
              {a.risk}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const emp = employeeById[id];

  if (!emp) {
    return (
      <main className="mx-auto max-w-[960px] px-6 py-12 text-center">
        <p className="text-[15px] text-muted">Employee not found.</p>
        <LinkButton onClick={() => navigate("/")}>Back to workspace</LinkButton>
      </main>
    );
  }

  const work = emp.articles.map((aid) => articleById[aid]);
  const overdue = work.filter((a) => a.bucket === "overdue");
  const dueToday = work.filter((a) => a.bucket === "today");
  const completedToday = emp.status === "Present" ? Math.max(1, Math.round(emp.assignedHours / 3)) : 0;
  const planned = emp.plannedArticles.map((aid) => articleById[aid]);
  const recs = employeeRecommendations(emp);
  const initials = emp.name
    .split(" ")
    .map((p) => p[0])
    .join("");

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-5">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 inline-flex items-center gap-1 text-[13px] font-semibold text-blue hover:underline"
      >
        <Icon d={icons.arrowLeft} size={15} />
        Back to planning workspace
      </button>

      {/* Overview */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#614655] text-[16px] font-semibold text-white">
            {initials}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold leading-6 text-slate">{emp.name}</h1>
              <Badge tone={capacityTone(emp.capacityStatus)}>{emp.capacityStatus}</Badge>
            </div>
            <p className="mt-[2px] text-[14px] text-muted">
              {emp.role} · {emp.team} · {emp.process} · {emp.location} · {emp.shift}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[4px] bg-canvas px-4 py-3">
          <p className="text-[12px] uppercase tracking-[0.02em] text-faint">
            Utilization
            <b className="block text-[20px] font-semibold normal-case tracking-normal text-ink">
              {emp.utilization}%
            </b>
          </p>
          <div className="w-40">
            <ProgressBar
              segments={[
                { value: Math.min(emp.assignedHours, 8), tone: emp.assignedHours > 8 ? "warn" : "blue" },
                { value: Math.max(8 - emp.assignedHours, 0), tone: "neutral" },
              ]}
            />
            <p className="mt-1 text-[12px] text-muted">
              {emp.assignedHours}h assigned · {Math.max(8 - emp.assignedHours, 0)}h free
              {emp.overtimeHours > 0 && (
                <b className="font-semibold text-orange"> · {emp.overtimeHours}h overtime</b>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* AI recommendations */}
      <Card className="mt-5 flex items-start gap-3 border-l-4 !border-l-blue px-5 py-4">
        <span className="mt-[2px] flex size-7 shrink-0 items-center justify-center rounded-[4px] bg-blue-soft text-blue">
          <Icon d={icons.sparkle} size={16} />
        </span>
        <div>
          <SectionLabel className="!text-[13px]">AI Recommendations</SectionLabel>
          <div className="mt-1 flex flex-col gap-1">
            {recs.map((r, i) => (
              <InterpChip key={i} tone={r.tone} className="self-start">
                {r.text}
              </InterpChip>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
        {/* Current work */}
        <Card className="flex flex-col gap-4 px-5 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <SectionLabel className="!text-[13px]">Current Work</SectionLabel>
            <span className="text-[12px] text-faint">
              {completedToday} completed today · {work.length} in hand · {planned.length} planned for tomorrow
            </span>
          </div>
          <WorkList title="Overdue" items={overdue} emptyText="No overdue items. " />
          <WorkList title="Due today" items={dueToday} emptyText="Nothing due today." />
          <WorkList
            title="Planned for tomorrow"
            items={planned.slice(0, 5)}
            emptyText="No anticipated load assigned yet."
          />
        </Card>

        <div className="flex flex-col gap-5">
          {/* Capacity numbers */}
          <Card className="px-5 pb-5 pt-4">
            <SectionLabel className="mb-3 !text-[13px]">Capacity</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Available hours", `${emp.availableHours}h`],
                ["Assigned hours", `${emp.assignedHours}h`],
                ["Overtime hours", `${emp.overtimeHours}h`],
                ["Leave status", emp.status === "Present" ? "Working today" : emp.status],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[4px] bg-canvas px-3 py-3">
                  <p className="text-[12px] uppercase tracking-[0.02em] text-faint">{k}</p>
                  <p className="text-[18px] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Trends */}
          <Card className="px-5 pb-5 pt-4">
            <SectionLabel className="mb-3 !text-[13px]">Trends · Last 7 Days</SectionLabel>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-slate">Utilization</p>
                  <p className="text-[12px] text-muted">avg {Math.round(emp.trends.utilization.reduce((s, v) => s + v, 0) / 7)}%</p>
                </div>
                <Sparkline data={emp.trends.utilization} tone="blue" width={170} height={36} />
              </div>
              <div className="flex items-center justify-between border-t border-line-soft pt-3">
                <div>
                  <p className="text-[13px] font-semibold text-slate">Productivity</p>
                  <p className="text-[12px] text-muted">vs. team baseline</p>
                </div>
                <Sparkline data={emp.trends.productivity} tone="ok" width={170} height={36} />
              </div>
              <div className="flex items-center justify-between border-t border-line-soft pt-3">
                <div>
                  <p className="text-[13px] font-semibold text-slate">Workload</p>
                  <p className="text-[12px] text-muted">articles per day</p>
                </div>
                <MiniBars data={emp.trends.workload} tone="blue" width={170} height={36} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
