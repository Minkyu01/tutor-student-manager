const LESSON_MINUTES_STEP = 30;
const MIN_LESSON_DURATION_MINUTES = 30;
const MAX_LESSON_DURATION_MINUTES = 240;
const DEFAULT_LESSON_DURATION_MINUTES = 120;
const TIMETABLE_START_HOUR = 9;
const TIMETABLE_END_HOUR = 21;
const NOW_LINE_TICK_MS = 15000;

const state = {
  mode: "week",
  activeTab: "schedule",
  currentDate: new Date(),
  students: [],
  lessons: [],
  summary: { canceled: 0, makeup: 0, items: [] },
  writeToken: "",
  studentFilter: "all",
  selectedStudentId: "",
  lessonStatus: "normal",
  lessonDurationMinutes: DEFAULT_LESSON_DURATION_MINUTES,
  restoreNoticeShown: false,
  draggingLessonId: "",
  suppressClicksUntil: 0,
  nowLineTimerId: 0,
};

const el = {
  appShell: document.getElementById("appShell"),
  pinGate: document.getElementById("pinGate"),
  pinGateForm: document.getElementById("pinGateForm"),
  pinGateInput: document.getElementById("pinGateInput"),
  pinGateError: document.getElementById("pinGateError"),

  mainPanel: document.querySelector(".main-panel"),
  mainTitle: document.getElementById("mainTitle"),
  periodLabel: document.getElementById("periodLabel"),
  scheduleNav: document.getElementById("scheduleNav"),
  scheduleView: document.getElementById("scheduleView"),
  studentsView: document.getElementById("studentsView"),

  sectionTabs: [...document.querySelectorAll("#sectionTabs .sidebar-tab")],
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  todayBtn: document.getElementById("todayBtn"),
  modeBtns: [...document.querySelectorAll(".mode-btn")],

  studentSearch: document.getElementById("studentSearch"),
  studentFilterWrap: document.getElementById("studentFilterPills"),
  studentFilterPills: [...document.querySelectorAll("#studentFilterPills .pill")],
  studentList: document.getElementById("studentList"),
  studentRosterCount: document.getElementById("studentRosterCount"),
  studentTableBody: document.getElementById("studentTableBody"),

  summaryToggleBtn: document.getElementById("summaryToggleBtn"),
  summaryItems: document.getElementById("summaryItems"),
  cancelCount: document.getElementById("cancelCount"),
  makeupCount: document.getElementById("makeupCount"),
  timetable: document.getElementById("timetable"),
  toast: document.getElementById("toast"),

  newStudentBtn: document.getElementById("newStudentBtn"),
  studentRegisterBtn: document.getElementById("studentRegisterBtn"),

  studentModal: document.getElementById("studentModal"),
  studentForm: document.getElementById("studentForm"),
  studentId: document.getElementById("studentId"),
  studentName: document.getElementById("studentName"),
  studentPhone: document.getElementById("studentPhone"),
  studentNickname: document.getElementById("studentNickname"),
  studentMemo: document.getElementById("studentMemo"),
  studentActiveCheck: document.getElementById("studentActiveCheck"),
  studentModalTitle: document.getElementById("studentModalTitle"),
  deleteStudentBtn: document.getElementById("deleteStudentBtn"),

  lessonModal: document.getElementById("lessonModal"),
  lessonForm: document.getElementById("lessonForm"),
  lessonId: document.getElementById("lessonId"),
  lessonStudent: document.getElementById("lessonStudent"),
  lessonDate: document.getElementById("lessonDate"),
  lessonTime: document.getElementById("lessonTime"),
  lessonDuration: document.getElementById("lessonDuration"),
  lessonTitle: document.getElementById("lessonTitle"),
  lessonMemo: document.getElementById("lessonMemo"),
  lessonStatusGroup: [...document.querySelectorAll("#lessonStatusGroup .status-btn")],
  lessonModalTitle: document.getElementById("lessonModalTitle"),
  deleteLessonBtn: document.getElementById("deleteLessonBtn"),
  desktopTools: document.getElementById("desktopTools"),
  backupBtn: document.getElementById("backupBtn"),
  restoreBtn: document.getElementById("restoreBtn"),
  checkUpdateBtn: document.getElementById("checkUpdateBtn"),
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function dateOnlyString(d) {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatDateOnly(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return dateOnlyString(d);
}

function timeString(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

function formatWeekdayLabel(date) {
  const weekMap = ["일", "월", "화", "수", "목", "금", "토"];
  return weekMap[date.getDay()];
}

function normalizeLessonDurationMinutes(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes)) return DEFAULT_LESSON_DURATION_MINUTES;
  const rounded = Math.round(minutes / LESSON_MINUTES_STEP) * LESSON_MINUTES_STEP;
  return Math.min(MAX_LESSON_DURATION_MINUTES, Math.max(MIN_LESSON_DURATION_MINUTES, rounded));
}

function toSlotTime(hour, minute = 0) {
  const total = hour * 60 + minute;
  const floored = Math.floor(total / LESSON_MINUTES_STEP) * LESSON_MINUTES_STEP;
  return {
    hour: Math.floor(floored / 60),
    minute: floored % 60,
  };
}

function formatPhone(value) {
  if (!value) return "-";
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value;
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

function rangeFromMode(mode, date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (mode === "week") return [startOfWeek(d), endOfWeek(d)];
  if (mode === "month") {
    const from = new Date(d.getFullYear(), d.getMonth(), 1);
    const to = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    return [from, to];
  }
  const from = new Date(d.getFullYear(), 0, 1);
  const to = new Date(d.getFullYear() + 1, 0, 1);
  return [from, to];
}

function toIso(d) {
  return d.toISOString();
}

function avatarClassById(id = "") {
  const classes = ["avatar-a", "avatar-b", "avatar-c", "avatar-d"];
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash += id.charCodeAt(i);
  return classes[hash % classes.length];
}

function statusLabel(status) {
  if (status === "canceled") return "취소";
  if (status === "makeup") return "보강";
  return "정상";
}

function statusClass(status) {
  if (status === "canceled") return "event-canceled";
  if (status === "makeup") return "event-makeup";
  return "event-normal";
}

function isStudentActive(student) {
  return Number(student?.is_active || 0) === 1;
}

function activeStateLabel(student) {
  return isStudentActive(student) ? "수강중" : "비활성";
}

function showToast(message) {
  el.toast.textContent = message;
  el.toast.classList.remove("hidden");
  setTimeout(() => el.toast.classList.add("hidden"), 1800);
}

function desktopBridge() {
  if (typeof window === "undefined") return null;
  const api = window.timetrackDesktop;
  if (!api || api.isDesktop !== true) return null;
  return api;
}

const DIALOG_CLOSE_MS = 140;

function showDialog(dialog) {
  dialog.classList.remove("is-closing");
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (!dialog?.open || dialog.classList.contains("is-closing")) return;
  dialog.classList.add("is-closing");
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove("is-closing");
  }, DIALOG_CLOSE_MS);
}

