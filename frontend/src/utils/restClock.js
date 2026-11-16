export const elapsedSeconds = (elapsed, anchor, now) => elapsed + Math.max(0, Math.floor((now - anchor) / 1000))
