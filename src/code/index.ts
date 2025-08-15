// Генератор российских госномеров (легковой/грузовой)
const RUS_PLATE_LETTERS = ['А','В','Е','К','М','Н','О','Р','С','Т','У','Х'];
const RUS_PLATE_REGIONS = [
  '77','97','99','177','197','199','777','797','799', // Москва
  '78','98','178', // СПб
  '50','90','150','190','750','790', // МО
  '16','116', // Татарстан
  '02','102', // Башкортостан
  '23','93','123', // Краснодар
  '61','161', // Ростов
  '66','96','196', // Свердловская
  '63','163', // Самара
  '52','152', // Н. Новгород
  '54','154', // Новосибирск
  '74','174', // Челябинск
  '59','159', // Пермь
  '36','136', // Воронеж
  '34','134', // Волгоград
  '64','164', // Саратов
  '55','155' // Омск
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRusPlate() {
  // Формат: Б ддд ББ RR (например, А123ВС777)
  const L1 = pick(RUS_PLATE_LETTERS);
  const D = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  const L2 = pick(RUS_PLATE_LETTERS);
  const L3 = pick(RUS_PLATE_LETTERS);
  const R = pick(RUS_PLATE_REGIONS);
  return `${L1}${D}${L2}${L3}${R}`;
}
// Показываем UI из собранного HTML, встроенного через __html__
declare const __html__: string;
figma.showUI(__html__, { width: 360, height: 240 });

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
  | "rus_plate";

type UIMessage =
  | { type: "getCollections" }
  | { type: "apply"; collection: CollectionId; domain?: string; useCustomDomain?: boolean; innKind?: "fl" | "ul"; phoneFormat?: PhoneFormatId; decimalPlaces?: number; timeFormat?: string; namesFormat?: string; namesGender?: string };

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
  { id: "rus_plate", label: "Госномер РФ" }
];

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
  const c11 = ((7*d[0] + 2*d[1] + 4*d[2] + 10*d[3] + 3*d[4] + 5*d[5] + 9*d[6] + 4*d[7] + 6*d[8] + 8*d[9]) % 11) % 10;
  const c12 = ((3*d[0] + 7*d[1] + 2*d[2] + 4*d[3] + 10*d[4] + 3*d[5] + 5*d[6] + 9*d[7] + 4*d[8] + 6*d[9] + 8*c11) % 11) % 10;
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

const corpDomains = [
  "company.ru", "corp.com", "business.org", "office.net", "enterprise.ru", "group.su", "holding.ru", "firm.com", "agency.ru", "consulting.ru",
  "solutions.ru", "partners.ru", "team.ru", "service.ru", "systems.ru", "it.ru", "dev.ru", "design.ru", "marketing.ru", "sales.ru",
  "finance.ru", "legal.ru", "support.ru", "hr.ru", "admin.ru", "cloud.ru", "media.ru", "brand.ru", "project.ru", "startup.ru",
  "logistics.ru", "import.ru", "export.ru", "trade.ru", "shop.ru", "store.ru", "market.ru", "bank.ru", "insurance.ru", "travel.ru",
  "auto.ru", "realty.ru", "property.ru", "build.ru", "event.ru", "promo.ru", "food.ru", "health.ru", "clinic.ru", "school.ru"
];