async function verifyPin(pin) {
  const res = await fetch("/api/pin/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });
  const data = await res.json().catch(() => ({ error: "PIN 인증 실패" }));
  if (!res.ok) {
    throw data;
  }
  return data;
}

async function openPortalWithPin(pin) {
  const auth = await verifyPin(pin);
  state.writeToken = auth.token;
  el.pinGate.classList.add("hidden");
  el.appShell.classList.remove("hidden");
  await refresh();
  if (!state.restoreNoticeShown) {
    state.restoreNoticeShown = true;
    await showLastRestoreStatus();
  }
}

async function showLastRestoreStatus() {
  const api = desktopBridge();
  if (!api) return;

  try {
    const result = await api.getLastRestoreResult();
    if (!result || result.pending) return;
    if (result.ok) {
      showToast(result.message || "백업 복원이 완료되었습니다.");
      return;
    }
    alert(result.message || "백업 복원 처리 중 오류가 발생했습니다.");
  } catch (_error) {
    // Ignore status lookup failures.
  }
}

function bindDesktopUpdateStatus() {
  const api = desktopBridge();
  if (!api || typeof api.onUpdateStatus !== "function") return;

  api.onUpdateStatus(async (payload) => {
    const stage = payload?.stage;
    if (stage === "checking") {
      showToast("업데이트 확인 중...");
      return;
    }
    if (stage === "available") {
      showToast(`새 버전(${payload.version || "latest"}) 다운로드 중...`);
      return;
    }
    if (stage === "downloading") {
      const percent = Number(payload.percent || 0);
      if (percent >= 1) showToast(`업데이트 다운로드 ${Math.round(percent)}%`);
      return;
    }
    if (stage === "downloaded") {
      const shouldInstall = confirm(
        `업데이트(${payload.version || "latest"}) 다운로드 완료. 지금 재시작하여 적용할까요?`
      );
      if (!shouldInstall) {
        showToast("앱 종료 시 업데이트가 적용됩니다.");
        return;
      }
      const result = await api.quitAndInstallUpdate();
      if (!result?.ok) alert(result?.message || "업데이트 적용에 실패했습니다.");
      return;
    }
    if (stage === "not-available") {
      showToast(`최신 버전입니다 (${payload.version || ""})`);
      return;
    }
    if (stage === "error") {
      alert(payload?.message || "업데이트 확인 중 오류가 발생했습니다.");
    }
  });
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.writeToken) headers["x-write-token"] = state.writeToken;
  const formatApiError = (errorData) => {
    const base = errorData?.error || "요청 실패";
    const steps = Array.isArray(errorData?.recoverySteps) ? errorData.recoverySteps : [];
    if (!steps.length) return base;
    return `${base}\n\n복구 가이드:\n- ${steps.join("\n- ")}`;
  };

  const response = await fetch(path, { ...options, headers });

  if (response.status === 401 && ["POST", "PATCH", "DELETE"].includes(options.method)) {
    const token = await ensureWriteToken();
    if (!token) throw new Error("PIN verification required");
    headers["x-write-token"] = token;
    const retried = await fetch(path, { ...options, headers });
    if (!retried.ok) {
      const errorData = await retried.json().catch(() => ({ error: "요청 실패" }));
      throw new Error(formatApiError(errorData));
    }
    if (retried.status === 204) return null;
    return retried.json();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "요청 실패" }));
    throw new Error(formatApiError(errorData));
  }

  if (response.status === 204) return null;
  return response.json();
}

