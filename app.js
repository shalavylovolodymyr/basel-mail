const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

const starterTemplate = {
  name: "Starter template",
  subject: "Hello {{firstName}}",
  body: `Hi {{firstName}},

I'm {{senderName}}.

{{personalBlock}}This is a short message for {{company}}. Replace this section with your outreach text.

Would you be open to a short call?

Best regards,
{{senderName}}`,
};

const blankTemplate = {
  name: "Blank template",
  subject: "",
  body: `Hi {{firstName}},

{{personalBlock}}

Best regards,
{{senderName}}`,
};

const el = {
  brandButton: document.getElementById("brandButton"),
  topActions: document.getElementById("topActions"),
  templatesButton: document.getElementById("templatesButton"),
  queueButton: document.getElementById("queueButton"),
  queueCount: document.getElementById("queueCount"),
  settingsButton: document.getElementById("settingsButton"),
  newEmailButton: document.getElementById("newEmailButton"),
  privacyBackdrop: document.getElementById("privacyBackdrop"),
  closePrivacyButton: document.getElementById("closePrivacyButton"),
  confirmBackdrop: document.getElementById("confirmBackdrop"),
  confirmTitle: document.getElementById("confirmTitle"),
  confirmMessage: document.getElementById("confirmMessage"),
  confirmCancelButton: document.getElementById("confirmCancelButton"),
  confirmConfirmButton: document.getElementById("confirmConfirmButton"),
  workspace: document.getElementById("workspace"),
  loadingCard: document.getElementById("loadingCard"),
  emptyState: document.getElementById("emptyState"),
  emptyCreateBlankButton: document.getElementById("emptyCreateBlankButton"),
  emptyCreateStarterButton: document.getElementById("emptyCreateStarterButton"),
  emptyUploadButton: document.getElementById("emptyUploadButton"),
  emptyDropZone: document.getElementById("emptyDropZone"),
  emptyUpload: document.getElementById("emptyUpload"),
  composer: document.getElementById("composer"),
  tabsShell: document.getElementById("tabsShell"),
  tabsLeft: document.getElementById("tabsLeft"),
  tabsRight: document.getElementById("tabsRight"),
  mainTabs: document.getElementById("mainTabs"),
  senderName: document.getElementById("senderName"),
  firstName: document.getElementById("firstName"),
  recipientEmails: document.getElementById("recipientEmails"),
  company: document.getElementById("company"),
  personalBlock: document.getElementById("personalBlock"),
  previewTo: document.getElementById("previewTo"),
  previewSubject: document.getElementById("previewSubject"),
  previewBody: document.getElementById("previewBody"),
  previewContent: document.getElementById("previewContent"),
  draftEditor: document.getElementById("draftEditor"),
  draftSubject: document.getElementById("draftSubject"),
  draftBody: document.getElementById("draftBody"),
  editEmailButton: document.getElementById("editEmailButton"),
  doneEditingButton: document.getElementById("doneEditingButton"),
  revertEmailButton: document.getElementById("revertEmailButton"),
  sendButton: document.getElementById("sendButton"),
  sendButtonLabel: document.getElementById("sendButtonLabel"),
  queueEmailButton: document.getElementById("queueEmailButton"),
  copyButton: document.getElementById("copyButton"),
  status: document.getElementById("status"),
  templatesBackdrop: document.getElementById("templatesBackdrop"),
  closeTemplatesButton: document.getElementById("closeTemplatesButton"),
  templateManageList: document.getElementById("templateManageList"),
  templateForm: document.getElementById("templateForm"),
  templateName: document.getElementById("templateName"),
  templateSubject: document.getElementById("templateSubject"),
  templateBody: document.getElementById("templateBody"),
  saveTemplateButton: document.getElementById("saveTemplateButton"),
  duplicateTemplateButton: document.getElementById("duplicateTemplateButton"),
  deleteTemplateButton: document.getElementById("deleteTemplateButton"),
  newTemplateName: document.getElementById("newTemplateName"),
  addBlankTemplateButton: document.getElementById("addBlankTemplateButton"),
  addStarterTemplateButton: document.getElementById("addStarterTemplateButton"),
  downloadTemplatesButton: document.getElementById("downloadTemplatesButton"),
  uploadTemplatesButton: document.getElementById("uploadTemplatesButton"),
  templateUpload: document.getElementById("templateUpload"),
  settingsDropZone: document.getElementById("settingsDropZone"),
  queueBackdrop: document.getElementById("queueBackdrop"),
  closeQueueButton: document.getElementById("closeQueueButton"),
  queueEmpty: document.getElementById("queueEmpty"),
  queueList: document.getElementById("queueList"),
  settingsBackdrop: document.getElementById("settingsBackdrop"),
  closeSettingsButton: document.getElementById("closeSettingsButton"),
  accountName: document.getElementById("accountName"),
  accountEmail: document.getElementById("accountEmail"),
  storagePath: document.getElementById("storagePath"),
  storageCount: document.getElementById("storageCount"),
  syncStatus: document.getElementById("syncStatus"),
  syncNowButton: document.getElementById("syncNowButton"),
  settingsAccountStatus: document.getElementById("settingsAccountStatus"),
  clearCurrentDraftButton: document.getElementById("clearCurrentDraftButton"),
  clearQueueButton: document.getElementById("clearQueueButton"),
  clearTemplatesButton: document.getElementById("clearTemplatesButton"),
  clearAllDataButton: document.getElementById("clearAllDataButton"),
  appearanceControl: document.getElementById("appearanceControl"),
  workspaceStatus: document.getElementById("workspaceStatus"),
  workspaceSync: document.getElementById("workspaceSync"),
  templateStatus: document.getElementById("templateStatus"),
  queueStatus: document.getElementById("queueStatus"),
  readinessHint: document.getElementById("readinessHint"),
  mobileTemplateSelect: document.getElementById("mobileTemplateSelect"),
  mobileTemplateName: document.getElementById("mobileTemplateName"),
  emailAppControl: document.getElementById("emailAppControl"),
  templateManagerEmpty: document.getElementById("templateManagerEmpty"),
  previousTemplateButton: document.getElementById("previousTemplateButton"),
  nextTemplateButton: document.getElementById("nextTemplateButton"),
};

const LOCAL_STORAGE_KEY = "baselMail.localWorkspace.v1";
let templates = [];
let queuedEmails = [];
let settings = createDefaultSettings();
let selectedManageTemplateId = null;
let syncTimer = null;
let syncing = false;
let loading = false;
let loaded = { settings: false, templates: false, queue: false };
let dragTemplateId = null;
let dragOrigin = null;
let activeModal = null;
let modalTrigger = null;
let templateDirty = false;
let loadedEditorId = null;
let tabsSignature = "";
let managerSignature = "";
let syncError = "";
let pendingSettings = false;
let queuePending = false;
let confirmationResolver = null;
let confirmationPreviousModal = null;
let syncClearTimer = null;
let syncDisplayState = "";
let lastTemplateTap = { id: null, at: 0 };
const statusTimers = new WeakMap();