const firstNames = [
  "ivan", "petr", "alex", "sergey", "maria", "anna", "nikita", "svetlana",
  "olga", "dmitry", "elena", "andrey", "irina", "viktor", "natalia", "egor",
  "maxim", "tatiana", "roman", "galina",
  "artem", "valeria", "denis", "ksenia", "boris", "arina", "timur", "sofia",
  "vadim", "polina", "ilya", "ekaterina", "vladimir", "milana", "anton", "alisa",
  "grigory", "veronika", "stanislav", "daria"
];
const lastNames = [
  "ivanov", "petrov", "smirnov", "sidorov", "kozlov", "volkova", "morozov", "sokolov",
  "novikov", "lebedev", "popova", "vasiliev", "egorova", "pavlova", "nikitina", "makarov",
  "fedorov", "semenov", "kuznetsova", "orlov",
  "zaitsev", "solovyov", "borisov", "yakovlev", "grigoriev", "romanov", "vorobyov", "sergeev",
  "kuzmin", "maximov", "filippov", "vlasov", "titov", "chernov", "abramov", "martynov",
  "efimov", "denisov", "belyaev", "terentiev"
];
const generateCorpEmail = (domainOverride?: string, useCustomDomain?: boolean): string => {
  const first = firstNames[randomInt(0, firstNames.length - 1)];
  const last = lastNames[randomInt(0, lastNames.length - 1)];
  let domain = "company.ru";
  if (useCustomDomain && domainOverride && domainOverride.trim()) {
    domain = domainOverride.trim();
  } else if (!useCustomDomain) {
    domain = corpDomains[randomInt(0, corpDomains.length - 1)];
  }
  return `${first}.${last}@${domain}`;
};

