export function whatsappUrl(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export const DEFAULT_QUOTE_MESSAGE =
  "Hi, I would like to know about a dress from your collection.";
