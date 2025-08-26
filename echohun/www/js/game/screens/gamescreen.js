class GameScreen {
  alpha = 0;
  loaded = false;
  unloaded = true;
  fadeStartTime = 0;
  fadeduration = 2000;
  isLoading = false;
  isUnloading = false;
  _callbackFn = null;
  constructor(game) {
    this.game = game;
  }
  
  onStateChange() {
    // Evento a ser executado após estar completamente carregado ou descarregado
    if (this._callbackFn != null) {
      this._callbackFn();
      this._callbackFn = null;
    }
  }

  load(callback = null) {
    this._callbackFn = callback;
    this.loaded = false;
    this.unloaded = false;
    this.fadeStartTime = 0;
    this.isLoading = true;
    this.isUnloading = false;
    this.alpha = 0.001;
    window.game.screen = this;
  }

  unload(callback = null) {
    this._callbackFn = callback;
    this.loaded = false;
    this.unloaded = false;
    this.fadeStartTime = 0;
    this.isLoading = false;
    this.isUnloading = true;
    this.alpha = 0.999;
    window.game.screen = this;
  }
  draw(ctx) {
    if (this.loaded) this.alpha = 1;
    else {
      if (this.fadeStartTime == 0) {
        this.fadeStartTime = this.game.gameTime;
        this.alpha == this.isLoading ? 0 : 1;
      } else {
        this.alpha =
          (this.game.gameTime - this.fadeStartTime) / this.fadeduration;
        
          if (this.isUnloading)
          this.alpha = 1 - this.alpha;

        if (this.alpha > 1) this.alpha = 1;
        else if (this.alpha <= 0) this.alpha = 0;
      }
    }
    if (this.alpha >= 1) this.loaded = true;
    else if (this.alpha <= 0) this.unloaded = true;

    if ((this.isLoading && this.loaded) || (this.isUnloading && this.unloaded))
      onLoad();
  }
  doEvent(eventName, e) {}
}