const generatePhoneRu = (fmt: PhoneFormatId = "space_dash"): string => {
  const p2 = randomInt(900, 999).toString();
  const p3 = randomInt(100, 999).toString();
  const p4 = randomInt(10, 99).toString();
  const p5 = randomInt(10, 99).toString();
  switch (fmt) {
    case "space_dash":
      return `+7 ${p2} ${p3}-${p4}-${p5}`;
    case "plain_space":
      return `+7 ${p2} ${p3} ${p4} ${p5}`;
    case "paren_dash":
    default:
      return `+7 (${p2}) ${p3}-${p4}-${p5}`;
  }
};

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
    if (m === 1 || m === 21 || m === 31 || m === 41 || m === 51) return "минута";
    if ((m >= 2 && m <= 4) || (m >= 22 && m <= 24) || (m >= 32 && m <= 34) || (m >= 42 && m <= 44) || (m >= 52 && m <= 54)) return "минуты";
    return "минут";
  };
  
  // Функция для склонения секунд
  const getSecondForm = (s: number): string => {
    if (s === 1 || s === 21 || s === 31 || s === 41 || s === 51) return "секунда";
    if ((s >= 2 && s <= 4) || (s >= 22 && s <= 24) || (s >= 32 && s <= 34) || (s >= 42 && s <= 44) || (s >= 52 && s <= 54)) return "секунды";
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

const generateNames = (format: string = "full_fio", gender: string = "any"): string => {
  // Словари русских имён, фамилий и отчеств
  const maleFirstNames = [
    "Александр", "Алексей", "Андрей", "Артём", "Владимир", "Дмитрий", "Евгений", "Иван", "Максим", "Михаил",
    "Николай", "Павел", "Пётр", "Сергей", "Степан", "Фёдор", "Юрий", "Ярослав", "Борис", "Василий",
    "Георгий", "Даниил", "Егор", "Захар", "Игорь", "Кирилл", "Леонид", "Матвей", "Назар", "Олег",
    "Роман", "Семён", "Тимофей", "Ульяна", "Филипп", "Харитон", "Цезарь", "Чеслав", "Шамиль", "Эдуард",
    "Юлиан", "Яков", "Анатолий", "Богдан", "Виталий", "Геннадий", "Денис", "Елисей", "Ждан", "Зиновий"
  ];
  
  const femaleFirstNames = [
    "Александра", "Алина", "Анна", "Валентина", "Валерия", "Вера", "Виктория", "Галина", "Дарья", "Евгения",
    "Екатерина", "Елена", "Елизавета", "Жанна", "Зинаида", "Инна", "Ирина", "Клавдия", "Лариса", "Любовь",
    "Марина", "Мария", "Надежда", "Наталья", "Нина", "Оксана", "Ольга", "Полина", "Раиса", "Светлана",
    "Тамара", "Татьяна", "Ульяна", "Фаина", "Христина", "Цветана", "Чулпан", "Шарифа", "Эльвира", "Юлия",
    "Яна", "Ангелина", "Богдана", "Василиса", "Варвара", "Глафира", "Диана", "Евдокия", "Жанетта", "Злата"
  ];
  
  const maleLastNames = [
    "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов", "Васильев", "Соколов", "Михайлов", "Новиков",
    "Фёдоров", "Морозов", "Волков", "Алексеев", "Лебедев", "Семёнов", "Егоров", "Павлов", "Козлов", "Степанов",
    "Николаев", "Орлов", "Андреев", "Макаров", "Никитин", "Захаров", "Зайцев", "Соловьёв", "Борисов", "Яковлев",
    "Григорьев", "Романов", "Воробьёв", "Сергеев", "Кузьмин", "Максимов", "Филиппов", "Власов", "Титов", "Семёнов",
    "Чернов", "Абрамов", "Мартынов", "Ефимов", "Денисов", "Беляев", "Терентьев", "Молчанов", "Рыбаков", "Субботин"
  ];
  
  const femaleLastNames = [
    "Иванова", "Петрова", "Сидорова", "Смирнова", "Кузнецова", "Попова", "Васильева", "Соколова", "Михайлова", "Новикова",
    "Фёдорова", "Морозова", "Волкова", "Алексеева", "Лебедева", "Семёнова", "Егорова", "Павлова", "Козлова", "Степанова",
    "Николаева", "Орлова", "Андреева", "Макарова", "Никитина", "Захарова", "Зайцева", "Соловьёва", "Борисова", "Яковлева",
    "Григорьева", "Романова", "Воробьёва", "Сергеева", "Кузьмина", "Максимова", "Филиппова", "Власова", "Титова", "Семёнова",
    "Чернова", "Абрамова", "Мартынова", "Ефимова", "Денисова", "Беляева", "Терентьева", "Молчанова", "Рыбакова", "Субботина"
  ];
  
  const malePatronymics = [
    "Александрович", "Алексеевич", "Андреевич", "Артёмович", "Владимирович", "Дмитриевич", "Евгеньевич", "Иванович", "Максимович", "Михайлович",
    "Николаевич", "Павлович", "Петрович", "Сергеевич", "Степанович", "Фёдорович", "Юрьевич", "Ярославович", "Борисович", "Васильевич",
    "Георгиевич", "Даниилович", "Егорович", "Захарович", "Игоревич", "Кириллович", "Леонидович", "Матвеевич", "Назарович", "Олегович",
    "Романович", "Семёнович", "Тимофеевич", "Ульянович", "Филиппович", "Харитонович", "Цезаревич", "Чеславович", "Шамилевич", "Эдуардович",
    "Юлианович", "Яковлевич", "Анатольевич", "Богданович", "Витальевич", "Геннадиевич", "Денисович", "Елисеевич", "Жданович", "Зиновьевич"
  ];
  
  const femalePatronymics = [
    "Александровна", "Алексеевна", "Андреевна", "Артёмовна", "Владимировна", "Дмитриевна", "Евгеньевна", "Ивановна", "Максимовна", "Михайловна",
    "Николаевна", "Павловна", "Петровна", "Сергеевна", "Степановна", "Фёдоровна", "Юрьевна", "Ярославовна", "Борисовна", "Васильевна",
    "Георгиевна", "Данииловна", "Егоровна", "Захаровна", "Игоревна", "Кирилловна", "Леонидовна", "Матвеевна", "Назаровна", "Олеговна",
    "Романовна", "Семёновна", "Тимофеевна", "Ульяновна", "Филипповна", "Харитоновна", "Цезаревна", "Чеславовна", "Шамилевна", "Эдуардовна",
    "Юлиановна", "Яковлевна", "Анатольевна", "Богдановна", "Витальевна", "Геннадиевна", "Денисовна", "Елисеевна", "Ждановна", "Зиновьевна"
  ];
  
  // Определяем пол для генерации
  let actualGender = gender;
  if (gender === "any") {
    actualGender = Math.random() < 0.5 ? "male" : "female";
  }
  
  // Выбираем случайные элементы в зависимости от пола
  const firstName = actualGender === "male" 
    ? maleFirstNames[randomInt(0, maleFirstNames.length - 1)]
    : femaleFirstNames[randomInt(0, femaleFirstNames.length - 1)];
  
  const lastName = actualGender === "male"
    ? maleLastNames[randomInt(0, maleLastNames.length - 1)]
    : femaleLastNames[randomInt(0, femaleLastNames.length - 1)];
  
  const patronymic = actualGender === "male"
    ? malePatronymics[randomInt(0, malePatronymics.length - 1)]
    : femalePatronymics[randomInt(0, femalePatronymics.length - 1)];
  
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
  corp_email: (payload?: { domain?: string; useCustomDomain?: boolean }) => generateCorpEmail(payload?.domain, payload?.useCustomDomain),
  phone_ru: (fmt?: string) => generatePhoneRu((fmt as PhoneFormatId) || "paren_dash"),
  snils: () => generateSnils(),
  finance: () => generateFinance(2), // Default: 2 decimal places, comma separator
  time: (fmt?: string) => generateTime(fmt || "digital_hhmm"),
  names: (fmt?: string) => generateNames(fmt || "full_fio", "any"),
  rus_plate: () => generateRusPlate()
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

async function loadFontsForNodes(textNodes: TextNode[]): Promise<void> {
  const fontsToLoad = new Set<string>();
  for (const node of textNodes) {
    try {
      const fontName = node.fontName as FontName | typeof figma.mixed;
      if (fontName !== figma.mixed) {
        fontsToLoad.add(`${fontName.family}__${fontName.style}`);
      } else {
        fontsToLoad.add(`Roboto__Regular`);
      }
    } catch (err) {
      void err;
      fontsToLoad.add(`Roboto__Regular`);
    }
  }
  await Promise.all(
    Array.from(fontsToLoad).map((key) => {
      const [family, style] = key.split("__");
      return figma.loadFontAsync({ family, style } as FontName);
    })
  );
}

function ensureWritableFont(node: TextNode): void {
  try {
    const fontName = node.fontName as FontName | typeof figma.mixed;
    if (fontName === figma.mixed) {
      node.fontName = { family: "Roboto", style: "Regular" };
    }
  } catch (err) {
    void err;
    node.fontName = { family: "Roboto", style: "Regular" };
  }
}

async function applyCollectionToSelection(collection: CollectionId, payload?: { domain?: string; useCustomDomain?: boolean; innKind?: "fl" | "ul"; phoneFormat?: PhoneFormatId; decimalPlaces?: number; timeFormat?: string; namesFormat?: string; namesGender?: string }): Promise<number> {
  const textNodes = collectSelectedTextNodes();
  if (textNodes.length === 0) return 0;

  await loadFontsForNodes(textNodes);
  const gen = generatorById[collection];
  for (const node of textNodes) {
    ensureWritableFont(node);
    if (collection === "inn") {
      node.characters = (payload?.innKind === "ul" ? generateInnUl() : generateInnFl());
    } else if (collection === "phone_ru") {
      node.characters = generatePhoneRu(payload?.phoneFormat);
    } else if (collection === "finance") {
      node.characters = generateFinance(payload?.decimalPlaces);
    } else if (collection === "time") {
      node.characters = generateTime(payload?.timeFormat);
    } else if (collection === "names") {
      node.characters = generateNames(payload?.namesFormat, payload?.namesGender);
    } else if (collection === "corp_email") {
      node.characters = generateCorpEmail(payload?.domain, payload?.useCustomDomain);
    } else {
      node.characters = gen(payload?.domain);
    }
  }
  return textNodes.length;
}

figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === "getCollections") {
    const payload: CodeMessage = { type: "collections", items: availableCollections };
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
      timeFormat: msg.timeFormat,
      namesFormat: msg.namesFormat,
      namesGender: msg.namesGender
    });
    figma.ui.postMessage({ type: "applied", count } as any);
    if (count === 0) {
      figma.notify("Выберите текстовые слои");
    } else {
      figma.notify(`Заполнил ${count} слоёв`);
    }
  }
};
