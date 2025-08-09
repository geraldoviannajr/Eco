class GameCore {
  canvas = null;
  ctx = null;
  map = null;
  player = null;
  lines = [];
  camera = new Camera();
  keys = {};
  keyPressTimes = {};
  mouseTarget = null;
  mousePos = null;
  isMousePressed = false;
  mousePressStart = 0;
  isPaused = false;
  idTouchPlayerMove = -1; // Idetificador do toque que move o jogador, -1 significa nenhum toque ativo
  controls = [];
  fps = 0; // Frames per second
  gameTime = 0; // Tempo de jogo em segundos
  gameState = "inactive"; //
  deltaTime = 0; // valor inicial em ms
  _framesThisSecond = 0;
  _lastFpsUpdate = performance.now();
  _lastFrameTime = performance.now();

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
      document.addEventListener(
        "pause",
        () => {
          window.game.pause();
        },
        false
      );

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

  static init() {
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("start_screen").style.display = "flex";

    var start_btnOnClick = () => {
      if (window.game != undefined) return;
      window._globalOpacity = 100;
      window._fadeOut = setTimeout(Game._fadeTimeOut, 50);
    };
    document
      .getElementById("start_btn")
      .addEventListener("touchend", start_btnOnClick);
    //document.getElementById('start_btn').addEventListener('click', start_btnOnClick);
  }

  constructor(w, h) {
    this.lines = [];
    this.keys = {};
    this.keyPressTimes = {};
    this.mouseTarget = null;
    this.isMousePressed = false;
    this.mousePressStart = 0;
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this._flashTime = 0;

    if (h > w) {
      this.canvas.width = h;
      this.canvas.height = w;
    } else {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    this.ctx.scale(1, 1);
    //this.ctx.imageSmoothingEnabled = false; // Desativa o suavizado de imagem para evitar borrões

    console.log("|-> Criando jogador...");
    this.player = new Player(0, 0); // Cria o jogador na posição inicial (0, 0);

    console.log("|-> Criando sons...");
    this.sounds = new Sounds();

    if (window.HeadsetDetection && device.platform != "browser") {
      console.log(" |-> 🎵 Adicionando eventos de áudio");
      window.HeadsetDetection.detect(function (detected) {
        window.game.sounds.setHeadphoneMode(detected);
      });
      window.HeadsetDetection.registerRemoteEvents(function (status) {
        switch (status) {
          case "headsetAdded":
            window.game.sounds.setHeadphoneMode(true);
            break;
          case "headsetRemoved":
            window.game.sounds.setHeadphoneMode(false);
            break;
        }
      });
    }

    console.log("|-> Criando HUD...");
    this.hud = new HUD();

    console.log("|-> Adicionando controles...");
    this.controls.push(this.hud);

    console.log("|-> Criando radar...");
    this.controls.push(new Radar());
  }
}
