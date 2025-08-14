const collectionSelect = document.getElementById('collection') as HTMLSelectElement;
const applyBtn = document.getElementById('apply') as HTMLButtonElement;
const log = document.getElementById('log') as HTMLElement;
const domainRow = document.getElementById('domainRow') as HTMLElement;
const innRow = document.getElementById('innRow') as HTMLElement;
const domainInput = document.getElementById('domain') as HTMLInputElement;
const phoneRow = document.getElementById('phoneRow') as HTMLElement;
const financeRow = document.getElementById('financeRow') as HTMLElement;
const financePreview = document.getElementById('financePreview') as HTMLElement;
const decimalPlaces = document.getElementById('decimalPlaces') as HTMLSelectElement;
const timeRow = document.getElementById('timeRow') as HTMLElement;
const timePreview = document.getElementById('timePreview') as HTMLElement;
const timeFormat = document.getElementById('timeFormat') as HTMLSelectElement;
const namesRow = document.getElementById('namesRow') as HTMLElement;
const namesFormat = document.getElementById('namesFormat') as HTMLSelectElement;
const namesGenderRadios = document.querySelectorAll<HTMLInputElement>('input[name="namesGender"]');
const corpDomainMode = document.getElementById('corpDomainMode') as HTMLInputElement;
const domainLabel = document.querySelector('label[for="domain"]') as HTMLLabelElement | null;

function setLog(text: string) {
  log.textContent = text;
}

function updateFinancePreview() {
  if (collectionSelect.value === 'finance') {
    const places = parseInt(decimalPlaces.value);
    let preview = '37 273';
    const sep = ',';
    if (places > 0) {
      if (places === 1) {
        preview += sep + '5';
      } else if (places === 2) {
        preview += sep + '50';
      }
    }
    preview += ' ₽';
    financePreview.textContent = preview;
  }
}

function updateTimePreview() {
  if (collectionSelect.value === 'time') {
    const format = timeFormat.value;
    let preview = '';

    switch (format) {
      case 'digital_hhmm':
        preview = '09:05';
        break;
      case 'digital_hhmmss':
        preview = '09:05:07';
        break;
      case 'units_hhmm':
        preview = '9 ч 5 мин';
        break;
      case 'units_hhmmss':
        preview = '9 ч 5 мин 7 с';
        break;
      case 'units_hh':
        preview = '9 ч';
        break;
      case 'units_mmss':
        preview = '5 мин 7 с';
        break;
      case 'text_hhmm':
        preview = '9 часов 5 минут';
        break;
      case 'text_hhmmss':
        preview = '9 часов 5 минут 7 секунд';
        break;
      case 'text_hh':
        preview = '9 часов';
        break;
      case 'text_mmss':
        preview = '5 минут 7 секунд';
        break;
      case 'timer_mmss':
        preview = '05:07';
        break;
      case 'timer_mss':
        preview = '5:07';
        break;
      case 'timer_mmss_hundredths':
        preview = '05:07,32';
        break;
      case 'timer_mmss_milliseconds':
        preview = '05:07,325';
        break;
      default:
        preview = '09:05';
    }
    timePreview.textContent = preview;
  }
}

function updateVisibility() {
  const isCorp = collectionSelect.value === 'corp_email';
  const isInn = collectionSelect.value === 'inn';
  const isPhone = collectionSelect.value === 'phone_ru';
  const isFinance = collectionSelect.value === 'finance';
  const isTime = collectionSelect.value === 'time';
  const isNames = collectionSelect.value === 'names';
  domainRow.style.display = isCorp ? 'flex' : 'none';
  innRow.style.display = isInn ? 'flex' : 'none';
  phoneRow.style.display = isPhone ? 'block' : 'none';
  financeRow.style.display = isFinance ? 'block' : 'none';
  timeRow.style.display = isTime ? 'block' : 'none';
  namesRow.style.display = isNames ? 'block' : 'none';
}

function updateDomainRow() {
  const isCorpEmail = collectionSelect.value === 'corp_email';
  domainRow.style.display = isCorpEmail ? 'flex' : 'none';
  if (isCorpEmail && corpDomainMode.checked) {
    domainInput.style.display = '';
    if (domainLabel) domainLabel.style.display = '';
  } else {
    domainInput.style.display = 'none';
    if (domainLabel) domainLabel.style.display = 'none';
  }
}

function getSelectedNamesGender(): string {
  for (const radio of namesGenderRadios) {
    if (radio.checked) return radio.value;
  }
  return 'any';
}

// Request collections from code
parent.postMessage({ pluginMessage: { type: 'getCollections' } }, '*');

// Receive data from code
onmessage = (event: MessageEvent) => {
  const msg = (event.data as any)?.pluginMessage;
  if (!msg) return;
  if (msg.type === 'collections') {
    collectionSelect.innerHTML = '';
    (msg.items || []).forEach((item: any) => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.label;
      collectionSelect.appendChild(opt);
    });
    setLog('Коллекции загружены');
    updateVisibility();
    updateFinancePreview();
    updateTimePreview();
  } else if (msg.type === 'applied') {
    setLog('Готово: ' + msg.count + ' слоёв обновлено');
  }
};

collectionSelect.onchange = () => {
  updateVisibility();
  updateDomainRow();
};

// Handlers for finance
decimalPlaces.onchange = updateFinancePreview;

// Handlers for time
timeFormat.onchange = updateTimePreview;

// Handler for corporate domain
corpDomainMode.addEventListener('change', updateDomainRow);

applyBtn.onclick = () => {
  const collection = collectionSelect.value;
  if (collection === 'corp_email') {
    let domain: string | undefined = undefined;
    let useCustomDomain = false;
    if (corpDomainMode && corpDomainMode.checked) {
      domain = (domainInput.value || '').trim() || 'company.ru';
      useCustomDomain = true;
    }
    parent.postMessage({ pluginMessage: { type: 'apply', collection, domain, useCustomDomain } }, '*');
  } else if (collection === 'inn') {
    const checked = document.querySelector('input[name="innKind"]:checked') as HTMLInputElement | null;
    const innKind = checked ? checked.value : 'fl';
    parent.postMessage({ pluginMessage: { type: 'apply', collection, innKind } }, '*');
  } else if (collection === 'phone_ru') {
    const checked = document.querySelector('input[name="phoneFormat"]:checked') as HTMLInputElement | null;
    const phoneFormat = checked ? checked.value : 'paren_dash';
    parent.postMessage({ pluginMessage: { type: 'apply', collection, phoneFormat } }, '*');
  } else if (collection === 'finance') {
    const places = parseInt(decimalPlaces.value);
    parent.postMessage({ pluginMessage: { type: 'apply', collection, decimalPlaces: places } }, '*');
  } else if (collection === 'time') {
    const format = timeFormat.value;
    parent.postMessage({ pluginMessage: { type: 'apply', collection, timeFormat: format } }, '*');
  } else if (collection === 'names') {
    const format = namesFormat.value;
    const gender = getSelectedNamesGender();
    parent.postMessage({ pluginMessage: { type: 'apply', collection, namesFormat: format, namesGender: gender } }, '*');
  } else {
    parent.postMessage({ pluginMessage: { type: 'apply', collection } }, '*');
  }
};