async function ensureWriteToken() {
  const pin = prompt("관리 PIN 4자리를 입력하세요");
  if (!pin) return "";
  try {
    const data = await verifyPin(pin);
    state.writeToken = data.token;
    return data.token;
  } catch (data) {
    alert(data.error || "PIN 인증 실패");
    return "";
  }
}

function getPeriodLabel() {
  const d = new Date(state.currentDate);
  if (state.mode === "week") {
    const from = startOfWeek(d);
    const weekOfMonth = Math.ceil(from.getDate() / 7);
    return `${from.getFullYear()}년 ${from.getMonth() + 1}월 ${weekOfMonth}주`;
  }
  if (state.mode === "month") {
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }
  return `${d.getFullYear()}년`;
}

function navigate(offset) {
  const next = new Date(state.currentDate);
  if (state.mode === "week") next.setDate(next.getDate() + offset * 7);
  if (state.mode === "month") next.setMonth(next.getMonth() + offset);
  if (state.mode === "year") next.setFullYear(next.getFullYear() + offset);
  state.currentDate = next;
  refresh();
}

function setActiveTab(nextTab) {
  state.activeTab = nextTab;
  if (nextTab === "students" && state.studentFilter !== "all") {
    state.studentFilter = "all";
    setPillActive(el.studentFilterPills, "filter", state.studentFilter);
    renderStudents();
    renderStudentTable();
  }
  updateTabVisibility();
}

function updateTabVisibility() {
  const isScheduleTab = state.activeTab === "schedule";

  el.sectionTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === state.activeTab);
  });

  el.mainPanel.classList.toggle("students-tab", !isScheduleTab);
  el.mainTitle.textContent = isScheduleTab ? "수업 시간 표" : "학생 관리";
  el.scheduleView.classList.toggle("hidden", !isScheduleTab);
  el.studentsView.classList.toggle("hidden", isScheduleTab);
  el.scheduleNav.classList.toggle("hidden", !isScheduleTab);
  el.periodLabel.classList.toggle("hidden", !isScheduleTab);
  el.studentFilterWrap.classList.toggle("hidden", !isScheduleTab);

  if (!isScheduleTab) {
    el.summaryItems.classList.add("hidden");
  }
}

function studentLabel(student) {
  return student.nickname ? `${student.name} (${student.nickname})` : student.name;
}

function studentPeriodLessons(studentId) {
  return state.lessons.filter((lesson) => lesson.student_id === studentId);
}

function filterStudents(students) {
  const term = el.studentSearch.value.trim().toLowerCase();

  return students.filter((student) => {
    const text = `${student.name} ${student.nickname || ""}`.toLowerCase();
    if (term && !text.includes(term)) return false;

    const lessons = studentPeriodLessons(student.id);
    const hasCanceled = lessons.some((lesson) => lesson.status === "canceled");
    const hasMakeup = lessons.some((lesson) => lesson.status === "makeup");
    const active = isStudentActive(student);

    if (state.studentFilter === "hasCanceled" && !hasCanceled) return false;
    if (state.studentFilter === "hasMakeup" && !hasMakeup) return false;
    if (state.studentFilter === "unassigned" && lessons.length > 0) return false;
    if (state.studentFilter === "active" && !active) return false;
    if (state.studentFilter === "inactive" && active) return false;

    return true;
  });
}

function renderStudentOptions() {
  const options = state.students.map((student) => `<option value="${student.id}">${escapeHtml(studentLabel(student))}</option>`).join("");
  el.lessonStudent.innerHTML = options;
}

