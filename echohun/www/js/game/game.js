class Game extends GameScreens(GameEngine(GameEvents(GameControls(GameCore)))) {
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

  static _fadeTimeOut = () => {
    window._globalOpacity -= 1;

    if (window._globalOpacity <= -10) clearTimeout(window._fadeOut);
    else window._fadeOut = setTimeout(Game._fadeTimeOut, 50);

    if (window._globalOpacity == -10) {
      document.getElementById("gameCanvas").style.display = "block";
      document.getElementById("start_screen").style.display = "none";

      console.log("Criando jogo...");
      window.game = new Game(
        config.GAME_SCREEN_WIDTH,
        config.GAME_SCREEN_HEIGHT,
        1
      );

      console.log("Adicionando eventos principais...");
      window.addEventListener("resize", resizeCanvas);
      document.addEventListener("pause", () => { window.game.pause(); } );

      console.log("Ajustando tamanho da tela...");
      resizeCanvas();

      console.log(" |-> Criando idioma...");
      window.game.language = new Language("pt_br");

      console.log(" |-> Iniciando jogo...");
      window.game.start();
    }
    if (window._globalOpacity > 1)
      document.getElementById("start_screen").style.opacity =
        window._globalOpacity + "%";
  };

  static _initGameClick = (e) => {
    e.preventDefault();

    if (window.game != undefined) return;
    
    document
      .getElementById("start_screen")
      .removeEventListener("touchstart", Game._initGameClick);

    window._globalOpacity = 100;
    window._fadeOut = setTimeout(Game._fadeTimeOut, 50);
  };
  static init() {
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("start_screen").style.display = "flex";
    document
      .getElementById("start_screen")
      .addEventListener("touchstart", Game._initGameClick);
  }
}
