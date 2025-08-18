// Основной скрипт UI: управление коллекциями, превью и отправка сообщений
(function () {
  const collectionSelect = document.getElementById("collection");
  const collectionList = document.getElementById("collectionList");
  const applyBtn = document.getElementById("apply");
  const log = document.getElementById("log");

  const domainRow = document.getElementById("domainRow");
  const domainInput = document.getElementById("domain");
  const domainLabel = document.querySelector('label[for="domain"]');
  const corpDomainMode = document.getElementById("corpDomainMode");

  const innRow = document.getElementById("innRow");
  const phoneRow = document.getElementById("phoneRow");
  const financeRow = document.getElementById("financeRow");
  const timeRow = document.getElementById("timeRow");
  const namesRow = document.getElementById("namesRow");
  const numbersRow = document.getElementById("numbersRow");

  // Финансы: замена select на радио-кнопки
  const decimalPlacesRadios = document.querySelectorAll('input[name="decimalPlaces"]');
  const timeFormat = document.getElementById("timeFormat");

  const namesFormat = document.getElementById("namesFormat");
  const namesGenderRadios = document.querySelectorAll('input[name="namesGender"]');
  const phoneFormatRadios = document.querySelectorAll('input[name="phoneFormat"]');
  const previewValueEl = document.getElementById("previewValue");
  // --- Preview helpers
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pad(num, len) { return String(num).padStart(len, "0"); }
  function formatThousands(num, places) {
    const fixed = places > 0 ? Number(num).toFixed(places) : Math.round(Number(num)).toString();
    const parts = fixed.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(places === 0 ? "" : ",");
  }
  const RUS_LETTERS = Array.from("АВЕКМНОРСТУХ");
  const maleFirst = ["Иван", "Алексей", "Дмитрий", "Николай", "Сергей"];
  const maleLast = ["Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов"];
  const femaleFirst = ["Анна", "Мария", "Екатерина", "Ольга", "Елена"];
  const femaleLast = ["Иванова", "Петрова", "Сидорова", "Смирнова", "Кузнецова"];
  const malePatr = ["Иванович", "Алексеевич", "Дмитриевич", "Николаевич", "Сергеевич"];
  const femalePatr = ["Ивановна", "Алексеевна", "Дмитриевна", "Николаевна", "Сергеевна"];
  const emailFirst = ["ivan", "alex", "sergey", "pavel", "nikolay"]; // латиница для email
  const emailLast = ["ivanov", "petrov", "sidorov", "smirnov", "kuznetsov"]; 

  function setLog(text) {
    if (log) log.textContent = String(text || "");
  }

  // removed local per-section previews; using global preview row instead

  // --- Global top preview across collections
  function updateGlobalPreview() {
    if (!previewValueEl) return;
    const val = collectionSelect && collectionSelect.value;
    let preview = "";
    if (val === "finance") {
      const dpEl = document.querySelector('input[name="decimalPlaces"]:checked');
      const places = dpEl ? parseInt(dpEl.value) : 2;
      const amount = randInt(1000, 999999) + Math.random();
      preview = `${formatThousands(amount, places)} ₽`;
    } else if (val === "time") {
      const fmt = timeFormat ? timeFormat.value : "digital_hhmm";
      const h = randInt(0, 23);
      const m = randInt(0, 59);
      const s = randInt(0, 59);
      const hundredths = randInt(0, 99);
      const ms = randInt(0, 999);
      if (fmt === "digital_hhmm") preview = `${pad(h,2)}:${pad(m,2)}`;
      else if (fmt === "digital_hhmmss") preview = `${pad(h,2)}:${pad(m,2)}:${pad(s,2)}`;
      else if (fmt === "units_hhmm") preview = `${h}\u202Fч\u202F${m}\u202Fмин`;
      else if (fmt === "units_hhmmss") preview = `${h}\u202Fч\u202F${m}\u202Fмин\u202F${s}\u202Fс`;
      else if (fmt === "units_hh") preview = `${h}\u202Fч`;
      else if (fmt === "units_mmss") preview = `${m}\u202Fмин\u202F${s}\u202Fс`;
      else if (fmt === "text_hhmm") preview = `${h}\u202Fчасов\u202F${m}\u202Fминут`;
      else if (fmt === "text_hhmmss") preview = `${h}\u202Fчасов\u202F${m}\u202Fминут\u202F${s}\u202Fсекунд`;
      else if (fmt === "text_hh") preview = `${h}\u202Fчасов`;
      else if (fmt === "text_mmss") preview = `${m}\u202Fминут\u202F${s}\u202Fсекунд`;
      else if (fmt === "timer_mmss") preview = `${pad(m,2)}:${pad(s,2)}`;
      else if (fmt === "timer_mss") preview = `${m}:${pad(s,2)}`;
      else if (fmt === "timer_mmss_hundredths") preview = `${pad(m,2)}:${pad(s,2)},${pad(hundredths,2)}`;
      else if (fmt === "timer_mmss_milliseconds") preview = `${pad(m,2)}:${pad(s,2)},${pad(ms,3)}`;
      else preview = `${pad(h,2)}:${pad(m,2)}`;
    } else if (val === "corp_email") {
      const useCustom = corpDomainMode && corpDomainMode.checked;
      const domain = (useCustom && domainInput && domainInput.value.trim()) || "company.ru";
      preview = `${pick(emailFirst)}.${pick(emailLast)}@${domain}`;
    } else if (val === "inn") {
      const checked = document.querySelector('input[name="innKind"]:checked');
      const kind = checked ? checked.value : "fl";
      preview = kind === "ul" ? pad(randInt(0, 9999999999), 10) : pad(randInt(0, 999999999999), 12);
    } else if (val === "phone_ru") {
      const checked = document.querySelector('input[name="phoneFormat"]:checked');
      const fmt = checked ? checked.value : "paren_dash";
      const p2 = randInt(900, 999);
      const p3 = pad(randInt(0, 999), 3);
      const p4 = pad(randInt(0, 99), 2);
      const p5 = pad(randInt(0, 99), 2);
      if (fmt === "space_dash") preview = `+7 ${p2} ${p3}-${p4}-${p5}`;
      else if (fmt === "plain_space") preview = `+7 ${p2} ${p3} ${p4} ${p5}`;
      else preview = `+7 (${p2}) ${p3}-${p4}-${p5}`;
    } else if (val === "names") {
      const fmt = namesFormat ? namesFormat.value : "full_fio";
      const gender = (function () {
        for (const r of namesGenderRadios) if (r.checked) return r.value;
        return "any";
      })();
      const genderPick = gender === "any" ? (Math.random() < 0.5 ? "male" : "female") : gender;
      const f = genderPick === "male" ? pick(maleFirst) : pick(femaleFirst);
      const l = genderPick === "male" ? pick(maleLast) : pick(femaleLast);
      const p = genderPick === "male" ? pick(malePatr) : pick(femalePatr);
      const map = {
        full_fio: `${l} ${f} ${p}`,
        last_first: `${l} ${f}`,
        first_last: `${f} ${l}`,
        last_initials: `${l} ${f[0]}. ${p[0]}.`,
        initials_last: `${f[0]}. ${p[0]}. ${l}`,
        last_first_initial: `${l} ${f[0]}.`,
      };
      preview = map[fmt] || map.full_fio;
    } else if (val === "numbers") {
      const decimal = document.getElementById("numbersDecimal");
      const isDec = decimal && decimal.checked;
      preview = isDec ? `${randInt(1,10)},${randInt(0,9)}` : `${randInt(1,10)}`;
    } else if (val === "passport_ru") {
      preview = `${pad(randInt(0,9999),4)} ${pad(randInt(0,999999),6)}`;
    } else if (val === "snils") {
      preview = `${pad(randInt(0,999),3)}-${pad(randInt(0,999),3)}-${pad(randInt(0,999),3)} ${pad(randInt(0,99),2)}`;
    } else if (val === "rus_plate") {
      const L1 = pick(RUS_LETTERS);
      const D = pad(randInt(0,999),3);
      const L2 = pick(RUS_LETTERS);
      const L3 = pick(RUS_LETTERS);
      const R = String(randInt(1, 799));
      preview = `${L1}${D}${L2}${L3}${R}`;
    } else if (val === "kpp") {
      preview = pad(randInt(0, 999999999), 9);
    } else {
      preview = "";
    }
    previewValueEl.textContent = preview;
  }

  // Toggle visibility via CSS class (no inline display)
  function setVisible(el, visible) {
    if (!el) return;
    if (visible) el.classList.remove("hidden");
    else el.classList.add("hidden");
  }

  function updateDomainRow() {
    const isCorpEmail = collectionSelect && collectionSelect.value === "corp_email";
    const innerVisible = isCorpEmail && corpDomainMode && corpDomainMode.checked;
    setVisible(domainInput, innerVisible);
    if (domainLabel) setVisible(domainLabel, innerVisible);
    const note = domainRow ? domainRow.querySelector(".note-text") : null;
    if (note) setVisible(note, innerVisible);
  }

  function updateVisibility() {
    const val = collectionSelect.value;

    const map = {
      corp_email: ["domainRow"],
      inn: ["innRow"],
      phone_ru: ["phoneRow"],
      finance: ["financeRow"],
      time: ["timeRow"],
      names: ["namesRow"],
      numbers: ["numbersRow"],
    };

    const all = { domainRow, innRow, phoneRow, financeRow, timeRow, namesRow, numbersRow };

    // Hide all rows first
    Object.values(all).forEach((el) => setVisible(el, false));
    // Show mapped rows
    (map[val] || []).forEach((id) => setVisible(all[id], true));

    // Update inner controls visibility for domain row
    updateDomainRow();
  }

  // ----------------------
  // Левый список коллекций
  // ----------------------
  const listItemsById = new Map();

  function markActiveListItem(activeId) {
    listItemsById.forEach((el, id) => {
      if (!el) return;
      if (id === activeId) el.classList.add("active");
      else el.classList.remove("active");
    });
  }

  function selectCollection(id) {
    if (!collectionSelect) return;
    if (collectionSelect.value !== id) {
      collectionSelect.value = id;
      const evt = new Event("change", { bubbles: true });
      collectionSelect.dispatchEvent(evt);
    } else {
      updateVisibility();
    }
    markActiveListItem(id);
    updateGlobalPreview();
  }

  function buildCollectionList(items) {
    if (!collectionList) return;
    collectionList.innerHTML = "";
    listItemsById.clear();
    items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "collection-item";
      li.setAttribute("data-id", item.id);
      const inner = document.createElement("div");
      inner.className = "current-bg";
      inner.textContent = item.label;
      li.appendChild(inner);
      li.addEventListener("click", () => selectCollection(item.id));
      collectionList.appendChild(li);
      listItemsById.set(item.id, li);
      if (idx === 0) li.classList.add("active");
    });
  }

  function updateDomainRow() {
    const isCorpEmail = collectionSelect.value === "corp_email";
    const innerVisible = isCorpEmail && corpDomainMode && corpDomainMode.checked;
    setVisible(domainInput, innerVisible);
    if (domainLabel) setVisible(domainLabel, innerVisible);
    const note = domainRow ? domainRow.querySelector(".note-text") : null;
    if (note) setVisible(note, innerVisible);
  }

  function getSelectedNamesGender() {
    for (const radio of namesGenderRadios) {
      if (radio.checked) return radio.value;
    }
    return "any";
  }

  // Запрос коллекций
  parent.postMessage({ pluginMessage: { type: "getCollections" } }, "*");

  // Ответы от плагина
  onmessage = (event) => {
    const msg = event.data && event.data.pluginMessage;
    if (!msg) return;
    if (msg.type === "collections") {
      collectionSelect.innerHTML = "";
      (msg.items || []).forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.label;
        collectionSelect.appendChild(opt);
      });
      buildCollectionList(msg.items || []);
      // Выбираем первую коллекцию по умолчанию
      const first = (msg.items && msg.items[0] && msg.items[0].id) || "";
      if (first) {
        collectionSelect.value = first;
        markActiveListItem(first);
      }
      setLog("Коллекции загружены");
      updateVisibility();
      updateGlobalPreview();
    } else if (msg.type === "applied") {
      setLog("Применено: " + msg.count + " элементов");
    }
  };

  // Слушатели UI
  collectionSelect.onchange = () => {
    updateVisibility();
    updateDomainRow();
    updateGlobalPreview();
  };
  // decimalPlaces select removed; radios handle change events above
  if (timeFormat) timeFormat.onchange = () => { updateGlobalPreview(); };
  if (corpDomainMode) corpDomainMode.addEventListener("change", () => { updateDomainRow(); updateGlobalPreview(); });
  if (domainInput) domainInput.addEventListener("input", updateGlobalPreview);
  if (namesFormat) namesFormat.addEventListener("change", updateGlobalPreview);
  namesGenderRadios.forEach((r) => r.addEventListener("change", updateGlobalPreview));
  phoneFormatRadios.forEach((r) => r.addEventListener("change", updateGlobalPreview));
  decimalPlacesRadios.forEach((r) => r.addEventListener("change", updateGlobalPreview));
  const numbersDecimalEl = document.getElementById("numbersDecimal");
  if (numbersDecimalEl) numbersDecimalEl.addEventListener("change", updateGlobalPreview);
  const innKindRadios = document.querySelectorAll('input[name="innKind"]');
  innKindRadios.forEach((r) => r.addEventListener("change", updateGlobalPreview));

  // Initialize hidden state early
  updateVisibility();
  updateGlobalPreview();
  updateGlobalPreview();

  // Применение
  applyBtn.onclick = () => {
    const collection = collectionSelect.value;
    if (collection === "corp_email") {
      let domain = undefined;
      let useCustomDomain = false;
      if (corpDomainMode && corpDomainMode.checked) {
        domain = (domainInput.value || "").trim() || "company.ru";
        useCustomDomain = true;
      }
      parent.postMessage({ pluginMessage: { type: "apply", collection, domain, useCustomDomain } }, "*");
    } else if (collection === "inn") {
      const checked = document.querySelector('input[name="innKind"]:checked');
      const innKind = checked ? checked.value : "fl";
      parent.postMessage({ pluginMessage: { type: "apply", collection, innKind } }, "*");
    } else if (collection === "phone_ru") {
      const checked = document.querySelector('input[name="phoneFormat"]:checked');
      const phoneFormat = checked ? checked.value : "paren_dash";
      parent.postMessage({ pluginMessage: { type: "apply", collection, phoneFormat } }, "*");
    } else if (collection === "finance") {
      const dpEl = document.querySelector('input[name="decimalPlaces"]:checked');
      const places = dpEl ? parseInt(dpEl.value) : 2;
      parent.postMessage({ pluginMessage: { type: "apply", collection, decimalPlaces: places } }, "*");
    } else if (collection === "time") {
      const format = timeFormat.value;
      parent.postMessage({ pluginMessage: { type: "apply", collection, timeFormat: format } }, "*");
    } else if (collection === "names") {
      const format = namesFormat.value;
      const gender = getSelectedNamesGender();
      parent.postMessage({ pluginMessage: { type: "apply", collection, namesFormat: format, namesGender: gender } }, "*");
    } else {
      parent.postMessage({ pluginMessage: { type: "apply", collection } }, "*");
    }
  };
})();
