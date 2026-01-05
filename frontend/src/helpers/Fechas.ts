function isoToDDMMYYYY(isoStr?: string | null): string {
  if (!isoStr) return "-";
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return "-";

  return `${String(date.getUTCDate()).padStart(2, "0")}/${
    String(date.getUTCMonth() + 1).padStart(2, "0")
  }/${date.getUTCFullYear()}`;
}

export default isoToDDMMYYYY;