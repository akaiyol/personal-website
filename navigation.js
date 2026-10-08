// Destinations and aliases are local; navigation does not require an API.
const destinations = [
  { id: "work", label: "work history", aliases: ["work", "experience", "career", "resume", "résumé"], url: "#work", copy: "" },
  { id: "projects", label: "projects", aliases: ["project", "portfolio", "builds"], url: "#projects", copy: "Projects are coming soon." },
  { id: "about", label: "about me", aliases: ["about", "bio", "yolanda"], url: "#about", copy: "I'm Yolanda, an Electrical and Computer Engineering student at the University of Waterloo." },
  { id: "github", label: "github", aliases: ["git", "code", "repositories"], url: "https://github.com/akaiyol", external: true },
  { id: "linkedin", label: "linkedin", aliases: ["linked in", "professional profile"], url: "https://www.linkedin.com/in/yolanda-chen1/", external: true },
];
const input = document.querySelector("#command");
const list = document.querySelector("#suggestions");
const completion = document.querySelector("#completion");
const cursor = document.querySelector("#block-cursor");
const response = document.querySelector("#response");
const hint = document.querySelector("#navigation-hint");
const normalHint = hint.textContent;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const normalize = value => value.trim().toLowerCase().replace(/\s+/g, " ");
let matches = [], selected = 0, dismissed = false;
function matching(value) {
  const query = normalize(value);
  return destinations.filter(item => [item.label, ...item.aliases].some(name => name.startsWith(query)));
}
function closeSuggestions() {
  list.hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  completion.replaceChildren();
}
function updateCompletion() {
  completion.replaceChildren();
  if (list.hidden) return;
  const item = matches[selected];
  const typed = input.value;
  if (!item || !typed || !item.label.startsWith(typed.toLowerCase()) || input.selectionStart !== typed.length || input.selectionEnd !== typed.length || input.scrollLeft > 0) return;
  const prefix = document.createElement("span");
  prefix.className = "completion-prefix";
  prefix.textContent = typed;
  const suffix = document.createElement("span");
  suffix.className = "completion-suffix";
  suffix.textContent = item.label.slice(typed.length);
  completion.append(prefix, suffix);
}
function renderSuggestions(reset = true) {
  if (document.activeElement !== input || dismissed) { closeSuggestions(); return; }
  matches = matching(input.value);
  if (reset) selected = 0;
  list.replaceChildren();
  hint.textContent = matches.length ? normalHint : "No matches. Try work, projects, about me, github or linkedin.";
  if (!matches.length) { closeSuggestions(); return; }
  matches.forEach((item, index) => {
    const option = document.createElement("li");
    option.id = `suggestion-${item.id}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", String(index === selected));
    const label = document.createElement("span");
    label.textContent = item.label;
    const kind = document.createElement("span");
    kind.className = "suggestion-kind";
    kind.textContent = item.external ? "external ↗" : "";
    option.append(label, kind);
    // Keep focus on the combobox while a pointer selects an option.
    option.addEventListener("pointerdown", event => event.preventDefault());
    option.addEventListener("click", () => navigate(item));
    list.append(option);
  });
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  input.setAttribute("aria-activedescendant", `suggestion-${matches[selected].id}`);
  updateCompletion();
}
function navigate(item) {
  closeSuggestions();
  input.value = "";
  updateCursor();
  hint.textContent = normalHint;
  if (item.external) location.assign(item.url);
  else {
    if (location.hash === item.url) showRoute(true);
    else location.hash = item.url;
  }
}
function showRoute(focus = false) {
  const id = location.hash.slice(1).split("/")[0] || "home";
  const item = destinations.find(item => !item.external && item.id === id);
  const connect = id === "connect";
  const about = id === "about";
  const work = id === "work";
  document.querySelector("#work-view").hidden = !work;
  document.body.classList.toggle("work-active", work);
  document.querySelector("#about-view").hidden = !about;
  document.body.classList.toggle("about-active", about);
  document.querySelector(".identity").textContent = about ? "yolanda@web:~/about" : work ? "yolanda@web:~/work" : "yolanda@web:~";
  const view = document.querySelector("#destination-view");
  document.querySelector(".hero").hidden = Boolean(item || connect);
  view.hidden = about || work || (!item && !connect);
  response.textContent = "";
  const title = document.querySelector("#destination-title");
  title.textContent = item?.label || "connect";
  document.querySelector("#destination-copy").textContent = item?.copy || "Find me on GitHub and LinkedIn.";
  const links = document.querySelector("#destination-links");
  links.replaceChildren();
  if (connect) destinations.filter(item => item.external).forEach(item => {
    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = `[ ${item.label} ↗ ]`;
    links.append(link);
  });
  document.title = `Yolanda | ${item?.label || (connect ? "Connect" : "Hello")}`;
  if (focus && about) document.querySelector("#about-title").focus();
  else if (focus && work && !location.hash.includes("/")) document.querySelector("#work-title").focus();
  else if (focus && !view.hidden) title.focus();
  if (!location.hash.includes("/")) window.scrollTo({top: 0, behavior: "instant"});
  window.dispatchEvent(new Event("site:route"));
}
window.addEventListener("hashchange", () => showRoute(true));
showRoute();
document.querySelectorAll("[data-command]").forEach(button => button.addEventListener("click", () => {
  const item = destinations.find(item => item.id === button.dataset.command);
  if (item) navigate(item);
  else location.hash = "#connect";
}));
input.addEventListener("focus", () => { finishPrompt(); dismissed = false; renderSuggestions(); updateCursor(); });
input.addEventListener("blur", () => { closeSuggestions(); hint.textContent = normalHint; startPrompt(); });
input.addEventListener("input", () => { dismissed = false; renderSuggestions(); updateCursor(); });
input.addEventListener("click", updateCompletion);
input.addEventListener("keyup", updateCompletion);
input.addEventListener("scroll", updateCompletion);
input.addEventListener("keydown", event => {
  if (event.isComposing) return;
  if (event.key === "Escape") { dismissed = true; closeSuggestions(); }
  else if (["ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    if (list.hidden) { dismissed = false; renderSuggestions(); }
    else { selected = (selected + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length; renderSuggestions(false); }
    document.getElementById(`suggestion-${matches[selected]?.id}`)?.scrollIntoView({block: "nearest"});
  } else if (event.key === "Tab" && !event.shiftKey && !list.hidden && input.value && matches[selected] && normalize(input.value) !== matches[selected].label) {
    event.preventDefault();
    input.value = matches[selected].label;
    renderSuggestions();
    updateCursor();
  }
});
document.querySelector("#command-form").addEventListener("submit", event => {
  event.preventDefault();
  const query = normalize(input.value);
  const exact = destinations.find(item => [item.label, ...item.aliases].includes(query));
  const item = exact || (!list.hidden ? matches[selected] : null);
  if (item) navigate(item);
  else if (query === "home") { location.hash = "#home"; input.value = ""; hint.textContent = normalHint; closeSuggestions(); }
  else if (query === "clear") { response.textContent = ""; input.value = ""; renderSuggestions(); }
  else if (query === "help" || query === "connect") { dismissed = false; input.value = ""; renderSuggestions(); }
  else if (query) { response.textContent = "Choose work history, projects, about me, github or linkedin."; }
  updateCursor();
});
// Demonstrate destinations once, then leave an empty terminal prompt.
const prompts = ["work", "projects", "about me"];
let promptTimer, cursorTimer, promptIndex = 0, promptLength = 0, deleting = false, promptFinished = false;
function stopPrompt() { clearTimeout(promptTimer); }
function updateCursor() {
  const focused = document.activeElement === input;
  const text = input.value || input.placeholder;
  const position = input.value ? (focused ? input.selectionStart : input.value.length) : text.length;
  cursor.style.left = `calc(${position}ch - ${input.scrollLeft}px)`;
  const candidate = !list.hidden && matches[selected]?.label.startsWith(input.value.toLowerCase()) ? matches[selected].label : "";
  cursor.textContent = input.value && focused ? input.value[position] || candidate[position] || "" : "";
  cursor.hidden = focused && input.selectionStart !== input.selectionEnd;
  cursor.classList.add("cursor-moving");
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => cursor.classList.remove("cursor-moving"), 500);
}
function finishPrompt() {
  stopPrompt();
  promptFinished = true;
  input.placeholder = "";
  updateCursor();
}
function promptTick() {
  if (document.hidden || document.activeElement === input || input.value || reducedMotion.matches || promptFinished) return;
  const word = prompts[promptIndex];
  promptLength += deleting ? -1 : 1;
  input.placeholder = word.slice(0, promptLength);
  updateCursor();
  let delay = deleting ? 65 : 125;
  if (!deleting && promptLength === word.length) { deleting = true; delay = 1200; }
  else if (deleting && promptLength === 0) {
    deleting = false;
    promptIndex++;
    if (promptIndex === prompts.length) { finishPrompt(); return; }
    delay = 350;
  }
  promptTimer = setTimeout(promptTick, delay);
}
function startPrompt() {
  stopPrompt();
  if (reducedMotion.matches) { finishPrompt(); return; }
  if (promptFinished || document.activeElement === input || input.value) { updateCursor(); return; }
  if (!document.hidden) {
    input.placeholder = prompts[promptIndex].slice(0, promptLength);
    updateCursor();
    promptTimer = setTimeout(promptTick, 400);
  }
}
["click", "keyup", "select", "scroll"].forEach(type => input.addEventListener(type, updateCursor));
window.addEventListener("resize", updateCursor);
reducedMotion.addEventListener("change", startPrompt);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { stopPrompt(); clearTimeout(cursorTimer); }
  else startPrompt();
});
startPrompt();