function createDefaultSettings() {
  return {
    senderName: "",
    firstName: "",
    recipientEmails: "",
    company: "",
    personalBlock: "",
    selectedTemplateId: null,
    draftOverride: null,
    appearance: "auto",
    emailApp: "outlook",
  };
}

function workspaceActive() {
  return true;
}

function localSettingsPayload() {
  return {
    senderName: String(settings.senderName || ""),
    firstName: String(settings.firstName || ""),
    recipientEmails: String(settings.recipientEmails || ""),
    company: String(settings.company || ""),
    personalBlock: String(settings.personalBlock || ""),
    selectedTemplateId: settings.selectedTemplateId || null,
    draftOverride: settings.draftOverride
      ? {
          subject: String(settings.draftOverride.subject || ""),
          body: String(settings.draftOverride.body || ""),
        }
      : null,
    appearance: settings.appearance || "auto",
    emailApp: settings.emailApp || "outlook",
  };
}

function localWorkspacePayload() {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    settings: localSettingsPayload(),
    templates: templates.map((template) => ({
      id: String(template.id),
      name: String(template.name || "Template"),
      subject: String(template.subject || ""),
      body: String(template.body || ""),
      sort: Number(template.sort || 0),
      createdAtISO: String(template.createdAtISO || ""),
      updatedAtISO: String(template.updatedAtISO || ""),
    })),
    queue: queuedEmails.map((item) => ({
      id: String(item.id),
      templateId: item.templateId || null,
      templateName: String(item.templateName || "Template"),
      senderName: String(item.senderName || ""),
      firstName: String(item.firstName || ""),
      recipientEmails: String(item.recipientEmails || ""),
      company: String(item.company || ""),
      personalBlock: String(item.personalBlock || ""),
      recipients: Array.isArray(item.recipients)
        ? item.recipients.map(String)
        : [],
      subject: String(item.subject || ""),
      body: String(item.body || ""),
      createdAtISO: String(item.createdAtISO || ""),
    })),
  };
}

function writeLocalWorkspace() {
  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(localWorkspacePayload()),
    );
    return true;
  } catch (error) {
    syncError =
      "Could not save to this browser. Local storage may be disabled or full.";
    setStatus(el.workspaceStatus, syncError, "error");
    return false;
  }
}

function loadLocalWorkspace() {
  let data = null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  settings = sanitizeSettings(data?.settings || {});
  templates = Array.isArray(data?.templates)
    ? data.templates
        .filter((template) => template && typeof template === "object")
        .map((template, index) => ({
          id: String(template.id || createId("template")),
          name: String(template.name || "Template"),
          subject: String(template.subject || ""),
          body: String(template.body || ""),
          sort: Number(template.sort || (index + 1) * 1000),
          createdAtISO: String(template.createdAtISO || ""),
          updatedAtISO: String(template.updatedAtISO || ""),
        }))
        .sort((a, b) => a.sort - b.sort)
    : [];
  queuedEmails = Array.isArray(data?.queue)
    ? data.queue
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          id: String(item.id || createId("queue")),
          templateId: item.templateId || null,
          templateName: String(item.templateName || "Template"),
          senderName: String(item.senderName || ""),
          firstName: String(item.firstName || ""),
          recipientEmails: String(item.recipientEmails || ""),
          company: String(item.company || ""),
          personalBlock: String(item.personalBlock || ""),
          recipients: Array.isArray(item.recipients)
            ? item.recipients.map(String)
            : parseRecipients(item.recipientEmails || ""),
          subject: String(item.subject || ""),
          body: String(item.body || ""),
          createdAtISO: String(item.createdAtISO || ""),
        }))
        .sort((a, b) =>
          String(b.createdAtISO).localeCompare(String(a.createdAtISO)),
        )
    : [];

  loaded = { settings: true, templates: true, queue: true };
  loading = false;
  ensureSelectedTemplate();
  applyAppearance(settings.appearance);
  syncInputFields();
}

function setStatus(element, message = "", type = "") {
  element = element || el.workspaceStatus;
  if (
    message &&
    element &&
    (element.closest("[hidden]") ||
      element.parentElement?.getClientRects().length === 0)
  ) {
    element =
      activeModal?.querySelector(".modal-status .status-line") ||
      el.workspaceStatus;
  }
  if (!element) return null;
  const existingTimer = statusTimers.get(element);
  if (existingTimer) {
    clearTimeout(existingTimer);
    statusTimers.delete(element);
  }
  element.textContent = message;
  element.classList.toggle("error", type === "error");
  element.classList.toggle("success", type === "success");
  return element;
}

function setTemporaryStatus(element, message, type = "success", delay = 2400) {
  const target = setStatus(element, message, type);
  const timer = setTimeout(() => {
    if (target.textContent === message) setStatus(target, "");
  }, delay);
  statusTimers.set(target, timer);
}

function userMessage(error) {
  return error?.message || "Something went wrong.";
}

