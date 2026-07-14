export const formatIban = (value: string) => {
  if (!value) return "";

  let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (cleaned.length === 0) return "";

  if (!cleaned.startsWith("TR")) {
    const numbersOnly = cleaned.replace(/[^0-9]/g, "");
    cleaned = "TR" + numbersOnly;
  } else {
    const numbersOnly = cleaned.substring(2).replace(/[^0-9]/g, "");
    cleaned = "TR" + numbersOnly;
  }

  if (cleaned.length > 26) {
    cleaned = cleaned.substring(0, 26);
  }

  const parts = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.substring(i, i + 4));
  }

  return parts.join(" ");
};
