export function formatCurrencyInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return Number(digits).toLocaleString("es-CL");
}

export function parseCurrencyInput(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}
