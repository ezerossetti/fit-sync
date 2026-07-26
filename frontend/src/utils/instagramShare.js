// Utilidades para compartir directo a Instagram Stories.
//
// En iOS, Meta documenta un deep link (instagram-stories://share) que abre
// el editor de Historia con una imagen ya puesta como sticker de fondo,
// pasada vía el pasteboard general de iOS. Requiere un Facebook App ID
// configurado (VITE_FACEBOOK_APP_ID) y que Instagram esté instalado.
//
// En Android no existe un equivalente confiable vía deep link con imagen
// en el pasteboard, así que ahí seguimos usando el share sheet nativo
// (Web Share API) desde CompartirResumen.jsx.

export function esAndroid() {
  return /Android/i.test(navigator.userAgent)
}

function esIOS() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream
}

export function puedeCompartirStoryNativoIOS() {
  return esIOS() && Boolean(import.meta.env.VITE_FACEBOOK_APP_ID)
}

// Convierte un Blob a base64 puro (sin el prefijo data:...;base64,).
function blobABase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const resultado = reader.result || ''
      const base64 = String(resultado).split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Intenta abrir el editor de Historia de Instagram en iOS con la imagen
// como sticker de fondo. Devuelve true si se disparó el deep link, false
// si no había forma de intentarlo (para que el caller caiga al share sheet
// genérico como alternativa).
export async function compartirStoryNativoIOS(blob) {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID
  if (!appId || !blob) return false

  try {
    const base64 = await blobABase64(blob)

    const params = new URLSearchParams({
      source_application: appId,
      'top_background_image[]': `data:image/png;base64,${base64}`,
    })

    const url = `instagram-stories://share?${params.toString()}`

    const antesDeIrse = Date.now()
    window.location.href = url

    // Si Instagram no está instalado, iOS no navega y no dispara blur/hidden.
    // Esperamos un toque para chequear si la app tomó foco; si no, asumimos
    // que falló y dejamos que el caller use el fallback.
    return await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        document.removeEventListener('visibilitychange', onVisibilityChange)
        resolve(false)
      }, 1500)

      function onVisibilityChange() {
        if (document.hidden && Date.now() - antesDeIrse < 1500) {
          clearTimeout(timeout)
          document.removeEventListener('visibilitychange', onVisibilityChange)
          resolve(true)
        }
      }

      document.addEventListener('visibilitychange', onVisibilityChange)
    })
  } catch (e) {
    return false
  }
}
