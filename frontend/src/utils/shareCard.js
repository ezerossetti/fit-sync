// Genera la tarjeta de resumen de sesión como imagen (formato historia de
// Instagram, 1080x1920) para compartir fuera de la app. Dibuja todo a mano
// sobre un <canvas> con los tokens de marca de FitSync — sin librerías
// externas, así el bundle no crece.
//
// No usamos el logo como imagen (evita líos de fondo/transparencia al
// componer sobre el canvas): el wordmark se dibuja como texto en Space
// Grotesk, que es como ya se ve la marca en el resto de la app.

import { formatKg, formatDuracion } from './helpers'

const W = 1080
const H = 1920

// Paleta tomada 1:1 de tailwind.config.js — así la tarjeta queda consistente
// con el resto de la UI aunque se genere fuera del árbol de React/Tailwind.
const COLORS = {
  background: '#0D0D0F',
  surfaceContainer: '#1B1D22',
  surfaceContainerHigh: '#22242A',
  outlineVariant: '#33353d',
  onSurface: '#e3e2df',
  onSurfaceVariant: '#c4c6d2',
  primary: '#0A2E6E',
  primaryContainer: '#132a5c',
  accent: '#29B0E8',
  onAccent: '#00202b',
  success: '#1D9E75',
  successContainer: '#00291d',
  onSuccessContainer: '#68dbae',
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r
  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + w - radius.tr, y)
  ctx.arcTo(x + w, y, x + w, y + radius.tr, radius.tr)
  ctx.lineTo(x + w, y + h - radius.br)
  ctx.arcTo(x + w, y + h, x + w - radius.br, y + h, radius.br)
  ctx.lineTo(x + radius.bl, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius.bl, radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.arcTo(x, y, x + radius.tl, y, radius.tl)
  ctx.closePath()
}

function drawBackground(ctx) {
  // Degradé sutil de fondo + glow radial en acento, igual espíritu que
  // .progress-gradient pero mucho más apagado para no competir con el texto.
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#0F1420')
  grad.addColorStop(0.55, COLORS.background)
  grad.addColorStop(1, '#0A0B0D')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const glow = ctx.createRadialGradient(W * 0.82, H * 0.06, 0, W * 0.82, H * 0.06, W * 0.75)
  glow.addColorStop(0, 'rgba(41, 176, 232, 0.16)')
  glow.addColorStop(1, 'rgba(41, 176, 232, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)
}

function drawWordmark(ctx, x, y) {
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.accent
  ctx.font = '700 56px "Space Grotesk"'
  ctx.fillText('FitSync', x, y)
  const wordmarkWidth = ctx.measureText('FitSync').width

  ctx.font = '600 22px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText('TU FUERZA, EN DATOS', x, y + 38)

  return wordmarkWidth
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawStatCard(ctx, x, y, w, h, { value, unit, label, accentColor = COLORS.accent }) {
  ctx.fillStyle = COLORS.surfaceContainer
  roundRect(ctx, x, y, w, h, 24)
  ctx.fill()
  ctx.strokeStyle = COLORS.outlineVariant
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 24)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = accentColor
  ctx.font = '700 64px "Space Grotesk"'
  const valueText = unit ? `${value} ${unit}` : `${value}`
  ctx.fillText(valueText, x + w / 2, y + h / 2 - 4)

  ctx.font = '600 22px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText(label.toUpperCase(), x + w / 2, y + h / 2 + 42)
}

function drawWeeklyChart(ctx, x, y, w, h, semana) {
  ctx.fillStyle = COLORS.surfaceContainer
  roundRect(ctx, x, y, w, h, 24)
  ctx.fill()
  ctx.strokeStyle = COLORS.outlineVariant
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 24)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.onSurface
  ctx.font = '600 26px "Plus Jakarta Sans"'
  ctx.fillText('Volumen semanal', x + 36, y + 56)

  const chartTop = y + 90
  const chartBottom = y + h - 56
  const chartHeight = chartBottom - chartTop
  const padding = 36
  const innerW = w - padding * 2
  const gap = 18
  const barW = (innerW - gap * (semana.length - 1)) / semana.length
  const maxVol = Math.max(1, ...semana.map(d => d.volumen))

  semana.forEach((d, i) => {
    const barH = Math.max(6, (d.volumen / maxVol) * chartHeight)
    const bx = x + padding + i * (barW + gap)
    const by = chartBottom - barH
    ctx.fillStyle = d.esHoy ? COLORS.accent : COLORS.primaryContainer
    roundRect(ctx, bx, by, barW, barH, { tl: 8, tr: 8, br: 0, bl: 0 })
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.font = d.esHoy ? '700 20px "Plus Jakarta Sans"' : '600 20px "Plus Jakarta Sans"'
    ctx.fillStyle = d.esHoy ? COLORS.accent : COLORS.onSurfaceVariant
    ctx.fillText(d.label, bx + barW / 2, chartBottom + 34)
  })
}

