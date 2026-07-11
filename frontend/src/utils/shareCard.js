// Genera la tarjeta de resumen de sesión como imagen (formato historia de
// Instagram, 1080x1920) para compartir fuera de la app. Dibuja todo a mano
// sobre un <canvas> con los tokens de marca de FitSync — sin librerías
// externas, así el bundle no crece.
//
// No usamos el logo como imagen (evita líos de fondo/transparencia al
// componer sobre el canvas): el wordmark se dibuja como texto en Space
// Grotesk, que es como ya se ve la marca en el resto de la app.
//
// v2: versión más completa — suma racha, calorías, logros desbloqueados en
// la sesión y el desglose de los ejercicios top por volumen, además del
// resumen de siempre (volumen, series, PRs, gráfico semanal).

import { formatKg, formatDuracion } from './helpers'
import { NIVEL_COLOR } from '../data/achievements'

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
  gold: '#E3B341',
  goldContainer: '#2b2210',
}

// Los logros usan nombres de Material Symbols (para la UI de React), pero acá
// dibujamos sobre un <canvas> plano sin esa fuente de íconos cargada — así
// que los traducimos a un emoji equivalente, nada más que para la tarjeta.
const EMOJI_LOGRO = {
  flag: '🚩', event_repeat: '📅', calendar_month: '🗓️', shield: '🛡️',
  workspace_premium: '👑', local_fire_department: '🔥', whatshot: '🔥',
  fitness_center: '🏋️', trophy: '🏆', schedule: '⏱️', explore: '🧭',
  travel_explore: '🗺️', weekend: '🌴', wb_twilight: '🌅', bedtime: '🌙',
  bolt: '⚡',
}

// Convierte un hex de NIVEL_COLOR a rgba() para poder usarlo en gradientes
// con transparencia (glow detrás de la insignia del logro).
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const bigint = parseInt(full, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
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
  ctx.lineTo(x + radius.tl, y)
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

  ctx.font = '600 22px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText('TU FUERZA, EN DATOS', x, y + 38)
}

// Pill de racha, alineado al margen derecho, a la misma altura que el wordmark.
function drawStreakChip(ctx, xRight, yBaseline, racha) {
  if (!racha || racha < 1) return
  const label = `${racha} ${racha === 1 ? 'día' : 'días'}`
  ctx.font = '700 30px "Plus Jakarta Sans"'
  const textW = ctx.measureText(`🔥 ${label}`).width
  const padX = 24
  const h = 56
  const w = textW + padX * 2
  const x = xRight - w
  const y = yBaseline - h + 8

  ctx.fillStyle = COLORS.goldContainer
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(227, 179, 65, 0.5)'
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = COLORS.gold
  ctx.fillText(`🔥 ${label}`, x + padX, y + h / 2 + 2)
  ctx.textBaseline = 'alphabetic'
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

// Tarjeta de "nuevos logros" desbloqueados en esta sesión (hasta 3, para no
// saturar). Cada uno con su emoji equivalente + título corto.
function drawAchievementsRow(ctx, x, y, w, logros) {
  const items = logros.slice(0, 3)
  const h = 168
  ctx.fillStyle = COLORS.goldContainer
  roundRect(ctx, x, y, w, h, 24)
  ctx.fill()
  ctx.strokeStyle = 'rgba(227, 179, 65, 0.35)'
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 24)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.gold
  ctx.font = '700 26px "Plus Jakarta Sans"'
  ctx.fillText(`🎉 ${items.length > 1 ? 'Nuevos logros' : 'Nuevo logro'}`, x + 32, y + 44)

  const colW = (w - 64) / items.length
  items.forEach((logro, i) => {
    const cx = x + 32 + colW * i + colW / 2
    ctx.textAlign = 'center'
    ctx.font = '40px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurface
    ctx.fillText(EMOJI_LOGRO[logro.icono] || '🏅', cx, y + 104)

    ctx.font = '600 20px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurfaceVariant
    const lineas = wrapText(ctx, logro.titulo, colW - 12).slice(0, 2)
    lineas.forEach((linea, li) => {
      ctx.fillText(linea, cx, y + 132 + li * 24)
    })
  })
}

