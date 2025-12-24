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
  const innIllustrationImg = document.getElementById("innIllustrationImg");
  const innAnyHint = document.getElementById("innAnyHint");
  const innVisualRow = document.getElementById("innVisualRow");

  // Финансы: замена select на радио-кнопки
  const decimalPlacesRadios = document.querySelectorAll('input[name="decimalPlaces"]');
  const customTailBlock = document.getElementById("customTailBlock");
  const customTailEnabled = document.getElementById("customTailEnabled");
  const customTailValue = document.getElementById("customTailValue");
  const timeFormat = document.getElementById("timeFormat");

  const namesFormat = document.getElementById("namesFormat");
  const namesGenderRadios = document.querySelectorAll('input[name="namesGender"]');
  const currencyRadios = document.querySelectorAll('input[name="currency"]');
  const phoneFormatRadios = document.querySelectorAll('input[name="phoneFormat"]');
  const previewValueEl = document.getElementById("previewValue");
  const financeMinEl = document.getElementById("financeMin");
  const financeMaxEl = document.getElementById("financeMax");
  const financeSortEl = document.getElementById("financeSort");
  const numbersMinEl = document.getElementById("numbersMin");
  const numbersMaxEl = document.getElementById("numbersMax");
  const financeDistRadios = document.querySelectorAll('input[name="financeDist"]');
  // --- Preview helpers
  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function pad(num, len) { return String(num).padStart(len, "0"); }
  const RUS_LETTERS = Array.from("АВЕКМНОРСТУХ");
  const RUS_PLATE_REGIONS = [
    "77","97","99","177","197","199","777","797","799",
    "78","98","178",
    "50","90","150","190","750","790",
    "16","116","02","102",
    "23","93","123",
    "61","161",
    "66","96","196",
    "63","163",
    "52","152",
    "54","154",
    "74","174",
    "59","159",
    "36","136",
    "34","134",
    "64","164",
    "55","155",
  ];
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
      const currencyEl = document.querySelector('input[name="currency"]:checked');
      const currency = currencyEl ? currencyEl.value : "RUB";
      const MAX = 1000000000;
      let fmin = financeMinEl && financeMinEl.value !== "" ? parseInt(financeMinEl.value, 10) : 0;
      let fmax = financeMaxEl && financeMaxEl.value !== "" ? parseInt(financeMaxEl.value, 10) : 99999;
      if (isNaN(fmin)) fmin = 0;
      if (isNaN(fmax)) fmax = 0;
      fmin = Math.min(Math.max(Math.floor(fmin), 0), MAX);
      fmax = Math.min(Math.max(Math.floor(fmax), 0), MAX);
      if (fmin > fmax) { const t = fmin; fmin = fmax; fmax = t; }
      // распределение: выборка x в [0,1]
      const distEl = document.querySelector('input[name="financeDist"]:checked');
      const dist = distEl ? distEl.value : "uniform";
      const spreadPct = 80; // фиксированный разброс 80%
      function sampleUnit() {
        const u = Math.random();
        if (dist === "uniform") return u;
        if (dist === "skew_right") {
          const t = 1 + (spreadPct / 100) * 6; // 1..7, больше t — больше масса у минимума
          return Math.pow(u, t);
        }
        if (dist === "skew_left") {
          const t = 1 + (spreadPct / 100) * 6; // 1..7, больше t — больше масса у максимума
          return 1 - Math.pow(u, t);
        }
        // center: Irwin–Hall (усреднение N равномерных)
        const n = 1 + Math.round((spreadPct / 100) * 7); // 1..8
        let s = 0;
        for (let i = 0; i < n; i++) s += Math.random();
        return s / n;
      }
      const x = sampleUnit();
      let intOnly = Math.floor(fmin + x * (fmax - fmin));
      if (intOnly < fmin) intOnly = fmin;
      if (intOnly > fmax) intOnly = fmax;

      // custom tail
      const tailEnabled = !!(customTailEnabled && customTailEnabled.checked && (places === 1 || places === 2));
      const tail = tailEnabled ? normalizeTail(places, customTailValue && customTailValue.value) : "";

      const groupSep = currency === "USD" ? "," : " ";
      const decSep = currency === "USD" ? "." : ",";
      const intFormatted = String(intOnly).replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);

      let frac = "";
      if (places > 0) {
        if (tailEnabled) {
          frac = tail || (places === 1 ? "0" : "00");
        } else {
          // сгенерировать случайную дробную часть по количеству знаков
          if (places === 1) frac = String(randInt(0, 9));
          else frac = String(randInt(0, 99)).padStart(2, "0");
        }
      }

      if (currency === "USD") {
        preview = places > 0 ? ("\u0024" + intFormatted + decSep + frac) : ("\u0024" + intFormatted);
      } else if (currency === "EUR") {
        preview = places > 0 ? (intFormatted + decSep + frac + " €") : (intFormatted + " €");
      } else { // RUB
        preview = places > 0 ? (intFormatted + decSep + frac + " ₽") : (intFormatted + " ₽");
      }
    } else if (val === "time") {
      const fmt = timeFormat ? timeFormat.value : "digital_hhmm";
      const h = randInt(0, 23);
      const m = randInt(0, 59);
      const s = randInt(0, 59);
      const hundredths = randInt(0, 99);
      const ms = randInt(0, 999);
      const narrow = " ";
      const tf = (window.timeInflect) || { getHourForm: () => "часов", getMinuteForm: () => "минут", getSecondForm: () => "секунд" };
      if (fmt === "digital_hhmm") preview = `${pad(h,2)}:${pad(m,2)}`;
      else if (fmt === "digital_hhmmss") preview = `${pad(h,2)}:${pad(m,2)}:${pad(s,2)}`;
      else if (fmt === "units_hhmm") preview = `${h}${narrow}ч${narrow}${m}${narrow}мин`;
      else if (fmt === "units_hhmmss") preview = `${h}${narrow}ч${narrow}${m}${narrow}мин${narrow}${s}${narrow}с`;
      else if (fmt === "units_hh") preview = `${h}${narrow}ч`;
      else if (fmt === "units_mmss") preview = `${m}${narrow}мин${narrow}${s}${narrow}с`;
      else if (fmt === "text_hhmm") preview = `${h}${narrow}${tf.getHourForm(h)}${narrow}${m}${narrow}${tf.getMinuteForm(m)}`;
      else if (fmt === "text_hhmmss") preview = `${h}${narrow}${tf.getHourForm(h)}${narrow}${m}${narrow}${tf.getMinuteForm(m)}${narrow}${s}${narrow}${tf.getSecondForm(s)}`;
      else if (fmt === "text_hh") preview = `${h}${narrow}${tf.getHourForm(h)}`;
      else if (fmt === "text_mmss") preview = `${m}${narrow}${tf.getMinuteForm(m)}${narrow}${s}${narrow}${tf.getSecondForm(s)}`;
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
      let kind = checked ? checked.value : "any";
      if (kind === "any") {
        kind = Math.random() < 0.5 ? "fl" : "ul";
      }
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
      const MAX = 1000000000;
      let min = numbersMinEl && numbersMinEl.value !== "" ? parseInt(numbersMinEl.value, 10) : 0;
      let max = numbersMaxEl && numbersMaxEl.value !== "" ? parseInt(numbersMaxEl.value, 10) : 0;
      if (isNaN(min)) min = 0;
      if (isNaN(max)) max = 0;
      min = Math.min(Math.max(Math.floor(min), 0), MAX);
      max = Math.min(Math.max(Math.floor(max), 0), MAX);
      if (min > max) { const t = min; min = max; max = t; }
      const value = randInt(min, max);
      preview = isDec ? `${value},${randInt(0,9)}` : `${value}`;
    } else if (val === "passport_ru") {
      preview = `${pad(randInt(0,9999),4)} ${pad(randInt(0,999999),6)}`;
    } else if (val === "snils") {
      preview = `${pad(randInt(0,999),3)}-${pad(randInt(0,999),3)}-${pad(randInt(0,999),3)} ${pad(randInt(0,99),2)}`;
    } else if (val === "rus_plate") {
      const L1 = pick(RUS_LETTERS);
      const D = pad(randInt(0,999),3);
      const L2 = pick(RUS_LETTERS);
      const L3 = pick(RUS_LETTERS);
      const R = pick(RUS_PLATE_REGIONS);
      preview = `${L1}${D}${L2}${L3}${R}`;
    } else if (val === "kpp") {
      preview = pad(randInt(0, 999999999), 9);
    } else {
      preview = "";
    }
    previewValueEl.textContent = preview;
    updateInnIllustration();
  }

  function updateInnIllustration() {
    if (!innIllustrationImg && !innAnyHint) return;
    const currentCollection = collectionSelect && collectionSelect.value;
    const allowed = currentCollection === "inn" || currentCollection === "kpp" || currentCollection === "passport_ru";
    if (!allowed) {
      if (innIllustrationImg) innIllustrationImg.style.display = "none";
      if (innAnyHint) innAnyHint.style.display = "none";
      return;
    }
    const checked = document.querySelector('input[name="innKind"]:checked');
    const kind = checked ? checked.value : "any";
    const showImg = kind === "ul" || kind === "fl";
    const showAny = kind === "any";
    if (innIllustrationImg) {
      if (showImg) {
        innIllustrationImg.src = kind === "ul"
          ? (innIllustrationImg.dataset.srcUl || "")
          : (innIllustrationImg.dataset.srcFl || "");
        innIllustrationImg.style.display = "block";
      } else {
        innIllustrationImg.style.display = "none";
      }
    }
    if (innAnyHint) {
      innAnyHint.style.display = showAny ? "block" : "none";
    }
  }

  // Toggle visibility via CSS class (no inline display)
  function setVisible(el, visible) {
    if (!el) return;
    if (visible) el.classList.remove("hidden");
    else el.classList.add("hidden");
  }

  function getDecimalPlaces() {
    const dpEl = document.querySelector('input[name="decimalPlaces"]:checked');
    return dpEl ? parseInt(dpEl.value, 10) : 2;
  }

  function normalizeTail(places, value) {
    const digits = String(value || "").replace(/\D+/g, "");
    if (places <= 0) return "";
    if (places === 1) return digits.slice(0, 1).padEnd(1, "0");
    return digits.slice(0, 2).padEnd(2, "0");
  }

  function sanitizeTail(places, value) {
    const digits = String(value || "").replace(/\D+/g, "");
    return places <= 0 ? "" : digits.slice(0, places);
  }

  function updateFinanceTailUI() {
    const places = getDecimalPlaces();
    const show = places === 1 || places === 2;
    if (customTailBlock) {
      if (show) customTailBlock.classList.remove("hidden");
      else customTailBlock.classList.add("hidden");
    }
    if (customTailValue) {
      customTailValue.maxLength = show ? places : 0;
      // если активен чекбокс — корректируем значение при смене точности
      if (customTailEnabled && customTailEnabled.checked) {
        let v = sanitizeTail(places, customTailValue.value);
        // при переходе на 2 знака из 1 — дописываем 0 справа, если одна цифра
        if (places === 2 && v.length === 1) v = v + "0";
        // при переходе на 1 знак — обрезаем до 1
        if (places === 1 && v.length > 1) v = v.slice(0, 1);
        customTailValue.value = places === 0 ? "" : v;
      }
      // placeholder по длине
      customTailValue.placeholder = places === 1 ? "0" : "00";
      customTailValue.disabled = !(customTailEnabled && customTailEnabled.checked);
    }
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

    // Show illustration row only for INN/KPP/Passport
    if (innVisualRow) {
      const showVisual = val === "inn" || val === "kpp" || val === "passport_ru";
      setVisible(innVisualRow, showVisual);
    }

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
  decimalPlacesRadios.forEach((r) => r.addEventListener("change", () => { updateFinanceTailUI(); updateGlobalPreview(); }));
  if (customTailEnabled) customTailEnabled.addEventListener("change", () => { updateFinanceTailUI(); updateGlobalPreview(); });
  if (customTailValue) customTailValue.addEventListener("input", () => {
    const places = getDecimalPlaces();
    // только цифры и не больше выбранной длины; без дописывания нулей
    customTailValue.value = sanitizeTail(places, customTailValue.value);
    updateGlobalPreview();
  });
  currencyRadios.forEach((r) => r.addEventListener("change", updateGlobalPreview));
  if (financeMinEl) financeMinEl.addEventListener("input", updateGlobalPreview);
  if (financeMaxEl) financeMaxEl.addEventListener("input", updateGlobalPreview);
  if (financeSortEl) financeSortEl.addEventListener("change", updateGlobalPreview);
  financeDistRadios.forEach((r) => r.addEventListener("change", updateGlobalPreview));
  const numbersDecimalEl = document.getElementById("numbersDecimal");
  if (numbersDecimalEl) numbersDecimalEl.addEventListener("change", updateGlobalPreview);
  if (numbersMinEl) numbersMinEl.addEventListener("input", updateGlobalPreview);
  if (numbersMaxEl) numbersMaxEl.addEventListener("input", updateGlobalPreview);
  const innKindRadios = document.querySelectorAll('input[name="innKind"]');
  innKindRadios.forEach((r) => r.addEventListener("change", () => { updateGlobalPreview(); updateInnIllustration(); }));

  // Initialize hidden state early
    updateVisibility();
    updateFinanceTailUI();
  updateGlobalPreview();
  updateInnIllustration();

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
      const innKind = checked ? checked.value : "any";
      parent.postMessage({ pluginMessage: { type: "apply", collection, innKind } }, "*");
    } else if (collection === "phone_ru") {
      const checked = document.querySelector('input[name="phoneFormat"]:checked');
      const phoneFormat = checked ? checked.value : "paren_dash";
      parent.postMessage({ pluginMessage: { type: "apply", collection, phoneFormat } }, "*");
    } else if (collection === "finance") {
      const dpEl = document.querySelector('input[name="decimalPlaces"]:checked');
      const places = dpEl ? parseInt(dpEl.value) : 2;
      const curEl = document.querySelector('input[name="currency"]:checked');
      const currency = curEl ? curEl.value : "RUB";
      const tailEnabled = !!(customTailEnabled && customTailEnabled.checked && (places === 1 || places === 2));
      const tailValue = tailEnabled && customTailValue ? normalizeTail(places, customTailValue.value) : "";
      const fmin = financeMinEl && financeMinEl.value !== "" ? parseInt(financeMinEl.value, 10) : 0;
      const fmax = financeMaxEl && financeMaxEl.value !== "" ? parseInt(financeMaxEl.value, 10) : 99999;
      const distEl = document.querySelector('input[name="financeDist"]:checked');
      const financeDist = distEl ? distEl.value : "uniform";
      const financeSort = financeSortEl ? financeSortEl.value : "random";
      parent.postMessage({ pluginMessage: { type: "apply", collection, decimalPlaces: places, currency, customTailEnabled: tailEnabled, customTailValue: tailValue, financeMin: fmin, financeMax: fmax, financeDist, financeSort } }, "*" );
    } else if (collection === "time") {
      const format = timeFormat.value;
      parent.postMessage({ pluginMessage: { type: "apply", collection, timeFormat: format } }, "*");
    } else if (collection === "names") {
      const format = namesFormat.value;
      const gender = getSelectedNamesGender();
      parent.postMessage({ pluginMessage: { type: "apply", collection, namesFormat: format, namesGender: gender } }, "*");
    } else if (collection === "numbers") {
      const decimalEl = document.getElementById("numbersDecimal");
      const numbersDecimal = !!(decimalEl && decimalEl.checked);
      const min = numbersMinEl && numbersMinEl.value !== "" ? parseInt(numbersMinEl.value, 10) : 0;
      const max = numbersMaxEl && numbersMaxEl.value !== "" ? parseInt(numbersMaxEl.value, 10) : 0;
      parent.postMessage({ pluginMessage: { type: "apply", collection, numbersDecimal, numbersMin: min, numbersMax: max } }, "*");
    } else {
      parent.postMessage({ pluginMessage: { type: "apply", collection } }, "*");
    }
  };
})();
