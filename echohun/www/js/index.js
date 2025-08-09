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

function isTouchDevice() {
  return (('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0) ||
           (navigator.msMaxTouchPoints > 0));
}

// Ajuste o tamanho visual via CSS para preencher a tela mantendo a proporção
function resizeCanvas() {
  if (!window.game)
    return;

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

function onDeviceReady() {
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

  console.log('Iniciando jogo em plataforma: ' + device.platform + '...');  
  document.getElementById('gameCanvas').style.display = 'block';

  console.log('Iniciando Game');
  Game.init();
}
