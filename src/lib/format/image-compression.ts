export interface CompressImageOptions {
  maxDimension: number;
  quality?: number;
}

/**
 * Redimensiona y comprime una imagen subida por el usuario en el navegador
 * usando WebP (o JPEG como respaldo) para evitar saturar el almacenamiento local.
 */
export function compressImageFile(
  file: File,
  options: CompressImageOptions,
): Promise<string> {
  const { maxDimension, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () =>
        reject(new Error("El archivo seleccionado no es una imagen válida."));
      img.onload = () => {
        const largestSide = Math.max(img.width, img.height);
        const scale =
          largestSide > maxDimension ? maxDimension / largestSide : 1;
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el procesador de imagen."));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        if (webpDataUrl.startsWith("data:image/webp")) {
          resolve(webpDataUrl);
          return;
        }

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result ?? "");
    };
    reader.readAsDataURL(file);
  });
}
