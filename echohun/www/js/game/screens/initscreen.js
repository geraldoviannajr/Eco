class InitScreen extends GameScreen {
  static loaded = false;
  static draw(ctx) {
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const message = "ECHO HUNTERS";
    ctx.save();
    ctx.font = "150px Horrorfind-gp0Y";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2 - 30;

    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillText(message, centerX, centerY);

    ctx.font = "24px Arial";
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillText("Toque para iniciar", centerX, centerY + 90);
    ctx.restore();
    InitScreen.loaded = true;
  }

  static doEvent(eventName, e) {
    var game = window.game;
    if (!InitScreen.loaded)
      return;

    switch (eventName) {
      case "touchstart":
      case "mousedown":     
      
        if (window.game.sounds == null) {
          console.log("|-> Criando sons...");
          window.game.sounds = new Sounds();

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
        }
      
        console.log("Criando mapa...");
        game.map = new Map1();        
        console.log("Carregando mapa...");
        game.map.load();
        game.screen = GameplayScreen;
        break;
    }
  }
}