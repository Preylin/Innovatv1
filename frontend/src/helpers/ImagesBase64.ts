const getBase64WithPrefix = (base64: string): string => {
  // Si ya tiene el prefijo, lo devolvemos tal cual
  if (base64.startsWith("data:image/")) return base64;

  // Identificar formato por el primer carácter de la cadena Base64
  let mime = "png"; // Fallback por defecto
  const firstChar = base64.charAt(0);

  const mimeMap: Record<string, string> = {
    '/': "jpeg", // Firma JPEG (FF D8 FF)
    'i': "png",  // Firma PNG (89 50 4E)
    'R': "gif",  // Firma GIF (47 49 46)
    'U': "webp", // Firma WebP (52 49 46)
    'J': "pdf"   // Por si acaso necesitas PDF (25 50 44)
  };

  mime = mimeMap[firstChar] || "png";

  return `data:image/${mime};base64,${base64}`;
};

export default getBase64WithPrefix;