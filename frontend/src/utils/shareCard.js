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

// Los logros usan nombres de Material Symbols (para la UI de React). Sobre
// el <canvas> no tenemos esa fuente de íconos cargada, así que en vez de caer
// a emoji (inconsistente entre plataformas, look poco profesional) dibujamos
// cada ícono a mano con trazos vectoriales — ver drawIcon() más abajo. Las
// claves coinciden 1:1 con los nombres de Material Symbols que ya usa el
// resto de la app, así no hace falta ningún mapeo.

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

// ---------- Íconos vectoriales ----------
// Set propio de íconos "line style", pensados para leerse bien a los tamaños
// chicos de la tarjeta y con el mismo espíritu técnico/outlined de Material
// Symbols (que es lo que usa el resto de la UI y los mockups de Stitch).
// drawIcon(ctx, nombre, cx, cy, size, color, weight?) dibuja centrado en
// (cx, cy) dentro de una caja aproximada de `size` x `size`.

function drawStarPath(ctx, cx, cy, outerR, innerR, points) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const a = (Math.PI / points) * i - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function drawIcon(ctx, name, cx, cy, size, color, weight) {
  const s = size
  const h = s / 2
  const w = weight || Math.max(2, s * 0.09)
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = w
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (name) {
    case 'dumbbell':
    case 'fitness_center': {
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.28, cy)
      ctx.lineTo(cx + s * 0.28, cy)
      ctx.stroke()
      const plateW = s * 0.15
      const plateH = s * 0.6
      roundRect(ctx, cx - s * 0.5, cy - plateH / 2, plateW, plateH, plateW * 0.35)
      ctx.fill()
      roundRect(ctx, cx + s * 0.35, cy - plateH / 2, plateW, plateH, plateW * 0.35)
      ctx.fill()
      const plate2H = s * 0.38
      roundRect(ctx, cx - s * 0.34, cy - plate2H / 2, plateW * 0.65, plate2H, plateW * 0.25)
      ctx.fill()
      roundRect(ctx, cx + s * 0.5 - plateW * 0.65, cy - plate2H / 2, plateW * 0.65, plate2H, plateW * 0.25)
      ctx.fill()
      break
    }
    case 'bolt': {
      ctx.beginPath()
      ctx.moveTo(cx + s * 0.06, cy - h)
      ctx.lineTo(cx - s * 0.22, cy + s * 0.08)
      ctx.lineTo(cx - s * 0.02, cy + s * 0.08)
      ctx.lineTo(cx - s * 0.1, cy + h)
      ctx.lineTo(cx + s * 0.26, cy - s * 0.05)
      ctx.lineTo(cx + s * 0.04, cy - s * 0.05)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'flame':
    case 'local_fire_department':
    case 'whatshot': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - h)
      ctx.bezierCurveTo(cx + s * 0.34, cy - s * 0.1, cx + s * 0.1, cy + s * 0.05, cx + s * 0.22, cy + h * 0.7)
      ctx.bezierCurveTo(cx + s * 0.22, cy + h, cx - s * 0.22, cy + h, cx - s * 0.22, cy + h * 0.6)
      ctx.bezierCurveTo(cx - s * 0.3, cy + h * 0.3, cx - s * 0.12, cy + s * 0.05, cx - s * 0.05, cy - s * 0.05)
      ctx.bezierCurveTo(cx - s * 0.14, cy - s * 0.28, cx - s * 0.05, cy - h * 0.85, cx, cy - h)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'trophy': {
      const cupTop = cy - h * 0.7
      const cupBottom = cy + s * 0.02
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.28, cupTop)
      ctx.quadraticCurveTo(cx - s * 0.28, cupBottom, cx, cupBottom)
      ctx.quadraticCurveTo(cx + s * 0.28, cupBottom, cx + s * 0.28, cupTop)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.28, cupTop)
      ctx.lineTo(cx + s * 0.28, cupTop)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx - s * 0.38, cupTop + s * 0.05, s * 0.11, Math.PI * 0.2, Math.PI * 1.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx + s * 0.38, cupTop + s * 0.05, s * 0.11, Math.PI * 1.3, Math.PI * 2.8)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cupBottom)
      ctx.lineTo(cx, cupBottom + s * 0.14)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.16, cupBottom + s * 0.18)
      ctx.lineTo(cx + s * 0.16, cupBottom + s * 0.18)
      ctx.stroke()
      break
    }
    case 'list': {
      const xs = cx - s * 0.32
      const xe = cx + s * 0.32
      ;[-0.26, 0, 0.26].forEach((f) => {
        ctx.beginPath()
        ctx.arc(xs, cy + s * f, w * 0.55, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(xs + s * 0.16, cy + s * f)
        ctx.lineTo(xe, cy + s * f)
        ctx.stroke()
      })
      break
    }
    case 'timer':
    case 'schedule': {
      ctx.beginPath()
      ctx.arc(cx, cy + s * 0.02, h * 0.78, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy + s * 0.02)
      ctx.lineTo(cx, cy - h * 0.42)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy + s * 0.02)
      ctx.lineTo(cx + h * 0.34, cy + s * 0.18)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.1, cy - h * 0.92)
      ctx.lineTo(cx + s * 0.1, cy - h * 0.92)
      ctx.stroke()
      break
    }
    case 'check_circle': {
      ctx.beginPath()
      ctx.arc(cx, cy, h * 0.82, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.2, cy)
      ctx.lineTo(cx - s * 0.04, cy + s * 0.16)
      ctx.lineTo(cx + s * 0.24, cy - s * 0.16)
      ctx.stroke()
      break
    }
    case 'flag': {
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.28, cy - h)
      ctx.lineTo(cx - s * 0.28, cy + h)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.28, cy - h * 0.9)
      ctx.lineTo(cx + s * 0.32, cy - s * 0.55)
      ctx.lineTo(cx - s * 0.28, cy - s * 0.1)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'calendar_month':
    case 'event_repeat': {
      const bx = cx - s * 0.34
      const by = cy - s * 0.3
      const bw = s * 0.68
      const bh = s * 0.58
      roundRect(ctx, bx, by, bw, bh, s * 0.08)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(bx, by + s * 0.18)
      ctx.lineTo(bx + bw, by + s * 0.18)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.16, by - s * 0.08)
      ctx.lineTo(cx - s * 0.16, by + s * 0.04)
      ctx.moveTo(cx + s * 0.16, by - s * 0.08)
      ctx.lineTo(cx + s * 0.16, by + s * 0.04)
      ctx.stroke()
      if (name === 'event_repeat') {
        ctx.beginPath()
        ctx.arc(cx, by + bh * 0.62, s * 0.13, Math.PI * 0.15, Math.PI * 1.7)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(cx + s * 0.11, by + bh * 0.62 - s * 0.03)
        ctx.lineTo(cx + s * 0.16, by + bh * 0.62 + s * 0.03)
        ctx.lineTo(cx + s * 0.07, by + bh * 0.62 + s * 0.05)
        ctx.closePath()
        ctx.fill()
      } else {
        ;[-0.16, 0, 0.16].forEach((fx) => {
          ctx.beginPath()
          ctx.arc(cx + s * fx, by + bh * 0.62, w * 0.55, 0, Math.PI * 2)
          ctx.fill()
        })
      }
      break
    }
    case 'shield': {
      ctx.beginPath()
      ctx.moveTo(cx, cy - h)
      ctx.lineTo(cx + s * 0.3, cy - s * 0.28)
      ctx.lineTo(cx + s * 0.3, cy + s * 0.06)
      ctx.quadraticCurveTo(cx + s * 0.3, cy + h * 0.7, cx, cy + h)
      ctx.quadraticCurveTo(cx - s * 0.3, cy + h * 0.7, cx - s * 0.3, cy + s * 0.06)
      ctx.lineTo(cx - s * 0.3, cy - s * 0.28)
      ctx.closePath()
      ctx.stroke()
      break
    }
    case 'workspace_premium': {
      ctx.beginPath()
      ctx.arc(cx, cy - s * 0.06, h * 0.58, 0, Math.PI * 2)
      ctx.stroke()
      drawStarPath(ctx, cx, cy - s * 0.06, h * 0.28, h * 0.13, 5)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx - s * 0.2, cy + s * 0.16)
      ctx.lineTo(cx - s * 0.3, cy + h)
      ctx.lineTo(cx - s * 0.1, cy + s * 0.32)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx + s * 0.2, cy + s * 0.16)
      ctx.lineTo(cx + s * 0.3, cy + h)
      ctx.lineTo(cx + s * 0.1, cy + s * 0.32)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'explore': {
      ctx.beginPath()
      ctx.arc(cx, cy, h * 0.82, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + s * 0.22, cy - s * 0.22)
      ctx.lineTo(cx + s * 0.04, cy + s * 0.04)
      ctx.lineTo(cx - s * 0.22, cy + s * 0.22)
      ctx.lineTo(cx - s * 0.04, cy - s * 0.04)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'travel_explore': {
      const gr = h * 0.6
      ctx.beginPath()
      ctx.arc(cx, cy, gr, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(cx, cy, gr, gr * 0.42, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy - gr)
      ctx.lineTo(cx, cy + gr)
      ctx.stroke()
      break
    }
    case 'weekend': {
      const bx = cx - s * 0.32
      const by = cy - s * 0.02
      const bw = s * 0.64
      const bh = s * 0.26
      roundRect(ctx, bx, by, bw, bh, s * 0.06)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(bx, by)
      ctx.quadraticCurveTo(bx, by - s * 0.22, bx + s * 0.12, by - s * 0.22)
      ctx.lineTo(bx + bw - s * 0.12, by - s * 0.22)
      ctx.quadraticCurveTo(bx + bw, by - s * 0.22, bx + bw, by)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(bx - s * 0.04, by + s * 0.04)
      ctx.lineTo(bx - s * 0.04, by + bh)
      ctx.moveTo(bx + bw + s * 0.04, by + s * 0.04)
      ctx.lineTo(bx + bw + s * 0.04, by + bh)
      ctx.stroke()
      break
    }
    case 'wb_twilight': {
      ctx.beginPath()
      ctx.arc(cx, cy + s * 0.08, h * 0.36, Math.PI, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - h * 0.82, cy + s * 0.08)
      ctx.lineTo(cx + h * 0.82, cy + s * 0.08)
      ctx.stroke()
      ;[-0.5, -0.25, 0, 0.25, 0.5].forEach((f) => {
        ctx.beginPath()
        ctx.moveTo(cx + f * s * 0.7, cy - s * 0.28)
        ctx.lineTo(cx + f * s * 0.7, cy - s * 0.4)
        ctx.stroke()
      })
      break
    }
    case 'bedtime': {
      ctx.beginPath()
      ctx.arc(cx, cy, h * 0.75, Math.PI * 0.5, Math.PI * 1.5, false)
      ctx.arc(cx + h * 0.5, cy, h * 0.65, Math.PI * 1.5, Math.PI * 0.5, true)
      ctx.closePath()
      ctx.fill()
      break
    }
    default: {
      ctx.beginPath()
      ctx.arc(cx, cy, h * 0.7, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.restore()
}

// ---------- Superficies "glass" y textura de fondo técnica ----------
// Mismo lenguaje visual que los mockups de Stitch: paneles con blur/borde
// sutil, grid de puntos de fondo y corner brackets técnicos en las esquinas.

function drawGlassPanel(ctx, x, y, w, h, r = 24, opts = {}) {
  const { fill = 'rgba(255, 255, 255, 0.035)', stroke = 'rgba(255, 255, 255, 0.09)' } = opts
  ctx.fillStyle = fill
  roundRect(ctx, x, y, w, h, r)
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, r)
  ctx.stroke()
}

function drawDotGrid(ctx, alpha = 0.05) {
  ctx.save()
  ctx.fillStyle = `rgba(122, 208, 255, ${alpha})`
  const step = 44
  for (let gx = step / 2; gx < W; gx += step) {
    for (let gy = step / 2; gy < H; gy += step) {
      ctx.beginPath()
      ctx.arc(gx, gy, 1.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawCornerBrackets(ctx, inset = 48, size = 32, color = 'rgba(122, 208, 255, 0.32)') {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  const corners = [
    [inset, inset, 1, 1],
    [W - inset, inset, -1, 1],
    [inset, H - inset, 1, -1],
    [W - inset, H - inset, -1, -1],
  ]
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath()
    ctx.moveTo(x, y + size * dy)
    ctx.lineTo(x, y)
    ctx.lineTo(x + size * dx, y)
    ctx.stroke()
  })
  ctx.restore()
}

function drawBackground(ctx) {
  // Degradé de fondo + doble glow radial (acento arriba-derecha, éxito
  // abajo-izquierda) + grid de puntos técnico — mismo espíritu que los
  // mockups de Stitch, apagado para no competir con el texto.
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, '#10141F')
  grad.addColorStop(0.5, COLORS.background)
  grad.addColorStop(1, '#08090B')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  const glow1 = ctx.createRadialGradient(W * 0.85, H * 0.05, 0, W * 0.85, H * 0.05, W * 0.9)
  glow1.addColorStop(0, 'rgba(41, 176, 232, 0.18)')
  glow1.addColorStop(1, 'rgba(41, 176, 232, 0)')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, W, H)

  const glow2 = ctx.createRadialGradient(W * 0.08, H * 0.6, 0, W * 0.08, H * 0.6, W * 0.7)
  glow2.addColorStop(0, hexToRgba(COLORS.success, 0.1))
  glow2.addColorStop(1, hexToRgba(COLORS.success, 0))
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, W, H)

  drawDotGrid(ctx, 0.045)
  drawCornerBrackets(ctx)
}

function drawWordmark(ctx, x, y) {
  const iconSize = 40
  drawIcon(ctx, 'dumbbell', x + iconSize / 2, y - 16, iconSize, COLORS.accent, 3.5)

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.accent
  ctx.font = '700 56px "Space Grotesk"'
  ctx.fillText('FitSync', x + iconSize + 14, y)

  ctx.font = '600 22px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText('TU FUERZA, EN DATOS', x + iconSize + 14, y + 38)
}

// Wordmark centrado (ícono + texto como un solo bloque), para tarjetas donde
// el header va al medio en vez de alineado a la izquierda.
function drawWordmarkCentered(ctx, cxCenter, y, { fontSize = 52, iconSize = 42, tagline = true } = {}) {
  ctx.font = `700 ${fontSize}px "Space Grotesk"`
  const textW = ctx.measureText('FitSync').width
  const gap = 14
  const totalW = iconSize + gap + textW
  const startX = cxCenter - totalW / 2

  drawIcon(ctx, 'dumbbell', startX + iconSize / 2, y - fontSize * 0.32, iconSize, COLORS.accent, 3.5)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = COLORS.accent
  ctx.fillText('FitSync', startX + iconSize + gap, y)

  if (tagline) {
    ctx.textAlign = 'center'
    ctx.font = '600 20px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurfaceVariant
    ctx.fillText('TU FUERZA, EN DATOS', cxCenter, y + 36)
  }
}

// Pill de racha, alineado al margen derecho. `yTop` es el borde superior del
// chip (no baseline), para poder anclarlo como badge de esquina.
function drawStreakChip(ctx, xRight, yTop, racha) {
  if (!racha || racha < 1) return
  const label = `${racha} ${racha === 1 ? 'día' : 'días'}`
  ctx.font = '700 28px "Plus Jakarta Sans"'
  const textW = ctx.measureText(label).width
  const iconSize = 26
  const gap = 10
  const padX = 22
  const h = 54
  const w = padX + iconSize + gap + textW + padX
  const x = xRight - w
  const y = yTop

  ctx.fillStyle = 'rgba(227, 179, 65, 0.12)'
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(227, 179, 65, 0.42)'
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, h / 2)
  ctx.stroke()

  drawIcon(ctx, 'flame', x + padX + iconSize / 2, y + h / 2, iconSize, COLORS.gold, 3)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = COLORS.gold
  ctx.fillText(label, x + padX + iconSize + gap, y + h / 2 + 1)
  ctx.textBaseline = 'alphabetic'

  return { x, y, w, h }
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

// Métrica tipo "bento" con panel glass + borde de acento a la izquierda +
// ícono — mismo patrón que la fila de badges de los mockups de Stitch
// (doc4), mucho más liviano que la caja plana anterior.
function drawBentoMetric(ctx, x, y, w, h, { icon, value, unit, label, accentColor = COLORS.accent }) {
  drawGlassPanel(ctx, x, y, w, h, 20)

  ctx.fillStyle = accentColor
  roundRect(ctx, x, y, 4, h, { tl: 4, bl: 4, tr: 0, br: 0 })
  ctx.fill()

  const iconSize = 36
  const iconCx = x + w / 2
  drawIcon(ctx, icon, iconCx, y + 46, iconSize, accentColor, 3)

  ctx.textAlign = 'center'
  ctx.fillStyle = COLORS.onSurface
  ctx.font = '700 42px "Space Grotesk"'
  const valueText = unit ? `${value} ${unit}` : `${value}`
  ctx.fillText(valueText, iconCx, y + h / 2 + 32)

  ctx.font = '700 19px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText(label.toUpperCase(), iconCx, y + h - 22)
}

function drawWeeklyChart(ctx, x, y, w, h, semana) {
  drawGlassPanel(ctx, x, y, w, h, 24)

  drawIcon(ctx, 'timer', x + 42, y + 50, 26, COLORS.accent, 2.5)
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.onSurface
  ctx.font = '700 26px "Plus Jakarta Sans"'
  ctx.fillText('Volumen semanal', x + 66, y + 58)

  const chartTop = y + 96
  const chartBottom = y + h - 60
  const chartHeight = chartBottom - chartTop
  const padding = 40

  // Líneas guía horizontales — sin esto, con una sola barra alta el resto del
  // panel se ve "vacío"; las guías le dan referencia visual incluso a bajo
  // volumen.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.lineWidth = 1.5
  ;[0.25, 0.5, 0.75].forEach((f) => {
    const gy = chartTop + chartHeight * f
    ctx.beginPath()
    ctx.moveTo(x + padding, gy)
    ctx.lineTo(x + w - padding, gy)
    ctx.stroke()
  })

  const innerW = w - padding * 2
  const gap = 20
  const barW = (innerW - gap * (semana.length - 1)) / semana.length
  const maxVol = Math.max(1, ...semana.map((d) => d.volumen))

  semana.forEach((d, i) => {
    const barH = d.volumen > 0 ? Math.max(10, (d.volumen / maxVol) * chartHeight) : 4
    const bx = x + padding + i * (barW + gap)
    const by = chartBottom - barH

    if (d.volumen > 0) {
      const barGrad = ctx.createLinearGradient(0, by, 0, chartBottom)
      if (d.esHoy) {
        barGrad.addColorStop(0, '#6FE0FF')
        barGrad.addColorStop(1, COLORS.accent)
      } else {
        barGrad.addColorStop(0, 'rgba(122, 208, 255, 0.45)')
        barGrad.addColorStop(1, 'rgba(122, 208, 255, 0.18)')
      }
      ctx.fillStyle = barGrad
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
    }
    roundRect(ctx, bx, by, barW, barH, { tl: 8, tr: 8, br: 0, bl: 0 })
    ctx.fill()

    ctx.textAlign = 'center'
    ctx.font = d.esHoy ? '700 20px "Plus Jakarta Sans"' : '600 20px "Plus Jakarta Sans"'
    ctx.fillStyle = d.esHoy ? COLORS.accent : COLORS.onSurfaceVariant
    ctx.fillText(d.label, bx + barW / 2, chartBottom + 36)
  })

  // Línea base del eje
  ctx.strokeStyle = COLORS.outlineVariant
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + padding, chartBottom)
  ctx.lineTo(x + w - padding, chartBottom)
  ctx.stroke()
}

