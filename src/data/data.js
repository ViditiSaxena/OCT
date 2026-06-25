// Deterministic sample data for the Ops Control Tower prototype.
// Everything is generated from a fixed seed so the prototype is stable
// across reloads, and capacity numbers are derived from real assignments.

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260610);
const int = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

export const TODAY = new Date(2026, 5, 10); // June 10, 2026

export function dateFor(offset) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + offset);
  return d;
}

export function fmtDate(offset) {
  return dateFor(offset).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const PROCESSES = ["Pre-editing", "Copyediting", "QC"];
export const STAGES = ["Received", "Pre-editing", "Copyediting", "QC", "Delivered"];

export const ACCOUNTS = ["WKH", "Wiley", "Elsevier", "ACS", "RSC", "AIP", "Karger", "DG"];
export const OPERATIONS_LOCATIONS = ["Chennai", "Coimbatore"];

export const BACKLOG_PRODUCTION_STAGES = ["AuthorProof", "AAProof", "Final Deliverables"];

export const BACKLOG_STATUSES = ["Held", "WIP", "Pause", "In query"];
export const BACKLOG_CRITICAL_OVERDUE_DAYS = 100;

export function isBacklogCriticalOverdue(article) {
  return article.dueOffset <= -BACKLOG_CRITICAL_OVERDUE_DAYS;
}

export const BACKLOG_DEPARTMENTS = {
  "Copy Editing": ["PREEDIT", "SERVERXMLERROR", "TEX5PREEDIT", "FILETRANSMUTERERROR"],
  Graphics: ["GRAPHICSINSTRUCTION", "GRAPHICSNORMALIZATION", "GVTOOL-LITEERROR"],
  "Language Editing": ["LE", "TEX5LE"],
  Login: ["PACKAGINGTOOLERROR", "PDFSECURITYERROR"],
  Normalization: ["TEXNORMALIZATION"],
  Pagination: ["LATEXSUPPORT-1", "PGNSUPPORT-1", "TEX5PAGINATION", "TEX5PGNCORR-1"],
  "PI Support": ["CUToolError"],
  "Process Tools": ["ALTTEXTCOMBINE", "AUTOTTI", "PCPROOF"],
  "Quality Control": ["CORRECTIONCHECK-1", "QC"],
  XML: ["XMLREVIEW"],
};

const BACKLOG_DEPT_KEYS = Object.keys(BACKLOG_DEPARTMENTS);

const TOPICS = [
  "Genomic variation in coastal microbial ecosystems",
  "Deep learning approaches to protein folding prediction",
  "Thermal stability of perovskite solar cells",
  "Post-operative outcomes in minimally invasive cardiac surgery",
  "Urban heat islands and adaptive infrastructure planning",
  "CRISPR-mediated gene regulation in plant pathology",
  "Quantum error correction in superconducting circuits",
  "Behavioral economics of household energy consumption",
  "Microplastic transport in freshwater river systems",
  "Federated learning for privacy-preserving diagnostics",
  "Catalytic conversion of CO2 to liquid fuels",
  "Neural correlates of working memory under stress",
  "Supply chain resilience in semiconductor manufacturing",
  "Antimicrobial resistance patterns in clinical isolates",
  "Soil carbon sequestration under regenerative agriculture",
  "Edge computing architectures for autonomous vehicles",
];

const FIRST = [
  "Aarav", "Priya", "Karthik", "Divya", "Suresh", "Meena", "Rahul", "Anitha",
  "Vikram", "Lakshmi", "Arjun", "Kavya", "Manoj", "Sneha", "Ravi", "Deepa",
  "Sanjay", "Pooja", "Naveen", "Shruti", "Ganesh", "Nandini", "Praveen", "Revathi",
  "Ashok", "Janani", "Dinesh", "Swathi", "Mohan", "Keerthi", "Vignesh", "Ramya",
  "Bharath", "Sindhu", "Gopal", "Charu",
];
const LAST = [
  "Krishnan", "Subramanian", "Iyer", "Nair", "Menon", "Pillai", "Raman", "Sharma",
  "Venkatesh", "Natarajan", "Srinivasan", "Murthy", "Reddy", "Rao", "Gupta", "Verma",
];

const TEAMS = ["Team Alpha", "Team Beta", "Team Gamma"];
const SHIFTS = ["Morning (6 AM–3 PM)", "General (9 AM–6 PM)", "Evening (2 PM–11 PM)"];

const ROLE_BY_PROCESS = {
  "Pre-editing": ["Pre-editor", "Senior Pre-editor"],
  Copyediting: ["Copyeditor", "Senior Copyeditor"],
  QC: ["QC Specialist", "QC Lead"],
};

// ---------------------------------------------------------------- Employees

function buildEmployees() {
  const list = [];
  let idx = 0;

  const make = (location, process, status) => {
    const name = `${FIRST[idx % FIRST.length]} ${LAST[idx % LAST.length]}`;
    idx += 1;
    return {
      id: `EMP-${String(idx).padStart(2, "0")}`,
      name,
      location,
      process,
      status, // Present | On Leave | Absent
      role: pick(ROLE_BY_PROCESS[process]),
      team: TEAMS[idx % 3],
      shift: SHIFTS[idx % 3],
      availableHours: status === "Present" ? 8 : 0,
      assignedHours: 0,
      overtimeHours: 0,
      articles: [],
      plannedArticles: [],
      trends: {
        utilization: Array.from({ length: 7 }, () => int(55, 108)),
        productivity: Array.from({ length: 7 }, () => int(70, 112)),
        workload: Array.from({ length: 7 }, () => int(3, 9)),
      },
    };
  };

  // Chennai: 20 people — 2 on leave, 1 absent, 17 present
  const chennaiPlan = [
    ["Pre-editing", 4],
    ["Copyediting", 7],
    ["QC", 9],
  ];
  const chennai = [];
  chennaiPlan.forEach(([proc, n]) => {
    for (let i = 0; i < n; i++) chennai.push(make("Chennai", proc, "Present"));
  });
  chennai[1].status = "On Leave";
  chennai[6].status = "On Leave";
  chennai[12].status = "Absent";
  chennai.forEach((e) => {
    if (e.status !== "Present") e.availableHours = 0;
  });

  // Coimbatore: 16 people — 1 absent, 15 present
  const cbePlan = [
    ["Pre-editing", 4],
    ["Copyediting", 5],
    ["QC", 7],
  ];
  const cbe = [];
  cbePlan.forEach(([proc, n]) => {
    for (let i = 0; i < n; i++) cbe.push(make("Coimbatore", proc, "Present"));
  });
  cbe[7].status = "Absent";
  cbe.forEach((e) => {
    if (e.status !== "Present") e.availableHours = 0;
  });

  list.push(...chennai, ...cbe);
  return list;
}

export const employees = buildEmployees();

// ----------------------------------------------------------------- Articles

let articleSeq = 4500;

function makeArticle({ bucket, dueOffset, stage, status }) {
  articleSeq += 1;
  const priority =
    bucket === "overdue"
      ? pick(["High", "High", "Medium"])
      : pick(["High", "Medium", "Medium", "Low"]);
  let effort = 0;
  if (status !== "Completed") {
    effort =
      stage === "Pre-editing" ? int(1, 3) : stage === "Copyediting" ? int(2, 4) : int(1, 2);
    if (bucket === "overdue") effort += 1;
  }
  let risk = "Low";
  if (bucket === "overdue") {
    risk = priority === "High" || effort >= 4 ? "High" : "Medium";
  } else if (dueOffset === 0 && status !== "Completed") {
    risk = status === "Not Started" ? "High" : effort >= 4 ? "Medium" : "Low";
  } else if (dueOffset === 1 && status === "Not Started") {
    risk = pick(["Medium", "Low", "Low"]);
  }
  const account = pick(ACCOUNTS);
  return {
    id: `TNQ-${articleSeq}`,
    title: pick(TOPICS),
    account,
    customer: account,
    journal: `${pick(["JOCN", "IJMS", "BMCG", "PLOS", "NEUR", "CHEM", "ECOL", "JAMA"])}-${int(100, 999)}`,
    bucket, // overdue | today | tomorrow | next3 | next7
    dueOffset,
    stage: status === "Completed" ? "Delivered" : stage,
    workStage: stage, // process the work sits in (or sat in)
    status, // Completed | In Progress | Not Started
    priority,
    effortRemaining: effort,
    risk,
    owner: null,
    location: null,
  };
}

function makeBacklogArticle({ productionStage, dueOffset, backlogStatus, atRisk }) {
  const department = pick(BACKLOG_DEPT_KEYS);
  const processName = pick(BACKLOG_DEPARTMENTS[department]);
  const workStage = pick(PROCESSES);
  const article = makeArticle({
    bucket: "overdue",
    dueOffset,
    stage: workStage,
    status: "In Progress",
  });
  const daysInProduction = int(4, 18);
  const status = backlogStatus ?? pick(BACKLOG_STATUSES);
  return {
    ...article,
    productionStage,
    department,
    processName,
    daysInProduction,
    status,
    atRisk:
      atRisk ??
      (article.priority === "High" || dueOffset <= -3 || daysInProduction >= 14),
  };
}

function buildArticles() {
  const all = [];
  const push = (n, args) => {
    for (let i = 0; i < n; i++) all.push(makeArticle(args));
  };

  // Backlog: 10 — 2 AuthorProof, 5 AAProof, 3 Final Deliverables
  all.push(
    makeBacklogArticle({
      productionStage: "AuthorProof",
      dueOffset: -112,
      backlogStatus: "In query",
      atRisk: true,
    }),
    makeBacklogArticle({
      productionStage: "AuthorProof",
      dueOffset: -2,
      backlogStatus: "WIP",
    }),
    makeBacklogArticle({
      productionStage: "AAProof",
      dueOffset: -3,
      backlogStatus: "Held",
      atRisk: true,
    }),
    makeBacklogArticle({
      productionStage: "AAProof",
      dueOffset: -2,
      backlogStatus: "WIP",
      atRisk: true,
    }),
    makeBacklogArticle({
      productionStage: "AAProof",
      dueOffset: -1,
      backlogStatus: "WIP",
    }),
    makeBacklogArticle({
      productionStage: "AAProof",
      dueOffset: -134,
      backlogStatus: "Pause",
      atRisk: true,
    }),
    makeBacklogArticle({
      productionStage: "AAProof",
      dueOffset: -1,
      backlogStatus: "Held",
    }),
    makeBacklogArticle({
      productionStage: "Final Deliverables",
      dueOffset: -2,
      backlogStatus: "WIP",
    }),
    makeBacklogArticle({
      productionStage: "Final Deliverables",
      dueOffset: -1,
      backlogStatus: "WIP",
    }),
    makeBacklogArticle({
      productionStage: "Final Deliverables",
      dueOffset: -3,
      backlogStatus: "In query",
      atRisk: true,
    })
  );

  // Due today: 100 — 20 completed; open: 10 PE, 20 CE, 50 QC (8 of these not started)
  push(20, { bucket: "today", dueOffset: 0, stage: "QC", status: "Completed" });
  push(8, { bucket: "today", dueOffset: 0, stage: "Pre-editing", status: "In Progress" });
  push(2, { bucket: "today", dueOffset: 0, stage: "Pre-editing", status: "Not Started" });
  push(17, { bucket: "today", dueOffset: 0, stage: "Copyediting", status: "In Progress" });
  push(3, { bucket: "today", dueOffset: 0, stage: "Copyediting", status: "Not Started" });
  push(47, { bucket: "today", dueOffset: 0, stage: "QC", status: "In Progress" });
  push(3, { bucket: "today", dueOffset: 0, stage: "QC", status: "Not Started" });

  // Due tomorrow: 120 — 2 completed, 88 WIP (10 PE, 20 CE, 58 QC), 30 not started
  push(2, { bucket: "tomorrow", dueOffset: 1, stage: "QC", status: "Completed" });
  push(10, { bucket: "tomorrow", dueOffset: 1, stage: "Pre-editing", status: "In Progress" });
  push(20, { bucket: "tomorrow", dueOffset: 1, stage: "Copyediting", status: "In Progress" });
  push(58, { bucket: "tomorrow", dueOffset: 1, stage: "QC", status: "In Progress" });
  push(18, { bucket: "tomorrow", dueOffset: 1, stage: "Pre-editing", status: "Not Started" });
  push(8, { bucket: "tomorrow", dueOffset: 1, stage: "Copyediting", status: "Not Started" });
  push(4, { bucket: "tomorrow", dueOffset: 1, stage: "QC", status: "Not Started" });

  // Due in 2–3 days: 85
  for (let i = 0; i < 25; i++)
    all.push(makeArticle({ bucket: "next3", dueOffset: int(2, 3), stage: pick(PROCESSES), status: "In Progress" }));
  for (let i = 0; i < 60; i++)
    all.push(makeArticle({ bucket: "next3", dueOffset: int(2, 3), stage: pick(["Pre-editing", "Pre-editing", "Copyediting", "QC"]), status: "Not Started" }));

  // Due in 4–7 days: 110
  for (let i = 0; i < 15; i++)
    all.push(makeArticle({ bucket: "next7", dueOffset: int(4, 7), stage: pick(PROCESSES), status: "In Progress" }));
  for (let i = 0; i < 95; i++)
    all.push(makeArticle({ bucket: "next7", dueOffset: int(4, 7), stage: pick(["Pre-editing", "Pre-editing", "Copyediting", "QC"]), status: "Not Started" }));

  return all;
}

export const articles = buildArticles();

// ------------------------------------------------- Assignment (work in hand)

function assignWork() {
  // Hold two Chennai QC specialists in reserve with a light load, so the
  // workspace always has visible spare QC capacity to reallocate against
  // the overdue queue (this is what the AI layer recommends acting on).
  const chennaiQC = employees.filter(
    (e) => e.location === "Chennai" && e.process === "QC" && e.status === "Present"
  );
  const reserves = chennaiQC.slice(-2);

  // Interleave Chennai/Coimbatore in each queue so early assignments (the
  // overdue queue is assigned first) are spread across both locations.
  const queues = {};
  PROCESSES.forEach((p) => {
    const pool = employees.filter(
      (e) => e.process === p && e.status === "Present" && !reserves.includes(e)
    );
    const chennai = pool.filter((e) => e.location === "Chennai");
    const cbe = pool.filter((e) => e.location === "Coimbatore");
    const mixed = [];
    for (let i = 0; i < Math.max(chennai.length, cbe.length); i++) {
      if (chennai[i]) mixed.push(chennai[i]);
      if (cbe[i]) mixed.push(cbe[i]);
    }
    queues[p] = mixed;
  });
  const cursors = { "Pre-editing": 0, Copyediting: 0, QC: 0 };

  // Reserves each take one small QC item due today
  const lightQC = articles.filter(
    (a) => a.bucket === "today" && a.workStage === "QC" && a.status === "In Progress"
  );
  reserves.forEach((e, i) => {
    const a = lightQC[i];
    a.owner = e.id;
    a.location = e.location;
    e.articles.push(a.id);
    e.assignedHours += a.effortRemaining;
  });

  const nextOwner = (process) => {
    const q = queues[process];
    const e = q[cursors[process] % q.length];
    cursors[process] += 1;
    return e;
  };

  // Work in hand: overdue + due today (open) count toward today's assigned hours
  articles
    .filter((a) => a.dueOffset <= 0 && a.status !== "Completed" && !a.owner)
    .forEach((a) => {
      const e = nextOwner(a.workStage);
      a.owner = e.id;
      a.location = e.location;
      e.articles.push(a.id);
      e.assignedHours += a.effortRemaining;
    });

  // Completed articles still belong to someone (for history)
  articles
    .filter((a) => a.status === "Completed")
    .forEach((a) => {
      const e = nextOwner("QC");
      a.owner = e.id;
      a.location = e.location;
    });

  // Tomorrow's WIP is anticipated load — owned, but not in today's hours
  articles
    .filter((a) => a.dueOffset === 1 && a.status === "In Progress")
    .forEach((a) => {
      const e = nextOwner(a.workStage);
      a.owner = e.id;
      a.location = e.location;
      e.plannedArticles.push(a.id);
    });

  // Later buckets: locations only, assigned at planning time
  articles
    .filter((a) => !a.owner)
    .forEach((a) => {
      a.location = pick(["Chennai", "Coimbatore"]);
    });

  employees.forEach((e) => {
    e.overtimeHours = Math.max(0, e.assignedHours - 8);
    if (e.status === "On Leave") e.capacityStatus = "On Leave";
    else if (e.status === "Absent") e.capacityStatus = "Absent";
    else if (e.assignedHours > 8) e.capacityStatus = "Overloaded";
    else if (e.assignedHours >= 7) e.capacityStatus = "Fully Allocated";
    else e.capacityStatus = "Available";
    e.utilization = e.status === "Present" ? Math.round((e.assignedHours / 8) * 100) : 0;
  });
}

assignWork();

// ------------------------------------------------------------------ Lookups

export const articleById = Object.fromEntries(articles.map((a) => [a.id, a]));
export const employeeById = Object.fromEntries(employees.map((e) => [e.id, e]));

export function employeeServesAccount(employee, accountFilter) {
  if (!accountFilter) return true;
  const ids = [...employee.articles, ...(employee.plannedArticles ?? [])];
  return ids.some((id) => articleById[id]?.account === accountFilter);
}

export function getLocations(accountFilter = null) {
  return OPERATIONS_LOCATIONS.map((loc) => {
    let people = employees.filter((e) => e.location === loc);
    if (accountFilter) people = people.filter((e) => employeeServesAccount(e, accountFilter));
    const present = people.filter((e) => e.status === "Present");
    const leave = people.filter((e) => e.status === "On Leave").length;
    const absent = people.filter((e) => e.status === "Absent").length;
    const capacity = present.length * 8;
    const assigned = present.reduce((s, e) => s + Math.min(e.assignedHours, 8), 0);
    const overtime = present.reduce((s, e) => s + e.overtimeHours, 0);
    const freeHours = capacity - assigned;
    const utilization = Math.round(((assigned + overtime) / capacity) * 100);
    const pressure = utilization > 95 ? "High" : utilization > 85 ? "Elevated" : "Balanced";
    return {
      name: loc,
      total: people.length,
      present: present.length,
      leave,
      absent,
      capacityHours: capacity,
      assignedHours: assigned,
      freeHours,
      overtimeHours: overtime,
      utilization,
      pressure,
    };
  });
}

export const locations = getLocations();

// --------------------------------------------------------- Group narratives

export const overdueInterpretations = {
  "Pre-editing": {
    text: "Likely to miss delivery — inform the client these will be delayed",
    tone: "risk",
  },
  Copyediting: {
    text: "Completion confidence is low for today without intervention",
    tone: "risk",
  },
  QC: {
    text: "Can be completed today with ~3 additional hours of effort",
    tone: "warn",
  },
};

export const todayConfidence = {
  "Pre-editing": { text: "At risk of entering the backlog", tone: "risk" },
  Copyediting: { text: "Needs faster turnaround to complete today", tone: "warn" },
  QC: { text: "Expected to complete today", tone: "ok" },
};

export const upcomingGroups = (() => {
  const make = (key, label, buckets) => {
    const arts = articles.filter((a) => buckets.includes(a.bucket));
    const open = arts.filter((a) => a.status !== "Completed");
    const effort = open.reduce((s, a) => s + a.effortRemaining, 0);
    return { key, label, articles: arts, open: open.length, effortHours: effort };
  };
  const g1 = make("tomorrow", "Due Tomorrow", ["tomorrow"]);
  const g3 = make("next3", "Next 3 Days", ["tomorrow", "next3"]);
  const g7 = make("next7", "Next 7 Days", ["tomorrow", "next3", "next7"]);

  g1.confidence = { text: "On track — most articles already in QC", tone: "ok" };
  g1.readiness = { text: "Current capacity can absorb this workload", tone: "ok" };
  g3.confidence = { text: "Pre-editing intake is heavier than usual", tone: "warn" };
  g3.readiness = { text: "QC demand may exceed available capacity on Friday", tone: "warn" };
  g7.confidence = { text: "Forecast stable; intake within normal range", tone: "ok" };
  g7.readiness = { text: "Additional allocation may be required mid-next week", tone: "warn" };
  return [g1, g3, g7];
})();

// ------------------------------------------------------- AI recommendations

function buildRecommendations() {
  const overdueQC = articles.filter((a) => a.bucket === "overdue" && a.workStage === "QC");
  const availQCChennai = employees.filter(
    (e) => e.process === "QC" && e.location === "Chennai" && e.capacityStatus === "Available"
  );
  const availableAll = employees.filter((e) => e.capacityStatus === "Available");
  const overdueAll = articles.filter((a) => a.bucket === "overdue");

  const cePeople = employees.filter((e) => e.process === "Copyediting" && e.status === "Present");
  const ceCapacity = cePeople.length * 8;
  const ceDemand = articles
    .filter((a) => a.dueOffset <= 0 && a.status !== "Completed" && a.workStage === "Copyediting")
    .reduce((s, a) => s + a.effortRemaining, 0);
  const cePct = Math.max(1, Math.round(((ceDemand - ceCapacity * 0.62) / (ceCapacity * 0.62)) * 100));

  const highRiskToday = articles.filter((a) => a.dueOffset === 0 && a.risk === "High");

  return [
    {
      id: "rec-1",
      tone: "action",
      headline: `${overdueQC.length} overdue QC articles can be completed today by reallocating capacity from Chennai.`,
      why: `${availQCChennai.length} QC specialists in Chennai have ${availQCChennai.reduce((s, e) => s + (8 - e.assignedHours), 0)}h of unassigned capacity today. Routing the overdue QC queue to them clears it before the 6 PM cut-off.`,
      action: "Review reallocation plan",
      articles: overdueQC.map((a) => a.id),
      employees: availQCChennai.map((e) => e.id),
      impact: "Eliminates all overdue QC risk today",
    },
    {
      id: "rec-2",
      tone: "watch",
      headline: `Copyediting workload is projected to exceed available capacity by ${Math.min(cePct, 12)}% today.`,
      why: `${ceDemand}h of copyediting remains against an effective ${Math.round(ceCapacity * 0.62)}h of capacity. Without intervention, ~${Math.ceil(ceDemand * 0.1)} articles will slip into tomorrow's backlog.`,
      action: "View copyediting breakdown",
      articles: articles
        .filter((a) => a.dueOffset === 0 && a.workStage === "Copyediting" && a.status !== "Completed")
        .slice(0, 6)
        .map((a) => a.id),
      employees: cePeople.filter((e) => e.capacityStatus === "Available").map((e) => e.id),
      impact: "Prevents copyediting spill-over into tomorrow",
    },
    {
      id: "rec-3",
      tone: "ok",
      headline: "Tomorrow's workload can be completed without overtime.",
      why: `Forecast demand for tomorrow is ${articles
        .filter((a) => a.dueOffset === 1 && a.status !== "Completed")
        .reduce((s, a) => s + a.effortRemaining, 0)}h against ${
        employees.filter((e) => e.status === "Present").length * 8
      }h of scheduled capacity across both locations. No overtime or weekend allocation is required.`,
      action: "View tomorrow's forecast",
      articles: [],
      employees: [],
      impact: "No action needed — capacity is sufficient",
    },
    {
      id: "rec-4",
      tone: "action",
      headline: `${availableAll.length} employees have available capacity while ${overdueAll.length} overdue articles remain.`,
      why: "Matching free capacity to the overdue queue by process clears Pre-editing and QC overdue items today; Copyediting items need a senior reviewer.",
      action: "Match capacity to overdue queue",
      articles: overdueAll.map((a) => a.id),
      employees: availableAll.slice(0, 6).map((e) => e.id),
      impact: `Clears ${Math.min(availableAll.length * 2, overdueAll.length)} of ${overdueAll.length} overdue articles`,
    },
    {
      id: "rec-5",
      tone: "action",
      headline: `Reassigning ${Math.min(4, highRiskToday.length)} articles can eliminate today's delivery risk.`,
      why: `${highRiskToday.length} articles due today are still high-risk. Moving the ${Math.min(4, highRiskToday.length)} not-started items to available editors removes the risk of a same-day breach.`,
      action: "Review reassignment",
      articles: highRiskToday.slice(0, 4).map((a) => a.id),
      employees: availableAll.slice(0, 4).map((e) => e.id),
      impact: "Removes all same-day delivery risk",
    },
  ];
}

export const recommendations = buildRecommendations();

// --------------------------------------------------------- Article timeline

const TIMELINE_NOTES = {
  Received: "Manuscript received from customer and logged into the workflow.",
  "Pre-editing": "Assigned for structure, reference and metadata normalization.",
  Copyediting: "Language and style edit in progress against customer specification.",
  QC: "Final quality check against delivery checklist.",
  Delivered: "Package delivered to customer portal.",
};

export function buildTimeline(article) {
  const owner = article.owner ? employeeById[article.owner] : null;
  const stageIdx = STAGES.indexOf(article.stage);
  const events = [];
  const startOffset = article.dueOffset - int(3, 6);
  let cursor = startOffset;

  for (let i = 0; i <= stageIdx; i++) {
    const stage = STAGES[i];
    events.push({
      type: i === 0 ? "received" : "stage",
      stage,
      date: fmtDate(Math.min(cursor, 0)),
      note: TIMELINE_NOTES[stage],
      actor: i >= 1 && owner ? owner.name : "Workflow system",
      current: i === stageIdx && article.status !== "Completed",
    });
    cursor += 1;
  }

  if (article.bucket === "overdue") {
    events.push({
      type: "delay",
      stage: article.stage,
      date: fmtDate(article.dueOffset),
      note: `Due date passed with article still in ${article.stage}. Flagged for intervention.`,
      actor: "Workflow system",
    });
    events.push({
      type: "escalation",
      stage: article.stage,
      date: fmtDate(0),
      note: "Escalated to shift lead in daily planning review.",
      actor: "Ops planning",
    });
  }
  if (article.status === "Not Started") {
    events.push({
      type: "note",
      stage: article.stage,
      date: fmtDate(0),
      note: "Awaiting pickup — no active owner session yet today.",
      actor: "Workflow system",
    });
  }
  return events;
}

export function articleAssessment(article) {
  if (article.status === "Completed")
    return { level: "Low risk", tone: "ok", text: "Delivered on schedule. No follow-up required." };
  if (article.bucket === "overdue")
    return {
      level: "High risk of delay",
      tone: "risk",
      text: `Already ${Math.abs(article.dueOffset)} day(s) past due in ${article.stage}. Can recover with reassignment to an available ${article.workStage} specialist — estimated ${article.effortRemaining}h to complete.`,
    };
  if (article.risk === "High")
    return {
      level: "High risk",
      tone: "risk",
      text: `Not started with ${article.effortRemaining}h of ${article.workStage} effort remaining today. Recommend immediate assignment or due-date renegotiation.`,
    };
  if (article.risk === "Medium")
    return {
      level: "Can recover with reassignment",
      tone: "warn",
      text: `${article.effortRemaining}h remaining in ${article.workStage}. Completion is feasible today if turnaround is prioritized this shift.`,
    };
  return {
    level: "Low risk",
    tone: "ok",
    text: "On pace to complete within the expected turnaround window. No intervention required.",
  };
}

export function alternateResources(article) {
  return employees
    .filter(
      (e) =>
        e.process === article.workStage &&
        e.status === "Present" &&
        e.id !== article.owner &&
        e.assignedHours + article.effortRemaining <= 9
    )
    .sort((a, b) => a.assignedHours - b.assignedHours)
    .slice(0, 3);
}

export function employeeRecommendations(emp) {
  const recs = [];
  if (emp.capacityStatus === "Available") {
    recs.push({
      tone: "ok",
      text: `Can take ${8 - emp.assignedHours}h of additional work today. Best fit: ${emp.process} items from the overdue queue.`,
    });
    recs.push({ tone: "ok", text: "Recommended support area: overdue " + emp.process + " articles in " + emp.location + "." });
  }
  if (emp.capacityStatus === "Fully Allocated") {
    recs.push({ tone: "warn", text: "At full allocation — avoid adding work without removing an existing item." });
    recs.push({ tone: "ok", text: "Current queue is achievable within shift if no new escalations arrive." });
  }
  if (emp.capacityStatus === "Overloaded") {
    recs.push({
      tone: "risk",
      text: `Risk of overload: ${emp.assignedHours}h assigned against an 8h day. Candidate for reassignment of ${emp.overtimeHours}h of work.`,
    });
    recs.push({ tone: "warn", text: "Recommend moving lowest-priority article to an available teammate this shift." });
  }
  if (emp.capacityStatus === "On Leave" || emp.capacityStatus === "Absent") {
    recs.push({ tone: "warn", text: "Not available today — assigned work has been redistributed in today's plan." });
  }
  return recs;
}
