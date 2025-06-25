class Player {
  x = 0;
  y = 0;
  speed = 0;
  lastStepX = 0;
  lastStepY = 0;
  wasIdle = true;
  forceNextStep = false;
  isRunning = false;
  isWalk = false;
  isDead = false;
  lastEcho = 0;

  // Construtor da classe Player
  // Define a posição inicial do jogador, a velocidade de caminhada e outras propriedades iniciais
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = config.WALK_SPEED;
    this.lastStepX = 0;
    this.lastStepY = 0;
    this.wasIdle = true;
    this.forceNextStep = false;
    this.isRunning = false;
    this.isWalk = false;
    this.lastEcho = Date.now();
  }
}
