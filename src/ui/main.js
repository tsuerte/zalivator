// Основной скрипт UI: управление коллекциями, превью и отправка сообщений
(function () {
  const collectionSelect = document.getElementById("collection");
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

  const financePreview = document.getElementById("financePreview");
  const decimalPlaces = document.getElementById("decimalPlaces");

  const timePreview = document.getElementById("timePreview");
  const timeFormat = document.getElementById("timeFormat");

  const namesFormat = document.getElementById("namesFormat");
  const namesGenderRadios = document.querySelectorAll('input[name="namesGender"]');

  function setLog(text) {
    if (log) log.textContent = String(text || "");
  }

  function updateFinancePreview() {
    if (!financePreview || !decimalPlaces) return;
    if (collectionSelect.value !== "finance") return;
    const places = parseInt(decimalPlaces.value);
    let base = "37 273";
    if (places === 0) {
      financePreview.textContent = base + " ₽";
    } else if (places === 1) {
      financePreview.textContent = base + ",5 ₽";
    } else {
      financePreview.textContent = base + ",50 ₽";
    }
  }

  function updateTimePreview() {
    if (!timePreview || !timeFormat) return;
    if (collectionSelect.value !== "time") return;
    const fmt = timeFormat.value;
    const map = {
      digital_hhmm: "09:05",
      digital_hhmmss: "09:05:07",
      units_hhmm: "9 ч 5 м",
      units_hhmmss: "9 ч 5 м 7 с",
      units_hh: "9 ч",
      units_mmss: "5 м 7 с",
      text_hhmm: "9 часов 5 минут",
      text_hhmmss: "9 часов 5 минут 7 секунд",
      text_hh: "9 часов",
      text_mmss: "5 минут 7 секунд",
      timer_mmss: "05:07",
      timer_mss: "5:07",
      timer_mmss_hundredths: "05:07,32",
      timer_mmss_milliseconds: "05:07,325",
    };
    timePreview.textContent = map[fmt] || "09:05";
  }

  function updateVisibility() {
    const val = collectionSelect.value;
    const isCorp = val === "corp_email";
    const isInn = val === "inn";
    const isPhone = val === "phone_ru";
    const isFinance = val === "finance";
    const isTime = val === "time";
    const isNames = val === "names";
    const isNumbers = val === "numbers";

    domainRow.style.display = isCorp ? "flex" : "none";
    innRow.style.display = isInn ? "flex" : "none";
    phoneRow.style.display = isPhone ? "block" : "none";
    financeRow.style.display = isFinance ? "block" : "none";
    timeRow.style.display = isTime ? "block" : "none";
    namesRow.style.display = isNames ? "block" : "none";
    if (numbersRow) numbersRow.style.display = isNumbers ? "flex" : "none";
  }

  function updateDomainRow() {
    const isCorpEmail = collectionSelect.value === "corp_email";
    domainRow.style.display = isCorpEmail ? "flex" : "none";
    if (!domainInput) return;
    if (isCorpEmail && corpDomainMode && corpDomainMode.checked) {
      domainInput.style.display = "";
      if (domainLabel) domainLabel.style.display = "";
    } else {
      domainInput.style.display = "none";
      if (domainLabel) domainLabel.style.display = "none";
    }
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
      setLog("Коллекции загружены");
      updateVisibility();
      updateFinancePreview();
      updateTimePreview();
    } else if (msg.type === "applied") {
      setLog("Применено: " + msg.count + " элементов");
    }
  };

  // Слушатели UI
  collectionSelect.onchange = () => {
    updateVisibility();
    updateDomainRow();
  };
  if (decimalPlaces) decimalPlaces.onchange = updateFinancePreview;
  if (timeFormat) timeFormat.onchange = updateTimePreview;
  if (corpDomainMode) corpDomainMode.addEventListener("change", updateDomainRow);

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
      const places = parseInt(decimalPlaces.value);
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

