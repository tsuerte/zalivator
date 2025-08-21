import uiHtml from "../ui/ui.html?raw";
import stylesCss from "../ui/styles.css?raw";
import interVarWoff2 from "../ui/fonts/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZJhiI2B.woff2?inline";
import mainJs from "../ui/main.js?raw";
// numbers UI helper script no longer injected; generation moved to code/generators
import { generateRusPlate } from "./generators/rusPlate";
import { generatePhoneRu } from "./generators/phoneRu";
import { corpDomains } from "../data/corp";
import { generateNumber as genNumber } from "./generators/numbers";
import { namesEmailFirst, namesEmailLast, namesRuMaleFirst, namesRuFemaleFirst, namesRuMaleLast, namesRuFemaleLast, namesRUFemalePatronymics, namesRUMalePatronymics } from "../data/names";

// Собираем строку HTML с инъекцией стилей и скриптов
let uiString: string = String(uiHtml);
const interFontFace = `@font-face {\n  font-family: 'Inter';\n  font-style: normal;\n  font-weight: 400 500;\n  font-display: swap;\n  src: url(${interVarWoff2}) format('woff2');\n}`;
uiString = uiString.replace("/*__INJECT_STYLES__*/", interFontFace + "\n" + String(stylesCss));
uiString = uiString.replace("//__INJECT_MAIN_SCRIPT__", String(mainJs));
uiString = uiString.replace("//__INJECT_NUMBERS_SCRIPT__", "");
figma.showUI(uiString, { width: 570, height: 480 });

// Генератор российских госномеров перенесён в отдельный модуль
type CollectionId =
  | "inn"
  | "kpp"
  | "passport_ru"
  | "corp_email"
  | "phone_ru"
  | "snils"
  | "finance"
  | "time"
  | "names"
  | "rus_plate"
  | "numbers";

type UIMessage =
  | { type: "getCollections" }
  | {
      type: "apply";
      collection: CollectionId;
      domain?: string;
      useCustomDomain?: boolean;
    innKind?: "fl" | "ul";
    phoneFormat?: PhoneFormatId;
    decimalPlaces?: number;
    currency?: "RUB" | "USD" | "EUR";
    customTailEnabled?: boolean;
    customTailValue?: string;
    timeFormat?: string;
    namesFormat?: string;
    namesGender?: string;
    numbersDecimal?: boolean;
    numbersMin?: number;
    numbersMax?: number;
    financeMin?: number;
    financeMax?: number;
    };

type PhoneFormatId = "space_dash" | "paren_dash" | "plain_space";

type CodeMessage =
  | { type: "collections"; items: { id: CollectionId; label: string }[] }
  | { type: "applied"; count: number };

const availableCollections: { id: CollectionId; label: string }[] = [
  { id: "inn", label: "ИНН" },
  { id: "kpp", label: "КПП" },
  { id: "passport_ru", label: "Паспорт РФ" },
  { id: "corp_email", label: "Эл. почта" },
  { id: "phone_ru", label: "Телефон РФ" },
  { id: "snils", label: "СНИЛС" },
  { id: "finance", label: "Финансы" },
  { id: "time", label: "Время" },
  { id: "names", label: "Имена" },
  { id: "rus_plate", label: "Госномер РФ" },
  { id: "numbers", label: "Числа" },
];

// Ранний пуш коллекций в UI (на случай, если UI не успел запросить)
figma.ui.postMessage({ type: "collections", items: availableCollections } as any);

// ---------- Random helpers
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDigits = (length: number): number[] =>
  Array.from({ length }, () => randomInt(0, 9));

// ---------- Generators
const generateInnUl = (): string => {
  // 10‑digit INN for legal entities with checksum
  const d = randomDigits(9);
  const coeff = [2, 4, 10, 3, 5, 9, 4, 6, 8];
  const sum = d.reduce((acc, digit, i) => acc + digit * coeff[i], 0);
  const c10 = (sum % 11) % 10;
  return [...d, c10].join("");
};

