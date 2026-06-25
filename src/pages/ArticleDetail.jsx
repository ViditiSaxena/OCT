import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  alternateResources,
  articleAssessment,
  articleById,
  buildTimeline,
  employeeById,
  fmtDate,
  STAGES,
} from "../data/data.js";
import {
  Badge,
  Card,
  Icon,
  icons,
  InterpChip,
  LinkButton,
  PrimaryButton,
  riskTone,
  SectionLabel,
} from "../components/ui.jsx";

function WorkflowProgress({ article }) {
  const currentIdx = STAGES.indexOf(article.stage);
  const owner = article.owner ? employeeById[article.owner] : null;
  return (
    <div>
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const done = i < currentIdx || article.status === "Completed";
          const current = i === currentIdx && article.status !== "Completed";
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`flex size-7 items-center justify-center rounded-full border-2 text-[12px] font-semibold ${
                    done
                      ? "border-green bg-green text-white"
                      : current
                        ? "border-blue bg-blue-soft text-blue"
                        : "border-line-strong bg-white text-faint"
                  }`}
                >
                  {done ? <Icon d={icons.check} size={13} strokeWidth={2.4} /> : i + 1}
                </span>
                <span
                  className={`whitespace-nowrap text-[12px] leading-4 ${
                    current ? "font-semibold text-blue" : done ? "text-slate" : "text-faint"
                  }`}
                >
                  {stage}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`mx-2 mb-5 h-[2px] flex-1 rounded ${i < currentIdx ? "bg-green" : "bg-line"}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid gap-2 rounded-[4px] bg-canvas px-4 py-3 sm:grid-cols-3">
        <p className="text-[13px] text-muted">
          Current stage{" "}
          <b className="block text-[14px] font-semibold text-ink">
            {article.stage}
            {article.status === "Not Started" ? " (awaiting pickup)" : ""}
          </b>
        </p>
        <p className="text-[13px] text-muted">
          Assigned owner{" "}
          <b className="block text-[14px] font-semibold text-ink">
            {owner ? (
              <Link to={`/employee/${owner.id}`} className="text-blue hover:underline">
                {owner.name}
              </Link>
            ) : (
              "Unassigned"
            )}
          </b>
        </p>
        <p className="text-[13px] text-muted">
          Expected completion{" "}
          <b className="block text-[14px] font-semibold text-ink">
            {article.status === "Completed"
              ? "Delivered"
              : article.bucket === "overdue"
                ? `Today, with intervention (+${article.effortRemaining}h)`
                : fmtDate(Math.max(article.dueOffset, 0))}
          </b>
        </p>
      </div>
    </div>
  );
}

const eventStyle = {
  received: { dot: "bg-blue", label: "Received" },
  stage: { dot: "bg-green", label: "Stage transition" },
  delay: { dot: "bg-red", label: "Delay" },
  escalation: { dot: "bg-orange", label: "Escalation" },
  note: { dot: "bg-line-bold", label: "Note" },
};

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = articleById[id];

  const timeline = useMemo(() => (article ? buildTimeline(article) : []), [article]);

  if (!article) {
    return (
      <main className="mx-auto max-w-[960px] px-6 py-12 text-center">
        <p className="text-[15px] text-muted">Article not found.</p>
        <LinkButton onClick={() => navigate("/")}>Back to workspace</LinkButton>
      </main>
    );
  }

  const assessment = articleAssessment(article);
  const owner = article.owner ? employeeById[article.owner] : null;
  const alternates = alternateResources(article);
  const daysRemaining = article.dueOffset;

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
      <div className="border-b border-line pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-semibold leading-6 text-slate">{article.id}</h1>
              <Badge tone={riskTone(article.risk)}>{article.risk} risk</Badge>
              <Badge tone={article.priority === "High" ? "risk" : article.priority === "Medium" ? "warn" : "neutral"}>
                {article.priority} priority
              </Badge>
              {article.status === "Completed" && <Badge tone="ok">Delivered</Badge>}
            </div>
            <p className="mt-1 max-w-[680px] text-[15px] leading-5 text-muted">{article.title}</p>
          </div>
          <PrimaryButton>
            Reassign article
            <Icon d={icons.arrowRight} size={15} />
          </PrimaryButton>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Customer", article.customer],
            ["Journal ref", article.journal],
            ["Current stage", article.stage],
            ["Due date", article.status === "Completed" ? "Met" : fmtDate(article.dueOffset)],
            [
              "Days remaining",
              article.status === "Completed"
                ? "—"
                : daysRemaining < 0
                  ? `${Math.abs(daysRemaining)} day(s) overdue`
                  : daysRemaining === 0
                    ? "Due today"
                    : `${daysRemaining} day(s)`,
            ],
            ["Location", article.location ?? "Unassigned"],
          ].map(([k, v]) => (
            <p key={k} className="text-[12px] uppercase tracking-[0.02em] text-faint">
              {k}
              <b
                className={`block normal-case tracking-normal text-[14px] font-semibold ${
                  k === "Days remaining" && daysRemaining < 0 && article.status !== "Completed"
                    ? "text-red"
                    : "text-ink"
                }`}
              >
                {v}
              </b>
            </p>
          ))}
        </div>
      </div>

      {/* AI assessment */}
      <Card className="mt-5 flex items-start gap-3 border-l-4 !border-l-blue px-5 py-4">
        <span className="mt-[2px] flex size-7 shrink-0 items-center justify-center rounded-[4px] bg-blue-soft text-blue">
          <Icon d={icons.sparkle} size={16} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <SectionLabel className="!text-[13px]">AI Assessment</SectionLabel>
            <InterpChip tone={assessment.tone}>{assessment.level}</InterpChip>
          </div>
          <p className="mt-1 text-[14px] leading-5 text-slate">{assessment.text}</p>
        </div>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Workflow */}
          <Card className="px-5 pb-5 pt-4">
            <SectionLabel className="mb-4 !text-[13px]">Workflow Progress</SectionLabel>
            <WorkflowProgress article={article} />
          </Card>

          {/* Timeline */}
          <Card className="px-5 pb-5 pt-4">
            <SectionLabel className="mb-3 !text-[13px]">Activity Timeline</SectionLabel>
            <div className="flex flex-col">
              {timeline.map((ev, i) => {
                const style = eventStyle[ev.type];
                return (
                  <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < timeline.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-[2px] bg-line-soft" />
                    )}
                    <span className={`relative mt-[5px] size-3 shrink-0 rounded-full ${style.dot}`} />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-[18px]">
                        <b className="font-semibold text-ink">
                          {ev.type === "stage" || ev.type === "received"
                            ? `${ev.stage}${ev.current ? " (current)" : ""}`
                            : style.label}
                        </b>
                        <span className="text-faint"> · {ev.date} · {ev.actor}</span>
                      </p>
                      <p className="text-[13px] leading-[18px] text-muted">{ev.note}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Capacity impact */}
        <Card className="px-5 pb-5 pt-4">
          <SectionLabel className="mb-3 !text-[13px]">Capacity Impact</SectionLabel>

          <div className="mb-3 rounded-[4px] bg-canvas px-3 py-3">
            <p className="text-[12px] uppercase tracking-[0.02em] text-faint">Assigned team</p>
            {owner ? (
              <Link
                to={`/employee/${owner.id}`}
                className="mt-1 flex items-center justify-between rounded-[4px] border border-line-soft bg-white px-3 py-2 hover:border-blue"
              >
                <span>
                  <b className="block text-[14px] font-semibold text-ink">{owner.name}</b>
                  <span className="text-[12px] text-muted">
                    {owner.role} · {owner.location} · {owner.team}
                  </span>
                </span>
                <span className="text-[12px] font-semibold text-muted">{owner.assignedHours}h / 8h</span>
              </Link>
            ) : (
              <p className="mt-1 text-[13px] text-muted">Not yet assigned — scheduled at planning time.</p>
            )}
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-[4px] bg-canvas px-3 py-3">
              <p className="text-[12px] uppercase tracking-[0.02em] text-faint">Effort remaining</p>
              <p className="text-[18px] font-semibold text-ink">{article.effortRemaining}h</p>
            </div>
            <div className="rounded-[4px] bg-canvas px-3 py-3">
              <p className="text-[12px] uppercase tracking-[0.02em] text-faint">Workload impact</p>
              <p className="text-[18px] font-semibold text-ink">
                {article.effortRemaining === 0 ? "None" : article.effortRemaining >= 4 ? "High" : "Moderate"}
              </p>
            </div>
          </div>

          <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.02em] text-faint">
            Suggested alternate resources
          </p>
          {article.status === "Completed" ? (
            <p className="text-[13px] text-muted">Delivered — no reassignment needed.</p>
          ) : alternates.length === 0 ? (
            <p className="text-[13px] text-muted">
              No spare {article.workStage} capacity today. Consider overtime or due-date renegotiation.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {alternates.map((e) => (
                <Link
                  key={e.id}
                  to={`/employee/${e.id}`}
                  className="flex items-center justify-between rounded-[4px] border border-line-soft px-3 py-2 text-[13px] hover:border-blue hover:bg-blue-wash"
                >
                  <span className="font-semibold text-slate">{e.name}</span>
                  <span className="text-muted">
                    {e.location} · <b className="font-semibold text-green">{8 - e.assignedHours}h free</b>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
