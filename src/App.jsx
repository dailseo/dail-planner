import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dail-planner-react-v1";

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

function createInitialState() {
  const today = localDateString();
  return {
    currentMonth: today.slice(0, 7),
    selectedDate: today,
    items: [],
    ideas: [],
  };
}

function loadState() {
  const fallback = createInitialState();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return {
      currentMonth: parsed.currentMonth || fallback.currentMonth,
      selectedDate: parsed.selectedDate || fallback.selectedDate,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
    };
  } catch {
    return fallback;
  }
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

function ContentModal({ open, item, defaultDate, prefill, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: "",
    type: "carousel",
    status: "planned",
    date: defaultDate,
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      title: item?.title || prefill || "",
      type: item?.type || "carousel",
      status: item?.status || "planned",
      date: item?.date || defaultDate,
      notes: item?.notes || "",
    });
  }, [open, item, defaultDate, prefill]);

  if (!open) return null;

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...form, title: form.title.trim(), notes: form.notes.trim() });
  };

  return (
    <div className="modal show" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <form className="sheet" onSubmit={submit}>
        <div className="sheet-grabber" />
        <div className="sheet-head">
          <h2>{item ? "콘텐츠 수정" : "콘텐츠 추가"}</h2>
          <button className="close-btn" type="button" onClick={onClose}>×</button>
        </div>

        <label className="field">
          <span>제목</span>
          <input
            autoFocus
            value={form.title}
            onChange={update("title")}
            placeholder="콘텐츠 제목을 입력하세요"
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>형식</span>
            <select value={form.type} onChange={update("type")}>
              <option value="carousel">캐러셀</option>
              <option value="reel">릴스</option>
            </select>
          </label>

          <label className="field">
            <span>상태</span>
            <select value={form.status} onChange={update("status")}>
              <option value="planned">예정</option>
              <option value="progress">작업 중</option>
              <option value="done">완료</option>
            </select>
          </label>
        </div>

        <label className="field">
          <span>날짜</span>
          <input type="date" value={form.date} onChange={update("date")} />
        </label>

        <label className="field">
          <span>메모</span>
          <textarea
            value={form.notes}
            onChange={update("notes")}
            placeholder="핵심 메시지, CTA, 촬영 메모 등을 적어보세요"
          />
        </label>

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
  });
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
  }, [planner]);

  const selectedItems = planner.items.filter(
    (item) => item.date === planner.selectedDate
  );
  const editingItem = planner.items.find(
    (item) => item.id === modal.editingId
  ) || null;

  const showToast = () => {
    setToastVisible(true);
    window.clearTimeout(window.dailToastTimer);
    window.dailToastTimer = window.setTimeout(() => setToastVisible(false), 1100);
  };

  const updatePlanner = (updater, notify = true) => {
    setPlanner((current) => typeof updater === "function" ? updater(current) : updater);
    if (notify) showToast();
  };

  const selectDate = (dateString) => {
    updatePlanner((current) => ({
      ...current,
      selectedDate: dateString,
      currentMonth: dateString.slice(0, 7),
    }), false);
  };

  const openModal = ({ editingId = null, sourceIdeaId = null, prefill = "" } = {}) => {
    setModal({ open: true, editingId, sourceIdeaId, prefill });
  };

  const closeModal = () => {
    setModal({ open: false, editingId: null, sourceIdeaId: null, prefill: "" });
  };

  const saveContent = (form) => {
    updatePlanner((current) => {
      const items = editingItem
        ? current.items.map((item) =>
            item.id === editingItem.id ? { ...item, ...form } : item
          )
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

  const exportData = () => {
    const blob = new Blob([JSON.stringify(planner, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dail-planner-${localDateString()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <main className="app">
        <header className="header">
          <div>
            <div className="eyebrow">DAIL CONTENT SYSTEM</div>
            <h1>콘텐츠 플래너</h1>
            <p>아이디어를 모으고, 날짜를 정하고,<br />꾸준히 세상에 꺼내놓는 공간</p>
          </div>
          <button className="backup-btn" onClick={exportData} title="데이터 백업">⇩</button>
        </header>

        <div className="desktop-grid">
          <section>
            <div className="calendar-card">
              <div className="calendar-toolbar">
                <div className="month-control">
                  <button
                    className="nav-btn"
                    onClick={() => updatePlanner((current) => ({
                      ...current,
                      currentMonth: shiftMonth(current.currentMonth, -1),
                    }), false)}
                  >‹</button>
                  <div className="month-label">{monthLabel(planner.currentMonth)}</div>
                  <button
                    className="nav-btn"
                    onClick={() => updatePlanner((current) => ({
                      ...current,
                      currentMonth: shiftMonth(current.currentMonth, 1),
                    }), false)}
                  >›</button>
                </div>

                <button className="today-btn" onClick={() => {
                  const today = localDateString();
                  updatePlanner((current) => ({
                    ...current,
                    selectedDate: today,
                    currentMonth: today.slice(0, 7),
                  }), false);
                }}>오늘</button>
              </div>

              <Calendar
                currentMonth={planner.currentMonth}
                selectedDate={planner.selectedDate}
                items={planner.items}
                onSelectDate={selectDate}
              />
            </div>
          </section>

          <div className="right-column">
            <section className="selected-panel">
              <div className="selected-head">
                <div className="selected-date">{selectedDateText(planner.selectedDate)}</div>
                <button className="small-add" onClick={() => openModal()}>+ 콘텐츠</button>
              </div>

              <div className="content-list">
                {selectedItems.length === 0 ? (
                  <div className="empty">
                    이날 예정된 콘텐츠가 없어요.<br />
                    위의 추가 버튼을 눌러 계획해보세요.
                  </div>
                ) : selectedItems.map((item) => {
                  const status = {
                    planned: "예정",
                    progress: "작업 중",
                    done: "완료",
                  }[item.status];

                  return (
                    <button
                      className={`content-card ${item.status === "done" ? "done" : ""}`}
                      key={item.id}
                      onClick={() => openModal({ editingId: item.id })}
                    >
                      <div className="content-top">
                        <span className={`badge ${item.type}`}>
                          {item.type === "carousel" ? "캐러셀" : "릴스"}
                        </span>
                        <span className="status">{status}</span>
                      </div>
                      <div className="content-title">{item.title}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="idea-panel">
              <div className="idea-head">
                <div>
                  <div className="section-kicker">IDEA INBOX</div>
                  <h2>떠오른 생각</h2>
                </div>
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
                {planner.ideas.map((idea) => (
                  <div className="idea-item" key={idea.id}>
                    <div className="idea-text">{idea.title}</div>
                    <div className="idea-actions">
                      <button
                        className="mini-btn"
                        onClick={() => openModal({
                          sourceIdeaId: idea.id,
                          prefill: idea.title,
                        })}
                      >일정</button>
                      <button
                        className="mini-btn"
                        onClick={() => updatePlanner((current) => ({
                          ...current,
                          ideas: current.ideas.filter((entry) => entry.id !== idea.id),
                        }))}
                      >삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <button className="fab" onClick={() => openModal()} aria-label="콘텐츠 추가">+</button>

      <ContentModal
        open={modal.open}
        item={editingItem}
        defaultDate={planner.selectedDate}
        prefill={modal.prefill}
        onClose={closeModal}
        onSave={saveContent}
        onDelete={deleteContent}
      />

      <div className={`toast ${toastVisible ? "show" : ""}`}>저장되었습니다</div>
    </>
  );
}