const generateInnFl = (): string => {
  // 12‑digit INN for individuals with 2 checksums
  const d = randomDigits(10);
  const c11 =
    ((7 * d[0] +
      2 * d[1] +
      4 * d[2] +
      10 * d[3] +
      3 * d[4] +
      5 * d[5] +
      9 * d[6] +
      4 * d[7] +
      6 * d[8] +
      8 * d[9]) %
      11) %
    10;
  const c12 =
    ((3 * d[0] +
      7 * d[1] +
      2 * d[2] +
      4 * d[3] +
      10 * d[4] +
      3 * d[5] +
      5 * d[6] +
      9 * d[7] +
      4 * d[8] +
      6 * d[9] +
      8 * c11) %
      11) %
    10;
  return [...d, c11, c12].join("");
};

const generateKpp = (): string => {
  // 9 digits, commonly NNNO1XXX; keep simple but valid format length
  const insp = randomInt(100, 999).toString().padStart(3, "0");
  const region = randomInt(1, 9).toString();
  const reason = "01"; // typical main registration
  const order = randomInt(1, 999).toString().padStart(3, "0");
  return `${region}${insp}${reason}${order}`;
};

const generatePassportRu = (): string => {
  const series = randomInt(1000, 9999).toString();
  const number = randomInt(0, 999999).toString().padStart(6, "0");
  return `${series} ${number}`;
};


const generateCorpEmail = (
  domainOverride?: string,
  useCustomDomain?: boolean,
): string => {
  const first = namesEmailFirst[randomInt(0, namesEmailFirst.length - 1)];
  const last = namesEmailLast[randomInt(0, namesEmailLast.length - 1)];
  let domain = "company.ru";
  if (useCustomDomain && domainOverride && domainOverride.trim()) {
    domain = domainOverride.trim();
  } else if (!useCustomDomain) {
    domain = corpDomains[randomInt(0, corpDomains.length - 1)];
  }
  return `${first}.${last}@${domain}`;
};

// generatePhoneRu moved to generators/phoneRu.ts

const generateSnils = (): string => {
  const g1 = randomInt(100, 999).toString();
  const g2 = randomInt(100, 999).toString();
  const g3 = randomInt(100, 999).toString();
  const yy = randomInt(0, 99).toString().padStart(2, "0"); // No checksum calculation as per request
  return `${g1}-${g2}-${g3} ${yy}`;
};

