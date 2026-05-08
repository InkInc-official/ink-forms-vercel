/**
 * Ink Forms — フロントエンドロジック
 * Ink Inc. | AI Creation, Human Care. The Future Drawn Together.
 */

const API = "https://goofball-marital-lying.ngrok-free.dev";
const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true", "Content-Type": "application/json" };

async function apiFetch(url, options = {}) {
  const headers = { "ngrok-skip-browser-warning": "true", ...options.headers };
  return fetch(url, { ...options, headers });
}

// ── タブ切替 ──────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`view-${btn.dataset.tab}`).classList.add("active");
  });
});

// ── ライバー名プルダウン ──────────────────────
async function loadLivers() {
  try {
    const res = await apiFetch(`${API}/api/livers`, { headers: { "ngrok-skip-browser-warning": "true" } });
    const names = await res.json();
    document.querySelectorAll(".liver-select").forEach(sel => {
      const current = sel.value;
      sel.innerHTML = '<option value="">選択してください</option>';
      names.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (name === current) opt.selected = true;
        sel.appendChild(opt);
      });
    });
  } catch(e) { console.error("ライバー名取得失敗:", e); }
}
loadLivers();

// フォームとパスワードAPIのマッピング
const PW_API_MAP = {
  "form-ticket":     "/api/check-password/ticket",
  "form-voice":      "/api/check-password/voice",
  "form-milestone":  "/api/check-password/milestone",
};

// ── パスワード入力でボタン活性化 ─────────────
document.querySelectorAll(".pw-section input[type='password']").forEach(input => {
  const form = input.closest("form");
  const btn = form ? form.querySelector(".pw-submit") : null;
  if (!btn) return;
  const apiUrl = PW_API_MAP[form.id];
  if (!apiUrl) return;

  input.addEventListener("input", async () => {
    if (!input.value.trim()) { btn.disabled = true; return; }
    try {
      const res = await apiFetch(`${API}${apiUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: input.value }),
      });
      const data = await res.json();
      btn.disabled = !data.valid;
      input.style.borderColor = data.valid ? "var(--accent-green)" : "var(--accent-red)";
    } catch { btn.disabled = true; }
  });
});

// ── Ink Contract パスワードロック ────────────
const contractPwBtn = document.getElementById("contract-pw-btn");
const contractPwInput = document.getElementById("contract-pw-input");
const contractPwError = document.getElementById("contract-pw-error");

contractPwBtn.addEventListener("click", async () => {
  const pw = contractPwInput.value.trim();
  if (!pw) return;
  try {
    const res = await apiFetch(`${API}/api/check-password/contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    if (data.valid) {
      document.getElementById("contract-lock").style.display = "none";
      document.getElementById("form-contract").style.display = "block";
    } else {
      contractPwError.hidden = false;
    }
  } catch { contractPwError.hidden = false; }
});

contractPwInput.addEventListener("keydown", e => {
  if (e.key === "Enter") contractPwBtn.click();
});

// ── 未成年フラグで親権者セクション表示切替 ────
document.getElementById("is-minor-select").addEventListener("change", e => {
  const section = document.getElementById("guardian-section");
  section.style.display = e.target.value === "true" ? "block" : "none";
});

// ── 日付表示（Ink Check）────────────────────
const now = new Date();
const dateEl = document.getElementById("check-date");
if (dateEl) {
  dateEl.textContent = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,"0")}.${String(now.getDate()).padStart(2,"0")} 月次チェック`;
}

// ── Ink Check スコアボタン ───────────────────
const scoreValues = {};
const CHECK_SCORE_FIELDS = ["score_private","score_rest","score_rhythm","score_mental","score_fan","score_stream"];
const CHECK_SCORE_LABELS = {
  score_private:"プライベート", score_rest:"休息", score_rhythm:"生活リズムの乱れ",
  score_mental:"精神的な落ち込み", score_fan:"配信やファン対応", score_stream:"配信準備・配信内容"
};

// Check画面のスコアボタン
document.querySelectorAll("#view-check .score-item").forEach(item => {
  const field = item.dataset.field;
  const buttons = item.querySelectorAll(".score-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      scoreValues[field] = parseInt(btn.dataset.value, 10);
      item.classList.add("selected");
    });
  });
});

// Check パスワード入力でボタン活性化（個別制御）
document.getElementById("check-password").addEventListener("input", async (e) => {
  const pw = e.target.value;
  if (!pw) { document.getElementById("check-submit-btn").disabled = true; return; }
  try {
    const res = await apiFetch(`${API}/api/check-password/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    document.getElementById("check-submit-btn").disabled = !data.valid;
    e.target.style.borderColor = data.valid ? "var(--accent-green)" : "var(--accent-red)";
  } catch { document.getElementById("check-submit-btn").disabled = true; }
});

