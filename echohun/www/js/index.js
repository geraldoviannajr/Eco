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
  const tela = document.getElementById('tela-inicial');
  tela.classList.add('fade-out');
  setTimeout(() => { tela.style.display = 'none'; startGame(); }, 700); // Tempo igual ao do transition do CSS
}

function onDeviceReady() {

  if (device.platform == "browser") // Eventos do Mouse (desktop)
    document.getElementById('btn-iniciar').addEventListener('click', closeStartScreen );
  else
    document.getElementById('btn-iniciar').addEventListener('touchstart', closeStartScreen);

  screen.orientation.lock("landscape"); // Trava a orientação da tela em modo paisagem
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  
  // Inicializa o gerenciador de fones de ouvido
  window.headphoneManager = new HeadphoneManager();
  
  // Configura callbacks para eventos de fone
  window.headphoneManager.onConnect(() => {
    console.log('🎧 Fone conectado - Ajustando áudio...');
    // Aqui você pode ajustar o volume, equalização, etc.
    if (window.game && window.game.sounds) {
      // Ajusta configurações de áudio para fone
      window.game.sounds.setHeadphoneMode(true);
    }
  });
  
  window.headphoneManager.onDisconnect(() => {
    console.log('🔇 Fone desconectado - Ajustando áudio...');
    // Aqui você pode ajustar o volume, equalização, etc.
    if (window.game && window.game.sounds) {
      // Ajusta configurações de áudio para alto-falante
      window.game.sounds.setHeadphoneMode(false);
    }
  });
  
  window.plugins.screensize.get( (screensz) => {
      document.getElementById('tela-inicial').style.display = 'flex';      
    },
    (error) => {
      console.error("Error getting screen size:", error);
    }
  );

  
}

function startGame() {  
  console.log('Iniciando jogo...');  
  document.getElementById('tela-inicial').style.display = 'none';      
  document.getElementById('gameCanvas').style.display = 'block';

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
  //document.addEventListener("resume",() => {setTimeout(() => {window.game.resume();}, 1000);},false); 
  window.addEventListener("resize", resizeCanvas);
 
  console.log('Ajustando tamanho da tela...');
  resizeCanvas();

  console.log('Iniciando jogo...');
  window.game.start();  
}