function renderStudents() {
  const filtered = filterStudents(state.students);

  if (!filtered.length) {
    el.studentList.innerHTML = '<div class="student-empty">표시할 학생이 없습니다.</div>';
    return;
  }

  el.studentList.innerHTML = filtered
    .map((student) => {
      const lessons = studentPeriodLessons(student.id);
      const canceled = lessons.filter((lesson) => lesson.status === "canceled").length;
      const makeup = lessons.filter((lesson) => lesson.status === "makeup").length;
      const upcoming = lessons
        .slice()
        .sort((a, b) => (a.start_at < b.start_at ? -1 : 1))
        .find((lesson) => new Date(lesson.start_at).getTime() >= Date.now());
      const meta = upcoming
        ? `${formatWeekdayLabel(new Date(upcoming.start_at))}/${timeString(new Date(upcoming.start_at))}`
        : "일정 없음";

      let badge = "";
      if (!isStudentActive(student)) {
        badge = '<span class="student-badge inactive">비활성</span>';
      } else if (makeup > 0) {
        badge = `<span class="student-badge makeup">보강 ${makeup}</span>`;
      } else if (canceled > 0) {
        badge = `<span class="student-badge cancel">취소 ${canceled}</span>`;
      }

      const initials = (student.nickname || student.name).slice(0, 2).toUpperCase();
      const selectedClass = student.id === state.selectedStudentId ? "is-selected" : "";

      return `
        <article class="student-item ${selectedClass}" data-id="${student.id}">
          <div class="avatar ${avatarClassById(student.id)}">${escapeHtml(initials)}</div>
          <div>
            <div class="student-name">${escapeHtml(student.name)}</div>
            <div class="student-meta">${escapeHtml(meta)}</div>
          </div>
          ${badge}
        </article>
      `;
    })
    .join("");

  [...document.querySelectorAll(".student-item")].forEach((item) => {
    item.addEventListener("click", () => {
      state.selectedStudentId = item.dataset.id;
      renderStudents();
    });

    item.addEventListener("dblclick", () => {
      const student = state.students.find((s) => s.id === item.dataset.id);
      if (student) openStudentModal(student);
    });
  });
}

function renderStudentTable() {
  const filtered = filterStudents(state.students);
  el.studentRosterCount.textContent = `총 ${state.students.length}명의 학생이 등록되어 있습니다.`;

  if (!filtered.length) {
    el.studentTableBody.innerHTML = '<tr><td colspan="5" class="table-empty">등록된 원생이 없습니다.</td></tr>';
    return;
  }

  el.studentTableBody.innerHTML = filtered
    .map((student) => {
      const initials = (student.nickname || student.name).slice(0, 2).toUpperCase();
      return `
        <tr data-row-student-id="${student.id}">
          <td>
            <div class="student-table-name">
              <span class="avatar ${avatarClassById(student.id)}">${escapeHtml(initials)}</span>
              <span>${escapeHtml(student.name)}</span>
            </div>
          </td>
          <td>${escapeHtml(formatPhone(student.phone))}</td>
          <td>${formatDateOnly(student.created_at)}</td>
          <td>
            <span class="student-state ${isStudentActive(student) ? "active" : "inactive"}">
              ${activeStateLabel(student)}
            </span>
          </td>
          <td>
            <button class="table-edit-btn" type="button" data-edit-student="${student.id}" aria-label="원생 수정">✎</button>
          </td>
        </tr>
      `;
    })
    .join("");

  [...document.querySelectorAll("[data-edit-student]")].forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const student = state.students.find((s) => s.id === button.dataset.editStudent);
      if (student) openStudentModal(student);
    });
  });

  [...document.querySelectorAll("#studentTableBody tr")].forEach((row) => {
    row.addEventListener("click", () => {
      const student = state.students.find((s) => s.id === row.dataset.rowStudentId);
      if (student) openStudentModal(student);
    });
  });
}

function renderSummary() {
  el.cancelCount.textContent = `취소 ${state.summary.canceled}건`;
  el.makeupCount.textContent = `보강 ${state.summary.makeup}건`;

  if (!state.summary.items.length) {
    el.summaryItems.innerHTML = '<div class="summary-item">취소/보강 항목이 없습니다.</div>';
    return;
  }

  el.summaryItems.innerHTML = state.summary.items
    .map((item) => {
      const student = item.student_nickname
        ? `${item.student_name} (${item.student_nickname})`
        : item.student_name;
      return `
        <div class="summary-item">
          <strong>${statusLabel(item.status)}</strong>
          ${escapeHtml(student)} · ${formatDateTime(item.start_at)}
        </div>
      `;
    })
    .join("");
}

function weekSlots() {
  const slots = [];
  for (let total = TIMETABLE_START_HOUR * 60; total < TIMETABLE_END_HOUR * 60; total += LESSON_MINUTES_STEP) {
    slots.push({
      hour: Math.floor(total / 60),
      minute: total % 60,
      label: `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`,
    });
  }
  return slots;
}

function weekDays() {
  const start = startOfWeek(state.currentDate);
  return Array.from({ length: 7 }, (_, idx) => {
    const d = new Date(start);
    d.setDate(d.getDate() + idx);
    return d;
  });
}

function lessonDurationMinutes(lesson) {
  const start = new Date(lesson.start_at);
  const end = new Date(lesson.end_at);
  return normalizeLessonDurationMinutes((end.getTime() - start.getTime()) / 60000);
}

function lessonDurationSlots(lesson) {
  const slots = lessonDurationMinutes(lesson) / LESSON_MINUTES_STEP;
  return Math.max(1, Math.min(MAX_LESSON_DURATION_MINUTES / LESSON_MINUTES_STEP, slots));
}

function lessonsBySlot(day, hour, minute) {
  return state.lessons.filter((lesson) => {
    const d = new Date(lesson.start_at);
    const slot = toSlotTime(d.getHours(), d.getMinutes());
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate() &&
      slot.hour === hour &&
      slot.minute === minute
    );
  });
}

