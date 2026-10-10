const state = { bank: [], current: null, recognition: null };
const $ = (id) => document.getElementById(id);

const normalize = (text) => text.toLowerCase().replace(/[，。、“”‘’？?！!、：:；;（）()\s]/g, "");
const terms = (text) => normalize(text).match(/[\u4e00-\u9fff]{2,}|[a-z0-9+#]+/g) || [];

function score(item, query) {
  const q = normalize(query);
  if (!q) return 0;
  const title = normalize(item.question);
  let points = title.includes(q) ? 20 : 0;
  for (const term of terms(query)) {
    if (term.length < 2) continue;
    if (title.includes(term)) points += 5;
    if (normalize(item.category).includes(term)) points += 2;
    if (normalize(item.answer).includes(term)) points += 1;
  }
  return points;
}

function ranked(query) {
  return state.bank.map((item) => ({ item, score: score(item, query) }))
    .filter((entry) => !query || entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.question.localeCompare(b.item.question))
    .slice(0, 12);
}

function showAnswer(item) {
  state.current = item;
  $("answerPanel").classList.remove("hidden");
  $("answerQuestion").textContent = item.question;
  $("answerMeta").textContent = `${item.category} · ${item.source}`;
  $("answerText").textContent = item.answer.replace(/^答[（(][^）)]*[）)]：?\s*/, "").replace(/^答：?\s*/, "");
}

function render(query = "") {
  const list = ranked(query);
  const results = $("results");
  results.replaceChildren();
  $("matchCount").textContent = query ? `找到 ${list.length} 条` : "从题库中选择一题";
  if (!list.length) { results.innerHTML = '<p class="muted">没有找到直接匹配的问题。换个关键词，或查看“相关题目”。</p>'; return; }
  const template = $("resultTemplate");
  list.forEach(({ item }) => {
    const node = template.content.cloneNode(true);
    node.querySelector(".result-category").textContent = item.category;
    node.querySelector(".result-question").textContent = item.question;
    node.querySelector(".result-preview").textContent = item.answer;
    node.querySelector("button").addEventListener("click", () => showAnswer(item));
    results.append(node);
  });
  if (query && list[0]) showAnswer(list[0].item);
}

function setupSpeech() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = $("micBtn");
  if (!Recognition) { btn.disabled = true; $("speechStatus").textContent = "此浏览器不支持语音识别；可直接输入问题。"; return; }
  const recognition = new Recognition();
  recognition.lang = "zh-CN"; recognition.interimResults = true; recognition.continuous = false;
  recognition.onstart = () => { btn.textContent = "正在听…"; $("speechStatus").textContent = "请说出一道面试题；说完会自动检索。"; };
  recognition.onresult = (e) => {
    const transcript = [...e.results].map((r) => r[0].transcript).join("");
    $("query").value = transcript; render(transcript);
  };
  recognition.onerror = (e) => { $("speechStatus").textContent = `语音识别未完成：${e.error}。可改用文字输入。`; };
  recognition.onend = () => { btn.textContent = "🎙️ 语音练习"; };
  btn.addEventListener("click", () => recognition.start());
  state.recognition = recognition;
}

async function init() {
  const response = await fetch("data/question-bank.json");
  state.bank = await response.json();
  $("count").textContent = `${state.bank.length} 道已导入`;
  render(); setupSpeech();
  $("searchBtn").addEventListener("click", () => render($("query").value));
  $("query").addEventListener("keydown", (e) => { if (e.key === "Enter") render(e.currentTarget.value); });
  document.querySelectorAll(".quick button").forEach((button) => button.addEventListener("click", () => { $("query").value = button.dataset.q; render(button.dataset.q); }));
  $("copyBtn").addEventListener("click", async () => { if (state.current) { await navigator.clipboard.writeText(state.current.answer); $("copyBtn").textContent = "已复制"; setTimeout(() => $("copyBtn").textContent = "复制回答", 1300); } });
  $("nextBtn").addEventListener("click", () => { const next = state.bank[Math.floor(Math.random() * state.bank.length)]; $("query").value = ""; showAnswer(next); });
}
init().catch((error) => { $("count").textContent = "题库加载失败"; console.error(error); });