function applyAppearance(choice = settings.appearance || "auto") {
  const resolved =
    choice === "auto" ? (systemTheme.matches ? "dark" : "light") : choice;
  document.documentElement.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]').content =
    resolved === "dark" ? "#080808" : "#fafafa";
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    const active = button.dataset.themeChoice === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function applyEmailAppChoice(choice = settings.emailApp || "outlook") {
  document.querySelectorAll("[data-email-app]").forEach((button) => {
    const active = button.dataset.emailApp === choice;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function selectedTemplate() {
  return (
    templates.find((template) => template.id === settings.selectedTemplateId) ||
    templates[0] ||
    null
  );
}

function ensureSelectedTemplate() {
  if (!templates.length) return null;
  if (
    !templates.some((template) => template.id === settings.selectedTemplateId)
  ) {
    settings.selectedTemplateId = templates[0].id;
    if (loaded.settings) scheduleSettingsSave();
  }
  return selectedTemplate();
}

function sanitizeSettings(data = {}) {
  const defaults = createDefaultSettings();
  return {
    senderName:
      typeof data.senderName === "string"
        ? data.senderName
        : defaults.senderName,
    firstName: typeof data.firstName === "string" ? data.firstName : "",
    recipientEmails:
      typeof data.recipientEmails === "string" ? data.recipientEmails : "",
    company: typeof data.company === "string" ? data.company : "",
    personalBlock:
      typeof data.personalBlock === "string" ? data.personalBlock : "",
    selectedTemplateId:
      typeof data.selectedTemplateId === "string"
        ? data.selectedTemplateId
        : null,
    draftOverride:
      data.draftOverride && typeof data.draftOverride === "object"
        ? {
            subject: String(data.draftOverride.subject || ""),
            body: String(data.draftOverride.body || ""),
          }
        : null,
    appearance: ["auto", "light", "dark"].includes(data.appearance)
      ? data.appearance
      : "auto",
    emailApp: ["outlook", "default"].includes(data.emailApp)
      ? data.emailApp
      : "outlook",
  };
}

function syncInputFields() {
  el.senderName.value = settings.senderName;
  el.firstName.value = settings.firstName;
  el.recipientEmails.value = settings.recipientEmails;
  el.company.value = settings.company;
  el.personalBlock.value = settings.personalBlock;
  autoResize(el.personalBlock);
}

function scheduleSettingsSave() {
  if (!workspaceActive()) return;
  clearTimeout(syncTimer);
  pendingSettings = true;
  syncError = "";
  setStatus(el.workspaceStatus, "");
  renderSyncState();
  syncTimer = setTimeout(saveSettingsNow, 400);
}

async function saveSettingsNow() {
  if (!workspaceActive()) return false;
  clearTimeout(syncTimer);
  pendingSettings = false;
  syncing = true;
  syncError = "";
  renderSyncState();
  const saved = writeLocalWorkspace();
  syncing = false;
  renderSyncState();
  return saved;
}

function renderSyncState() {
  if (!workspaceActive()) return;
  const busy = syncing || pendingSettings;
  const state = syncError ? "error" : busy ? "saving" : "saved";
  if (state === syncDisplayState) return;
  syncDisplayState = state;
  clearTimeout(syncClearTimer);
  const text =
    state === "error" ? "Not saved" : busy ? "Saving…" : "Saved locally";
  [el.syncStatus, el.workspaceSync].forEach((element) => {
    if (!element) return;
    element.textContent = text;
    element.dataset.state = state;
  });
  if (state === "saved") {
    syncClearTimer = setTimeout(() => {
      if (syncDisplayState !== "saved") return;
      [el.syncStatus, el.workspaceSync].forEach((element) => {
        if (!element) return;
        element.textContent = "";
        delete element.dataset.state;
      });
    }, 2000);
  }
}

function renderAll() {
  document.body.classList.add("signed-in");
  document.querySelector('meta[name="theme-color"]').content =
    document.documentElement.dataset.theme === "dark" ? "#080808" : "#fafafa";
  el.workspace.hidden = false;
  el.topActions.hidden = false;

  el.loadingCard.hidden = !loading;
  const hasTemplates = templates.length > 0;
  el.emptyState.hidden = loading || hasTemplates;
  el.composer.hidden = loading || !hasTemplates;

  renderTabs();
  renderPreview();
  renderQueueCount();
  renderQueueList();
  renderTemplateManager();
  renderAccount();
  renderSyncState();
  applyEmailAppChoice();
}

function renderTabs() {
  const current = ensureSelectedTemplate();
  const signature = JSON.stringify([
    current?.id,
    templates.map(({ id, name }) => [id, name]),
  ]);
  if (signature === tabsSignature) return;
  tabsSignature = signature;
  const focused = el.mainTabs.contains(document.activeElement)
    ? document.activeElement.dataset.templateId
    : null;
  const scroll = el.mainTabs.scrollLeft;
  el.mainTabs.innerHTML = "";
  el.mobileTemplateSelect.replaceChildren();
  el.mobileTemplateName.textContent = current?.name || "Choose template";
  templates.forEach((template) => {
    const button = document.createElement("button");
    button.className = "tab" + (template.id === current?.id ? " active" : "");
    button.type = "button";
    button.textContent = template.name;
    button.title = `${template.name} — double-click or double-tap to edit`;
    button.setAttribute("aria-pressed", String(template.id === current?.id));
    button.draggable = true;
    button.dataset.templateId = template.id;
    attachTemplateDrag(button, "horizontal");
    button.addEventListener("click", () => selectTemplate(template.id));
    button.addEventListener("dblclick", (event) => {
      event.preventDefault();
      openTemplateEditor(template.id);
    });
    button.addEventListener("pointerup", (event) => {
      if (event.pointerType !== "touch") return;
      handleTemplateDoubleTap(template.id);
    });
    el.mainTabs.appendChild(button);
    el.mobileTemplateSelect.add(
      new Option(
        template.name,
        template.id,
        false,
        template.id === current?.id,
      ),
    );
    if (template.id === focused) button.focus({ preventScroll: true });
  });
  el.mainTabs.scrollLeft = scroll;
  requestAnimationFrame(updateTabButtons);
}

function renderQueueCount() {
  const count = queuedEmails.length;
  el.queueCount.hidden = count === 0;
  el.queueCount.textContent = String(count);
}

function renderAccount() {
  if (!workspaceActive()) return;
  el.accountName.textContent = "Local workspace";
  el.accountEmail.textContent = "Stored only in this browser on this device";
  document.getElementById("accountAvatar").textContent = "L";
  el.storagePath.textContent = "Browser localStorage";
  el.storageCount.textContent = `${templates.length} templates · ${queuedEmails.length} queued emails`;
}

function loadTemplateEditorFields(template) {
  el.templateName.value = template.name;
  el.templateName.defaultValue = template.name;
  el.templateSubject.value = template.subject;
  el.templateSubject.defaultValue = template.subject;
  el.templateBody.value = template.body;
  el.templateBody.defaultValue = template.body;
  autoResize(el.templateBody);
}

function renderTemplateManager() {
  const current =
    templates.find((template) => template.id === selectedManageTemplateId) ||
    selectedTemplate() ||
    templates[0] ||
    null;
  if (current) selectedManageTemplateId = current.id;
  const signature = JSON.stringify([
    current?.id,
    templates.map(({ id, name }) => [id, name]),
  ]);
  const focused = el.templateManageList.contains(document.activeElement)
    ? document.activeElement.dataset.templateId
    : null;
  if (signature !== managerSignature) {
    managerSignature = signature;
    el.templateManageList.innerHTML = "";
    templates.forEach((template) => {
      const button = document.createElement("button");
      button.className =
        "template-list-item" + (template.id === current?.id ? " active" : "");
      button.type = "button";
      button.title = template.name;
      button.setAttribute("aria-pressed", String(template.id === current?.id));
      button.draggable = true;
      button.dataset.templateId = template.id;
      const name = document.createElement("span");
      name.textContent = template.name;
      button.append(name);
      attachTemplateDrag(button, "horizontal");
      button.addEventListener("click", () =>
        selectManagedTemplate(template.id),
      );
      el.templateManageList.appendChild(button);
      if (template.id === focused) button.focus({ preventScroll: true });
    });
  }
  const index = templates.findIndex((template) => template.id === current?.id);
  el.previousTemplateButton.disabled = index <= 0;
  el.nextTemplateButton.disabled = index < 0 || index === templates.length - 1;
  el.templateManagerEmpty.hidden = Boolean(current);
  el.templateForm.hidden = !current;
  if (current && (loadedEditorId !== current.id || !templateDirty)) {
    loadedEditorId = current.id;
    loadTemplateEditorFields(current);
    requestAnimationFrame(() => {
      if (selectedManageTemplateId === current.id && !templateDirty)
        loadTemplateEditorFields(current);
    });
  }
}

function renderQueueList() {
  el.queueList.innerHTML = "";
  el.queueEmpty.hidden = queuedEmails.length > 0;
  queuedEmails.forEach((item) => {
    const article = document.createElement("article");
    article.className = "queue-item";
    const title = document.createElement("h3");
    title.textContent = item.subject || "No subject";
    const meta = document.createElement("div");
    meta.className = "queue-item-meta";
    meta.textContent = queueMeta(item);
    const preview = document.createElement("div");
    preview.className = "queue-item-preview";
    preview.textContent = item.body || "";
    const actions = document.createElement("div");
    actions.className = "queue-item-actions";
    const openButton = createButton(
      "Open in Outlook",
      "btn primary small",
      () => launchOutlook(item.recipients, item.subject, item.body),
    );
    const loadButton = createButton("Load", "btn small", () =>
      loadQueuedEmail(item),
    );
    const removeButton = createButton("Remove", "btn small", () =>
      removeQueuedEmail(item.id),
    );
    actions.append(openButton, loadButton, removeButton);
    article.append(title, meta, preview, actions);
    el.queueList.appendChild(article);
  });
}

function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function queueMeta(item) {
  const recipients = item.recipients.join(", ") || "No recipient";
  const date = item.createdAtISO ? new Date(item.createdAtISO) : null;
  if (!date || Number.isNaN(date.getTime())) return recipients;
  const formatted = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${recipients} · ${formatted}`;
}

function requestConfirmation(message, title = "Please confirm") {
  if (confirmationResolver) confirmationResolver(false);
  confirmationPreviousModal = activeModal;
  if (confirmationPreviousModal) {
    confirmationPreviousModal.hidden = true;
    activeModal = null;
  }
  el.confirmTitle.textContent = title;
  el.confirmMessage.textContent = message;
  el.confirmBackdrop.hidden = false;
  document.querySelector(".app").inert = true;
  document.body.classList.add("modal-open");
  el.confirmConfirmButton.focus();
  return new Promise((resolve) => {
    confirmationResolver = resolve;
  });
}

function finishConfirmation(result) {
  const resolve = confirmationResolver;
  confirmationResolver = null;
  el.confirmBackdrop.hidden = true;
  if (confirmationPreviousModal) {
    activeModal = confirmationPreviousModal;
    confirmationPreviousModal.hidden = false;
    confirmationPreviousModal = null;
  } else {
    document.querySelector(".app").inert = false;
    document.body.classList.remove("modal-open");
  }
  resolve?.(result);
}

async function discardTemplateChangesAsync() {
  if (!templateDirty) return true;
  const confirmed = await requestConfirmation(
    "Discard unsaved template changes?",
  );
  if (!confirmed) return false;
  templateDirty = false;
  return true;
}

async function selectManagedTemplate(templateId) {
  if (!templates.some((template) => template.id === templateId)) return false;
  if (
    templateId !== selectedManageTemplateId &&
    !(await discardTemplateChangesAsync())
  )
    return false;
  selectedManageTemplateId = templateId;
  loadedEditorId = null;
  setStatus(el.templateStatus, "");
  renderTemplateManager();
  return true;
}

async function openTemplateEditor(templateId) {
  if (!(await selectManagedTemplate(templateId))) return;
  await openModal(el.templatesBackdrop);
  requestAnimationFrame(() => {
    autoResize(el.templateBody);
    el.templateName.focus();
  });
}

function handleTemplateDoubleTap(templateId) {
  const now = Date.now();
  if (lastTemplateTap.id === templateId && now - lastTemplateTap.at < 450) {
    lastTemplateTap = { id: null, at: 0 };
    openTemplateEditor(templateId);
    return;
  }
  lastTemplateTap = { id: templateId, at: now };
}

async function selectTemplate(templateId) {
  if (templateId === settings.selectedTemplateId) return;
  if (
    settings.draftOverride &&
    !(await requestConfirmation(
      "Switch template and replace your edited message?",
    ))
  ) {
    el.mobileTemplateSelect.value = settings.selectedTemplateId;
    return;
  }
  settings.selectedTemplateId = templateId;
  settings.draftOverride = null;
  closeDraftEditor();
  scheduleSettingsSave();
  renderAll();
  setStatus(el.status, "");
}

function normalizePersonalBlock(value) {
  const clean = String(value || "").trim();
  return clean ? clean + "\n\n" : "";
}

function renderText(text) {
  const values = {
    firstName: settings.firstName.trim(),
    senderName: settings.senderName.trim(),
    company: settings.company.trim(),
    personalBlock: normalizePersonalBlock(settings.personalBlock),
  };
  return String(text || "").replace(
    /\{\{(firstName|senderName|company|personalBlock)\}\}/g,
    (_, key) => values[key] ?? "",
  );
}

function rawEmailTemplate() {
  if (settings.draftOverride) return settings.draftOverride;
  const template = selectedTemplate();
  if (!template) return { subject: "", body: "" };
  return { subject: template.subject, body: template.body };
}

function renderedEmail() {
  const source = rawEmailTemplate();
  return {
    subject: renderText(source.subject).trim(),
    body: renderText(source.body).trim(),
  };
}

function renderPreview() {
  const email = renderedEmail();
  const recipients = parseRecipients(settings.recipientEmails);
  el.previewTo.textContent = recipients.join(", ") || "Add a recipient";
  el.previewSubject.textContent = email.subject || "No subject";
  el.previewBody.textContent = email.body || "Your message will appear here.";
  const validation = validateEmail();
  el.readinessHint.textContent = validation || "Ready. Review and send.";
  el.sendButtonLabel.textContent =
    settings.emailApp === "default" ? "Open in email app" : "Open in Outlook";
  el.sendButton.disabled = Boolean(validation);
  el.queueEmailButton.disabled = Boolean(validation) || queuePending;
  el.copyButton.disabled = !email.subject && !email.body;
}

function parseRecipients(value) {
  return String(value || "")
    .split(/[;,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateEmail() {
  if (!templates.length) return "Create or import a template first.";
  const recipients = parseRecipients(settings.recipientEmails);
  if (!recipients.length) return "Add a recipient email to continue.";
  const invalid = recipients.find((email) => !isValidEmail(email));
  if (invalid) return `Check email: ${invalid}`;
  const source = rawEmailTemplate();
  const text = source.subject + "\n" + source.body;
  for (const [key, label] of [
    ["firstName", "the recipient name"],
    ["senderName", "your name"],
    ["company", "the company"],
  ]) {
    if (text.includes("{{" + key + "}}") && !settings[key].trim())
      return `Add ${label} in Details.`;
  }
  const email = renderedEmail();
  if (!email.subject) return "Add a subject using Edit.";
  if (!email.body) return "Write a message using Edit.";
  return "";
}

function isMobileDevice() {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 &&
      window.matchMedia("(max-width: 1000px)").matches)
  );
}

function buildMailtoUrl(recipients, subject, body) {
  const to = (recipients || []).join(",");
  return (
    "mailto:" +
    to +
    "?subject=" +
    encodeURIComponent(subject || "") +
    "&body=" +
    encodeURIComponent(body || "")
  );
}

function buildOutlookWebUrl(recipients, subject, body) {
  const to = (recipients || []).join(",");
  const normalizedBody = String(body || "").replace(/\r?\n/g, "\r\n");
  return (
    "https://outlook.office.com/mail/deeplink/compose" +
    "?to=" +
    encodeURIComponent(to) +
    "&subject=" +
    encodeURIComponent(subject || "") +
    "&body=" +
    encodeURIComponent(normalizedBody)
  );
}

function buildOutlookMobileUrl(recipients, subject, body) {
  const to = (recipients || []).join(",");
  const normalizedBody = String(body || "").replace(/\r?\n/g, "\r\n");
  return (
    "ms-outlook://compose" +
    "?to=" +
    encodeURIComponent(to) +
    "&subject=" +
    encodeURIComponent(subject || "") +
    "&body=" +
    encodeURIComponent(normalizedBody)
  );
}

function launchOutlook(recipients, subject, body) {
  if (isMobileDevice()) {
    // Outlook's HTTPS compose link can be intercepted by the mobile app but lose
    // the query parameters. Use Outlook's mobile URI scheme instead so To,
    // Subject and Body are passed directly into the compose screen.
    window.location.href = buildOutlookMobileUrl(recipients, subject, body);
    return;
  }

  const url = buildOutlookWebUrl(recipients, subject, body);
  const opened = window.open(url, "_blank");
  if (opened) {
    try {
      opened.opener = null;
    } catch {}
  } else {
    window.location.href = url;
  }
}

function launchDefaultEmailApp(recipients, subject, body) {
  window.location.href = buildMailtoUrl(recipients, subject, body);
}

async function openEmailApp(event) {
  if (event && !event.isTrusted) return;

  saveDraftEditorChanges();
  const validation = validateEmail();
  if (validation) {
    setStatus(el.status, validation, "error");
    return;
  }

  const email = renderedEmail();
  const recipients = parseRecipients(settings.recipientEmails);

  if (settings.emailApp === "default") {
    launchDefaultEmailApp(recipients, email.subject, email.body);
  } else {
    launchOutlook(recipients, email.subject, email.body);
  }

  setTemporaryStatus(
    el.status,
    settings.emailApp === "default"
      ? "Email app requested. Review your email there."
      : "Outlook requested. If Outlook is unavailable, your default mail app will open.",
    "success",
    3500,
  );

  await saveSettingsNow();
}

async function queueCurrentEmail() {
  if (!workspaceActive() || queuePending) return;
  saveDraftEditorChanges();
  const validation = validateEmail();
  if (validation) {
    setStatus(el.status, validation, "error");
    return;
  }
  const email = renderedEmail();
  const template = selectedTemplate();
  const item = {
    id: createId("queue"),
    templateId: template?.id || null,
    templateName: template?.name || "Template",
    senderName: settings.senderName,
    firstName: settings.firstName,
    recipientEmails: settings.recipientEmails,
    company: settings.company,
    personalBlock: settings.personalBlock,
    recipients: parseRecipients(settings.recipientEmails),
    subject: email.subject,
    body: email.body,
    createdAtISO: new Date().toISOString(),
  };
  queuePending = true;
  renderPreview();
  try {
    queuedEmails = [item, ...queuedEmails];
    if (!writeLocalWorkspace())
      throw new Error("Could not save the queued email locally.");
    renderAll();
    setStatus(el.status, "Added to queue.", "success");
  } catch (error) {
    setStatus(el.status, userMessage(error), "error");
  } finally {
    queuePending = false;
    renderPreview();
  }
}

async function copyEmail() {
  saveDraftEditorChanges();
  const email = renderedEmail();
  const text = `To: ${parseRecipients(settings.recipientEmails).join(", ")}\nSubject: ${email.subject}\n\n${email.body}`;
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const previousFocus = document.activeElement;
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    textarea.remove();
    previousFocus?.focus({ preventScroll: true });
  }
  setStatus(
    el.status,
    copied ? "Email copied." : "Couldn’t copy. Select and copy the message.",
    copied ? "success" : "error",
  );
}

function openDraftEditor() {
  const source = rawEmailTemplate();
  el.draftSubject.value = source.subject;
  el.draftBody.value = source.body;
  el.previewContent.hidden = true;
  el.draftEditor.hidden = false;
  el.editEmailButton.hidden = true;
  requestAnimationFrame(() => {
    autoResize(el.draftBody);
    el.draftSubject.focus();
  });
}

function saveDraftEditorChanges() {
  if (el.draftEditor.hidden) return;
  settings.draftOverride = {
    subject: el.draftSubject.value,
    body: el.draftBody.value,
  };
  scheduleSettingsSave();
  renderPreview();
}

function doneEditing() {
  settings.draftOverride = {
    subject: el.draftSubject.value,
    body: el.draftBody.value,
  };
  closeDraftEditor();
  scheduleSettingsSave();
  renderPreview();
  setStatus(el.status, "Email updated.", "success");
  el.editEmailButton.focus();
}

function revertEmail() {
  settings.draftOverride = null;
  closeDraftEditor();
  scheduleSettingsSave();
  renderPreview();
  setStatus(el.status, "Using template.", "success");
}

function closeDraftEditor() {
  el.draftEditor.hidden = true;
  el.previewContent.hidden = false;
  el.editEmailButton.hidden = false;
}

function newEmail() {
  if (!templates.length) {
    openTemplates();
    el.newTemplateName.focus();
    return;
  }
  settings.firstName = "";
  settings.recipientEmails = "";
  settings.company = "";
  settings.personalBlock = "";
  settings.draftOverride = null;
  closeDraftEditor();
  syncInputFields();
  scheduleSettingsSave();
  renderPreview();
  setStatus(el.status, "");
  setMobilePanel("details");
  el.recipientEmails.focus();
}

function createId(prefix) {
  if (crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

async function createTemplate(kind = "blank", name = "") {
  if (!workspaceActive() || !(await discardTemplateChangesAsync())) return;
  const base = kind === "starter" ? starterTemplate : blankTemplate;
  const id = createId("template");
  const title = String(name || "").trim() || base.name;
  const maxSort = templates.reduce(
    (max, template) => Math.max(max, Number(template.sort || 0)),
    0,
  );
  const now = new Date().toISOString();
  const payload = {
    id,
    name: title,
    subject: base.subject,
    body: base.body,
    sort: maxSort + 1000,
    createdAtISO: now,
    updatedAtISO: now,
  };
  try {
    templates = [...templates, payload].sort((a, b) => a.sort - b.sort);
    settings.selectedTemplateId = id;
    selectedManageTemplateId = id;
    settings.draftOverride = null;
    await saveSettingsNow();
    el.newTemplateName.value = "";
    renderTemplateManager();
    openModal(el.templatesBackdrop);
    requestAnimationFrame(() => {
      autoResize(el.templateBody);
      el.templateName.focus();
    });
    setTemporaryStatus(el.templateStatus, "Template created.");
  } catch (error) {
    setStatus(el.status, userMessage(error), "error");
  }
}

async function saveTemplate() {
  const id = selectedManageTemplateId;
  if (!id || !workspaceActive() || el.saveTemplateButton.disabled) return;
  const values = {
    name: el.templateName.value.trim() || "Template",
    subject: el.templateSubject.value,
    body: el.templateBody.value,
  };
  el.saveTemplateButton.disabled = true;
  setStatus(el.templateStatus, "Saving…");
  try {
    templates = templates.map((template) =>
      template.id === id
        ? { ...template, ...values, updatedAtISO: new Date().toISOString() }
        : template,
    );
    if (id === settings.selectedTemplateId) settings.draftOverride = null;
    await saveSettingsNow();
    templateDirty = false;
    loadedEditorId = id;
    renderAll();
    setTemporaryStatus(el.templateStatus, "Template saved.");
  } catch (error) {
    setStatus(el.templateStatus, userMessage(error), "error");
  } finally {
    el.saveTemplateButton.disabled = false;
  }
}

async function duplicateTemplate() {
  const source = templates.find(
    (template) => template.id === selectedManageTemplateId,
  );
  if (!source || !workspaceActive()) return;
  const id = createId("template");
  const now = new Date().toISOString();
  const copy = {
    id,
    name: `${el.templateName.value.trim() || source.name} copy`,
    subject: el.templateSubject.value,
    body: el.templateBody.value,
    sort: Number(source.sort || 0) + 1,
    createdAtISO: now,
    updatedAtISO: now,
  };
  try {
    templates = [...templates, copy].sort((a, b) => a.sort - b.sort);
    templateDirty = false;
    selectedManageTemplateId = id;
    settings.selectedTemplateId = id;
    settings.draftOverride = null;
    await reorderByIds(templates.map((template) => template.id));
    await saveSettingsNow();
  } catch (error) {
    setStatus(el.templateStatus, userMessage(error), "error");
  }
}

async function deleteSelectedTemplate() {
  const id = selectedManageTemplateId;
  if (!id || !workspaceActive()) return;
  const template = templates.find((item) => item.id === id);
  if (
    !(await requestConfirmation(`Delete ${template?.name || "this template"}?`))
  )
    return;
  try {
    templateDirty = false;
    templates = templates.filter((template) => template.id !== id);
    selectedManageTemplateId = templates[0]?.id || null;
    if (settings.selectedTemplateId === id) {
      settings.selectedTemplateId = selectedManageTemplateId;
      settings.draftOverride = null;
    }
    await saveSettingsNow();
    renderAll();
  } catch (error) {
    setStatus(el.templateStatus, userMessage(error), "error");
  }
}

async function reorderByIds(ids) {
  if (!workspaceActive()) return;
  const now = new Date().toISOString();
  templates = ids
    .map((id, index) => {
      const template = templates.find((item) => item.id === id);
      if (!template) return null;
      return { ...template, sort: (index + 1) * 1000, updatedAtISO: now };
    })
    .filter(Boolean);
  writeLocalWorkspace();
  renderAll();
}

async function reorderTemplate(sourceId, targetId, after = false) {
  if (!sourceId || !targetId || sourceId === targetId) return;
  const ids = templates
    .map((template) => template.id)
    .filter((id) => id !== sourceId);
  const targetIndex = ids.indexOf(targetId);
  ids.splice(targetIndex + (after ? 1 : 0), 0, sourceId);
  try {
    await reorderByIds(ids);
  } catch (error) {
    setStatus(el.settingsAccountStatus, userMessage(error), "error");
  }
}

function clearDragMarkers() {
  document
    .querySelectorAll(".drag-before, .drag-after")
    .forEach((item) => item.classList.remove("drag-before", "drag-after"));
}

function attachTemplateDrag(button, orientation) {
  if (orientation !== "horizontal") return;
  button.dataset.dragOrientation = "horizontal";
  button.addEventListener("dragstart", (event) => {
    dragTemplateId = button.dataset.templateId;
    dragOrigin = orientation;
    button.classList.add("dragging");
    button.setAttribute("aria-grabbed", "true");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", dragTemplateId);
  });
  button.addEventListener("dragend", () => {
    dragTemplateId = null;
    dragOrigin = null;
    button.classList.remove("dragging");
    button.setAttribute("aria-grabbed", "false");
    clearDragMarkers();
  });
  button.addEventListener("dragover", (event) => {
    if (!dragTemplateId || dragTemplateId === button.dataset.templateId) return;
    event.preventDefault();
    clearDragMarkers();
    const rect = button.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;
    button.classList.add(after ? "drag-after" : "drag-before");
  });
  button.addEventListener("drop", async (event) => {
    if (!dragTemplateId || dragTemplateId === button.dataset.templateId) return;
    event.preventDefault();
    const rect = button.getBoundingClientRect();
    const after = event.clientX > rect.left + rect.width / 2;
    await reorderTemplate(dragTemplateId, button.dataset.templateId, after);
    clearDragMarkers();
  });
}

function extractTemplatesFromImport(data) {
  const items = [];
  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item && typeof item === "object") items.push(item);
    });
    return items;
  }
  if (data?.templates && typeof data.templates === "object") {
    const order = Array.isArray(data.templateOrder)
      ? data.templateOrder
      : Object.keys(data.templates);
    order.forEach((key) => {
      const template = data.templates[key];
      if (template && typeof template === "object") items.push(template);
    });
    Object.entries(data.templates).forEach(([key, template]) => {
      if (!order.includes(key) && template && typeof template === "object")
        items.push(template);
    });
  }
  return items;
}

async function importTemplates(file) {
  if (!file || !workspaceActive()) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    const imported = extractTemplatesFromImport(data).filter((template) =>
      String(template.body || template.subject || template.name || "").trim(),
    );
    if (!imported.length) throw new Error("No templates found in this file.");
    let sort = templates.reduce(
      (max, template) => Math.max(max, Number(template.sort || 0)),
      0,
    );
    let firstId = null;
    const now = new Date().toISOString();
    const localItems = imported.map((template) => {
      const id = createId("template");
      if (!firstId) firstId = id;
      sort += 1000;
      return {
        id,
        name: String(template.name || "Template"),
        subject: String(template.subject || ""),
        body: String(template.body || ""),
        sort,
        createdAtISO: now,
        updatedAtISO: now,
      };
    });
    templates = [...templates, ...localItems].sort((a, b) => a.sort - b.sort);
    if (!settings.selectedTemplateId && firstId)
      settings.selectedTemplateId = firstId;
    await saveSettingsNow();
    renderAll();
    setStatus(el.status, `${imported.length} templates uploaded.`, "success");
  } catch (error) {
    setStatus(el.status, error.message || userMessage(error), "error");
  }
}

function downloadTemplates() {
  const output = {
    app: "Basel Mail",
    version: 6,
    exportedAt: new Date().toISOString(),
    templateOrder: templates.map((template) => template.id),
    templates: Object.fromEntries(
      templates.map((template) => [
        template.id,
        {
          name: template.name,
          subject: template.subject,
          body: template.body,
        },
      ]),
    ),
  };
  const blob = new Blob([JSON.stringify(output, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "basel-mail-templates.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadQueuedEmail(item) {
  settings.selectedTemplateId =
    item.templateId &&
    templates.some((template) => template.id === item.templateId)
      ? item.templateId
      : settings.selectedTemplateId;
  settings.senderName = item.senderName;
  settings.firstName = item.firstName;
  settings.recipientEmails = item.recipientEmails || item.recipients.join(", ");
  settings.company = item.company;
  settings.personalBlock = item.personalBlock;
  settings.draftOverride = { subject: item.subject, body: item.body };
  closeModal(el.queueBackdrop);
  closeDraftEditor();
  syncInputFields();
  await saveSettingsNow();
  renderAll();
  setMobilePanel("preview");
  setStatus(el.status, "Queued email loaded.", "success");
}

async function removeQueuedEmail(id) {
  if (!workspaceActive() || !id) return;
  try {
    queuedEmails = queuedEmails.filter((item) => item.id !== id);
    writeLocalWorkspace();
    renderAll();
  } catch (error) {
    setStatus(el.settingsAccountStatus, userMessage(error), "error");
  }
}

async function clearCurrentDraft() {
  settings.firstName = "";
  settings.recipientEmails = "";
  settings.company = "";
  settings.personalBlock = "";
  settings.draftOverride = null;
  syncInputFields();
  closeDraftEditor();
  renderPreview();
  setMobilePanel("details");
  await saveSettingsNow();
}

async function clearQueue() {
  if (!(await requestConfirmation("Clear all queued emails?"))) return;
  queuedEmails = [];
  writeLocalWorkspace();
  renderAll();
}

async function clearTemplates() {
  if (!(await requestConfirmation("Clear all templates?"))) return;
  templates = [];
  settings.selectedTemplateId = null;
  settings.draftOverride = null;
  writeLocalWorkspace();
  renderAll();
}

async function clearAllData() {
  if (
    !(await requestConfirmation(
      "Clear all locally stored Basel Mail data on this device?",
    ))
  )
    return;
  templates = [];
  queuedEmails = [];
  settings = createDefaultSettings();
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}
  applyAppearance(settings.appearance);
  syncInputFields();
  renderAll();
}

function discardTemplateChanges() {
  if (templateDirty) return false;
  return true;
}

async function openModal(backdrop) {
  if (
    (!workspaceActive() && backdrop !== el.privacyBackdrop) ||
    activeModal === backdrop
  )
    return;
  if (activeModal && !(await closeModal(activeModal))) return;
  modalTrigger = document.activeElement;
  activeModal = backdrop;
  backdrop.hidden = false;
  document.querySelector(".app").inert = true;
  document.body.classList.add("modal-open");
  backdrop.querySelector(".modal").focus();
  requestAnimationFrame(() =>
    backdrop.querySelectorAll("textarea").forEach(autoResize),
  );
}

async function closeModal(backdrop, force = false) {
  if (backdrop.hidden) return true;
  if (!force && backdrop === el.templatesBackdrop) {
    if (!(await discardTemplateChangesAsync())) return false;
  }
  backdrop.hidden = true;
  if (activeModal === backdrop) {
    activeModal = null;
    document.querySelector(".app").inert = false;
    document.body.classList.remove("modal-open");
    if (modalTrigger?.isConnected) modalTrigger.focus({ preventScroll: true });
    modalTrigger = null;
  }
  return true;
}

function closeAllModals() {
  [
    el.privacyBackdrop,
    el.templatesBackdrop,
    el.queueBackdrop,
    el.settingsBackdrop,
  ].forEach((backdrop) => closeModal(backdrop, true));
}

function setMobilePanel(panel) {
  el.composer.dataset.mobilePanel = panel;
  ["Details", "Preview"].forEach((name) => {
    const active = name.toLowerCase() === panel;
    const button = document.getElementById("show" + name + "Button");
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  requestAnimationFrame(() => {
    autoResize(el.personalBlock);
    if (!el.draftEditor.hidden) autoResize(el.draftBody);
  });
}

async function navigateManagedTemplate(direction) {
  const index = templates.findIndex(
    (item) => item.id === selectedManageTemplateId,
  );
  const next = templates[index + direction];
  if (!next) return false;
  return selectManagedTemplate(next.id);
}

function insertToken(button) {
  const container = button.closest(".draft-editor, .template-form");
  const textarea = container.querySelector("textarea");
  const token = "{{" + button.dataset.token + "}}";
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  textarea.setRangeText(token, start, end, "end");
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function openTemplates() {
  if (!templates.length) selectedManageTemplateId = null;
  else
    selectedManageTemplateId = settings.selectedTemplateId || templates[0].id;
  renderTemplateManager();
  openModal(el.templatesBackdrop);
}

function openQueue() {
  renderQueueList();
  openModal(el.queueBackdrop);
}

function openSettings() {
  renderAccount();
  openModal(el.settingsBackdrop);
}

function bindInput(element, key) {
  element.addEventListener("input", () => {
    settings[key] = element.value;
    if (element.tagName === "TEXTAREA") autoResize(element);
    scheduleSettingsSave();
    renderPreview();
    setStatus(el.status, "");
  });
}

function autoResize(textarea) {
  if (!textarea || textarea.getClientRects().length === 0) return;
  const value = textarea.value;
  const measurePlaceholder = !value && textarea.placeholder;
  if (measurePlaceholder) textarea.value = textarea.placeholder;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
  if (measurePlaceholder) textarea.value = value;
}

function updateTabButtons() {
  const container = el.mainTabs;
  const max = Math.max(0, container.scrollWidth - container.clientWidth);
  if (container.scrollLeft < 0) container.scrollLeft = 0;
  if (container.scrollLeft > max) container.scrollLeft = max;
  const overflow = max > 2;
  el.tabsLeft.disabled = !overflow || container.scrollLeft <= 2;
  el.tabsRight.disabled = !overflow || container.scrollLeft >= max - 2;
}

function scrollTabs(direction) {
  const container = el.mainTabs;
  const max = Math.max(0, container.scrollWidth - container.clientWidth);
  const next = Math.min(
    max,
    Math.max(0, container.scrollLeft + direction * 260),
  );
  container.scrollTo({ left: next, behavior: "smooth" });
  setTimeout(updateTabButtons, 260);
}

function registerEvents() {
  el.brandButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  el.templatesButton.addEventListener("click", openTemplates);
  el.queueButton.addEventListener("click", openQueue);
  el.settingsButton.addEventListener("click", openSettings);
  el.newEmailButton.addEventListener("click", newEmail);
  el.emptyCreateBlankButton.addEventListener("click", () =>
    createTemplate("blank"),
  );
  el.emptyCreateStarterButton.addEventListener("click", () =>
    createTemplate("starter"),
  );
  el.emptyUploadButton.addEventListener("click", () => el.emptyUpload.click());
  el.emptyUpload.addEventListener("change", (event) =>
    importTemplates(event.target.files[0]),
  );
  el.emptyDropZone.addEventListener("click", () => el.emptyUpload.click());
  el.tabsLeft.addEventListener("click", () => scrollTabs(-1));
  el.tabsRight.addEventListener("click", () => scrollTabs(1));
  el.mainTabs.addEventListener("scroll", updateTabButtons);
  el.closeTemplatesButton.addEventListener("click", () =>
    closeModal(el.templatesBackdrop),
  );
  el.closeQueueButton.addEventListener("click", () =>
    closeModal(el.queueBackdrop),
  );
  el.closeSettingsButton.addEventListener("click", () =>
    closeModal(el.settingsBackdrop),
  );
  el.closePrivacyButton.addEventListener("click", () =>
    closeModal(el.privacyBackdrop),
  );
  el.confirmCancelButton.addEventListener("click", () =>
    finishConfirmation(false),
  );
  el.confirmConfirmButton.addEventListener("click", () =>
    finishConfirmation(true),
  );
  el.confirmBackdrop.addEventListener("click", (event) => {
    if (event.target === el.confirmBackdrop) finishConfirmation(false);
  });
  el.templatesBackdrop.addEventListener("click", (event) => {
    if (event.target === el.templatesBackdrop) closeModal(el.templatesBackdrop);
  });
  el.queueBackdrop.addEventListener("click", (event) => {
    if (event.target === el.queueBackdrop) closeModal(el.queueBackdrop);
  });
  el.settingsBackdrop.addEventListener("click", (event) => {
    if (event.target === el.settingsBackdrop) closeModal(el.settingsBackdrop);
  });
  el.privacyBackdrop.addEventListener("click", (event) => {
    if (event.target === el.privacyBackdrop) closeModal(el.privacyBackdrop);
  });
  el.saveTemplateButton.addEventListener("click", saveTemplate);
  el.duplicateTemplateButton.addEventListener("click", duplicateTemplate);
  el.deleteTemplateButton.addEventListener("click", deleteSelectedTemplate);
  el.addBlankTemplateButton.addEventListener("click", () =>
    createTemplate("blank", el.newTemplateName.value),
  );
  el.addStarterTemplateButton.addEventListener("click", () =>
    createTemplate("starter", el.newTemplateName.value),
  );
  el.downloadTemplatesButton.addEventListener("click", downloadTemplates);
  el.uploadTemplatesButton.addEventListener("click", () =>
    el.templateUpload.click(),
  );
  el.templateUpload.addEventListener("change", (event) =>
    importTemplates(event.target.files[0]),
  );
  el.settingsDropZone.addEventListener("click", () =>
    el.templateUpload.click(),
  );
  [el.emptyDropZone, el.settingsDropZone].forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("dragover");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("dragover");
      importTemplates(event.dataTransfer.files[0]);
    });
  });
  bindInput(el.senderName, "senderName");
  bindInput(el.firstName, "firstName");
  bindInput(el.recipientEmails, "recipientEmails");
  bindInput(el.company, "company");
  bindInput(el.personalBlock, "personalBlock");
  el.editEmailButton.addEventListener("click", openDraftEditor);
  el.doneEditingButton.addEventListener("click", doneEditing);
  el.revertEmailButton.addEventListener("click", revertEmail);
  [el.draftSubject, el.draftBody].forEach((input) =>
    input.addEventListener("input", () => {
      if (input === el.draftBody) autoResize(input);
      saveDraftEditorChanges();
    }),
  );
  [el.templateName, el.templateSubject, el.templateBody].forEach((input) =>
    input.addEventListener("input", () => {
      templateDirty = true;
      setStatus(el.templateStatus, "Unsaved changes");
      if (input === el.templateBody) autoResize(input);
    }),
  );
  document
    .querySelectorAll("[data-token]")
    .forEach((button) =>
      button.addEventListener("click", () => insertToken(button)),
    );
  el.mobileTemplateSelect.addEventListener("change", () =>
    selectTemplate(el.mobileTemplateSelect.value),
  );
  el.mobileTemplateSelect.addEventListener("dblclick", (event) => {
    event.preventDefault();
    openTemplateEditor(el.mobileTemplateSelect.value);
  });
  el.mobileTemplateSelect.addEventListener("pointerup", (event) => {
    if (event.pointerType === "touch")
      handleTemplateDoubleTap(el.mobileTemplateSelect.value);
  });
  document
    .getElementById("showDetailsButton")
    .addEventListener("click", () => setMobilePanel("details"));
  document
    .getElementById("showPreviewButton")
    .addEventListener("click", () => setMobilePanel("preview"));
  document
    .getElementById("mobilePreviewButton")
    .addEventListener("click", () => {
      setMobilePanel("preview");
      document.getElementById("showPreviewButton").focus();
      el.composer.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  el.previousTemplateButton.addEventListener("click", () =>
    navigateManagedTemplate(-1),
  );
  el.nextTemplateButton.addEventListener("click", () =>
    navigateManagedTemplate(1),
  );
  document.addEventListener("keydown", (event) => {
    if (!el.confirmBackdrop.hidden && event.key === "Escape") {
      event.preventDefault();
      finishConfirmation(false);
      return;
    }
    if (!activeModal) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal(activeModal);
    }
    if (event.key === "Tab") {
      const focusable = [
        ...activeModal.querySelectorAll(
          'button:not(:disabled), input:not(:disabled), textarea, select, summary, [tabindex="0"]',
        ),
      ].filter((node) => node.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !focusable.includes(document.activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !focusable.includes(document.activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
  window.addEventListener("beforeunload", (event) => {
    if (templateDirty || syncing || pendingSettings) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  el.sendButton.addEventListener("click", openEmailApp);
  el.queueEmailButton.addEventListener("click", queueCurrentEmail);
  el.copyButton.addEventListener("click", copyEmail);
  el.syncNowButton.addEventListener("click", async () => {
    if (await saveSettingsNow()) {
      setTemporaryStatus(
        el.settingsAccountStatus,
        "Workspace saved locally.",
        "success",
        3000,
      );
    }
  });
  el.clearCurrentDraftButton.addEventListener("click", () =>
    clearCurrentDraft().catch((error) =>
      setStatus(el.settingsAccountStatus, userMessage(error), "error"),
    ),
  );
  el.clearQueueButton.addEventListener("click", () =>
    clearQueue().catch((error) =>
      setStatus(el.settingsAccountStatus, userMessage(error), "error"),
    ),
  );
  el.clearTemplatesButton.addEventListener("click", () =>
    clearTemplates().catch((error) =>
      setStatus(el.settingsAccountStatus, userMessage(error), "error"),
    ),
  );
  el.clearAllDataButton.addEventListener("click", () =>
    clearAllData().catch((error) =>
      setStatus(el.settingsAccountStatus, userMessage(error), "error"),
    ),
  );
  el.appearanceControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-theme-choice]");
    if (!button) return;
    settings.appearance = button.dataset.themeChoice;
    applyAppearance(settings.appearance);
    scheduleSettingsSave();
  });
  el.emailAppControl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-email-app]");
    if (!button) return;
    settings.emailApp = button.dataset.emailApp;
    applyEmailAppChoice(settings.emailApp);
    renderPreview();
    scheduleSettingsSave();
  });
  systemTheme.addEventListener?.("change", () => {
    if ((settings.appearance || "auto") === "auto") applyAppearance("auto");
  });
  window.addEventListener("resize", () => {
    updateTabButtons();
    autoResize(el.personalBlock);
    if (!el.draftEditor.hidden) autoResize(el.draftBody);
  });
}

registerEvents();
loadLocalWorkspace();
renderAll();