config = {
  WALK_SPEED: 600,
  RUN_SPEED: 400,
  WALK_STEP: 1,
  RUN_STEP: 2,

  RUN_THRESHOLD: 1300,

  ECHO_COLOR_1: [50, 50, 50, 1],
  ECHO_COLOR_2: [100, 100, 100, 1],
  CLAP_COLOR: [255, 255, 255, 0.8],

  ECHO_LINE_COUNT: 24,
  ECHO_LINE_WIDTH: 2,
  ECHO_DURATION_1: 1200,
  ECHO_DURATION_2: 2200,
  ECHO_EXPANSION_SPEED: 3,

  CLAP_LINE_COUNT: 48, // Mais linhas
  CLAP_ECHO_DURATION: 2000, // Duração do clap com stamina no máximor
  CLAP_ECHO_BOUNCES: 3, // Mais reflexões
  CLAP_EXPANSION_SPEED: 6, // Expande mais rápido
  
  WALL_COLOR : "rgb(0, 0, 0)",
  DOOR_COLOR: "rgba(0, 255, 0, 0.9)",  

  // IPhone
  //GAME_SCREEN_WIDTH: 824,
  //GAME_SCREEN_HEIGHT: 390,
  
  // 16:9 aspect ratio
  //GAME_SCREEN_WIDTH: 832,  
  //GAME_SCREEN_HEIGHT: 468,

  // 21:9 aspect ratio
  GAME_SCREEN_WIDTH: 1092,
  GAME_SCREEN_HEIGHT: 468,

  MAX_STAMINA: 100, // Máximo de stamina
  MAX_HP: 100, // Máximo de hp
  MIN_STAMINA_RUN: 30, // Mínimo de stamina para correr
  MIN_STAMINA_CLAP: 30, // Mínimo de stamina para clap

  CELL_SIZE: 8, // Tamanho da célula para pathfinding
  DEBUG: false, // Ativa/desativa o modo debug
};
