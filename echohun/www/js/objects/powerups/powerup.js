class PowerUp extends MapObject {
    visible = true;
    _playerCanCollide = true;
    _enemyCanCollide = false;
    _sound = game.sounds.getSound('beep');

    playSound() {
        // Efeito sonoro direcional e de volume
        if (this._sound) {
            const dx = this.x - game.player.x;
            const dy = this.y - game.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = config.MAX_DISTANCE_SOUND / 2;
            let volume = 0.8 - Math.min(dist / maxDist, 0.8);
            volume = Math.max(0, Math.min(1, volume));
            let pan = dx / (game.canvas.width / 2);
            pan = Math.max(-1, Math.min(1, pan));
                
            let id = this._sound.play("echo");
            this._sound.pos(pan, 0, 0, id);
            this._sound.volume(volume, id);
        }        
    }
    constructor(x, y) {
        super(x, y);
        this.name = 'Powerup';
        this.radius = 3;
 
        this.createCircleHitbox(this.x, this.y, this.radius +1);
    }
}

