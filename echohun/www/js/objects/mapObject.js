class MapObject {
    name = 'Object';    
    x = 0;
    y = 0;
    radius = 3;
    width = 0;
    height = 0;
    createdAt = performance.now();
    lastUpdate = performance.now(); // Tempo do último update
    hitbox = {type: 'circle', points: []};
    _enemyCanCollide = true; // Indica se o objeto pode colidir com um inimigo
    _playerCanCollide = true; // Indica se o objeto pode colidir com o jogador
    _enemyColliding = false; // Indica se o objeto está colidindo com um inimigo
    _playerColliding = false; // Indica se o objeto está colidindo com o jogador
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    createRectHitbox(x,y,width,height) {
        this.hitbox.type = 'rect';
        this.hitbox.radius = 0;
        this.hitbox.points = [
            { x: x - width / 2, y: y - height / 2 },
            { x: x + width / 2, y: y - height / 2 },
            { x: x + width / 2, y: y + height / 2 },
            { x: x - width / 2, y: y + height / 2 }
        ];
    }
    createCircleHitbox(x, y, radius) {
        this.hitbox.type = 'circle'; 
        this.hitbox.radius = radius;       
        this.hitbox.points = [{ x: x, y: y }];
    }
    drawHitbox() {
        if (this.hitbox.points.length == 0) return;

        game.ctx.save();
        game.ctx.beginPath();
        game.ctx.setLineDash([6, 4]);
        game.ctx.strokeStyle = "#00FF00";
        game.ctx.lineWidth = 2;
        game.ctx.globalAlpha = 0.8;
        if (this.hitbox.type == 'rect') {            
            game.ctx.moveTo(this.x + this.hitbox.points[0].x, this.y + this.hitbox.points[0].y);
            for (let i = 1; i < this.hitbox.points.length; i++) {
                game.ctx.lineTo(this.x + this.hitbox.points[i].x, this.y + this.hitbox.points[i].y);
            }           
        } else if (this.hitbox.type == 'circle') {
            game.ctx.arc(this.x + this.hitbox.points[0].x - game.camera.x, this.y + this.hitbox.points[0].y - game.camera.y, this.hitbox.radius, 0, 2 * Math.PI);
        }
        game.ctx.closePath();
        game.ctx.stroke();
        game.ctx.setLineDash([]);
        game.ctx.restore();
    }

    draw() {
        if (config.DEBUG) {
            this.drawHitbox();
        }
    }

    update() {
        
    }

    checkCollision(obj) {
        if ((!this._enemyCanCollide && obj instanceof Enemy) ||
            (!this._playerCanCollide && obj instanceof Player)) {
            return false;
        }

        var result = false;

        if (this.hitbox.type == 'circle') {
            result = isCircleColliding(this.x, this.y, this.radius, obj.x, obj.y, obj.radius);
        } else if (this.hitbox.type == 'rect') {
            result = isRectColliding(this.x, this.y, this.width, this.height, obj.x, obj.y, obj.radius);
        }
        if (obj instanceof Enemy) { this._enemyColliding = result; }
        else if (obj instanceof Player) { this._playerColliding = result; }
        return result;
    }

    onCollision(obj) {
        console.log(this.name + " colidiu com o objeto " + obj.name);
    }
}