/**
 * Dibuja la tarjeta de resumen sobre el canvas dado.
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   rutinaNombre: string,
 *   fecha: Date,
 *   volumenTotal: number,
 *   totalSeries: number,
 *   duracionMin: number,
 *   prs: string[],
 *   semana: {label:string, volumen:number, esHoy:boolean}[],
 * }} data
 */
export function dibujarTarjetaResumen(canvas, data) {
  const {
    rutinaNombre = 'Sesión libre',
    fecha = new Date(),
    volumenTotal = 0,
    totalSeries = 0,
    duracionMin = 0,
    prs = [],
    semana = [],
  } = data

  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  drawBackground(ctx)

  const marginX = 80
  let cursorY = 140

  drawWordmark(ctx, marginX, cursorY)
  cursorY += 130

  // Encabezado: check de sesión completada
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.success
  ctx.font = '700 30px "Plus Jakarta Sans"'
  ctx.fillText('✓ SESIÓN COMPLETADA', marginX, cursorY)
  cursorY += 56

  ctx.fillStyle = COLORS.onSurface
  ctx.font = '700 52px "Space Grotesk"'
  const tituloLines = wrapText(ctx, rutinaNombre, W - marginX * 2)
  tituloLines.slice(0, 2).forEach((line) => {
    ctx.fillText(line, marginX, cursorY)
    cursorY += 60
  })

  const fechaTexto = fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  ctx.font = '500 26px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText(fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1), marginX, cursorY + 4)
  cursorY += 70

  // PRs, si hubo
  if (prs.length > 0) {
    const badgeH = 64
    ctx.fillStyle = COLORS.successContainer
    roundRect(ctx, marginX, cursorY, W - marginX * 2, badgeH, 16)
    ctx.fill()
    ctx.strokeStyle = COLORS.success
    ctx.lineWidth = 2
    roundRect(ctx, marginX, cursorY, W - marginX * 2, badgeH, 16)
    ctx.stroke()

    ctx.fillStyle = COLORS.onSuccessContainer
    ctx.font = '700 26px "Plus Jakarta Sans"'
    ctx.textAlign = 'left'
    const prText = prs.length === 1
      ? `🏅 Nuevo récord en ${prs[0]}`
      : `🏅 Nuevos récords: ${prs.slice(0, 2).join(', ')}${prs.length > 2 ? ` +${prs.length - 2}` : ''}`
    ctx.fillText(prText, marginX + 28, cursorY + badgeH / 2 + 9)
    cursorY += badgeH + 40
  } else {
    cursorY += 30
  }

  // Stats principales: volumen total + series
  const statW = (W - marginX * 2 - 24) / 2
  const statH = 200
  drawStatCard(ctx, marginX, cursorY, statW, statH, { value: formatKg(volumenTotal), unit: 'kg', label: 'Volumen total' })
  drawStatCard(ctx, marginX + statW + 24, cursorY, statW, statH, { value: totalSeries, unit: '', label: 'Series totales' })
  cursorY += statH + 24

  // Duración
  ctx.textAlign = 'center'
  ctx.font = '600 26px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText(`Duración: ${formatDuracion(duracionMin)}`, W / 2, cursorY + 10)
  cursorY += 64

  // Gráfico semanal
  if (semana.length > 0) {
    const chartH = 320
    drawWeeklyChart(ctx, marginX, cursorY, W - marginX * 2, chartH, semana)
    cursorY += chartH + 40
  }

  // Footer
  const footerY = H - 90
  ctx.strokeStyle = COLORS.outlineVariant
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(marginX, footerY - 34)
  ctx.lineTo(W - marginX, footerY - 34)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '600 24px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText('Registrado con FitSync', marginX, footerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = COLORS.accent
  ctx.font = '600 24px "Plus Jakarta Sans"'
  ctx.fillText('fitsync.app', W - marginX, footerY)
}

// Espera a que las fuentes web (Space Grotesk / Plus Jakarta Sans) estén
// listas antes de dibujar — si no, el primer render puede caer en la fuente
// del sistema porque el canvas no re-renderiza solo cuando el font-face carga.
export async function esperarFuentes() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all([
      document.fonts.load('700 56px "Space Grotesk"'),
      document.fonts.load('600 26px "Plus Jakarta Sans"'),
      document.fonts.load('700 64px "Space Grotesk"'),
    ])
    await document.fonts.ready
  } catch {
    // Si falla la carga de fuentes, seguimos igual con las fuentes de fallback.
  }
}

export async function generarBlobTarjetaResumen(data) {
  const canvas = document.createElement('canvas')
  await esperarFuentes()
  dibujarTarjetaResumen(canvas, data)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.95)
  })
}
