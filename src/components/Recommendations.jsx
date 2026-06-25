import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { articleById, employeeById, fmtDate, recommendations } from "../data/data.js";
import { Badge, Card, Icon, icons, LinkButton } from "./ui.jsx";

const toneBadge = {
  action: { tone: "info", label: "Recommended action" },
  watch: { tone: "warn", label: "Watch" },
  ok: { tone: "ok", label: "On track" },
};

function RecommendationModal({ rec, onClose }) {
  const navigate = useNavigate();
  const arts = rec.articles.map((id) => articleById[id]);
  const emps = rec.employees.map((id) => employeeById[id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[10vh]"
      onClick={onClose}
    >
      <div
        className="anim-in w-full max-w-[560px] rounded-[4px] border border-line-soft bg-white shadow-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-start gap-2">
            <span className="mt-[2px] flex size-7 shrink-0 items-center justify-center rounded-[4px] bg-blue-soft text-blue">
              <Icon d={icons.sparkle} size={16} />
            </span>
            <div>
              <p className="text-[16px] font-semibold leading-[22px] text-ink">{rec.headline}</p>
              <p className="mt-1 text-[13px] leading-[18px] text-muted">{rec.why}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-[4px] p-1 text-muted hover:bg-chip" aria-label="Close">
            <Icon d={icons.close} size={16} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          {arts.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.02em] text-faint">
                Articles involved ({arts.length})
              </p>
              <div className="flex flex-col gap-1">
                {arts.slice(0, 6).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => navigate(`/article/${a.id}`)}
                    className="flex items-center justify-between rounded-[4px] border border-line-soft px-2 py-[6px] text-left text-[13px] hover:border-blue hover:bg-blue-wash"
                  >
                    <span className="font-semibold text-blue">{a.id}</span>
                    <span className="text-muted">
                      {a.workStage} · due {fmtDate(a.dueOffset)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {emps.length > 0 && (
            <div>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.02em] text-faint">
                Capacity to use ({emps.length})
              </p>
              <div className="flex flex-col gap-1">
                {emps.slice(0, 6).map((e) => (
                  <button
                    key={e.id}
                    onClick={() => navigate(`/employee/${e.id}`)}
                    className="flex items-center justify-between rounded-[4px] border border-line-soft px-2 py-[6px] text-left text-[13px] hover:border-blue hover:bg-blue-wash"
                  >
                    <span className="font-semibold text-slate">{e.name}</span>
                    <span className="text-green">{8 - e.assignedHours}h free</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {arts.length === 0 && emps.length === 0 && (
            <p className="text-[13px] text-muted sm:col-span-2">
              No reallocation needed. This is an informational forecast — capacity is sufficient as planned.
            </p>
          )}
        </div>

        <div className="border-t border-line bg-canvas px-5 py-3">
          <span className="text-[13px] text-muted">
            Expected impact: <b className="font-semibold text-ink">{rec.impact}</b>
          </span>
        </div>
      </div>
    </div>
  );
}

export function AiOverviewTrigger({ open, onToggle }) {
  const count = recommendations.length;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`AI Overview - ${count} Recommendations`}
      className={`group/ai fixed top-[64px] z-40 flex items-center justify-center rounded-bl-[8px] border-b border-l border-white/20 py-4 pl-3 pr-3 shadow-pop transition-all ${
        open
          ? "right-[min(100%,400px)] bg-blue-deep lg:right-[380px]"
          : "right-0 bg-gradient-to-b from-[#1c40ca] via-[#5b7bff] to-[#1c40ca] hover:brightness-105"
      }`}
    >
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute right-full mr-3 whitespace-nowrap rounded-[4px] bg-ink px-3 py-2 text-[12px] font-semibold normal-case leading-4 tracking-normal text-white opacity-0 shadow-pop transition-all duration-150 group-hover/ai:visible group-hover/ai:opacity-100"
      >
        AI Overview - {count} Recommendations
        <span className="absolute -right-1 top-1/2 size-2 -translate-y-1/2 rotate-45 bg-ink" />
      </span>
      <Icon d={icons.sparkle} size={22} className="text-white" strokeWidth={2} />
    </button>
  );
}

export function AiOverviewPanel({ open, onClose }) {
  const [selected, setSelected] = useState(null);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={onClose} aria-hidden="true" />

      <aside
        className="anim-in fixed inset-y-0 right-0 z-40 flex w-full max-w-[400px] flex-col border-l border-line-soft bg-canvas shadow-pop lg:relative lg:inset-auto lg:sticky lg:top-[52px] lg:z-auto lg:h-[calc(100vh-52px)] lg:w-[380px] lg:max-w-none lg:shrink-0 lg:shadow-none"
        aria-label="AI Overview"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 bg-gradient-to-r from-[#1c40ca] via-[#5b7bff] to-[#1c40ca] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-[4px] bg-white/15 text-white">
              <Icon d={icons.sparkle} size={16} />
            </span>
            <div>
              <p className="text-[15px] font-semibold leading-5 text-white">AI Overview</p>
              <p className="text-[11px] leading-4 text-white/75">
                {recommendations.length} recommendations · refreshed 3 mins ago
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[4px] p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close AI Overview"
          >
            <Icon d={icons.close} size={16} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {recommendations.map((rec) => {
            const t = toneBadge[rec.tone];
            return (
              <Card key={rec.id} className="flex flex-col gap-2 px-4 pb-3 pt-3">
                <Badge tone={t.tone}>{t.label}</Badge>
                <p className="text-[14px] font-semibold leading-[19px] text-slate">{rec.headline}</p>
                <p className="text-[12px] leading-[17px] text-muted">{rec.why}</p>
                <div className="pt-1">
                  <LinkButton onClick={() => setSelected(rec)}>
                    {rec.action}
                    <Icon d={icons.arrowRight} size={14} />
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      </aside>

      {selected && <RecommendationModal rec={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