function clearNowLineTimer() {
  if (!state.nowLineTimerId) return;
  window.clearInterval(state.nowLineTimerId);
  state.nowLineTimerId = 0;
}

function updateNowLine() {
  const wrap = el.timetable.querySelector(".week-grid-wrap");
  const line = wrap?.querySelector(".now-line");
  const badge = line?.querySelector(".now-badge");
  const firstCell = wrap?.querySelector("tbody tr:first-child td.week-cell");
  const lastCell = wrap?.querySelector("tbody tr:last-child td.week-cell");
  if (!wrap || !line || !badge || !firstCell || !lastCell) return;

  const now = new Date();
  const weekStart = startOfWeek(state.currentDate);
  const weekEndExclusive = endOfWeek(state.currentDate);
  const minutesFromStart =
    now.getHours() * 60 +
    now.getMinutes() +
    now.getSeconds() / 60 +
    now.getMilliseconds() / 60000 -
    TIMETABLE_START_HOUR * 60;
  const timetableMinutes = (TIMETABLE_END_HOUR - TIMETABLE_START_HOUR) * 60;

  if (now < weekStart || now >= weekEndExclusive || minutesFromStart < 0 || minutesFromStart > timetableMinutes) {
    line.classList.add("hidden");
    return;
  }

  const wrapRect = wrap.getBoundingClientRect();
  const firstCellRect = firstCell.getBoundingClientRect();
  const lastCellRect = lastCell.getBoundingClientRect();
  const firstCellTop = firstCellRect.top - wrapRect.top;
  const firstCellLeft = firstCellRect.left - wrapRect.left;
  const gridHeight = Math.max(1, lastCellRect.bottom - firstCellRect.top);
  const top = firstCellTop + (minutesFromStart / timetableMinutes) * gridHeight;

  line.style.top = `${top}px`;
  line.style.left = `${firstCellLeft}px`;
  badge.textContent = timeString(now);
  line.classList.remove("hidden");
}

function startNowLineTimer() {
  clearNowLineTimer();
  updateNowLine();
  state.nowLineTimerId = window.setInterval(updateNowLine, NOW_LINE_TICK_MS);
}

function clearDropHighlights() {
  [...document.querySelectorAll(".week-cell.is-drop-target")].forEach((cell) => {
    cell.classList.remove("is-drop-target");
  });
}

