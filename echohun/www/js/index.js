/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener("deviceready", onDeviceReady, false);

// Ajuste o tamanho visual via CSS para preencher a tela mantendo a proporção
function resizeCanvas() {
  const aspect = config.GAME_SCREEN_WIDTH / config.GAME_SCREEN_HEIGHT;
  let width = window.innerWidth;
  let height = window.innerHeight;
  if (width / height > aspect) {
    width = height * aspect;
  } else {
    height = width / aspect;
  }
  game.canvas.style.width = width + "px";
  game.canvas.style.height = height + "px";
  game.canvas.style.left = 'calc((100% / 2) - '+ (width /2) +'px)';
  game.canvas.style.top = 'calc(100% / 2 - '+ (height /2) +'px)';  
}

function closeStartScreen() {
  // Efeito de fade-out
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // Criar um efeito de fade-out
  let opacity = 1.0;
  const fadeOut = setInterval(() => { opacity -= 0.05; if (opacity <= 0) { clearInterval(fadeOut); startGame(); return; }    
    // Desenhar um retângulo semi-transparente sobre a tela inicial
    ctx.fillStyle = `rgba(0, 0, 0, ${1 - opacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, 30);
}

function drawStartScreen() {
    // Criar um canvas temporário para a tela inicial
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block'; // Torna o canvas visível
    
    const ctx = canvas.getContext('2d');
    const width = config.GAME_SCREEN_WIDTH;
    const height = config.GAME_SCREEN_HEIGHT;
    
    // Definir dimensões do canvas
    canvas.width = width;
    canvas.height = height;
    
    // Fundo escuro com gradiente
    const gradient = ctx.createRadialGradient(width/2, height/2, 10, width/2, height/2, height);
    gradient.addColorStop(0, '#333');
    gradient.addColorStop(1, '#111');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Desenhar título do jogo
    ctx.font = '72px Horrorfind-gp0Y';
    ctx.textAlign = 'center';
    
    // Sombra para o título
    ctx.fillStyle = '#000';
    ctx.fillText('ECHO HUNTERS', width/2 + 4, height/3 + 4);
    
    // Título
    ctx.fillStyle = '#ff0055';
    ctx.fillText('ECHO HUNTERS', width/2, height/3);
    
    // Desenhar botão de iniciar
    const btnWidth = 240;
    const btnHeight = 60;
    const btnX = (width - btnWidth) / 2;
    const btnY = height * 0.6;
    
    // Sombra do botão
    ctx.fillStyle = '#000';
    ctx.fillRect(btnX + 4, btnY + 4, btnWidth, btnHeight);
    
    // Botão
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    
    // Texto do botão
    ctx.font = '24px Press Start 2P';
    ctx.fillStyle = '#fff';
    ctx.fillText('INICIAR', width/2, btnY + btnHeight/2 + 8);
    
    // Copyright
    ctx.font = '12px Arial';
    ctx.fillStyle = '#444';
    ctx.fillText('© 2025 geraldoviannajr@gmail.com', width/2, height - 20);
    
    // Adicionar evento de clique ao canvas para o botão iniciar
    canvas.addEventListener('click', function handleClick(event) {
        // Converter coordenadas do clique para coordenadas do canvas
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        
        // Verificar se o clique foi no botão
        if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
            canvas.removeEventListener('click', handleClick);
            closeStartScreen();
        }
    });
    
    // Adicionar evento de toque para dispositivos móveis
    canvas.addEventListener('touchstart', function handleTouch(event) {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.touches[0].clientX - rect.left) * scaleX;
        const y = (event.touches[0].clientY - rect.top) * scaleY;
        
        if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
            canvas.removeEventListener('touchstart', handleTouch);
            closeStartScreen();
        }
    });
}

function onDeviceReady() {
  /*
  if (device.platform == "browser") // Eventos do Mouse (desktop)
    document.getElementById('btn-iniciar').addEventListener('click', closeStartScreen );
  else
    document.getElementById('btn-iniciar').addEventListener('touchstart', closeStartScreen);
  */

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";  
    
  if (device.platform !== "browser")
  {
    // Trava a orientação da tela em modo paisagem
    screen.orientation.lock("landscape"); 
    window.plugins.screensize.get( 
      (screensz) => { console.log('Screen: ' + screensz.width + 'x' + screensz.height); /*document.getElementById('tela-inicial').style.display = 'flex';*/ },
      (error) => { console.error("Error getting screen size:", error); }
    );  
  }

  drawStartScreen();
}

function startGame() {      
  console.log('Iniciando jogo em plataforma: ' + device.platform + '...');  
  //document.getElementById('tela-inicial').style.display = 'none';      
  //document.getElementById('gameCanvas').style.display = 'block';

  console.log('Criando jogo...');
  window.game = new Game(config.GAME_SCREEN_WIDTH, config.GAME_SCREEN_HEIGHT, 1);   
  
  console.log('Criando idioma...');
  window.game.language = new Language('pt_br');

  console.log('Criando mapa...');
  window.game.map = new Map1();

  console.log('Carregando mapa...');
  window.game.map.load();

  console.log('Adicionando eventos...');
  window.game.addEvents();
  document.addEventListener("pause",() => {window.game.pause();},false);
  window.addEventListener("resize", resizeCanvas);
 
  console.log('Ajustando tamanho da tela...');
  resizeCanvas();

  console.log('Iniciando jogo...');
  window.game.start();     
}
