const { test, expect } = require("@playwright/test");

async function verifyPin(request) {
  const res = await request.post("/api/pin/verify", {
    data: { pin: "1234" },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  return body.token;
}

async function createStudent(request, name) {
  const token = await verifyPin(request);
  const res = await request.post("/api/students", {
    headers: { "x-write-token": token },
    data: {
      name,
      nickname: name.slice(0, 2),
      is_active: true,
    },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

async function createLesson(request, payload) {
  const token = await verifyPin(request);
  const res = await request.post("/api/lessons", {
    headers: { "x-write-token": token },
    data: payload,
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

function todayAt(hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function unlockPage(page, pin = "1234") {
  await page.goto("/");
  await expect(page.locator("#pinGate")).toBeVisible();
  await page.locator("#pinGateInput").fill(pin);
  await page.getByRole("button", { name: "입장하기" }).click();
  await expect(page.locator("#pinGate")).toBeHidden();
  await expect(page.getByRole("heading", { name: "수업 시간 표" })).toBeVisible();
}

test.describe("TimeTrack MVP UI", () => {
  test("loads dashboard shell", async ({ page }) => {
    await unlockPage(page);
    await expect(page.getByText("아카데미 관리")).toBeVisible();
    await expect(page.getByRole("heading", { name: "수업 시간 표" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("button", { name: "주" })).toBeVisible();
  });

  test("creates student from modal", async ({ page }) => {
    await unlockPage(page);

    await page.getByRole("button", { name: "학생 추가" }).click();
    await expect(page.getByRole("heading", { name: "학생 추가/수정" })).toBeVisible();

    await page.locator("#studentName").fill(`테스트학생-${Date.now()}`);
    await page.locator("#studentNickname").fill("TS");
    await page.locator("#studentMemo").fill("e2e student create");

    await page.getByRole("button", { name: "저장" }).click();

    await expect(page.getByText("학생 추가 완료")).toBeVisible();
  });

  test("creates lesson by clicking week cell", async ({ page, request }) => {
    const student = await createStudent(request, `수업테스트-${Date.now()}`);

    await unlockPage(page);
    await page.getByPlaceholder("이름/닉네임 검색").fill(student.name);
    await page.locator(".student-item").first().click();

    await page.locator(".week-cell").nth(8).click();
    await expect(page.getByRole("heading", { name: "수업 추가/수정" })).toBeVisible();

    await page.locator("#lessonTitle").fill("E2E 수업");
    await page.locator("#lessonMemo").fill("slot click create");

    await page.getByRole("button", { name: "저장" }).click();

    await expect(page.getByText("수업 추가 완료")).toBeVisible();
  });

  test("updates summary counts and expands canceled/makeup list", async ({ page, request }) => {
    await unlockPage(page);
    const beforeCanceledText = (await page.locator("#cancelCount").textContent()) || "취소 0건";
    const beforeMakeupText = (await page.locator("#makeupCount").textContent()) || "보강 0건";
    const beforeCanceled = Number(beforeCanceledText.match(/\d+/)?.[0] || 0);
    const beforeMakeup = Number(beforeMakeupText.match(/\d+/)?.[0] || 0);

    const student = await createStudent(request, `요약테스트-${Date.now()}`);

    const canceledStart = todayAt(10, 0);
    const canceledEnd = todayAt(11, 0);
    const makeupStart = todayAt(14, 0);
    const makeupEnd = todayAt(15, 0);

    await createLesson(request, {
      student_id: student.id,
      start_at: canceledStart.toISOString(),
      end_at: canceledEnd.toISOString(),
      status: "canceled",
      title: "취소 수업",
    });

    await createLesson(request, {
      student_id: student.id,
      start_at: makeupStart.toISOString(),
      end_at: makeupEnd.toISOString(),
      status: "makeup",
      title: "보강 수업",
    });

    await unlockPage(page);
    await expect(page.locator("#cancelCount")).toContainText(`취소 ${beforeCanceled + 1}건`);
    await expect(page.locator("#makeupCount")).toContainText(`보강 ${beforeMakeup + 1}건`);

    await page.locator("#summaryToggleBtn").click();
    await expect(page.locator("#summaryItems .summary-item").first()).toBeVisible();
    const itemCount = await page.locator("#summaryItems .summary-item").count();
    expect(itemCount).toBeGreaterThanOrEqual(2);
    await expect(page.locator("#summaryItems")).toContainText("취소");
    await expect(page.locator("#summaryItems")).toContainText("보강");
    await expect(page.locator("#summaryItems")).toContainText(student.name);
  });

  test("filters student list by canceled/makeup pills", async ({ page, request }) => {
    const canceledStudent = await createStudent(request, `취소필터-${Date.now()}`);
    const makeupStudent = await createStudent(request, `보강필터-${Date.now()}`);

    const base = todayAt(12, 0);
    await createLesson(request, {
      student_id: canceledStudent.id,
      start_at: base.toISOString(),
      end_at: new Date(base.getTime() + 60 * 60000).toISOString(),
      status: "canceled",
      title: "취소 전용",
    });
    await createLesson(request, {
      student_id: makeupStudent.id,
      start_at: new Date(base.getTime() + 2 * 60 * 60000).toISOString(),
      end_at: new Date(base.getTime() + 3 * 60 * 60000).toISOString(),
      status: "makeup",
      title: "보강 전용",
    });

    await unlockPage(page);

    const studentNames = page.locator("#studentList .student-name");
    await page.getByRole("button", { name: "취소 있음" }).click();
    await expect(studentNames.filter({ hasText: canceledStudent.name })).toHaveCount(1);
    await expect(studentNames.filter({ hasText: makeupStudent.name })).toHaveCount(0);

    await page.getByRole("button", { name: "보강 있음" }).click();
    await expect(studentNames.filter({ hasText: makeupStudent.name })).toHaveCount(1);
    await expect(studentNames.filter({ hasText: canceledStudent.name })).toHaveCount(0);
  });

  test("switches month/year views", async ({ page }) => {
    await unlockPage(page);

    await page.getByRole("button", { name: "월" }).click();
    await expect(page.getByRole("columnheader", { name: "날짜" })).toBeVisible();

    await page.getByRole("button", { name: "년" }).click();
    await expect(page.locator(".mode-fallback strong", { hasText: /^1월$/ })).toBeVisible();
    await expect(page.locator(".mode-fallback strong", { hasText: /^12월$/ })).toBeVisible();
  });

  test("edits student and sets inactive", async ({ page, request }) => {
    const student = await createStudent(request, `수정학생-${Date.now()}`);
    const updatedMemo = "inactive by e2e";

    await unlockPage(page);
    await page.getByPlaceholder("이름/닉네임 검색").fill(student.name);

    const studentCard = page
      .locator(".student-item")
      .filter({ has: page.locator(".student-name", { hasText: student.name }) })
      .first();
    await expect(studentCard).toBeVisible();
    await studentCard.dblclick();

    await expect(page.getByRole("heading", { name: "학생 추가/수정" })).toBeVisible();
    await page.locator("#studentMemo").fill(updatedMemo);
    await page.locator("#studentActiveCheck").uncheck();

    await page.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("학생 수정 완료")).toBeVisible();

    await page.getByRole("button", { name: "비활성" }).click();
    await expect(page.locator("#studentList .student-name").filter({ hasText: student.name })).toHaveCount(1);
  });

  test("deletes student from student modal", async ({ page, request }) => {
    const student = await createStudent(request, `삭제학생-${Date.now()}`);
    const lessonStart = todayAt(11, 0);
    await createLesson(request, {
      student_id: student.id,
      start_at: lessonStart.toISOString(),
      end_at: new Date(lessonStart.getTime() + 60 * 60000).toISOString(),
      status: "normal",
      title: "삭제 대상 수업",
    });

    await unlockPage(page);
    await page.getByPlaceholder("이름/닉네임 검색").fill(student.name);

    const studentCard = page
      .locator(".student-item")
      .filter({ has: page.locator(".student-name", { hasText: student.name }) })
      .first();
    await expect(studentCard).toBeVisible();
    await studentCard.dblclick();

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });
    await page.getByRole("button", { name: "🗑 제거" }).click();

    await page.getByPlaceholder("이름/닉네임 검색").fill(student.name);
    await expect(page.locator("#studentList .student-name").filter({ hasText: student.name })).toHaveCount(0);
  });

  test("edits and deletes lesson", async ({ page, request }) => {
    const student = await createStudent(request, `수정수업학생-${Date.now()}`);
    const start = todayAt(16, 0);
    const end = todayAt(17, 0);
    const lesson = await createLesson(request, {
      student_id: student.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status: "normal",
      title: "원본 수업명",
      memo: "before edit",
    });

    await unlockPage(page);
    await page.getByPlaceholder("이름/닉네임 검색").fill(student.name);
    await page.locator(".student-item").first().click();

    const lessonCard = page.locator(`.event-card[data-lesson-id="${lesson.id}"]`);
    await expect(lessonCard).toBeVisible();
    await lessonCard.click();

    await page.locator("#lessonTitle").fill("수정된 수업명");
    await page.locator("#lessonMemo").fill("after edit");

    await page.getByRole("button", { name: "저장" }).click();
    await expect(page.getByText("수업 수정 완료")).toBeVisible();

    await lessonCard.click();

    page.on("dialog", async (dialog) => {
      if (dialog.type() === "confirm") {
        await dialog.accept();
        return;
      }
      if (dialog.type() === "prompt") {
        await dialog.accept("1234");
        return;
      }
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "🗑 삭제" }).click();
    await expect(page.getByText("수업 삭제 완료")).toBeVisible();
    await expect(lessonCard).toHaveCount(0);
  });

  test("locks PIN verification after 5 failed attempts", async ({ request }) => {
    for (let i = 0; i < 5; i += 1) {
      const failed = await request.post("/api/pin/verify", {
        data: { pin: "0000" },
      });
      expect(failed.status()).toBe(401);
    }

    const locked = await request.post("/api/pin/verify", {
      data: { pin: "1234" },
    });
    expect(locked.status()).toBe(429);
    const body = await locked.json();
    expect(body.error).toContain("locked");
  });
});