async function moveLessonToSlot(lessonId, dayIso, hour, minute = 0) {
  const lesson = state.lessons.find((item) => item.id === lessonId);
  if (!lesson) return;

  const nextStart = new Date(dayIso);
  nextStart.setHours(hour, minute, 0, 0);

  const currentStart = new Date(lesson.start_at);
  const isSameSlot =
    currentStart.getFullYear() === nextStart.getFullYear() &&
    currentStart.getMonth() === nextStart.getMonth() &&
    currentStart.getDate() === nextStart.getDate() &&
    currentStart.getHours() === nextStart.getHours() &&
    currentStart.getMinutes() === nextStart.getMinutes();

  if (isSameSlot) return;

  const durationMinutes = lessonDurationMinutes(lesson);
  const nextEnd = new Date(nextStart.getTime() + durationMinutes * 60000);

  await api(`/api/lessons/${lesson.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      start_at: nextStart.toISOString(),
      end_at: nextEnd.toISOString(),
    }),
  });
  showToast("수업 시간 이동 완료");
  await refresh();
}

function renderWeekGrid() {
  const days = weekDays();
  const slots = weekSlots();
  const now = new Date();

  const dayHeader = days
    .map((day) => {
      const w = day.getDay();
      const dayClass = w === 0 ? "day-sunday" : w === 6 ? "day-weekend" : "";
      const isToday =
        day.getFullYear() === now.getFullYear() &&
        day.getMonth() === now.getMonth() &&
        day.getDate() === now.getDate();
      const sunColClass = w === 0 ? "col-sun" : "";
      const todayColClass = isToday ? "col-today" : "";
      return `
        <th class="${sunColClass} ${todayColClass}">
          <div class="day-name">${formatWeekdayLabel(day)}</div>
          <div class="day-num ${dayClass}">${day.getDate()}</div>
        </th>
      `;
    })
    .join("");

  const rows = slots
    .map((slot) => {
      const cells = days
        .map((day) => {
          const isToday =
            day.getFullYear() === now.getFullYear() &&
            day.getMonth() === now.getMonth() &&
            day.getDate() === now.getDate();
          const sunClass = day.getDay() === 0 ? "col-sun" : "";
          const todayClass = isToday ? "col-today" : "";
          const cards = lessonsBySlot(day, slot.hour, slot.minute)
            .map((lesson) => {
              const spanSlots = lessonDurationSlots(lesson);
              const studentName = `${lesson.student_name} 학생`;
              const start = new Date(lesson.start_at);
              const end = new Date(lesson.end_at);
              const timeRange = `${timeString(start)}-${timeString(end)}`;
              return `
                <div class="event-card ${statusClass(lesson.status)} event-span-${spanSlots}" data-lesson-id="${lesson.id}" data-span-slots="${spanSlots}" draggable="true">
                  <div class="event-title">
                    <span>${statusLabel(lesson.status)}</span>
                    <span>⋮</span>
                  </div>
                  <div>${escapeHtml(studentName)}</div>
                  <div class="event-time">${timeRange}</div>
                  ${lesson.title ? `<div class="event-note">${escapeHtml(lesson.title)}</div>` : ""}
                </div>
              `;
            })
            .join("");

          return `<td class="week-cell ${sunClass} ${todayClass}" data-day="${day.toISOString()}" data-hour="${slot.hour}" data-minute="${slot.minute}">${cards}</td>`;
        })
        .join("");

      return `<tr><th>${slot.label}</th>${cells}</tr>`;
    })
    .join("");

  el.timetable.innerHTML = `
    <div class="week-grid-wrap">
      <table class="week-grid">
        <thead>
          <tr>
            <th></th>
            ${dayHeader}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="now-line hidden"><span class="now-badge"></span></div>
    </div>
  `;
  startNowLineTimer();

  [...document.querySelectorAll(".week-cell")].forEach((cell) => {
    cell.addEventListener("dragover", (event) => {
      event.preventDefault();
      cell.classList.add("is-drop-target");
    });

    cell.addEventListener("dragleave", () => {
      cell.classList.remove("is-drop-target");
    });

    cell.addEventListener("drop", async (event) => {
      event.preventDefault();
      const lessonId = event.dataTransfer?.getData("text/plain") || state.draggingLessonId;
      clearDropHighlights();
      if (!lessonId) return;

      state.suppressClicksUntil = Date.now() + 250;
      try {
        await moveLessonToSlot(
          lessonId,
          cell.dataset.day,
          Number(cell.dataset.hour),
          Number(cell.dataset.minute || 0)
        );
      } catch (error) {
        alert(error.message);
      }
    });

    cell.addEventListener("click", (event) => {
      if (Date.now() < state.suppressClicksUntil) return;
      if (event.target.closest(".event-card")) return;

      const day = new Date(cell.dataset.day);
      const hour = Number(cell.dataset.hour);
      const minute = Number(cell.dataset.minute || 0);
      day.setHours(hour, minute, 0, 0);

      openLessonModal({
        student_id: state.selectedStudentId || (state.students[0] && state.students[0].id),
        start_at: day.toISOString(),
        end_at: new Date(day.getTime() + DEFAULT_LESSON_DURATION_MINUTES * 60000).toISOString(),
        status: "normal",
        title: "",
        memo: "",
      });
    });
  });

  [...document.querySelectorAll(".event-card")].forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      state.draggingLessonId = card.dataset.lessonId || "";
      card.classList.add("is-dragging");
      if (event.dataTransfer && state.draggingLessonId) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", state.draggingLessonId);
      }
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("is-dragging");
      state.draggingLessonId = "";
      clearDropHighlights();
      state.suppressClicksUntil = Date.now() + 250;
    });

    card.addEventListener("click", (event) => {
      if (Date.now() < state.suppressClicksUntil) return;
      event.stopPropagation();
      const lesson = state.lessons.find((item) => item.id === card.dataset.lessonId);
      if (lesson) openLessonModal(lesson);
    });
  });
}

function renderMonthList() {
  const grouped = new Map();
  state.lessons.forEach((lesson) => {
    const key = lesson.start_at.slice(0, 10);
    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  const rows = [...grouped.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([day, count]) => `<tr><td>${day}</td><td>${count}건</td></tr>`)
    .join("");

  el.timetable.innerHTML = `
    <div class="mode-fallback">
      <table>
        <thead><tr><th>날짜</th><th>수업 수</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="2">일정이 없습니다.</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

function renderYearCards() {
  const counts = Array.from({ length: 12 }, () => 0);
  state.lessons.forEach((lesson) => {
    const d = new Date(lesson.start_at);
    counts[d.getMonth()] += 1;
  });

  el.timetable.innerHTML = `
    <div class="mode-fallback" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;">
      ${counts
        .map(
          (count, i) => `
            <article style="background:#fff;border:1px solid #edf1f7;border-radius:14px;padding:12px;">
              <strong style="font-size:1rem;">${i + 1}월</strong>
              <div style="margin-top:8px;color:#73819b;">수업 ${count}건</div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderTimetable() {
  if (state.mode === "week") {
    renderWeekGrid();
    return;
  }
  clearNowLineTimer();
  if (state.mode === "month") {
    renderMonthList();
    return;
  }
  renderYearCards();
}

function setPillActive(buttons, attr, value) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[attr] === value);
  });
}

