class InitScreen extends GameScreen {
  draw(ctx) {
    super.draw(ctx);

    ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const message = "ECHO HUNTERS";
    ctx.save();
    ctx.font = "150px Horrorfind-gp0Y";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2 - 30;

    ctx.fillStyle = "rgba(255, 0, 0, " + this.alpha + ")";
    ctx.fillText(message, centerX, centerY);

    ctx.font = "24px Arial";
    ctx.fillStyle = "rgba(255, 0, 0, " + this.alpha + ")";
    ctx.fillText("Toque para iniciar", centerX, centerY + 90);
    ctx.restore();
  }

  doEvent(eventName, e) {
    var game = window.game;
    if (!this.loaded) return;

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

        this.unload(() => {
          console.log("Carregando Gameplay...");
          game.screen = game.screens.gameplay;
        });

        break;
    }
  }
}
