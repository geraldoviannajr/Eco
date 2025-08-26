class InitScreen extends GameScreen {
  fadeduration = 6000;

  onCompleteLoad() {
    super.onCompleteLoad();
    console.log("          |-> Adicionando Mapa 0");
    window.game.map = window.game.maps[0];
    console.log("          |-> Carregando...");
    window.game.map.load();
  }

  emitEcho(x,y) {
    var lineCount = config.CLAP_LINE_COUNT;
    window.game.sounds.play("clap");

    for (let i = 0; i < lineCount; i++) {
      const angle = ((Math.PI * 2) / lineCount) * i;
      window.game.lines.push(
        new EchoLine(x, y, angle, "initclap", null, config.CLAP_ECHO_BOUNCES)
      );
    }
  }

  startGame() {
    if (window.game.maps.length < 2) {
      console.log("Criando mapas...");
      var map = new Map1();  
      window.game.maps.push(map);
    } 

    this.unload(() => {
      console.log("Carregando mapa...");
      window.game.map = window.game.maps[1];
      window.game.map.load(); 
      
      console.log("Carregando Gameplay...");
      window.game.screens.gameplay.load();
    });
  }

  draw(ctx) {
    super.draw(ctx);
   
    // Fundo Preto
    ctx.fillStyle = "rgba(0, 0, 0, " + this.alpha + ")";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Linhas
    if (window.game)
      window.game.updateLines();

    // Título
    ctx.save();    
    const message = "ECHO HUNTERS";    
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
        this.startGame();
    }
  }
}