const generateTime = (format: string = "digital_hhmm"): string => {
  const hours = randomInt(0, 23);
  const minutes = randomInt(0, 59);
  const seconds = randomInt(0, 59);
  const hundredths = randomInt(0, 99);
  const milliseconds = randomInt(0, 999);

  // Узкий неразрывной пробел для единиц измерения
  const narrowSpace = "\u202F";

  // Функция для склонения часов
  const getHourForm = (h: number): string => {
    if (h === 1 || h === 21) return "час";
    if ((h >= 2 && h <= 4) || (h >= 22 && h <= 24)) return "часа";
    return "часов";
  };

  // Функция для склонения минут
  const getMinuteForm = (m: number): string => {
    if (m === 1 || m === 21 || m === 31 || m === 41 || m === 51)
      return "минута";
    if (
      (m >= 2 && m <= 4) ||
      (m >= 22 && m <= 24) ||
      (m >= 32 && m <= 34) ||
      (m >= 42 && m <= 44) ||
      (m >= 52 && m <= 54)
    )
      return "минуты";
    return "минут";
  };

  // Функция для склонения секунд
  const getSecondForm = (s: number): string => {
    if (s === 1 || s === 21 || s === 31 || s === 41 || s === 51)
      return "секунда";
    if (
      (s >= 2 && s <= 4) ||
      (s >= 22 && s <= 24) ||
      (s >= 32 && s <= 34) ||
      (s >= 42 && s <= 44) ||
      (s >= 52 && s <= 54)
    )
      return "секунды";
    return "секунд";
  };

  switch (format) {
    case "digital_hhmm":
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    case "digital_hhmmss":
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    case "units_hhmm":
      return `${hours}${narrowSpace}ч${narrowSpace}${minutes}${narrowSpace}мин`;
    case "units_hhmmss":
      return `${hours}${narrowSpace}ч${narrowSpace}${minutes}${narrowSpace}мин${narrowSpace}${seconds}${narrowSpace}с`;
    case "units_hh":
      return `${hours}${narrowSpace}ч`;
    case "units_mmss":
      return `${minutes}${narrowSpace}мин${narrowSpace}${seconds}${narrowSpace}с`;
    case "text_hhmm":
      return `${hours}${narrowSpace}${getHourForm(hours)}${narrowSpace}${minutes}${narrowSpace}${getMinuteForm(minutes)}`;
    case "text_hhmmss":
      return `${hours}${narrowSpace}${getHourForm(hours)}${narrowSpace}${minutes}${narrowSpace}${getMinuteForm(minutes)}${narrowSpace}${seconds}${narrowSpace}${getSecondForm(seconds)}`;
    case "text_hh":
      return `${hours}${narrowSpace}${getHourForm(hours)}`;
    case "text_mmss":
      return `${minutes}${narrowSpace}${getMinuteForm(minutes)}${narrowSpace}${seconds}${narrowSpace}${getSecondForm(seconds)}`;
    case "timer_mmss":
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    case "timer_mss":
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    case "timer_mmss_hundredths":
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${hundredths.toString().padStart(2, "0")}`;
    case "timer_mmss_milliseconds":
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${milliseconds.toString().padStart(3, "0")}`;
    default:
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
};

const generateNames = (
  format: string = "full_fio",
  gender: string = "any",
): string => {
   // Определяем пол для генерации
  let actualGender = gender;
  if (gender === "any") {
    actualGender = Math.random() < 0.5 ? "male" : "female";
  }

  // Выбираем случайные элементы в зависимости от пола
  const firstName =
    actualGender === "male"
      ? namesRuMaleFirst[randomInt(0, namesRuMaleFirst.length - 1)]
      : namesRuFemaleFirst[randomInt(0, namesRuFemaleFirst.length - 1)];

  const lastName =
    actualGender === "male"
      ? namesRuMaleLast[randomInt(0, namesRuMaleLast.length - 1)]
      : namesRuFemaleLast[randomInt(0, namesRuFemaleLast.length - 1)];

  const patronymic =
    actualGender === "male"
      ? namesRUFemalePatronymics[randomInt(0, namesRUFemalePatronymics.length - 1)]
      : namesRUMalePatronymics[randomInt(0, namesRUMalePatronymics.length - 1)];

  // Получаем инициалы
  const firstInitial = firstName.charAt(0) + ".";
  const patronymicInitial = patronymic.charAt(0) + ".";

  switch (format) {
    case "full_fio":
      return `${lastName} ${firstName} ${patronymic}`;
    case "last_first":
      return `${lastName} ${firstName}`;
    case "first_last":
      return `${firstName} ${lastName}`;
    case "last_initials":
      return `${lastName} ${firstInitial} ${patronymicInitial}`;
    case "initials_last":
      return `${firstInitial} ${patronymicInitial} ${lastName}`;
    case "last_first_initial":
      return `${lastName} ${firstInitial}`;
    default:
      return `${lastName} ${firstName} ${patronymic}`;
  }
};

const generateFinance = (decimalPlaces: number = 2): string => {
  const rubles = randomInt(1, 99999).toString();

  // Добавляем разделители тысяч для чисел > 999
  const formatThousands = (num: string): string => {
    if (num.length <= 3) return num;
    const parts = [];
    for (let i = num.length; i > 0; i -= 3) {
      parts.unshift(num.slice(Math.max(0, i - 3), i));
    }
    return parts.join(" ");
  };

  const formattedRubles = formatThousands(rubles);
  const sep = ",";

  if (decimalPlaces === 0) {
    return `${formattedRubles} ₽`;
  } else if (decimalPlaces === 1) {
    const kopecks = randomInt(0, 9).toString();
    return `${formattedRubles}${sep}${kopecks} ₽`;
  } else {
    const kopecks = randomInt(0, 99).toString().padStart(2, "0");
    return `${formattedRubles}${sep}${kopecks} ₽`;
  }
};

const generatorById: Record<CollectionId, (arg?: any) => string> = {
  inn: () => generateInnFl(), // Default to FL, UI can override
  kpp: () => generateKpp(),
  passport_ru: () => generatePassportRu(),
  corp_email: (payload?: { domain?: string; useCustomDomain?: boolean }) =>
    generateCorpEmail(payload?.domain, payload?.useCustomDomain),
  phone_ru: (fmt?: string) =>
    generatePhoneRu((fmt as PhoneFormatId) || "paren_dash"),
  snils: () => generateSnils(),
  finance: () => generateFinance(2), // Default: 2 decimal places, comma separator
  time: (fmt?: string) => generateTime(fmt || "digital_hhmm"),
  names: (fmt?: string) => generateNames(fmt || "full_fio", "any"),
  rus_plate: () => generateRusPlate(),
  numbers: (isDec?: boolean, min?: number, max?: number) =>
    genNumber({ decimal: Boolean(isDec), min, max }),
};

// Расширенный генератор финансов с выбором валюты и локали форматирования
const generateFinanceEx = (
  decimalPlaces: number = 2,
  currency: "RUB" | "USD" | "EUR" = "RUB",
  customTail?: string,
  minWhole?: number,
  maxWhole?: number,
): string => {
  // базовое число совпадает с generateFinance по диапазону
  let min = typeof minWhole === "number" ? Math.max(0, Math.floor(minWhole)) : 0;
  let max = typeof maxWhole === "number" ? Math.max(0, Math.floor(maxWhole)) : 99999;
  if (min > max) { const t = min; min = max; max = t; }
  const whole = randomInt(min, max).toString();

  const formatThousands = (num: string, groupSep: string): string => {
    if (num.length <= 3) return num;
    const parts: string[] = [];
    for (let i = num.length; i > 0; i -= 3) {
      parts.unshift(num.slice(Math.max(0, i - 3), i));
    }
    return parts.join(groupSep);
  };

  const normalizeTail = (places: number, v?: string): string => {
    const digits = String(v || "").replace(/\D+/g, "");
    if (places <= 0) return "";
    if (places === 1) return digits.slice(0, 1).padEnd(1, "0");
    return digits.slice(0, 2).padEnd(2, "0");
  };

  const tail = customTail ? normalizeTail(decimalPlaces, customTail) : "";

  if (currency === "USD") {
    const intPart = formatThousands(whole, ",");
    if (decimalPlaces === 0) return "\u0024" + intPart;
    if (tail) return "\u0024" + intPart + "." + tail;
    if (decimalPlaces === 1) return "\u0024" + intPart + "." + randomInt(0, 9).toString();
    return "\u0024" + intPart + "." + randomInt(0, 99).toString().padStart(2, "0");
  }

  // EUR и RUB формат одинаков, меняется только знак валюты
  const intPart = formatThousands(whole, " ");
  const sign = currency === "EUR" ? "€" : "₽";
  if (decimalPlaces === 0) return `${intPart} ${sign}`;
  if (tail) return `${intPart},${tail} ${sign}`;
  if (decimalPlaces === 1) return `${intPart},${randomInt(0, 9)} ${sign}`;
  return `${intPart},${randomInt(0, 99).toString().padStart(2, "0")} ${sign}`;
};

function collectSelectedTextNodes(): TextNode[] {
  const result: TextNode[] = [];
  const walk = (node: SceneNode) => {
    if (node.type === "TEXT") {
      result.push(node);
      return;
    }
    if ("children" in node) {
      for (const child of node.children) walk(child);
    }
  };
  for (const node of figma.currentPage.selection) walk(node);
  return result;
}

async function loadFontsForNode(node: TextNode): Promise<void> {
  const len = node.characters.length;
  if (len === 0) {
    if (node.fontName !== figma.mixed) {
      await figma.loadFontAsync(node.fontName as FontName);
    }
    return;
  }
  if (node.fontName !== figma.mixed) {
    await figma.loadFontAsync(node.fontName as FontName);
    return;
  }
  let i = 0;
  while (i < len) {
    const fn = node.getRangeFontName(i, i + 1);
    if (fn !== figma.mixed) {
      await figma.loadFontAsync(fn as FontName);
      let j = i + 1;
      while (j < len && node.getRangeFontName(j, j + 1) === fn) j++;
      i = j;
    } else {
      i++;
    }
  }
}

const DEFAULT_FONT: FontName = { family: "Roboto", style: "Regular" };

async function loadDefaultFont(): Promise<void> {
  await figma.loadFontAsync(DEFAULT_FONT);
}

function ensureWritableFont(node: TextNode): void {
  // Проще и предсказуемее: используем дефолтный шрифт
  node.fontName = DEFAULT_FONT;
}

async function applyCollectionToSelection(
  collection: CollectionId,
  payload?: {
    domain?: string;
    useCustomDomain?: boolean;
    innKind?: "fl" | "ul";
    phoneFormat?: PhoneFormatId;
    decimalPlaces?: number;
    currency?: "RUB" | "USD" | "EUR";
    customTailEnabled?: boolean;
    customTailValue?: string;
    timeFormat?: string;
    namesFormat?: string;
    namesGender?: string;
    numbersDecimal?: boolean;
    numbersMin?: number;
    numbersMax?: number;
    financeMin?: number;
    financeMax?: number;
  },
): Promise<number> {
  const textNodes = collectSelectedTextNodes();
  if (textNodes.length === 0) return 0;

  // Load actual fonts used in nodes to keep user font
  const gen = generatorById[collection];
  for (const node of textNodes) {
    await loadFontsForNode(node);
    if (collection === "inn") {
      node.characters =
        payload?.innKind === "ul" ? generateInnUl() : generateInnFl();
    } else if (collection === "phone_ru") {
      node.characters = generatePhoneRu(payload?.phoneFormat);
    } else if (collection === "finance") {
      node.characters = generateFinanceEx(
        payload?.decimalPlaces,
        (payload?.currency as any) || "RUB",
        payload?.customTailEnabled ? payload?.customTailValue : undefined,
        payload?.financeMin,
        payload?.financeMax,
      );
    } else if (collection === "time") {
      node.characters = generateTime(payload?.timeFormat);
    } else if (collection === "names") {
      node.characters = generateNames(
        payload?.namesFormat,
        payload?.namesGender,
      );
    } else if (collection === "numbers") {
      node.characters = genNumber({
        decimal: Boolean(payload?.numbersDecimal),
        min: payload?.numbersMin,
        max: payload?.numbersMax,
      });
    } else if (collection === "corp_email") {
      node.characters = generateCorpEmail(
        payload?.domain,
        payload?.useCustomDomain,
      );
    } else {
      node.characters = gen(payload?.domain);
    }
  }
  return textNodes.length;
}

figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === "getCollections") {
    const payload: CodeMessage = {
      type: "collections",
      items: availableCollections,
    };
    figma.ui.postMessage(payload);
    return;
  }
  if (msg.type === "apply") {
    const count = await applyCollectionToSelection(msg.collection, {
      domain: msg.domain,
      useCustomDomain: msg.useCustomDomain,
      innKind: msg.innKind,
      phoneFormat: msg.phoneFormat,
      decimalPlaces: msg.decimalPlaces,
      currency: msg.currency,
      customTailEnabled: msg.customTailEnabled,
      customTailValue: msg.customTailValue,
      timeFormat: msg.timeFormat,
      namesFormat: msg.namesFormat,
      namesGender: msg.namesGender,
      numbersDecimal: msg.numbersDecimal,
      numbersMin: msg.numbersMin,
      numbersMax: msg.numbersMax,
      financeMin: msg.financeMin,
      financeMax: msg.financeMax,
    });
    figma.ui.postMessage({ type: "applied", count } as any);
    if (count === 0) {
      figma.notify("Выберите текстовые слои");
    } else {
      figma.notify(`Заполнил ${count} слоёв`);
    }
  }
};