// Fila de "nuevos logros" desbloqueados en esta sesión (hasta 3, para no
// saturar). Cada uno es una chip glass individual con ícono vectorial propio
// y borde superior dorado fino — nada de caja sólida pesada ni emoji.
function drawAchievementsRow(ctx, x, y, w, logros) {
  const items = logros.slice(0, 3)
  const h = 172
  const gap = 20
  const colW = (w - gap * (items.length - 1)) / items.length

  ctx.textAlign = 'left'
  drawIcon(ctx, 'workspace_premium', x + 16, y - 6, 26, COLORS.gold, 2.5)
  ctx.fillStyle = COLORS.gold
  ctx.font = '700 24px "Plus Jakarta Sans"'
  ctx.fillText((items.length > 1 ? 'NUEVOS LOGROS' : 'NUEVO LOGRO'), x + 38, y + 2)

  const cardsY = y + 34
  items.forEach((logro, i) => {
    const cx = x + colW * i + (i > 0 ? gap * i : 0)
    drawGlassPanel(ctx, cx, cardsY, colW, h, 20, { stroke: 'rgba(227, 179, 65, 0.28)' })
    ctx.fillStyle = 'rgba(227, 179, 65, 0.55)'
    roundRect(ctx, cx, cardsY, colW, 3, { tl: 20, tr: 20, br: 0, bl: 0 })
    ctx.fill()

    const iconCx = cx + colW / 2
    const badgeR = 34
    const badgeCy = cardsY + 56
    ctx.fillStyle = 'rgba(227, 179, 65, 0.12)'
    ctx.beginPath()
    ctx.arc(iconCx, badgeCy, badgeR, 0, Math.PI * 2)
    ctx.fill()
    drawIcon(ctx, logro.icono, iconCx, badgeCy, 36, COLORS.gold, 3)

    ctx.textAlign = 'center'
    ctx.font = '600 19px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurfaceVariant
    const lineas = wrapText(ctx, logro.titulo, colW - 20).slice(0, 2)
    lineas.forEach((linea, li) => {
      ctx.fillText(linea, iconCx, cardsY + 116 + li * 24)
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

  drawGlassPanel(ctx, x, y, w, h, 24)

  drawIcon(ctx, 'list', x + 42, y + 38, 26, COLORS.accent, 2.5)
  ctx.textAlign = 'left'
  ctx.fillStyle = COLORS.onSurface
  ctx.font = '700 26px "Plus Jakarta Sans"'
  ctx.fillText('Desglose de la sesión', x + 66, y + 46)

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

// ---------- Sticker transparente (texto directo sobre la foto) ----------
// Formato historia (1080x1920), canvas transparente de punta a punta: NO
// hay ninguna caja/panel de fondo. Pensado para compartirse vía
// navigator.share: cuando Instagram recibe un PNG con zonas transparentes
// desde el share sheet nativo, lo coloca como sticker sobre la foto/cámara
// que el usuario elija en el editor de Historia. Como no sabemos qué foto
// va a quedar detrás, la legibilidad se resuelve con dos degradés (scrim)
// arriba y abajo — igual que hacen Instagram/Strava con sus propios
// stickers — más una sombra de texto suave, nunca con un rectángulo de
// fondo: el texto tiene que sentirse pegado a la foto, no flotando en una
// tarjeta aparte.

const STICKER_MARGIN_X = 84
const STICKER_TOP_SAFE = 110 // franja arriba, para la barra de progreso/cierre de IG
const STICKER_BOTTOM_SAFE = 190 // franja abajo, para los controles propios de IG

// Formatea el número hero con separador de miles estilo es-AR (punto),
// conservando los decimales de formatKg con coma: 2450 -> "2.450",
// 2450.5 -> "2.450,5". formatKg ya resuelve el redondeo; acá solo agrupamos.
function formatHeroKg(valor) {
  const crudo = formatKg(valor)
  const [entero, decimales] = crudo.split('.')
  const enteroFormateado = new Intl.NumberFormat('es-AR').format(Number(entero))
  return decimales ? `${enteroFormateado},${decimales}` : enteroFormateado
}

// Degradés (scrim) arriba y abajo del canvas, igual que el mockup: NO hay
// ninguna caja detrás del texto. El texto va directo sobre la foto que el
// usuario elija en Instagram; estos degradés son lo único que garantiza
// legibilidad, oscureciendo un poco arriba (para el wordmark) y bastante
// más abajo (donde va el bloque de datos), sin tapar la foto con un panel.
function drawStickerScrims(ctx) {
  const scrimTop = ctx.createLinearGradient(0, 0, 0, H * 0.32)
  scrimTop.addColorStop(0, 'rgba(0, 0, 0, 0.45)')
  scrimTop.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = scrimTop
  ctx.fillRect(0, 0, W, H * 0.32)

  const scrimBottom = ctx.createLinearGradient(0, H * 0.45, 0, H)
  scrimBottom.addColorStop(0, 'rgba(0, 0, 0, 0)')
  scrimBottom.addColorStop(1, 'rgba(0, 0, 0, 0.82)')
  ctx.fillStyle = scrimBottom
  ctx.fillRect(0, H * 0.45, W, H * 0.55)
}

function truncateToWidth(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let out = text
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1)
  }
  return `${out}…`
}

/**
 * Dibuja el sticker transparente de resumen de sesión.
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   rutinaNombre: string, fecha: Date, volumenTotal: number,
 *   totalSeries: number, duracionMin: number, racha?: number, prs: string[],
 * }} data
 */
export function dibujarStickerResumen(canvas, data) {
  const {
    rutinaNombre = 'Sesión libre',
    fecha = new Date(),
    volumenTotal = 0,
    totalSeries = 0,
    duracionMin = 0,
    racha = 0,
    prs = [],
  } = data

  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H) // el canvas queda transparente salvo lo que dibujemos

  const hayPR = prs.length > 0
  const marginX = STICKER_MARGIN_X
  const innerW = W - marginX * 2

  drawStickerScrims(ctx)

  // Sombra de texto suave y constante para todo el bloque de datos: es lo
  // que reemplaza a la caja de fondo, dándole legibilidad sin taparle la
  // foto al usuario.
  const conSombra = (dibujar) => {
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
    ctx.shadowBlur = 18
    ctx.shadowOffsetY = 2
    dibujar()
    ctx.restore()
  }

  // ---- Header: wordmark centrado arriba, fijo, como en el mockup ----
  conSombra(() => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = COLORS.accent
    ctx.font = '700 44px "Space Grotesk"'
    ctx.fillText('FitSync', W / 2, STICKER_TOP_SAFE + 44)
  })

  // ---- Bloque inferior: PR (si hay) + hero + subtítulo + metadata ----
  const hPill = hayPR ? 50 : 0
  const gapAfterPill = hayPR ? 22 : 0
  const hHero = 128
  const gapAfterHero = 14
  const hSubtitle = 40
  const gapAfterSubtitle = 28
  const hMetadata = 40

  const bloqueH = hPill + gapAfterPill + hHero + gapAfterHero + hSubtitle + gapAfterSubtitle + hMetadata
  let cy = H - STICKER_BOTTOM_SAFE - bloqueH

  // PR: pill chico tipo "glass", sin fondo pesado — un tag suelto, no una caja.
  if (hayPR) {
    const pillLabel = prs.length === 1 ? 'NUEVO RÉCORD' : `${prs.length} RÉCORDS NUEVOS`
    conSombra(() => {
      ctx.font = '700 22px "Plus Jakarta Sans"'
      const textW = ctx.measureText(pillLabel).width
      const iconSize = 22
      const iconGap = 10
      const padX = 22
      const pillW = padX + iconSize + iconGap + textW + padX
      ctx.fillStyle = 'rgba(227, 179, 65, 0.16)'
      roundRect(ctx, marginX, cy, pillW, hPill, hPill / 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(227, 179, 65, 0.55)'
      ctx.lineWidth = 2
      roundRect(ctx, marginX, cy, pillW, hPill, hPill / 2)
      ctx.stroke()
      drawIcon(ctx, 'trophy', marginX + padX + iconSize / 2, cy + hPill / 2, iconSize, COLORS.gold, 2.4)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = COLORS.gold
      ctx.fillText(pillLabel, marginX + padX + iconSize + iconGap, cy + hPill / 2 + 2)
      ctx.textBaseline = 'alphabetic'
    })
    cy += hPill + gapAfterPill
  }

  // Hero: número gigante + unidad, alineado a la izquierda, directo sobre la foto.
  const valorTexto = formatHeroKg(volumenTotal)
  conSombra(() => {
    ctx.textAlign = 'left'
    ctx.font = '700 116px "Space Grotesk"'
    const valorW = ctx.measureText(valorTexto).width
    ctx.fillStyle = '#ffffff'
    ctx.fillText(valorTexto, marginX, cy + hHero - 22)
    ctx.font = '700 48px "Space Grotesk"'
    ctx.fillStyle = COLORS.accent
    ctx.fillText(' kg', marginX + valorW, cy + hHero - 22)
  })
  cy += hHero + gapAfterHero

  // Subtítulo: rutina + fecha en una sola línea, gris claro, truncado si no entra.
  const fechaTexto = fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
  const subtitulo = `${rutinaNombre} · ${fechaTexto}`
  conSombra(() => {
    ctx.textAlign = 'left'
    ctx.font = '500 32px "Plus Jakarta Sans"'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)'
    ctx.fillText(truncateToWidth(ctx, subtitulo, innerW), marginX, cy + hSubtitle - 8)
  })
  cy += hSubtitle + gapAfterSubtitle

  // Metadata: fila de ítems con ícono + texto, separados por divisores finos,
  // en una sola línea (ancho dinámico, no columnas fijas) — igual que el mockup.
  const items = [
    { icon: 'list', text: `${totalSeries} Series` },
    { icon: 'timer', text: formatDuracion(duracionMin) },
  ]
  if (racha > 0) items.push({ icon: 'flame', text: `Racha ${racha} ${racha === 1 ? 'día' : 'días'}` })

  conSombra(() => {
    ctx.textAlign = 'left'
    ctx.font = '700 30px "Plus Jakarta Sans"'
    const iconSize = 26
    const iconTextGap = 10
    let x = marginX
    const dividerGap = 28
    items.forEach((item, i) => {
      const textY = cy + hMetadata - 8
      drawIcon(ctx, item.icon, x + iconSize / 2, textY - 10, iconSize, '#ffffff', 2.6)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(item.text, x + iconSize + iconTextGap, textY)
      const w = iconSize + iconTextGap + ctx.measureText(item.text).width
      x += w + dividerGap / 2 + dividerGap / 2

      if (i < items.length - 1) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x - dividerGap / 2, cy + hMetadata - 30)
        ctx.lineTo(x - dividerGap / 2, cy + hMetadata - 6)
        ctx.stroke()
      }
    })
  })

  // Footer: caption chica y centrada, muy pegada al piso del safe-zone.
  ctx.textAlign = 'center'
  ctx.font = '600 20px "Plus Jakarta Sans"'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.fillText('REGISTRADO CON FITSYNC', W / 2, H - STICKER_BOTTOM_SAFE + 46)
  ctx.textAlign = 'left'
}

