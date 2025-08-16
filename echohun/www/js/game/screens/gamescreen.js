class GameScreen {
  alpha = 0;
  loaded = false;
  fadeStartTime = 0;
  fadeduration = 3000;
  isFading = false;
  constructor(game) {
    this.game = game;
  } 
  draw(ctx) {}
  doEvent(eventName, e) {}
}