class Map1 extends Map {
  level = 1;
  name = "map1";
  title = "Map 1 - Fase 1";
  description = "This is the first map of the game. Navigate through the corridors and avoid enemies.";
  width = 2500; // Largura do mapa
  height = game.canvas.height; // Altura do mapa

  constructor() { super(); }

  load() {    
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
      x: this.width - 90,
      y: this.height / 2 - 50,
      width: 10,
      height: 100,
      visible: false,
      touchingLines: 0,
    };

    // === INIMIGOS ===
    this.enemies = [
      new Darkness(this.width * 0.25,this.height / 2, "Terror", 5, 0.8),
      new DeepDarkness(this.width * 0.5,this.height / 2, "TerrorSupremo", 100, 0.4),
    ];

    // === POWERUPS ===
    this.objects.push(new PUPHP(this.width * 0.10, this.height / 2));

    game.player.x = 5;
    game.player.y = this.height / 2;

    super.load();
  }
}
