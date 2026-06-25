import { useState } from "react";
import { AiOverviewPanel, AiOverviewTrigger } from "../components/Recommendations.jsx";
import { OverdueCard, DueTodayCard, UpcomingCard } from "../components/PlanningSection.jsx";
import { ACCOUNTS, OPERATIONS_LOCATIONS } from "../data/data.js";
import { LocationCards, EmployeeGrid, CapacityHeader } from "../components/CapacitySection.jsx";
import { GhostButton, Icon, icons, Select } from "../components/ui.jsx";

export default function Home() {
  const [accountFilter, setAccountFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);

  const accountOptions = [
    { value: "All", label: "All accounts" },
    ...ACCOUNTS.map((account) => ({ value: account, label: account })),
  ];
  const locationOptions = [
    { value: "All", label: "All operations" },
    ...OPERATIONS_LOCATIONS.map((location) => ({ value: location, label: location })),
  ];

  return (
    <div className="flex">
      <main className="mx-auto min-w-0 flex-1 max-w-[1440px] px-4 pb-12 pt-5 sm:px-6">
        {/* Page header */}
        <div className="mb-4 border-b border-line pb-3">
          <h1 className="text-[26px] font-semibold leading-8 tracking-[-0.26px] text-ink">
            Let's Plan!
          </h1>
          <p className="mt-1 text-[15px] font-semibold leading-6 text-muted">
            Last updated 3 mins ago. Workspace refreshes after every 30 mins.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Select
              label="Account:"
              value={accountFilter ?? "All"}
              onChange={(value) => setAccountFilter(value === "All" ? null : value)}
              options={accountOptions}
            />
            <Select
              label="Operations:"
              value={locationFilter ?? "All"}
              onChange={(value) => setLocationFilter(value === "All" ? null : value)}
              options={locationOptions}
            />
            {(accountFilter || locationFilter) && (
              <GhostButton
                onClick={() => {
                  setAccountFilter(null);
                  setLocationFilter(null);
                }}
              >
                Clear filters
                <Icon d={icons.close} size={12} />
              </GhostButton>
            )}
          </div>
        </div>

        {/* SECTION 1 — PLANNING */}
        <section className="mb-8">
          <div className="grid items-stretch gap-4 lg:grid-cols-3">
            <OverdueCard locationFilter={locationFilter} accountFilter={accountFilter} />
            <DueTodayCard locationFilter={locationFilter} accountFilter={accountFilter} />
            <UpcomingCard locationFilter={locationFilter} accountFilter={accountFilter} />
          </div>
        </section>

        {/* SECTION 2 — CAPACITY */}
        <section className="rounded-[4px] bg-canvas px-4 py-5">
          <CapacityHeader
            locationFilter={locationFilter}
            accountFilter={accountFilter}
            onClear={() => {
              setAccountFilter(null);
              setLocationFilter(null);
            }}
          />
          <div className="mb-5">
            <LocationCards
              selected={locationFilter}
              accountFilter={accountFilter}
              onSelect={setLocationFilter}
            />
          </div>
          <EmployeeGrid locationFilter={locationFilter} accountFilter={accountFilter} />
        </section>
      </main>

      <AiOverviewPanel open={aiOpen} onClose={() => setAiOpen(false)} />
      <AiOverviewTrigger open={aiOpen} onToggle={() => setAiOpen((o) => !o)} />
    </div>
  );
}
