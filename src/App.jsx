import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dail-planner-react-v2";
const LEGACY_STORAGE_KEY = "dail-planner-react-v1";

const NAV_ITEMS = [
  { key: "dashboard", label: "대시보드", icon: "◆" },
  { key: "calendar", label: "캘린더", icon: "▦" },
  { key: "ideas", label: "아이디어", icon: "✎" },
];

const TYPE_LABEL = { reel: "릴스", carousel: "캐러셀" };
const STATUS_LABEL = {
  planning: "기획",
  making: "제작 중",
  waiting: "업로드 대기",
  done: "완료",
};
const STATUS_ORDER = ["planning", "making", "waiting", "done"];

const BRAND_KEYWORDS = ["우주", "창작", "기록", "용기"];
const BRAND_MESSAGE = "꾸준히 창작하는 사람의 기록";
const BRAND_QUOTE = "우주를 통해 계속 창작할 용기를 전합니다.";

const CHECKLIST_ITEMS = [
  { id: "c1", label: "콘텐츠 목적이 명확한가?" },
  { id: "c2", label: "다일의 캐릭터와 핵심 메시지에 맞는가?" },
  { id: "c3", label: "구체적인 타깃 한 사람을 향하고 있는가?" },
  { id: "c4", label: "첫 3초 안에 시선을 끌 수 있는가?" },
  { id: "c5", label: "자연스러운 CTA가 들어가 있는가?" },
  { id: "c6", label: "처음 보는 사람도 다일이 누구인지 이해할 수 있는가?" },
  { id: "c7", label: "대사가 군더더기 없이 명확한가?" },
  { id: "c8", label: "자막이 안전 영역 안에 있는가?" },
  { id: "c9", label: "화면 전환 속도가 적절한가?" },
  { id: "c10", label: "목소리가 깨끗하게 녹음되었는가?" },
  { id: "c11", label: "릴스의 무드와 톤이 통일되었는가?" },
  { id: "c12", label: "고화질 업로드를 설정했는가?" },
  { id: "c13", label: "영상에 자막을 달았는가?" },
];

function emptyChecklist() {
  return CHECKLIST_ITEMS.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {});
}

function checklistProgress(checklist) {
  const state = checklist || {};
  const checked = CHECKLIST_ITEMS.filter((item) => state[item.id]).length;
  return { checked, total: CHECKLIST_ITEMS.length, pct: Math.round((checked / CHECKLIST_ITEMS.length) * 100) };
}

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function shiftMonth(key, amount) {
  let [year, month] = key.split("-").map(Number);
  month += amount;
  if (month < 1) {
    month = 12;
    year -= 1;
  }
  if (month > 12) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [year, month] = key.split("-");
  return `${year}년 ${Number(month)}월`;
}