// ── 汎用フォーム送信ヘルパー ─────────────────
function showResult(resultId, message, success = true) {
  const el = document.getElementById(resultId);
  el.innerHTML = `
    <div class="result-icon">${success ? "🖤" : "⚠️"}</div>
    <div class="result-msg">${message}</div>
  `;
  el.hidden = false;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showError(errorId, message) {
  const el = document.getElementById(errorId);
  el.textContent = message;
  el.hidden = false;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError(errorId) {
  document.getElementById(errorId).hidden = true;
}

// ── Ink Entry 送信 ────────────────────────────
document.getElementById("form-entry").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("entry-error");
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());

  // 必須チェック
  const required = ["streamer_name","iriam_id","email","age_range","experience","available_hours","frequency","motivation","self_pr","contact_method","contact_id"];
  const missing = required.filter(k => !payload[k]?.trim());
  if (missing.length) { showError("entry-error", "必須項目をすべて入力してください"); return; }

  const btn = e.target.querySelector(".submit-btn");
  btn.disabled = true;
  try {
    const res = await apiFetch(`${API}/api/entry/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      e.target.style.display = "none";
      showResult("entry-result", data.message);
    } else {
      showError("entry-error", data.detail || "送信に失敗しました");
    }
  } catch(err) {
    showError("entry-error", `送信に失敗しました: ${err.message}`);
  } finally { btn.disabled = false; }
});

// ── Ink Contract 送信 ─────────────────────────
document.getElementById("form-contract").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("contract-error");

  const fd = new FormData(e.target);

  // 同意チェック
  if (!fd.get("agree")) { showError("contract-error", "同意事項にチェックしてください"); return; }

  // 身分証
  const idFile = document.querySelector('input[name="id_file"]').files[0];
  if (!idFile) { showError("contract-error", "身分証をアップロードしてください"); return; }

  // パスワードをhiddenで追加
  const pw = document.getElementById("contract-pw-input").value;
  fd.append("password", pw);

  const btn = e.target.querySelector(".submit-btn");
  btn.disabled = true;
  try {
    const res = await apiFetch(`${API}/api/contract/submit`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (res.ok) {
      e.target.style.display = "none";
      showResult("contract-result", data.message);
    } else {
      showError("contract-error", data.detail || "送信に失敗しました");
    }
  } catch(err) {
    showError("contract-error", `送信に失敗しました: ${err.message}`);
  } finally { btn.disabled = false; }
});

// ── Ink Ticket 送信 ───────────────────────────
document.getElementById("form-ticket").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("ticket-error");
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  if (!payload.liver_name || !payload.ticket_type || !payload.recent_note?.trim()) {
    showError("ticket-error", "必須項目をすべて入力してください"); return;
  }
  const btn = e.target.querySelector(".submit-btn");
  btn.disabled = true;
  try {
    const res = await apiFetch(`${API}/api/ticket/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      e.target.style.display = "none";
      showResult("ticket-result", data.message);
    } else {
      showError("ticket-error", data.detail || "送信に失敗しました");
    }
  } catch(err) {
    showError("ticket-error", `送信に失敗しました: ${err.message}`);
  } finally { btn.disabled = false; }
});

