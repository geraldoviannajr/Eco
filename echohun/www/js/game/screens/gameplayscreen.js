class GameplayScreen extends GameScreen {
  static draw(ctx, canvas) {
    window.game.update();
    if (config.DEBUG || config.DEBUG_INFO) {
      window.game.drawInfo();
    }
  }

  static doEvent(eventName, e) {
    var game = window.game;

    switch (eventName) {
      case "keydown":
        if (!(e.key in game.keys)) game.keyPressTimes[e.key] = game.gameTime;
        game.keys[e.key] = true;
        break;

      case "keyup":
        delete game.keys[e.key];
        delete game.keyPressTimes[e.key];

        // Se todas as teclas de movimento foram soltas
        if (
          !game.keys["w"] &&
          !game.keys["a"] &&
          !game.keys["s"] &&
          !game.keys["d"] &&
          !game.keys["W"] &&
          !game.keys["A"] &&
          !game.keys["S"] &&
          !game.keys["D"]
        ) {
          game.player.wasIdle = true;
        } else {
          game.player.forceNextStep = true;
        }

        //Se apertou "space"
        if (e.code === "Space") {
          game.emitClap();
        }
        break;

      case "mousedown":
        if (game.isPaused) return;
        var rect = game.canvas.getBoundingClientRect();
        var scaleX = game.canvas.width / rect.width;
        var scaleY = game.canvas.height / rect.height;
        var mouseX = (e.clientX - rect.left) * scaleX;
        var mouseY = (e.clientY - rect.top) * scaleY;
        if (!game.checkControls(mouseX, mouseY, false)) {
          game.mouseTarget = {
            x: mouseX + game.camera.x,
            y: mouseY + game.camera.y,
          };
          game.mousePos = { x: mouseX, y: mouseY };
          game.isMousePressed = true;
          game.mousePressStart = game.gameTime;
        }
        break;

      case "mouseup":
        if (game.isPaused) {
          game.resume();
          return;
        }
        if (game.player.isDead) return;
        else if (game.checkControls(game.mousePos.x, game.mousePos.y, true))
          return;
        else if (!game.player.wasIdle) {
          game.isMousePressed = false;
          game.mouseTarget = null;
          game.player.wasIdle = true;
          game.player.forceNextStep = true;
        }
        break;

      case "mousemove":
        if (game.isPaused) {
          return;
        }
        if (game.player.isDead) return;
        var rect = game.canvas.getBoundingClientRect();
        var scaleX = game.canvas.width / rect.width;
        var scaleY = game.canvas.height / rect.height;
        var mouseX = (e.clientX - rect.left) * scaleX;
        var mouseY = (e.clientY - rect.top) * scaleY;

        if (game.isMousePressed) {
          game.mouseTarget = {
            x: mouseX + game.camera.x,
            y: mouseY + game.camera.y,
          };
        } else {
          game.mousePos = { x: mouseX, y: mouseY };
        }
        break;

      case "touchstart":
        if (game.isPaused) return;
        if (game.player.isDead) return;

        var touch = e.touches[e.touches.length - 1]; // Armazena o índice do último toque

        if (config.DEBUG_INFO)
          console.log('👆 Evento "TouchStart" detectado: ', touch);

        // Verifica se tocou num controle
        if (game.checkControls(touch.clientX, touch.clientY, false)) return;

        if (e.touches.length == 2) {
          // Se houver dois toques, dispara o clap
          game.emitClap();
        } else if (e.touches.length == 1) {
          // Se houver apenas um toque, armazena o ID do toque para o movimento do player
          if (config.DEBUG_INFO)
            console.log(
              " |-> Armazenando ID do toque que move o jogador e iniciando movimento..."
            );

          game.idTouchPlayerMove = touch.identifier; // Armazena o ID do toque que move o jogador
          var rect = game.canvas.getBoundingClientRect();
          var scaleX = game.canvas.width / rect.width;
          var scaleY = game.canvas.height / rect.height;
          var mouseX = (touch.clientX - rect.left) * scaleX + game.camera.x;
          var mouseY = (touch.clientY - rect.top) * scaleY + game.camera.y;
          game.mouseTarget = { x: mouseX, y: mouseY };
          game.isMousePressed = true;
          game.mousePressStart = game.gameTime;
        }
        break;

      case "touchmove":
        if (game.player.isDead) return;

        if (game.isMousePressed && game.idTouchPlayerMove >= 0) {
          // Verifica se o toque que está se movendo é o que move o jogador
          for (let i = 0; i < e.touches.length; i++) {
            var touch = e.touches[i];
            if (touch.identifier === game.idTouchPlayerMove) {
              var rect = game.canvas.getBoundingClientRect();
              var scaleX = game.canvas.width / rect.width;
              var scaleY = game.canvas.height / rect.height;
              var mouseX =
                (touch.clientX - rect.left) * scaleX + game.camera.x;
              var mouseY =
                (touch.clientY - rect.top) * scaleY + game.camera.y;
              game.mouseTarget = { x: mouseX, y: mouseY };
              break;
            }
          }
        }
        break;

      case "touchend":
        if (game.isPaused) {
          game.resume();
          return;
        }

        if (config.DEBUG_INFO)
          console.log('👆 Evento "TouchEnd" detectado: ', e.changedTouches);

        // Executa todos os eventos de liberação
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];

          // Verifica se o toque que está sendo liberado é o que move o jogador
          if (
            game.idTouchPlayerMove >= 0 &&
            touch.identifier === game.idTouchPlayerMove
          ) {
            if (config.DEBUG_INFO)
              console.log(" |-> Liberando toque do jogador...");

            game.isMousePressed = false;
            game.mouseTarget = null;
            game.player.wasIdle = true;
            game.player.forceNextStep = true;
            game.idTouchPlayerMove = -1; // Reseta o ID do toque
          } else {
            game.checkControls(touch.clientX, touch.clientY, true);
          }
        }
        break;

      case "touchcancel":
          if (config.DEBUG_INFO)
            console.log(
              '👆 Evento "TouchCancel" detectado: ',
              e.changedTouches
            );

          if (game.idTouchPlayerMove >= 0) {
            // Verifica se o toque que está sendo cancelado é o que move o jogador
            for (let i = 0; i < e.changedTouches.length; i++) {
              const touch = e.changedTouches[i];
              if (touch.identifier === game.idTouchPlayerMove) {
                if (config.DEBUG_INFO)
                  console.log(" |-> Cancelando toque do jogador...");

                game.isMousePressed = false;
                game.mouseTarget = null;
                game.player.wasIdle = true;
                game.player.forceNextStep = true;
                game.idTouchPlayerMove = -1; // Reseta o ID do toque
                break;
              }
            }
          }
        break;
    }
  }
}