function openStudentModal(student) {
  el.studentForm.reset();
  el.studentId.value = student?.id || "";
  el.studentName.value = student?.name || "";
  el.studentPhone.value = student?.phone || "";
  el.studentNickname.value = student?.nickname || "";
  el.studentMemo.value = student?.memo || "";
  el.studentActiveCheck.checked = student ? isStudentActive(student) : true;
  el.studentModalTitle.innerHTML = `<span class="modal-title-icon">✎</span>학생 추가/수정`;
  el.deleteStudentBtn.classList.toggle("hidden", !student?.id);
  showDialog(el.studentModal);
}

function openLessonModal(lesson) {
  el.lessonForm.reset();
  el.lessonId.value = lesson?.id || "";

  const fallbackStudentId = state.selectedStudentId || (state.students[0] && state.students[0].id) || "";
  el.lessonStudent.value = lesson?.student_id || fallbackStudentId;

  const start = lesson?.start_at ? new Date(lesson.start_at) : new Date();
  const end = lesson?.end_at
    ? new Date(lesson.end_at)
    : new Date(start.getTime() + DEFAULT_LESSON_DURATION_MINUTES * 60000);
  state.lessonDurationMinutes = normalizeLessonDurationMinutes((end.getTime() - start.getTime()) / 60000);

  el.lessonDate.value = dateOnlyString(start);
  el.lessonTime.value = timeString(start);
  el.lessonDuration.value = String(state.lessonDurationMinutes);
  el.lessonTitle.value = lesson?.title || "";
  el.lessonMemo.value = lesson?.memo || "";

  state.lessonStatus = lesson?.status || "normal";
  setPillActive(el.lessonStatusGroup, "status", state.lessonStatus);

  el.lessonModalTitle.textContent = lesson?.id ? "수업 추가/수정" : "수업 추가/수정";
  el.deleteLessonBtn.classList.toggle("hidden", !lesson?.id);
  showDialog(el.lessonModal);
}

async function loadData() {
  const [from, to] = rangeFromMode(state.mode, state.currentDate);

  const query = new URLSearchParams({
    from: toIso(from),
    to: toIso(to),
    query: el.studentSearch.value,
  });

  const [students, lessons, summary] = await Promise.all([
    api(`/api/students?${query.toString()}`),
    api(`/api/lessons?from=${encodeURIComponent(toIso(from))}&to=${encodeURIComponent(toIso(to))}`),
    api(`/api/summary?from=${encodeURIComponent(toIso(from))}&to=${encodeURIComponent(toIso(to))}`),
  ]);

  state.students = students;
  state.lessons = lessons;
  state.summary = summary;

  if (!state.selectedStudentId || !state.students.some((student) => student.id === state.selectedStudentId)) {
    state.selectedStudentId = state.students[0]?.id || "";
  }
}

async function refresh() {
  try {
    el.periodLabel.textContent = getPeriodLabel();
    setPillActive(el.modeBtns, "mode", state.mode);

    await loadData();

    renderStudentOptions();
    renderStudents();
    renderStudentTable();
    renderSummary();
    renderTimetable();
    updateTabVisibility();
  } catch (error) {
    el.timetable.innerHTML = `<div class="mode-fallback">오류: ${escapeHtml(error.message)}</div>`;
    el.studentTableBody.innerHTML = `<tr><td colspan="5" class="table-empty">오류: ${escapeHtml(error.message)}</td></tr>`;
  }
}

el.prevBtn.addEventListener("click", () => navigate(-1));
el.nextBtn.addEventListener("click", () => navigate(1));
el.todayBtn.addEventListener("click", () => {
  state.currentDate = new Date();
  refresh();
});

el.sectionTabs.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);
  });
});

el.modeBtns.forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    refresh();
  });
});

el.studentFilterPills.forEach((button) => {
  button.addEventListener("click", () => {
    state.studentFilter = button.dataset.filter;
    setPillActive(el.studentFilterPills, "filter", state.studentFilter);
    renderStudents();
    renderStudentTable();
    renderTimetable();
  });
});

el.studentSearch.addEventListener("input", () => {
  renderStudents();
  renderStudentTable();
  renderTimetable();
});

el.summaryToggleBtn.addEventListener("click", () => {
  el.summaryItems.classList.toggle("hidden");
});

el.newStudentBtn.addEventListener("click", () => openStudentModal(null));
el.studentRegisterBtn.addEventListener("click", () => openStudentModal(null));

if (!desktopBridge()) {
  el.desktopTools?.classList.add("hidden");
}
bindDesktopUpdateStatus();

el.backupBtn?.addEventListener("click", async () => {
  const api = desktopBridge();
  if (!api) return;
  try {
    const result = await api.createBackup();
    if (result?.canceled) return;
    if (!result?.ok) {
      alert(result?.message || "백업 생성에 실패했습니다.");
      return;
    }
    showToast("백업 저장 완료");
  } catch (_error) {
    alert("백업 생성에 실패했습니다.");
  }
});

