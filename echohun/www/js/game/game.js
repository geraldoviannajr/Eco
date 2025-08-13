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

      console.log(" |-> Iniciando jogo...");
      document.addEventListener("pause", () => { window.game.pause(); } );
      window.game.start();
    }
    if (window._globalOpacity > 1)
      document.getElementById("start_screen").style.opacity =
        window._globalOpacity + "%";
  };

  static _initGameClick = (e) => {
    e.preventDefault();

    document
      .getElementById("gameCanvas")
      .removeEventListener("touchstart", Game._initGameClick);

    window._globalOpacity = 100;
    window._fadeOut = setTimeout(Game._fadeTimeOut, 50);
  };
  static init() {
    console.log("Criando jogo...");
    window.game = new Game(
      config.GAME_SCREEN_WIDTH,
      config.GAME_SCREEN_HEIGHT
    );

    console.log("Adicionando eventos do canvas...");
    window.addEventListener("resize", resizeCanvas);

    console.log("Ajustando tamanho da tela...");
    resizeCanvas();

    console.log("Carregando idioma...");
    window.game.language = new Language("pt_br");

    console.log("Iniciando jogo...");
    window.game.start();
  
    /*document
      .getElementById("gameCanvas")
      .addEventListener("touchstart", Game._initGameClick);*/
  }
}
