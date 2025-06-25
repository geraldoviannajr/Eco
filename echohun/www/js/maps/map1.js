class Map1 extends Map {
  name = "map1";
  title = "Map 1 - Fase 1";
  description = "This is the first map of the game. Navigate through the corridors and avoid enemies.";
  width = 2500; // Largura do mapa
  height = game.canvas.height; // Altura do mapa

  constructor() {
    super();
  }

  Load() {
    super.Load();

    // === PAREDES ===
    this.walls = [
      // Parede superior
      [
        { x: 0, y: 0 }, // Parte do zero
        { x: this.width, y: 0 }, // Vai até o topo à direita
        { x: this.width, y: this.height / 2 - 50 }, // na direita, desce até metade -50
        { x: (this.width / 4) * 3, y: this.height / 2 - 50 }, // vem pro 3/4 do mapa mas permanece na metade -50
        { x: (this.width / 4) * 3, y: this.height / 2 - 150 }, // permanece no 3/4 do mapa e vai a metade -150
        { x: this.width / 4, y: this.height / 2 - 150 }, // vai a 1/4 do mapa e permanece na metade -150
        { x: this.width / 4, y: this.height / 2 - 50 }, // no 1/4 do mapa vai até a metade - 50
        { x: 0, y: this.height / 2 - 50 }, // fecha bo zero x, mas ainda está na metade -50
        // Ao fechar vai ao zero
      ],
      // Parede inferior
      [
        { x: 0, y: this.height / 2 + 50 }, // Parte do zero e metade + 50
        { x: this.width / 4, y: this.height / 2 + 50 }, //vai até 1/4 do mapa mas permanece na metade + 50
        { x: this.width / 4, y: this.height / 2 + 150 }, //em 1/4 do mapa desce até metade +150
        { x: (this.width / 4) * 3, y: this.height / 2 + 150 }, //vai a 3/4 do mapa mas permanece na metade +150
        { x: (this.width / 4) * 3, y: this.height / 2 + 50 }, //em 3/4 do mapa desce até a metade +50
        { x: this.width, y: this.height / 2 + 50 }, //vai até à direita mas permanece em metade +50
        { x: this.width, y: this.height }, // Na direita, desce até o ponto mais baixo
        { x: 0, y: this.height }, // Volta para esquerda no ponto mais baixo
        // Ao fechar vai ao zero e metade + 50
      ],
    ];

    // === PORTA ===
    this.exitDoor = {
      x: this.width - 5,
      y: this.height / 2 - 50,
      width: 5,
      height: 100,
      visible: false,
      touchingLines: 0,
    };

    // === INIMIGOS ===
    this.enemies = [
      new Enemy(
        this.width * 0.25,
        this.height / 2,
        "echo",
        10,
        0.4
      ),
      new Enemy(
        this.width * 0.5,
        this.height / 2,
        "radar",
        120,
        0.2
      ),
    ];

    // Propriedades específicas dos inimigo
    this.enemies[0].detectionCoolDown = 3000;
    this.enemies[0].expansionSpeed = 4;
    this.enemies[0].lineCount = 24;

    this.enemies[1].waveCount = 90;
    this.enemies[1].waveAmplitude = 2;
    this.enemies[1].bodyColor = `rgba(0,0,0,1)`;
    this.enemies[1].echoColor = [255, 0, 0, 0.8];
    this.enemies[1].expansionSpeed = 4;
    this.enemies[1].lineCount = 36;

    game.player.x = 5;
    game.player.y = this.height / 2;
  }
}