el.restoreBtn?.addEventListener("click", async () => {
  const api = desktopBridge();
  if (!api) return;
  if (!confirm("백업 복원 시 앱이 재시작됩니다. 계속할까요?")) return;
  try {
    const result = await api.restoreBackup();
    if (result?.canceled) return;
    if (!result?.ok) {
      alert(result?.message || "복원 준비에 실패했습니다.");
      return;
    }
    if (result?.relaunching) {
      showToast("복원 적용을 위해 앱을 재시작합니다.");
    }
  } catch (_error) {
    alert("복원 준비에 실패했습니다.");
  }
});

el.checkUpdateBtn?.addEventListener("click", async () => {
  const api = desktopBridge();
  if (!api) return;
  try {
    const result = await api.checkForUpdates();
    if (result?.disabled) {
      alert(result.message || "현재 환경에서는 자동업데이트를 사용할 수 없습니다.");
      return;
    }
    if (!result?.ok) {
      alert(result?.message || "업데이트 확인에 실패했습니다.");
      return;
    }
    showToast("업데이트 확인을 시작했습니다.");
  } catch (_error) {
    alert("업데이트 확인에 실패했습니다.");
  }
});

[...document.querySelectorAll("[data-close]")].forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.close);
    if (dialog) closeDialog(dialog);
  });
});

[el.studentModal, el.lessonModal].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog(dialog);
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(dialog);
  });

  dialog.addEventListener("close", () => {
    dialog.classList.remove("is-closing");
  });
});

el.lessonStatusGroup.forEach((button) => {
  button.addEventListener("click", () => {
    state.lessonStatus = button.dataset.status;
    setPillActive(el.lessonStatusGroup, "status", state.lessonStatus);
  });
});

el.lessonDuration.addEventListener("change", () => {
  state.lessonDurationMinutes = normalizeLessonDurationMinutes(el.lessonDuration.value);
  el.lessonDuration.value = String(state.lessonDurationMinutes);
});

el.studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      name: el.studentName.value.trim(),
      phone: el.studentPhone.value.trim(),
      nickname: el.studentNickname.value.trim(),
      memo: el.studentMemo.value.trim(),
      is_active: el.studentActiveCheck.checked,
    };

    if (el.studentId.value) {
      await api(`/api/students/${el.studentId.value}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      showToast("학생 수정 완료");
    } else {
      await api("/api/students", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("학생 추가 완료");
    }

    closeDialog(el.studentModal);
    await refresh();
  } catch (error) {
    alert(error.message);
  }
});

el.deleteStudentBtn.addEventListener("click", async () => {
  if (!el.studentId.value) return;
  if (!confirm("이 학생을 완전히 제거할까요? 관련 수업도 함께 삭제됩니다.")) return;

  try {
    await api(`/api/students/${el.studentId.value}`, { method: "DELETE" });
    showToast("학생 제거 완료");
    closeDialog(el.studentModal);
    await refresh();
  } catch (error) {
    alert(error.message);
  }
});

el.lessonForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const start = new Date(`${el.lessonDate.value}T${el.lessonTime.value}:00`);
    if (![0, 30].includes(start.getMinutes())) {
      throw new Error("수업 시작 시간은 30분 단위(00분/30분)로만 설정할 수 있습니다.");
    }

    const durationMinutes = normalizeLessonDurationMinutes(el.lessonDuration.value || state.lessonDurationMinutes);
    state.lessonDurationMinutes = durationMinutes;
    const end = new Date(start.getTime() + durationMinutes * 60000);

    const payload = {
      student_id: el.lessonStudent.value,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: state.lessonStatus,
      title: el.lessonTitle.value.trim(),
      memo: el.lessonMemo.value.trim(),
    };

    if (el.lessonId.value) {
      await api(`/api/lessons/${el.lessonId.value}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      showToast("수업 수정 완료");
    } else {
      await api("/api/lessons", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showToast("수업 추가 완료");
    }

    closeDialog(el.lessonModal);
    await refresh();
  } catch (error) {
    alert(error.message);
  }
});

el.deleteLessonBtn.addEventListener("click", async () => {
  if (!el.lessonId.value) return;
  if (!confirm("이 수업을 삭제할까요?")) return;

  try {
    await api(`/api/lessons/${el.lessonId.value}`, { method: "DELETE" });
    showToast("수업 삭제 완료");
    closeDialog(el.lessonModal);
    await refresh();
  } catch (error) {
    alert(error.message);
  }
});

el.pinGateForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  el.pinGateError.classList.add("hidden");
  el.pinGateError.textContent = "";
  const pin = el.pinGateInput.value.trim();
  if (!/^\d{4}$/.test(pin)) {
    el.pinGateError.textContent = "4자리 숫자 PIN을 입력하세요.";
    el.pinGateError.classList.remove("hidden");
    return;
  }

  try {
    await openPortalWithPin(pin);
  } catch (data) {
    if (data.retryAfterMs) {
      const sec = Math.ceil(data.retryAfterMs / 1000);
      el.pinGateError.textContent = `PIN 잠금 상태입니다. ${sec}초 후 다시 시도하세요.`;
    } else {
      el.pinGateError.textContent = data.error || "PIN 인증 실패";
    }
    el.pinGateError.classList.remove("hidden");
  }
});
