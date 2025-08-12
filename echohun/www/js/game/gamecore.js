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