function selectedDateText(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${days[date.getDay()]}요일`;
}

function isBrandContent(item) {
  return (item.purpose || "").includes("브랜드");
}

function defaultSeedItems() {
  const base = {
    checklist: emptyChecklist(),
  };
  const raw = [
    {
      id: "seed-01",
      date: "2026-08-04",
      type: "reel",
      series: "다일의 노트 #01",
      title: "왜 저는 계속 우주를 그릴까요?",
      purpose: "브랜드 구축 · 팬 형성",
      target: "감성적인 그림과 작가의 생각을 좋아하는 사람",
      hook: "왜 저는 계속 우주를 그릴까요?",
      message: "우주는 고민을 작게 바라보게 하고, 다시 한 걸음 내디딜 용기를 주는 공간입니다.",
      structure: "노트 → 생각 → 작업 과정 → 완성 그림",
      cta: "여러분에게도 마음이 편안해지는 '우주' 같은 존재가 있나요?",
      status: "planning",
    },
    {
      id: "seed-02",
      date: "2026-08-06",
      type: "carousel",
      series: "창작노트 #01",
      title: "퇴근 후에도 그림을 계속 그릴 수 있었던 작은 습관",
      purpose: "저장 · 팔로워 유입",
      target: "퇴근 후 그림을 그리고 싶지만 지쳐서 시작하지 못하는 직장인 창작자",
      hook: "퇴근하면 그림 그릴 힘이 없었습니다.",
      message: "10분만 앉기, 완성보다 시작하기, 작은 단위로 이어가기.",
      structure: "문제 → 작은 변화 → 실천 방법 → 경험 → 제안",
      cta: "저장해두고 오늘 10분만 시작해보세요.",
      status: "planning",
    },
    {
      id: "seed-03",
      date: "2026-08-09",
      type: "reel",
      series: "우주 그림",
      title: "노을이 있는 우주",
      purpose: "도달 · 신규 유입",
      target: "따뜻한 감성 일러스트와 짧은 응원 문장을 좋아하는 사람",
      hook: "긴 장마가 끝난 뒤, 하늘을 올려다봤어요.",
      message: "평범한 날에도 아름다운 장면은 찾아옵니다.",
      structure: "노을 장면 → 드로잉 과정 → 완성 → 메시지",
      cta: "오늘 본 가장 예쁜 장면을 댓글로 알려주세요.",
      status: "planning",
    },
    {
      id: "seed-04",
      date: "2026-08-11",
      type: "reel",
      series: "창작자의 하루",
      title: "회사원이지만 그림을 포기하지 않는 이유",
      purpose: "팬 형성 · 인물 브랜딩",
      target: "일과 좋아하는 일을 함께 이어가고 싶은 직장인",
      hook: "퇴근했습니다. 그래도 오늘 그림을 그립니다.",
      message: "잘 그리는 사람보다 계속 그리는 사람이 되고 싶습니다.",
      structure: "퇴근 → 책상 → 짧은 작업 → 완성",
      cta: "퇴근 후에도 이어가고 있는 일이 있나요?",
      status: "planning",
    },
    {
      id: "seed-05",
      date: "2026-08-13",
      type: "carousel",
      series: "창작노트 #02",
      title: "그림이 늘지 않을 때 제가 바꾼 한 가지",
      purpose: "저장 · 공유",
      target: "실력이 늘지 않는 것 같아 지친 그림 초보",
      hook: "그림이 늘지 않는다고 느낄 때, 저는 이것부터 바꿨습니다.",
      message: "완성도에 집착하기보다 그리는 빈도를 늘렸습니다.",
      structure: "고민 → 과거 방식 → 바꾼 점 → 변화 → 제안",
      cta: "조급해질 때 다시 볼 수 있도록 저장해두세요.",
      status: "planning",
    },
    {
      id: "seed-06",
      date: "2026-08-16",
      type: "reel",
      series: "우주 그림",
      title: "별과 함께하는 밤",
      purpose: "도달 · 팔로워 유입",
      target: "잔잔한 그림과 위로가 필요한 사람",
      hook: "오늘 밤, 생각이 너무 많다면.",
      message: "생각을 멈출 수 없다면 좋은 가능성을 더 오래 떠올려보세요.",
      structure: "밤 장면 → 드로잉 → 별 → 메시지",
      cta: "이런 그림과 문장을 계속 보고 싶다면 함께해 주세요.",
      status: "planning",
    },
    {
      id: "seed-07",
      date: "2026-08-18",
      type: "reel",
      series: "다일의 노트 #02",
      title: "완벽보다 꾸준함을 선택한 이유",
      purpose: "브랜드 구축 · 팬 형성",
      target: "완벽하게 해야 한다는 생각 때문에 창작을 미루는 사람",
      hook: "완벽하게 그리고 싶어서, 오히려 그리지 못했습니다.",
      message: "부족한 한 장을 계속 쌓는 것이 완벽한 한 장을 기다리는 것보다 나를 멀리 데려갑니다.",
      structure: "노트 → 실패 경험 → 생각 변화 → 그림 → 질문",
      cta: "여러분은 완벽과 꾸준함 중 무엇을 선택하고 싶나요?",
      status: "planning",
    },
    {
      id: "seed-08",
      date: "2026-08-20",
      type: "carousel",
      series: "창작노트 #03",
      title: "그림 아이디어가 없을 때 제가 하는 방법",
      purpose: "저장 · 노하우 공유",
      target: "무엇을 그릴지 몰라 빈 화면 앞에서 멈추는 창작자",
      hook: "아이디어가 없을 때, 억지로 상상하지 않습니다.",
      message: "일상 관찰 → 사진 → 한 줄 메모 → 우주 요소 결합 → 작은 스케치.",
      structure: "문제 → 5단계 방법 → 실제 예시 → 정리",
      cta: "다음에 막힐 때 꺼내볼 수 있도록 저장해두세요.",
      status: "planning",
    },
    {
      id: "seed-09",
      date: "2026-08-23",
      type: "reel",
      series: "우주 그림",
      title: "우주 속 작은 행성",
      purpose: "도달 · 참여",
      target: "다일의 우주 세계관과 캐릭터를 좋아할 잠재 팔로워",
      hook: "이 작은 행성에는 어떤 이야기가 살고 있을까요?",
      message: "작고 평범한 존재에게도 저마다의 우주가 있습니다.",
      structure: "행성 스케치 → 디테일 → 완성 → 이름 짓기",
      cta: "이 행성에 이름을 붙여주세요.",
      status: "planning",
    },
    {
      id: "seed-10",
      date: "2026-08-25",
      type: "reel",
      series: "창작자의 하루",
      title: "예전의 나에게 해주고 싶은 말",
      purpose: "팬 형성 · 공감 댓글",
      target: "시작이 늦었다고 느끼거나 자신의 창작을 의심하는 사람",
      hook: "그림을 다시 시작하던 나에게 말해주고 싶어요.",
      message: "느려도 멈추지 않으면 결국 나만의 길이 만들어집니다.",
      structure: "과거 기록 → 현재 작업 → 메시지 → 질문",
      cta: "과거의 나에게 해주고 싶은 한마디가 있나요?",
      status: "planning",
    },
    {
      id: "seed-11",
      date: "2026-08-27",
      type: "carousel",
      series: "창작노트 #04",
      title: "그림을 오래 그리는 사람들의 공통점",
      purpose: "저장 · 공유 · 팔로워 유입",
      target: "꾸준히 그리고 싶지만 쉽게 지치는 초보 창작자",
      hook: "오래 그리는 사람은 매일 의욕적인 사람이 아니었습니다.",
      message: "작게 시작하기 · 쉬는 날 허용하기 · 기록하기 · 비교 줄이기 · 다시 돌아오기.",
      structure: "오해 → 공통점 5가지 → 경험 → 제안",
      cta: "오래 그리고 싶은 친구와 공유해 주세요.",
      status: "planning",
    },
    {
      id: "seed-12",
      date: "2026-08-30",
      type: "reel",
      series: "8월 회고",
      title: "이번 달에도 계속 그렸습니다",
      purpose: "브랜드 강화 · 기존 팔로워 관계 형성",
      target: "한 달 동안 다일의 콘텐츠를 함께 본 팔로워",
      hook: "8월에도 완벽하진 않았지만, 계속 그렸습니다.",
      message: "작은 기록이 쌓여 한 달의 세계가 됩니다.",
      structure: "8월 작업 모음 → 가장 좋아하는 그림 → 노트 한 줄 → 질문",
      cta: "8월에 가장 기억에 남은 그림이나 이야기를 알려주세요.",
      status: "planning",
    },
  ];
  return raw.map((item) => ({ ...base, checklist: emptyChecklist(), ...item }));
}

function createInitialState() {
  return {
    currentMonth: "2026-08",
    selectedDate: "2026-08-04",
    tab: "dashboard",
    items: defaultSeedItems(),
    ideas: [],
  };
}

function normalizeItem(raw) {
  return {
    id: raw.id || uid(),
    date: raw.date || localDateString(),
    type: raw.type === "reel" ? "reel" : "carousel",
    series: raw.series || "",
    title: raw.title || "",
    purpose: raw.purpose || "",
    target: raw.target || "",
    hook: raw.hook || "",
    message: raw.message || raw.notes || "",
    structure: raw.structure || "",
    cta: raw.cta || "",
    status: STATUS_ORDER.includes(raw.status)
      ? raw.status
      : raw.status === "planned"
      ? "planning"
      : raw.status === "progress"
      ? "making"
      : raw.status === "done"
      ? "done"
      : "planning",
    checklist: { ...emptyChecklist(), ...(raw.checklist || {}) },
  };
}

function loadState() {
  const fallback = createInitialState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        currentMonth: parsed.currentMonth || fallback.currentMonth,
        selectedDate: parsed.selectedDate || fallback.selectedDate,
        tab: NAV_ITEMS.some((n) => n.key === parsed.tab) ? parsed.tab : "dashboard",
        items: Array.isArray(parsed.items) ? parsed.items.map(normalizeItem) : [],
        ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      };
    }

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return {
        ...fallback,
        currentMonth: parsed.currentMonth || fallback.currentMonth,
        selectedDate: parsed.selectedDate || fallback.selectedDate,
        items: Array.isArray(parsed.items) && parsed.items.length
          ? parsed.items.map(normalizeItem)
          : fallback.items,
        ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
}

function Sidebar({ tab, onChangeTab }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="eyebrow">DAIL CONTENT SYSTEM</div>
        <h1>다일 플래너</h1>
        <p>아이디어를 모으고, 날짜를 정하고,<br />꾸준히 세상에 꺼내놓는 공간</p>
      </div>
      <nav className="side-nav">
        {NAV_ITEMS.map((navItem) => (
          <button
            key={navItem.key}
            className={`side-nav-btn ${tab === navItem.key ? "active" : ""}`}
            onClick={() => onChangeTab(navItem.key)}
          >
            <span className="nav-icon">{navItem.icon}</span>
            {navItem.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

function MobileNav({ tab, onChangeTab }) {
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map((navItem) => (
        <button
          key={navItem.key}
          className={`mobile-nav-btn ${tab === navItem.key ? "active" : ""}`}
          onClick={() => onChangeTab(navItem.key)}
        >
          <span className="nav-icon">{navItem.icon}</span>
          <span>{navItem.label}</span>
        </button>
      ))}
    </nav>
  );
}

function Dashboard({ planner, onSelectContent, onGoCalendar }) {
  const monthItems = useMemo(
    () => planner.items.filter((item) => item.date.startsWith(planner.currentMonth)),
    [planner.items, planner.currentMonth]
  );

  const total = monthItems.length;
  const done = monthItems.filter((item) => item.status === "done").length;
  const remaining = total - done;
  const brandCount = monthItems.filter(isBrandContent).length;

  const today = localDateString();
  const upcoming = useMemo(
    () =>
      planner.items
        .filter((item) => item.date >= today && item.status !== "done")
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [planner.items, today]
  );

  const monthNumber = Number(planner.currentMonth.split("-")[1]);

  return (
    <div className="page dashboard-page">
      <div className="page-head">
        <div className="eyebrow">DASHBOARD</div>
        <h2>대시보드</h2>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">{monthNumber}월 전체 콘텐츠 수</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">완료 콘텐츠 수</div>
          <div className="stat-value stat-green">{done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">남은 콘텐츠 수</div>
          <div className="stat-value stat-purple">{remaining}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">브랜드 콘텐츠 수</div>
          <div className="stat-value">{brandCount}</div>
        </div>
      </div>

      <section className="dash-section">
        <div className="dash-section-head">
          <h3>다가오는 콘텐츠</h3>
          <button className="text-link" onClick={onGoCalendar}>캘린더 보기</button>
        </div>
        <div className="content-list">
          {upcoming.length === 0 ? (
            <div className="empty">다가오는 콘텐츠가 없어요.</div>
          ) : (
            upcoming.map((item) => (
              <button
                key={item.id}
                className={`content-card ${item.status === "done" ? "done" : ""}`}
                onClick={() => onSelectContent(item)}
              >
                <div className="content-top">
                  <span className={`badge ${item.type}`}>{TYPE_LABEL[item.type]}</span>
                  <span className="status">{STATUS_LABEL[item.status]}</span>
                  <span className="content-date">{item.date.slice(5)}</span>
                </div>
                <div className="content-title">{item.title || "(제목 없음)"}</div>
                {item.series && <div className="content-series">{item.series}</div>}
              </button>
            ))
          )}
        </div>
      </section>

      <section className="brand-card">
        <div className="brand-message">"{BRAND_MESSAGE}"</div>
        <div className="brand-keywords">
          {BRAND_KEYWORDS.map((keyword) => (
            <span className="keyword-chip" key={keyword}>#{keyword}</span>
          ))}
        </div>
        <div className="brand-quote">{BRAND_QUOTE}</div>
      </section>
    </div>
  );
}

function Calendar({ currentMonth, selectedDate, items, onSelectDate }) {
  const days = useMemo(() => {
    const [year, month] = currentMonth.split("-").map(Number);
    const first = new Date(year, month - 1, 1);
    const start = new Date(year, month - 1, 1 - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dateString = localDateString(date);

      return {
        date,
        dateString,
        inMonth: date.getMonth() === month - 1,
        items: items.filter((item) => item.date === dateString),
      };
    });
  }, [currentMonth, items]);

  return (
    <div className="calendar-grid">
      {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
        <div className="dow" key={day}>{day}</div>
      ))}

      {days.map(({ date, dateString, inMonth, items: dayItems }) => {
        const className = [
          "day",
          !inMonth ? "outside" : "",
          dateString === localDateString() ? "today" : "",
          dateString === selectedDate ? "selected" : "",
        ].filter(Boolean).join(" ");

        return (
          <button
            className={className}
            key={dateString}
            onClick={() => onSelectDate(dateString)}
            aria-label={`${date.getMonth() + 1}월 ${date.getDate()}일`}
          >
            <span className="day-number">{date.getDate()}</span>
            <span className="dots">
              {dayItems.slice(0, 3).map((item) => (
                <span
                  className={`dot ${item.status === "done" ? "done" : item.type}`}
                  key={item.id}
                />
              ))}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CalendarPage({ planner, updatePlanner, selectDate, onOpenContent }) {
  const selectedItems = planner.items.filter((item) => item.date === planner.selectedDate);

  return (
    <div className="page">
      <div className="calendar-card">
        <div className="calendar-toolbar">
          <div className="month-control">
            <button
              className="nav-btn"
              onClick={() =>
                updatePlanner((current) => ({
                  ...current,
                  currentMonth: shiftMonth(current.currentMonth, -1),
                }), false)
              }
            >‹</button>
            <div className="month-label">{monthLabel(planner.currentMonth)}</div>
            <button
              className="nav-btn"
              onClick={() =>
                updatePlanner((current) => ({
                  ...current,
                  currentMonth: shiftMonth(current.currentMonth, 1),
                }), false)
              }
            >›</button>
          </div>

          <button
            className="today-btn"
            onClick={() => {
              const today = localDateString();
              updatePlanner((current) => ({
                ...current,
                selectedDate: today,
                currentMonth: today.slice(0, 7),
              }), false);
            }}
          >오늘</button>
        </div>

        <Calendar
          currentMonth={planner.currentMonth}
          selectedDate={planner.selectedDate}
          items={planner.items}
          onSelectDate={selectDate}
        />

        <div className="legend">
          <span><i className="dot reel" /> 릴스</span>
          <span><i className="dot carousel" /> 캐러셀</span>
          <span><i className="dot done" /> 완료</span>
        </div>
      </div>

      <section className="selected-panel">
        <div className="selected-head">
          <div className="selected-date">{selectedDateText(planner.selectedDate)}</div>
          <button className="small-add" onClick={() => onOpenContent()}>+ 콘텐츠</button>
        </div>

        <div className="content-list">
          {selectedItems.length === 0 ? (
            <div className="empty">
              이날 예정된 콘텐츠가 없어요.<br />
              위의 추가 버튼을 눌러 계획해보세요.
            </div>
          ) : (
            selectedItems.map((item) => {
              const progress = checklistProgress(item.checklist);
              return (
                <button
                  className={`content-card ${item.status === "done" ? "done" : ""}`}
                  key={item.id}
                  onClick={() => onOpenContent(item)}
                >
                  <div className="content-top">
                    <span className={`badge ${item.type}`}>{TYPE_LABEL[item.type]}</span>
                    <span className="status">{STATUS_LABEL[item.status]}</span>
                  </div>
                  {item.series && <div className="content-series">{item.series}</div>}
                  <div className="content-title">{item.title || "(제목 없음)"}</div>
                  <div className="mini-progress">
                    <div className="mini-progress-bar">
                      <div className="mini-progress-fill" style={{ width: `${progress.pct}%` }} />
                    </div>
                    <span className="mini-progress-text">{progress.checked}/{progress.total}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function IdeasPage({ planner, ideaInput, setIdeaInput, addIdea, deleteIdea, onConvertIdea }) {
  return (
    <div className="page ideas-page">
      <div className="page-head">
        <div className="eyebrow">IDEA INBOX</div>
        <h2>아이디어 인박스</h2>
      </div>

      <section className="idea-panel">
        <div className="idea-head">
          <div>떠오른 생각을 빠르게 남겨보세요</div>
          <span className="idea-count">{planner.ideas.length}개</span>
        </div>

        <div className="idea-input-row">
          <input
            value={ideaInput}
            onChange={(event) => setIdeaInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addIdea();
            }}
            placeholder="콘텐츠 아이디어를 빠르게 적어보세요"
          />
          <button onClick={addIdea}>추가</button>
        </div>

        <div className="idea-list">
          {planner.ideas.length === 0 ? (
            <div className="empty">아직 저장한 아이디어가 없어요.</div>
          ) : (
            planner.ideas.map((idea) => (
              <div className="idea-item" key={idea.id}>
                <div className="idea-text">{idea.title}</div>
                <div className="idea-actions">
                  <button className="mini-btn" onClick={() => onConvertIdea(idea)}>콘텐츠로 만들기</button>
                  <button className="mini-btn danger" onClick={() => deleteIdea(idea.id)}>삭제</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function ContentModal({ open, item, defaultDate, prefill, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      date: item?.date || defaultDate,
      type: item?.type || "carousel",
      series: item?.series || "",
      title: item?.title || prefill || "",
      purpose: item?.purpose || "",
      target: item?.target || "",
      hook: item?.hook || "",
      message: item?.message || "",
      structure: item?.structure || "",
      cta: item?.cta || "",
      status: item?.status || "planning",
      checklist: { ...emptyChecklist(), ...(item?.checklist || {}) },
    });
  }, [open, item, defaultDate, prefill]);

  if (!open || !form) return null;

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const toggleCheck = (id) => {
    setForm((current) => ({
      ...current,
      checklist: { ...current.checklist, [id]: !current.checklist[id] },
    }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim() });
  };

  const progress = checklistProgress(form.checklist);

  return (
    <div
      className="modal show"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="sheet" onSubmit={submit}>
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <h2>{item ? "콘텐츠 수정" : "콘텐츠 추가"}</h2>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>

        <label className="field">
          <span>콘텐츠 제목</span>
          <input
            autoFocus
            value={form.title}
            onChange={update("title")}
            placeholder="콘텐츠 제목을 입력하세요"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>업로드 날짜</span>
            <input type="date" value={form.date} onChange={update("date")} />
          </label>
          <label className="field">
            <span>콘텐츠 형식</span>
            <select value={form.type} onChange={update("type")}>
              <option value="reel">릴스</option>
              <option value="carousel">캐러셀</option>
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>시리즈명</span>
            <input value={form.series} onChange={update("series")} placeholder="예: 창작노트 #01" />
          </label>
          <label className="field">
            <span>작업 상태</span>
            <select value={form.status} onChange={update("status")}>
              {STATUS_ORDER.map((key) => (
                <option key={key} value={key}>{STATUS_LABEL[key]}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>목적</span>
          <input value={form.purpose} onChange={update("purpose")} placeholder="예: 브랜드 구축 · 팬 형성" />
        </label>

        <label className="field">
          <span>타깃</span>
          <input value={form.target} onChange={update("target")} placeholder="이 콘텐츠가 향하는 한 사람" />
        </label>

        <label className="field">
          <span>첫 3초 후킹</span>
          <textarea value={form.hook} onChange={update("hook")} placeholder="첫 3초 안에 시선을 끌 문장" />
        </label>

        <label className="field">
          <span>핵심 메시지</span>
          <textarea value={form.message} onChange={update("message")} placeholder="이 콘텐츠가 전하고 싶은 메시지" />
        </label>

        <label className="field">
          <span>콘텐츠 구성</span>
          <textarea value={form.structure} onChange={update("structure")} placeholder="예: 문제 → 변화 → 실천 → 제안" />
        </label>

        <label className="field">
          <span>CTA</span>
          <textarea value={form.cta} onChange={update("cta")} placeholder="댓글, 저장, 공유 등 원하는 행동" />
        </label>

        <div className="checklist-section">
          <div className="checklist-head">
            <span>업로드 전 체크리스트</span>
            <span className="checklist-pct">{progress.pct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.pct}%` }} />
          </div>
          <div className="checklist-count">{progress.checked}개 체크 / {progress.total}개 전체</div>
          <div className="checklist-list">
            {CHECKLIST_ITEMS.map((checkItem) => (
              <label className="checklist-item" key={checkItem.id}>
                <input
                  type="checkbox"
                  checked={!!form.checklist[checkItem.id]}
                  onChange={() => toggleCheck(checkItem.id)}
                />
                <span>{checkItem.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="sheet-actions">
          {item ? (
            <button className="delete-btn" type="button" onClick={onDelete}>삭제</button>
          ) : <span />}
          <div className="sheet-actions-right">
            <button className="cancel-btn" type="button" onClick={onClose}>취소</button>
            <button className="save-btn" type="submit">저장</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  const [planner, setPlanner] = useState(loadState);
  const [ideaInput, setIdeaInput] = useState("");
  const [modal, setModal] = useState({
    open: false,
    editingId: null,
    sourceIdeaId: null,
    prefill: "",
    defaultDate: null,
  });
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
  }, [planner]);

  const editingItem = planner.items.find((item) => item.id === modal.editingId) || null;

  const showToast = () => {
    setToastVisible(true);
    window.clearTimeout(window.dailToastTimer);
    window.dailToastTimer = window.setTimeout(() => setToastVisible(false), 1100);
  };

  const updatePlanner = (updater, notify = true) => {
    setPlanner((current) => (typeof updater === "function" ? updater(current) : updater));
    if (notify) showToast();
  };

  const changeTab = (tab) => {
    setPlanner((current) => ({ ...current, tab }));
  };

  const selectDate = (dateString) => {
    updatePlanner((current) => ({
      ...current,
      selectedDate: dateString,
      currentMonth: dateString.slice(0, 7),
    }), false);
  };

  const openModal = ({ editingId = null, sourceIdeaId = null, prefill = "", defaultDate = null } = {}) => {
    setModal({ open: true, editingId, sourceIdeaId, prefill, defaultDate });
  };

  const closeModal = () => {
    setModal({ open: false, editingId: null, sourceIdeaId: null, prefill: "", defaultDate: null });
  };

  const saveContent = (form) => {
    updatePlanner((current) => {
      const items = editingItem
        ? current.items.map((item) => (item.id === editingItem.id ? { ...item, ...form } : item))
        : [...current.items, { id: uid(), ...form }];

      return {
        ...current,
        items,
        ideas: modal.sourceIdeaId
          ? current.ideas.filter((idea) => idea.id !== modal.sourceIdeaId)
          : current.ideas,
        selectedDate: form.date,
        currentMonth: form.date.slice(0, 7),
      };
    });
    closeModal();
  };

  const deleteContent = () => {
    if (!editingItem) return;
    if (!window.confirm(`"${editingItem.title}"을 삭제할까요?`)) return;

    updatePlanner((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== editingItem.id),
    }));
    closeModal();
  };

  const addIdea = () => {
    const title = ideaInput.trim();
    if (!title) return;

    updatePlanner((current) => ({
      ...current,
      ideas: [{ id: uid(), title }, ...current.ideas],
    }));
    setIdeaInput("");
  };

  const deleteIdea = (id) => {
    updatePlanner((current) => ({
      ...current,
      ideas: current.ideas.filter((idea) => idea.id !== id),
    }));
  };

  const convertIdea = (idea) => {
    openModal({ sourceIdeaId: idea.id, prefill: idea.title, defaultDate: planner.selectedDate });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(planner, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dail-planner-${localDateString()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openFromDashboard = (item) => {
    setPlanner((current) => ({ ...current, selectedDate: item.date, currentMonth: item.date.slice(0, 7) }));
    openModal({ editingId: item.id });
  };

  return (
    <>
      <div className="shell">
        <Sidebar tab={planner.tab} onChangeTab={changeTab} />

        <div className="main-col">
          <header className="topbar">
            <div className="topbar-title">
              {NAV_ITEMS.find((n) => n.key === planner.tab)?.label}
            </div>
            <button className="backup-btn" onClick={exportData} title="데이터 백업">⇩</button>
          </header>

          <main className="app">
            {planner.tab === "dashboard" && (
              <Dashboard
                planner={planner}
                onSelectContent={openFromDashboard}
                onGoCalendar={() => changeTab("calendar")}
              />
            )}

            {planner.tab === "calendar" && (
              <CalendarPage
                planner={planner}
                updatePlanner={updatePlanner}
                selectDate={selectDate}
                onOpenContent={(item) =>
                  item
                    ? openModal({ editingId: item.id })
                    : openModal({ defaultDate: planner.selectedDate })
                }
              />
            )}

            {planner.tab === "ideas" && (
              <IdeasPage
                planner={planner}
                ideaInput={ideaInput}
                setIdeaInput={setIdeaInput}
                addIdea={addIdea}
                deleteIdea={deleteIdea}
                onConvertIdea={convertIdea}
              />
            )}
          </main>
        </div>
      </div>

      <MobileNav tab={planner.tab} onChangeTab={changeTab} />

      {planner.tab !== "ideas" && (
        <button
          className="fab"
          onClick={() => openModal({ defaultDate: planner.selectedDate })}
          aria-label="콘텐츠 추가"
        >+</button>
      )}

      <ContentModal
        open={modal.open}
        item={editingItem}
        defaultDate={modal.defaultDate || planner.selectedDate}
        prefill={modal.prefill}
        onClose={closeModal}
        onSave={saveContent}
        onDelete={deleteContent}
      />

      <div className={`toast ${toastVisible ? "show" : ""}`}>저장되었습니다</div>
    </>
  );
}
