// === CONFIGURAÇÕES ===
const WALK_SPEED = 600;
const RUN_SPEED = 400;

const WALK_STEP = 1;
const RUN_STEP = 2;

const RUN_THRESHOLD = 1300;

const ECHO_COLOR_1 = [80,80,80,1]; 
const ECHO_COLOR_2 = [200,200,200,1]; 
const CLAP_COLOR   = [255,255,255,0.8]; 

const ECHO_LINE_COUNT = 24;
const ECHO_LINE_WIDTH = 2;
const ECHO_DURATION_1 = 900; 
const ECHO_DURATION_2 = 1500; 
const ECHO_EXPANSION_SPEED = 2;

const CLAP_LINE_COUNT = 48;       // Mais linhas
const CLAP_ECHO_DURATION = 10000; // Duração mais longa
const CLAP_ECHO_BOUNCES = 3;      // Mais reflexões
const CLAP_COOLDOWN = 30000;      // 30 segundos entre cada clap
const CLAP_EXPANSION_SPEED = 4;   // Expande mais rápido


//const WALL_COLOR = "rgb(100, 100, 100)";
const WALL_COLOR = "rgb(0, 0, 0)";
const DOOR_COLOR = "rgba(0, 255, 0, 0.9)";

// === CANVAS ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// === CORREDOR ===
const corridorWidth = canvas.width * 1.5;


