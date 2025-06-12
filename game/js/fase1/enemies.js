// === INIMIGOS ===
const enemies = [
  {
    x: canvas.width * 0.50,
    y: canvas.height / 2,
    
    type: 'echo',

    size: 40,
    speed: 0.4,
    miliSecBetweenEchos: 1000, 
    chasing: false,
    visible: false,
    touchingLines: 0,

    detectionCoolDown: 1500,
    lastDetection: Date.now(),
    
    bodyColor: `rgba(0,0,0,1)`,
    echoColor: [255,0,0,0.8],
    expansionSpeed: 4,
    duration: 1300,
    lineCount: 36,

    lastEcho: Date.now(),      
  }
  ,
  {
    x: canvas.width * 0.75,
    y: canvas.height / 2,
    
    type: 'radar',
    waveCount: 90, //Número de ondas
    waveAmplitude: 2, // Altura da onda

    size: 120,
    speed: 0.2,
    miliSecBetweenEchos: 1000, 
    chasing: false,
    visible: false,
    touchingLines: 0,

    detectionCoolDown: 3000,
    lastDetection: Date.now(),
    
    bodyColor: `rgba(0,0,0,1)`,
    echoColor: [255,0,0,0.8],
    expansionSpeed: 4,
    duration: 1300,
    lineCount: 36,

    lastEcho: Date.now(),      
  }

];
