// === PERSONAGEM ===
const player = {
  x: 0,
  y: canvas.height / 2,
  speed: WALK_SPEED,
  lastStepX: 0,
  lastStepY: 0,
  wasIdle: true,
  forceNextStep: false,
  isRunning: false,
  isWalk: false,
  lastEcho: Date.now()
};