// Desglose de los ejercicios con más volumen de la sesión, con una mini barra
// proporcional al máximo — da contexto de "en qué se fue" el volumen total.
function drawTopExercises(ctx, x, y, w, topEjercicios) {
  const items = topEjercicios.slice(0, 3)
  const rowH = 60
  const headerH = 52
  const h = headerH + items.length * rowH + 20

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
  ctx.fillText('Desglose de la sesión', x + 36, y + 42)

  const maxVol = Math.max(1, ...items.map(i => i.volumen))
  const barMaxW = w - 72 - 220 // deja espacio al nombre (izq) y al valor (der)

  items.forEach((ej, i) => {
    const rowY = y + headerH + i * rowH + 14

    ctx.font = '600 24px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurface
    const nombreTrunc = ctx.measureText(ej.nombre).width > 260
      ? `${ej.nombre.slice(0, 24)}…`
      : ej.nombre
    ctx.fillText(nombreTrunc, x + 36, rowY)

    // barra mini debajo del nombre
    const barY = rowY + 12
    const barW = Math.max(8, (ej.volumen / maxVol) * barMaxW)
    ctx.fillStyle = COLORS.outlineVariant
    roundRect(ctx, x + 36, barY, barMaxW, 8, 4)
    ctx.fill()
    ctx.fillStyle = COLORS.accent
    roundRect(ctx, x + 36, barY, barW, 8, 4)
    ctx.fill()

    ctx.textAlign = 'right'
    ctx.font = '700 24px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.accent
    ctx.fillText(`${formatKg(ej.volumen)} kg`, x + w - 36, rowY)
    ctx.textAlign = 'left'
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
 *   calorias?: number,
 *   racha?: number,
 *   prs: string[],
 *   semana: {label:string, volumen:number, esHoy:boolean}[],
 *   topEjercicios?: {nombre:string, volumen:number}[],
 *   logrosNuevos?: {titulo:string, icono:string}[],
 * }} data
 */
export function dibujarTarjetaResumen(canvas, data) {
  const {
    rutinaNombre = 'Sesión libre',
    fecha = new Date(),
    volumenTotal = 0,
    totalSeries = 0,
    duracionMin = 0,
    calorias = null,
    racha = 0,
    prs = [],
    semana = [],
    topEjercicios = [],
    logrosNuevos = [],
  } = data

  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  drawBackground(ctx)

  const marginX = 80
  let cursorY = 140

  drawWordmark(ctx, marginX, cursorY)
  drawStreakChip(ctx, W - marginX, cursorY, racha)
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
    cursorY += badgeH + 32
  } else {
    cursorY += 20
  }

  // Stats principales: volumen total + series
  const statW = (W - marginX * 2 - 24) / 2
  const statH = 200
  drawStatCard(ctx, marginX, cursorY, statW, statH, { value: formatKg(volumenTotal), unit: 'kg', label: 'Volumen total' })
  drawStatCard(ctx, marginX + statW + 24, cursorY, statW, statH, { value: totalSeries, unit: '', label: 'Series totales' })
  cursorY += statH + 24

  // Mini stats secundarias: duración + calorías
  ctx.textAlign = 'center'
  ctx.font = '600 26px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  const calText = calorias != null ? ` · ~${Math.round(calorias)} kcal estimadas` : ''
  ctx.fillText(`Duración: ${formatDuracion(duracionMin)}${calText}`, W / 2, cursorY + 10)
  cursorY += 56

  // Gráfico semanal
  if (semana.length > 0) {
    const chartH = 320
    drawWeeklyChart(ctx, marginX, cursorY, W - marginX * 2, chartH, semana)
    cursorY += chartH + 32
  }

  // Logros nuevos desbloqueados en esta sesión
  if (logrosNuevos.length > 0) {
    drawAchievementsRow(ctx, marginX, cursorY, W - marginX * 2, logrosNuevos)
    cursorY += 168 + 32
  }

  // Desglose de ejercicios top por volumen
  if (topEjercicios.length > 0) {
    const items = Math.min(3, topEjercicios.length)
    const blockH = 52 + items * 60 + 20
    drawTopExercises(ctx, marginX, cursorY, W - marginX * 2, topEjercicios)
    cursorY += blockH + 32
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

// ---------- Tarjeta de un logro individual ----------
// Formato post (4:5, más cuadrado que la historia de resumen) pensado para
// compartir un solo logro desde la grilla de Perfil, no necesariamente
// recién desbloqueado en la sesión activa.

const LOGRO_W = 1080
const LOGRO_H = 1350

const NIVEL_LABEL = { bronce: 'BRONCE', plata: 'PLATA', oro: 'ORO', platino: 'PLATINO' }

function drawBackgroundLogro(ctx, color) {
  const grad = ctx.createLinearGradient(0, 0, 0, LOGRO_H)
  grad.addColorStop(0, '#0F1420')
  grad.addColorStop(0.5, COLORS.background)
  grad.addColorStop(1, '#0A0B0D')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, LOGRO_W, LOGRO_H)

  const glow = ctx.createRadialGradient(LOGRO_W / 2, LOGRO_H * 0.4, 0, LOGRO_W / 2, LOGRO_H * 0.4, LOGRO_W * 0.85)
  glow.addColorStop(0, hexToRgba(color, 0.24))
  glow.addColorStop(1, hexToRgba(color, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, LOGRO_W, LOGRO_H)
}

// Insignia circular grande con el emoji del logro y anillo del color de nivel.
function drawBadge(ctx, cx, cy, radius, color, emoji) {
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 1.35)
  glow.addColorStop(0, hexToRgba(color, 0.35))
  glow.addColorStop(1, hexToRgba(color, 0))
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLORS.surfaceContainer
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = color
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `${Math.round(radius * 1.1)}px "Plus Jakarta Sans"`
  ctx.fillStyle = COLORS.onSurface
  ctx.fillText(emoji, cx, cy + radius * 0.06)
  ctx.textBaseline = 'alphabetic'
}

/**
 * Dibuja la tarjeta de un logro individual (para compartir desde Perfil).
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   logro: {titulo:string, descripcion:string, icono:string, nivel:string},
 *   nombreUsuario?: string,
 *   statsContext?: string,
 * }} data
 */
export function dibujarTarjetaLogro(canvas, data) {
  const { logro, nombreUsuario = '', statsContext = '' } = data
  const color = NIVEL_COLOR[logro.nivel] || COLORS.accent

  canvas.width = LOGRO_W
  canvas.height = LOGRO_H
  const ctx = canvas.getContext('2d')

  drawBackgroundLogro(ctx, color)

  const marginX = 90
  let cursorY = 130

  drawWordmark(ctx, marginX, cursorY)
  cursorY += 170

  // Insignia central
  const badgeCx = LOGRO_W / 2
  const badgeCy = cursorY + 190
  drawBadge(ctx, badgeCx, badgeCy, 170, color, EMOJI_LOGRO[logro.icono] || '🏅')
  cursorY = badgeCy + 170 + 70

  // Pill de nivel
  const nivelTexto = NIVEL_LABEL[logro.nivel] || logro.nivel.toUpperCase()
  ctx.font = '700 26px "Plus Jakarta Sans"'
  const nivelW = ctx.measureText(nivelTexto).width
  const pillPadX = 28
  const pillH = 52
  const pillW = nivelW + pillPadX * 2
  const pillX = LOGRO_W / 2 - pillW / 2
  ctx.fillStyle = hexToRgba(color, 0.16)
  roundRect(ctx, pillX, cursorY, pillW, pillH, pillH / 2)
  ctx.fill()
  ctx.strokeStyle = hexToRgba(color, 0.5)
  ctx.lineWidth = 2
  roundRect(ctx, pillX, cursorY, pillW, pillH, pillH / 2)
  ctx.stroke()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(nivelTexto, LOGRO_W / 2, cursorY + pillH / 2 + 2)
  ctx.textBaseline = 'alphabetic'
  cursorY += pillH + 44

  // Título
  ctx.font = '700 58px "Space Grotesk"'
  ctx.fillStyle = COLORS.onSurface
  ctx.textAlign = 'center'
  const tituloLines = wrapText(ctx, logro.titulo, LOGRO_W - marginX * 2)
  tituloLines.slice(0, 2).forEach((line) => {
    ctx.fillText(line, LOGRO_W / 2, cursorY)
    cursorY += 64
  })
  cursorY += 12

  // Descripción
  ctx.font = '500 30px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  const descLines = wrapText(ctx, logro.descripcion, LOGRO_W - marginX * 2 - 60)
  descLines.slice(0, 3).forEach((line) => {
    ctx.fillText(line, LOGRO_W / 2, cursorY)
    cursorY += 40
  })

  // Contexto opcional (p. ej. "Desbloqueado el 12 de julio" o nombre de usuario)
  if (statsContext) {
    cursorY += 20
    ctx.font = '600 26px "Plus Jakarta Sans"'
    ctx.fillStyle = color
    ctx.fillText(statsContext, LOGRO_W / 2, cursorY)
  }

  if (nombreUsuario) {
    ctx.font = '500 24px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurfaceVariant
    ctx.fillText(nombreUsuario, LOGRO_W / 2, LOGRO_H - 150)
  }

  // Footer
  const footerY = LOGRO_H - 90
  ctx.strokeStyle = COLORS.outlineVariant
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(marginX, footerY - 34)
  ctx.lineTo(LOGRO_W - marginX, footerY - 34)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '600 24px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText('Registrado con FitSync', marginX, footerY)

  ctx.textAlign = 'right'
  ctx.fillStyle = COLORS.accent
  ctx.font = '600 24px "Plus Jakarta Sans"'
  ctx.fillText('fitsync.app', LOGRO_W - marginX, footerY)
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
