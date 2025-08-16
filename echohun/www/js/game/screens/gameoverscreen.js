class GameoverScreen extends GameScreen {
  draw(ctx) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const message = "YOU DIED";
    ctx.save();
    ctx.font = "78px Horrorfind-gp0Y";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    ctx.fillStyle = "white";
    ctx.fillText(message, centerX, centerY);
    ctx.restore();

    this.loaded = true;
  }

  doEvent(eventName, e) {
    var game = window.game;
    if (!this.loaded) 
      return;

    switch (eventName) {
      case "touchstart":
      case "mousedown":
        console.log("Descarregando mapa e carregando tela inicial...");
        game.map = null;
        game.screen = InitScreen;
        GameoverScreen.loaded = false;
        break;
    }
  }
}
