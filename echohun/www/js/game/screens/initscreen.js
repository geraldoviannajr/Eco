class InitScreen extends GameScreen {
  fadeduration = 4000;

  emitEcho(x,y) {
    var lineCount = config.CLAP_LINE_COUNT;
    window.game.sounds.play("clap");

    for (let i = 0; i < lineCount; i++) {
      const angle = ((Math.PI * 2) / lineCount) * i;
      window.game.lines.push(
        new EchoLine(x, y, angle, "clap", null, config.CLAP_ECHO_BOUNCES)
      );
    }
  }

  startGame() {
    console.log("Criando mapa...");
    game.map = new Map1();

    console.log("Carregando mapa...");
    game.map.load();

    this.unload(() => {
      console.log("Carregando Gameplay...");
      game.screens.gameplay.load();
    });
  }

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

    if (this.loaded) {
      ctx.font = "24px Arial";
      ctx.fillStyle = "rgba(255, 0, 0, " + this.alpha + ")";
      ctx.fillText(
        window.game.language.getResource("clickToStart"),
        centerX,
        centerY + 90
      );
    }
    ctx.restore();

    if (window.game)
      window.game.updateLines();
  }

  doEvent(eventName, e) {
    if ((!this.loaded) || (eventName != "touchstart" && eventName != "mousedown"))
      return;

    console.log(e);

    const rect = window.game.canvas.getBoundingClientRect();
    const scaleX = window.game.canvas.width / rect.width;
    const scaleY = window.game.canvas.height / rect.height;
    var mouseX = 0;
    var mouseY = 0;

    switch (eventName) {
      case "mousedown":
        mouseX = (e.clientX - rect.left) * scaleX;
        mouseY = (e.clientY - rect.top) * scaleY;
        break;
      case "touchstart":
        var touch = e.touches[e.touches.length - 1];
        mouseX = (touch.clientX - rect.left) * scaleX;
        mouseY = (touch.clientY - rect.top) * scaleY;                     
        break;
    }

    console.log(mouseX, mouseY);

    if (mouseX > 0 || mouseY > 0) {
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
        this.emitEcho(mouseX, mouseY);                
    }
  }
}
