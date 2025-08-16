class Game extends GameEngine(GameEvents(GameControls(GameCore))) {
  emitClap() {
    if (
      this.player.stamina >= config.MIN_STAMINA_CLAP &&
      !this.player.isDead &&
      !this.isPaused
    ) {
      this.player.emitEcho("clap");
      this.player.stamina = 0; // Custa todas as staminas
    }
  }
  drawBackground() {
    this.ctx.fillStyle = "rgb(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawPause() {
    this.player.bag.drawInventory(this.ctx);
  }

  drawMapWin() {
    this.ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const message = "YOU WIN";
    this.ctx.save();
    this.ctx.font = "62px Horrorfind-gp0Y";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;
    //const textWidth = this.ctx.measureText(message).width;
    //const padding = 40;

    this.ctx.fillStyle = "white";
    this.ctx.fillText(message, centerX, centerY);
    this.ctx.restore();
  }

  static init() {
    console.log("Criando jogo...");
    window.game = new Game(config.GAME_SCREEN_WIDTH, config.GAME_SCREEN_HEIGHT);

    console.log("Adicionando eventos do canvas...");
    window.addEventListener("resize", resizeCanvas);

    console.log("Ajustando tamanho da tela...");
    resizeCanvas();

    console.log("Carregando idioma...");
    window.game.language = new Language("pt_br");

    console.log("Iniciando jogo...");
    window.game.start();
  }
}