// ── Ink Voice 送信 ────────────────────────────
document.getElementById("form-voice").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("voice-error");
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  if (!payload.liver_name || !payload.review?.trim() || !payload.influence?.trim() || !payload.next_month?.trim()) {
    showError("voice-error", "必須項目をすべて入力してください"); return;
  }
  const btn = e.target.querySelector(".submit-btn");
  btn.disabled = true;
  try {
    const res = await apiFetch(`${API}/api/voice/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      e.target.style.display = "none";
      showResult("voice-result", data.message);
    } else {
      showError("voice-error", data.detail || "送信に失敗しました");
    }
  } catch(err) {
    showError("voice-error", `送信に失敗しました: ${err.message}`);
  } finally { btn.disabled = false; }
});

// ── Ink Contact 送信 ─────────────────────────
document.getElementById("form-contact").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("contact-error");
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  if (!payload.contact_name?.trim() || !payload.contact_email?.trim() || !payload.contact_body?.trim()) {
    showError("contact-error", "必須項目をすべて入力してください"); return;
  }
  const btn = e.target.querySelector(".submit-btn");
  btn.disabled = true;
  try {
    const res = await apiFetch(`${API}/api/contact/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      e.target.style.display = "none";
      showResult("contact-result", data.message);
    } else {
      showError("contact-error", data.detail || "送信に失敗しました");
    }
  } catch(err) {
    showError("contact-error", );
  } finally { btn.disabled = false; }
});

