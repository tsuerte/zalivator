export type PhoneFormatId = "space_dash" | "paren_dash" | "plain_space";

export function generatePhoneRu(fmt: PhoneFormatId = "space_dash"): string {
  const p2 = Math.floor(Math.random() * 1000) // 0..999
    .toString()
    .padStart(3, "0")
    .replace(/^0{3}$/, "900"); // ensure looks plausible
  const p3 = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  const p4 = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  const p5 = Math.floor(Math.random() * 100).toString().padStart(2, "0");

  switch (fmt) {
    case "space_dash":
      return `+7 ${p2} ${p3}-${p4}-${p5}`;
    case "plain_space":
      return `+7 ${p2} ${p3} ${p4} ${p5}`;
    case "paren_dash":
    default:
      return `+7 (${p2}) ${p3}-${p4}-${p5}`;
  }
}

