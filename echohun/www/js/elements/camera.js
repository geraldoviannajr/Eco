class Camera {
    x = 0;
    y = 0;
    width = window.innerWidth;
    height = window.innerHeight;
    zoom = 1;
    constructor() { 
        this.shakeTime = 300;
        this.shakeIntensity = 8;
        this.shakeDuration = 300;
    }

    update() {
        // Centraliza a câmera na tela
        const centerStartX = game.canvas.width / 2;
        const centerStartY = game.canvas.height / 2;

        const centerEndX = game.map.width - game.canvas.width / 2;
        const centerEndY = game.map.height - game.canvas.height / 2;

        if (game.player.x < centerStartX) {game.camera.x = 0;} 
        else if (game.player.x > centerEndX) { game.camera.x = game.map.width - game.canvas.width;} 
        else {game.camera.x = game.player.x - game.canvas.width / 2;}

        if (game.player.y < centerStartY) {game.camera.y = 0;} 
        else if (game.player.y > centerEndY) {game.camera.y = game.map.height - game.canvas.height;} 
        else {game.camera.y = game.player.y - game.canvas.height / 2;}

        if (this.shakeTime > 0) {
            this.shakeTime -= game._deltaTime;
            const angle = Math.random() * Math.PI * 2;
            const intensity = this.shakeIntensity * (this.shakeTime / this.shakeDuration);
            this.x += Math.cos(angle) * intensity;
            this.y += Math.sin(angle) * intensity;
        }
    }

    setZoom(zoom) {
        this.zoom = zoom;
    }
}