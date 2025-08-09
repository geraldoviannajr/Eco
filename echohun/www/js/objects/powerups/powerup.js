class PowerUp extends MapObject {
    player = null;
    bag = null;
    visible = true;
    caption = 'Powerup';
    text = 'Powerup';
    description = 'Generic Powerup';
    _playerCanCollide = true;
    _enemyCanCollide = false;
    _sound = game.sounds.getSound('beep');

    playSound() {
        game.sounds.playSpatial(this._sound, this, game.player);
    }

    onCollision(obj) {
        super.onCollision(obj);

        if (this.visible == false) { return; }
        
        if (obj instanceof Player) {
            if (obj.bag.items.length + 1 <= obj.bag.maxItems) {
                console.log('Player get an item: ' + this.name);
                obj.bag.addItem(this);
                this.visible = false;
                if (this._sound) { this._sound.stop(); }
                game.sounds.play('pickup');
                this.player = obj;
                this.bag = obj.bag;
                game.map.objects.splice(game.map.objects.indexOf(this), 1);
            }
        }
    }

    useIt() {
        if (this.bag != null && this.bag.items.length > 0) {
            this.bag.splice(this.bag.indexOf(this), 1);
        }
    }

    constructor(x, y) {
        super(x, y);
        this.name = 'Powerup';
        this.radius = 3; 
        this.createCircleHitbox(this.x, this.y, this.radius +1);
    }
}