// ── Ink Check 送信 ────────────────────────────
document.getElementById("form-check").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("check-error");

  const liverName = document.getElementById("check-liver").value;
  if (!liverName) { showError("check-error", "ライバー名を選択してください"); return; }

  const unselected = CHECK_SCORE_FIELDS.filter(f => scoreValues[f] === undefined);
  if (unselected.length) {
    showError("check-error", `未選択の項目があります：${unselected.map(f => CHECK_SCORE_LABELS[f]).join("、")}`);
    return;
  }

  const interviewEl = document.querySelector('#form-check input[name="interview_request"]:checked');
  const password = document.getElementById("check-password").value;

  const payload = {
    liver_name: liverName,
    ...Object.fromEntries(CHECK_SCORE_FIELDS.map(f => [f, scoreValues[f]])),
    consult_text: document.getElementById("check-consult").value.trim() || null,
    free_text: document.getElementById("check-free").value.trim() || null,
    interview_request: interviewEl ? interviewEl.value === "true" : false,
    password,
  };

  const btn = document.getElementById("check-submit-btn");
  const label = document.getElementById("check-submit-label");
  const spinner = document.getElementById("check-spinner");
  btn.disabled = true;
  label.hidden = true;
  spinner.hidden = false;

  try {
    const res = await apiFetch(`${API}/api/check/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("form-check").style.display = "none";
      showResult("check-result", data.message);
    } else {
      showError("check-error", data.detail || "送信に失敗しました");
      btn.disabled = false;
    }
  } catch(err) {
    showError("check-error", `送信に失敗しました: ${err.message}`);
    btn.disabled = false;
  } finally {
    label.hidden = false;
    spinner.hidden = true;
  }
});

// ── Ink Milestone ─────────────────────────────

let milestoneInkDuoUnlocked = false;

// ライバー選択 → 情報カード・フォーム本体を表示
document.getElementById("milestone-liver").addEventListener("change", async (e) => {
  const name = e.target.value;
  const card = document.getElementById("milestone-liver-card");
  const body = document.getElementById("milestone-form-body");

  if (!name) {
    card.style.display = "none";
    body.style.display = "none";
    updateMilestoneSubmitBtn();
    return;
  }

  try {
    const res = await apiFetch(`${API}/api/livers/${encodeURIComponent(name)}`);
    const d = await res.json();

    document.getElementById("mi-debut").textContent   = d.debut_at           ? formatDate(d.debut_at)           : "未登録";
    document.getElementById("mi-base").textContent    = d.ink_duo_base_date   ? formatDate(d.ink_duo_base_date)   : "未登録";
    document.getElementById("mi-unlock").textContent  = d.ink_duo_unlock_date ? formatDate(d.ink_duo_unlock_date) : "未登録";

    milestoneInkDuoUnlocked = d.ink_duo_unlocked;

    if (d.ink_duo_unlock_date) {
      const today = new Date();
      const unlock = new Date(d.ink_duo_unlock_date);
      if (d.ink_duo_unlocked) {
        document.getElementById("mi-status").textContent = "🎶 Ink Duo解放済み！";
        document.getElementById("mi-status").style.color = "var(--accent-green)";
      } else {
        const days = Math.ceil((unlock - today) / (1000 * 60 * 60 * 24));
        document.getElementById("mi-status").textContent = `🔒 解放まであと${days}日`;
        document.getElementById("mi-status").style.color = "var(--accent-yellow)";
      }
    } else {
      document.getElementById("mi-status").textContent  = "デビュー日未登録";
      document.getElementById("mi-status").style.color  = "";
    }

    card.style.display = "block";
    body.style.display = "block";
  } catch(err) {
    console.error("ライバー情報取得失敗:", err);
  }
  updateMilestoneSubmitBtn();
});

// 達成内容変更 → Ink Duo制御・達成日表示制御
document.getElementById("milestone-type").addEventListener("change", (e) => {
  const val = e.target.value;
  const isDuo = val === "Ink Duo申請（2ヶ月継続達成）";
  const achGroup = document.getElementById("achieved-at-group");
  const duoMsg   = document.getElementById("ink-duo-locked-msg");

  achGroup.style.display = isDuo ? "none" : "block";

  if (isDuo && !milestoneInkDuoUnlocked) {
    duoMsg.textContent    = "🔒 まだInk Duoは解放されていません";
    duoMsg.style.display  = "block";
  } else {
    duoMsg.style.display  = "none";
  }
  updateMilestoneSubmitBtn();
});

// 達成日の未来日付制限
const achievedAtInput = document.getElementById("milestone-achieved-at");
achievedAtInput.max = new Date().toISOString().split("T")[0];
achievedAtInput.addEventListener("change", updateMilestoneSubmitBtn);

function updateMilestoneSubmitBtn() {
  const type = document.getElementById("milestone-type").value;
  const btn  = document.getElementById("milestone-submit-btn");
  if (!type) { btn.disabled = true; return; }
  const isDuo = type === "Ink Duo申請（2ヶ月継続達成）";
  if (isDuo && !milestoneInkDuoUnlocked) { btn.disabled = true; return; }
  if (!isDuo && !achievedAtInput.value)   { btn.disabled = true; return; }
  // パスワード検証はPW_API_MAPで別途制御
}

// Ink Milestone 送信
document.getElementById("form-milestone").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError("milestone-error");

  const liverName     = document.getElementById("milestone-liver").value;
  const milestoneType = document.getElementById("milestone-type").value;
  const achievedAt    = achievedAtInput.value || null;
  const password      = document.querySelector("#form-milestone .pw-section input[type='password']").value;

  if (!liverName)     { showError("milestone-error", "ライバー名を選択してください"); return; }
  if (!milestoneType) { showError("milestone-error", "達成内容を選択してください"); return; }

  const btn     = document.getElementById("milestone-submit-btn");
  const label   = document.getElementById("milestone-submit-label");
  const spinner = document.getElementById("milestone-spinner");
  btn.disabled  = true;
  label.hidden  = true;
  spinner.hidden = false;

  try {
    const res = await apiFetch(`${API}/api/milestone/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liver_name: liverName, milestone_type: milestoneType, achieved_at: achievedAt, password }),
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("form-milestone").style.display = "none";
      showResult("milestone-result", data.message);
    } else {
      showError("milestone-error", data.detail || "送信に失敗しました");
      btn.disabled = false;
    }
  } catch(err) {
    showError("milestone-error", `送信に失敗しました: ${err.message}`);
    btn.disabled = false;
  } finally {
    label.hidden   = false;
    spinner.hidden = true;
  }
});

// 日付フォーマットヘルパー
function formatDate(dateStr) {
  if (!dateStr) return "−";
  const [y, m, d] = dateStr.split("-");
  return `${y}年${m}月${d}日`;
}
