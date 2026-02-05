const getBase64WithPrefix = (base64: string): string => {
  if (base64.startsWith("data:image/")) return base64;

  // Identificar formato por la firma del Base64
  let mime = "png"; // fallback por defecto
  const firstChar = base64.charAt(0);

  if (firstChar === '/') mime = "jpeg";
  else if (firstChar === 'i') mime = "png";
  else if (firstChar === 'R') mime = "gif";
  else if (firstChar === 'U') mime = "webp";

  return `data:image/${mime};base64,${base64}`;
};

export default getBase64WithPrefix;