export async function generarBlobStickerResumen(data) {
  const canvas = document.createElement('canvas')
  await esperarFuentes()
  dibujarStickerResumen(canvas, data)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 1)
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
  const innerW = W - marginX * 2
  let cursorY = 96

  // ---- Header: wordmark centrado + racha como badge de esquina ----
  drawWordmarkCentered(ctx, W / 2, cursorY, { fontSize: 50, iconSize: 40 })
  drawStreakChip(ctx, W - marginX, 60, racha)
  cursorY += 82

  // ---- Estado + identidad de la sesión ----
  ctx.textAlign = 'left'
  drawIcon(ctx, 'check_circle', marginX + 13, cursorY - 9, 26, COLORS.success, 2.5)
  ctx.fillStyle = COLORS.success
  ctx.font = '700 25px "Plus Jakarta Sans"'
  ctx.fillText('SESIÓN COMPLETADA', marginX + 34, cursorY)
  cursorY += 54

  ctx.fillStyle = COLORS.onSurface
  ctx.font = '700 54px "Space Grotesk"'
  const tituloLines = wrapText(ctx, rutinaNombre, innerW)
  tituloLines.slice(0, 2).forEach((line) => {
    ctx.fillText(line, marginX, cursorY)
    cursorY += 60
  })

  const fechaTexto = fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  ctx.font = '500 27px "Plus Jakarta Sans"'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.fillText(fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1), marginX, cursorY + 2)
  cursorY += 50

  // ---- PR, si hubo: banda glass con acento dorado (mismo lenguaje que el
  // pill "NUEVO RÉCORD" del sticker), reemplaza la caja verde sólida anterior ----
  if (prs.length > 0) {
    const badgeH = 66
    drawGlassPanel(ctx, marginX, cursorY, innerW, badgeH, 18, { stroke: 'rgba(227, 179, 65, 0.35)' })
    ctx.fillStyle = 'rgba(227, 179, 65, 0.65)'
    roundRect(ctx, marginX, cursorY, 4, badgeH, { tl: 18, bl: 18, tr: 0, br: 0 })
    ctx.fill()
    drawIcon(ctx, 'trophy', marginX + 46, cursorY + badgeH / 2, 30, COLORS.gold, 2.8)

    ctx.fillStyle = COLORS.gold
    ctx.font = '700 25px "Plus Jakarta Sans"'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    const prText = prs.length === 1
      ? `Nuevo récord en ${prs[0]}`
      : `Nuevos récords: ${prs.slice(0, 2).join(', ')}${prs.length > 2 ? ` +${prs.length - 2}` : ''}`
    ctx.fillText(truncateToWidth(ctx, prText, innerW - 96), marginX + 76, cursorY + badgeH / 2 + 1)
    ctx.textBaseline = 'alphabetic'
    cursorY += badgeH + 26
  } else {
    cursorY += 12
  }

  // ---- Hero: número gigante, el protagonista de la tarjeta (mismo trato
  // que en el sticker que le gustó) ----
  const heroValueText = formatHeroKg(volumenTotal)

  ctx.font = '700 22px "Plus Jakarta Sans"'
  const pillLabel = 'VOLUMEN TOTAL'
  const pillTextW = ctx.measureText(pillLabel).width
  const pillIconSize = 20
  const pillGap = 10
  const pillPadX = 22
  const pillH = 48
  const pillW = pillPadX + pillIconSize + pillGap + pillTextW + pillPadX
  const pillX = W / 2 - pillW / 2
  drawGlassPanel(ctx, pillX, cursorY, pillW, pillH, pillH / 2)
  drawIcon(ctx, 'bolt', pillX + pillPadX + pillIconSize / 2, cursorY + pillH / 2, pillIconSize, COLORS.accent, 2.4)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = COLORS.onSurfaceVariant
  ctx.font = '700 22px "Plus Jakarta Sans"'
  ctx.fillText(pillLabel, pillX + pillPadX + pillIconSize + pillGap, cursorY + pillH / 2 + 1)
  ctx.textBaseline = 'alphabetic'
  cursorY += pillH + 22

  // Glow suave detrás del número — mismo espíritu que los mockups (doc4/doc5).
  const heroGlowCy = cursorY + 64
  const heroGlow = ctx.createRadialGradient(W / 2, heroGlowCy, 0, W / 2, heroGlowCy, 340)
  heroGlow.addColorStop(0, 'rgba(41, 176, 232, 0.22)')
  heroGlow.addColorStop(1, 'rgba(41, 176, 232, 0)')
  ctx.fillStyle = heroGlow
  ctx.fillRect(0, cursorY - 90, W, 320)

  // Número + unidad, medidos por separado para poder centrar el conjunto y
  // dejar la unidad más chica en acento (igual que "2.450 kg" del sticker).
  ctx.font = '700 122px "Space Grotesk"'
  const numW = ctx.measureText(heroValueText).width
  ctx.font = '700 46px "Space Grotesk"'
  const unitW = ctx.measureText(' kg').width
  const heroTotalW = numW + unitW
  const heroBaselineY = cursorY + 108

  ctx.textAlign = 'left'
  ctx.font = '700 122px "Space Grotesk"'
  ctx.fillStyle = COLORS.onSurface
  ctx.fillText(heroValueText, W / 2 - heroTotalW / 2, heroBaselineY)
  ctx.font = '700 46px "Space Grotesk"'
  ctx.fillStyle = COLORS.accent
  ctx.fillText(' kg', W / 2 - heroTotalW / 2 + numW, heroBaselineY)
  cursorY += 148

  // ---- Bento de métricas: Series / Duración / (Racha) ----
  const bentoItems = [
    { icon: 'list', value: totalSeries, unit: '', label: 'Series' },
    { icon: 'timer', value: formatDuracion(duracionMin), unit: '', label: 'Duración' },
  ]
  if (racha > 0) {
    bentoItems.push({ icon: 'flame', value: racha, unit: racha === 1 ? 'día' : 'días', label: 'Racha', accentColor: COLORS.gold })
  }
  const bentoGap = 20
  const bentoW = (innerW - bentoGap * (bentoItems.length - 1)) / bentoItems.length
  const bentoH = 150
  bentoItems.forEach((item, i) => {
    drawBentoMetric(ctx, marginX + i * (bentoW + bentoGap), cursorY, bentoW, bentoH, item)
  })
  cursorY += bentoH + 18

  if (calorias != null) {
    ctx.textAlign = 'center'
    ctx.font = '600 22px "Plus Jakarta Sans"'
    ctx.fillStyle = COLORS.onSurfaceVariant
    ctx.fillText(`~${Math.round(calorias)} kcal estimadas`, W / 2, cursorY + 6)
    cursorY += 38
  } else {
    cursorY += 10
  }

  // ---- Gráfico semanal ----
  if (semana.length > 0) {
    const chartH = 300
    drawWeeklyChart(ctx, marginX, cursorY, innerW, chartH, semana)
    cursorY += chartH + 28
  }

  // ---- Logros nuevos desbloqueados en esta sesión ----
  if (logrosNuevos.length > 0) {
    drawAchievementsRow(ctx, marginX, cursorY, innerW, logrosNuevos)
    cursorY += 34 + 172 + 28
  }

  // ---- Desglose de ejercicios top por volumen ----
  if (topEjercicios.length > 0) {
    const items = Math.min(3, topEjercicios.length)
    const blockH = 52 + items * 60 + 20
    drawTopExercises(ctx, marginX, cursorY, innerW, topEjercicios)
    cursorY += blockH + 28
  }

  // ---- Footer ----
  const footerY = H - 84
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

// Insignia circular grande con el ícono vectorial del logro y anillo del
// color de nivel.
function drawBadge(ctx, cx, cy, radius, color, iconName) {
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

  drawIcon(ctx, iconName, cx, cy, radius * 1.05, COLORS.onSurface, radius * 0.075)
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
  drawBadge(ctx, badgeCx, badgeCy, 170, color, logro.icono || 'trophy')
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
