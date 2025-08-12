class InitScreen extends GameScreen {
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
  }
}