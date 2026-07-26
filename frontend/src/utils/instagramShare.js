// Utilidades para compartir a Instagram Stories.
//
// HISTORIAL: esta versión anterior intentaba un deep link
// (instagram-stories://share?top_background_image[]=data:...base64) para
// entrar directo al editor de Historia con la imagen ya puesta. Ese enfoque
// NO es la API real de Meta y nunca funcionó de forma confiable:
//
// - La API real de iOS (documentada por Meta) requiere escribir la imagen
//   en el UIPasteboard nativo bajo una clave especial
//   ("com.instagram.sharedSticker.backgroundImage") y recién ahí abrir
//   "instagram-stories://share". Eso solo se puede hacer con código nativo
//   (Swift/Kotlin); el Clipboard API del navegador no permite escribir
//   claves de pasteboard custom, así que una PWA no tiene forma de hacerlo.
// - En Android el equivalente es un Intent nativo
//   ("com.instagram.share.ADD_TO_STORY") con una content:// URI de un
//   FileProvider, que tampoco existe fuera de una app nativa.
//
// Como pasar la imagen por query string (base64, potencialmente pesado) no
// es un mecanismo soportado, el deep link fallaba en silencio y la app caía
// al share genérico: Instagram recibía la imagen como post/feed normal y
// aplanaba la transparencia a negro sólido — el "sale todo negro" que se
// veía tanto en iOS como en Android.
//
// La única forma 100% confiable de conservar la transparencia (sin empaquetar
// la app como nativa con Capacitor/similar) es que el usuario descargue el
// PNG y lo agregue como sticker desde la galería dentro del editor de
// Historia de Instagram — el picker de "foto de la galería como sticker" de
// Instagram sí respeta el canal alfa. Por eso el flujo de share ahora se
// apoya en eso en vez de prometer un salto directo que no se puede cumplir.

export function esAndroid() {
  return /Android/i.test(navigator.userAgent)
}

export function esIOS() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream
}

// Instrucciones cortas y correctas para el flujo confiable, según plataforma.
// Se usan como copy de ayuda debajo de la preview cuando el modo es "sticker".
export function instruccionesStickerTransparente() {
  if (esAndroid()) {
    return 'Descargá la imagen. Después, en Instagram, arrancá una Historia con tu cámara o una foto, abrí el selector de stickers y elegí "Foto" > la imagen que acabás de descargar: se pega manteniendo la transparencia.'
  }
  if (esIOS()) {
    return 'Descargá la imagen a tu galería. Después, en Instagram, arrancá una Historia, tocá el ícono de sticker (la carita) y elegí la foto que acabás de descargar: se pega manteniendo la transparencia.'
  }
  return 'Descargá la imagen y agregala como sticker desde la galería al crear una Historia en Instagram: así se conserva la transparencia.'
}
