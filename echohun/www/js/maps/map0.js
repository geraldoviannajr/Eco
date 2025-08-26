class Map0 extends Map {
  level = 0;
  name = "Init Screen Map";
  title = "init Screen";
  width = config.GAME_SCREEN_WIDTH;
  height = config.GAME_SCREEN_HEIGHT;

  constructor() { super(); }

  load() {    
    // === PAREDES ===
    this.walls = [
      // Parede superior
      [
        { x: 0, y: 0 }, // Parte do zero
        { x: this.width, y: 0 }, // Vai até o topo à direita
        { x: this.width, y: this.height - 2 }, // na direita, desce 2px
        { x: 0, y: this.height - 2 }, // vem pro inicio do mapa mas permanece -2px
        // Ao fechar vai ao zero
      ],
      // Parede lateral esquerda
      [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 2, y: this.height },
        { x: 0, y: this.height },
        // Ao fechar vai ao zero
      ],
      // Parede lateral direita
      [
        { x: this.width, y: 0 },
        { x: this.width - 2, y: 0 },
        { x: this.width - 2, y: this.height },
        { x: this.width, y: 0 },
        // Ao fechar vai ao zero
      ],
      // Parede inferior
      [
        { x: 0, y: this.height },
        { x: 0, y: this.height -2 },
        { x: this.width, y: this.height -2 },
        { x: this.width, y: this.height },
        // Ao fechar vai ao zero
      ],
    ];

    // === PORTA ===
    this.exitDoor = {
      x: this.width *2,
      y: 100,
      width: 10,
      height: 100,
      visible: false,
      touchingLines: 0,
    };

    // === INIMIGOS ===
    this.enemies = [
    ];

    game.player.x = this.width * 2;
    game.player.y = this.height * 2;

    super.load();
  }
}
