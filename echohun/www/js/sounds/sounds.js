class Sounds {
    constructor() {
        this.isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent)) || device.platform == "iOS";               
        console.log(' |-> 🎵 Carregando arquivos de sons');
        this.loadSounds();

        this.isHeadphone = false;
        this.is3D = this.isHeadphone || device.platform == "browser";               
        this.audioContextInitialized = false;

        console.log(' |-> 🎵 Inicializando contexto de áudio');
        this.checkAudioSupport();                     
        if (this.isIOS) {  this.forceAudioInit(); }   
    }

    // Load sounds using Howler.js
    loadSounds() {            
      this.sounds = {
        intro: new Howl({
          src: ['assets/sounds/bigdark.mp3'],
          html5: false, // Usar HTML5 no iOS para melhor compatibilidade
          volume: 0.0
        }),
        step: new Howl({
          src: ['assets/sounds/step1.mp3'],
          html5 : false,
          volume: 0.3
        }),
        run: new Howl({
          src: ['assets/sounds/step1.mp3'],
          html5 : false,
          volume: 0.2
        }),
        enemy_echo: new Howl({
          src: ['assets/sounds/step1.mp3'],
          html5 : false,
          volume: 0.0
        }),
        clap: new Howl({
          src: ['assets/sounds/clap1.mp3'],
          html5 : false,
          volume: 0.5
        }),
        ddChasing: new Howl({
          src: ['assets/sounds/bigdark.mp3'],
          html5 : false,
          volume: 0
        }),
        beep: new Howl({
          src: ['assets/sounds/beep.mp3'],
          html5 : false,
          volume: 0,
        }),
        scream: new Howl({
          src: ['assets/sounds/scream.mp3'],
          html5 : false,
          preload: true,
          sprite: {
            dead: [521, 3408],
            dead2: [3861, 6870],
            hurt: [7878, 8818],
            hurt2: [9235, 10453],
            hurt3: [10835, 11948],
            hurt4: [12348, 13409]
          },          
          volume: 0
        }),
      };
    }

    // Play a sound with spatial efect
    playSpatial(sound, pos, refPos, maxDist = config.MAX_DISTANCE_SOUND) {      
      if (sound == null)
        return;
      if (config.DEBUG_SOUNDS)
        console.log(' |-> 🎵 playSpatial: ', sound);

      const dx = pos.x - refPos.x;
      const dy = pos.y - refPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let volume = 1 - Math.min(dist / maxDist, 1);
      volume = Math.max(0, Math.min(1, volume));
      let pan = dx / (game.canvas.width / 2);
      pan = Math.max(-1, Math.min(1, pan));

      let id = sound.play();
      sound.once('play', function(playId) {
        if (this.is3D) {
          this.pos(pan, 0, 0, playId);
        }
        this.volume(volume, playId);
      }, id);            
      return id;
    }

    // Play a sound by name, with optional sprite and id
    play(name_and_srite, id = 0, forcenew = true) {      
        if (name_and_srite == null)
          return null;

        var name  = name_and_srite.split(".")[0];
        var sprite = name_and_srite.split(".")[1] || null;
        var newid = -1;       

        if (this.sounds[name]) {            
          if (id > 0) {
            if (!forcenew && this.sounds[name].playing(id)) {
              if (config.DEBUG_SOUNDS)
                console.warn(` |-> 🎵 Sound "${name}"-"${sprite}" is already playing.`);

              return null;
            } else {
              if (config.DEBUG_SOUNDS)
                console.log(` |-> 🎵 Stop and play againg sound: "${name}"-"${sprite}".`);

              this.sounds[name].stop(id);
              if (sprite != null) {
                newid = this.sounds[name].play(sprite, id);
                return newid;
              } else {
                newid = this.sounds[name].play(id);
                return newid;
              }
            }
          }

          if (config.DEBUG_SOUNDS)
            console.log(` |-> 🎵 Playing sound: "${name}"-"${sprite}"`);

          if (sprite != null) {
            newid = this.sounds[name].play(sprite);
            return newid;
          }
          else {
            newid = this.sounds[name].play();
            return newid;
          }
        } else {
            console.warn(`Sound "${name}"-"${sprite}" not found.`);
        }
    }

    stop(name_and_srite, id = 0) {      
      if (name_and_srite == null)
        return null;

      var name  = name_and_srite.split(".")[0];
      var sprite = name_and_srite.split(".")[1] || null;
      var newid = -1;       

      if (this.sounds[name]) {            
        if (id > 0) {
          if (!this.sounds[name].playing(id)) {
            return null;
          } else {
            this.sounds[name].stop(id);
          }
        }

        //console.log(`Stoping sound: "${name}"-"${sprite}"`);

        if (sprite != null) {
          this.sounds[name].stop(sprite);
          return null;
        }
        else {
          this.sounds[name].stop();
          return null;
        }
      } else {
          console.warn(`Sound "${name}"-"${sprite}" not found.`);
      }
  }

    isPlaying(name, id) {
      if (this.sounds[name]) { return (this.sounds[name].playing(id)); }
      return false;
    }

    pauseAll() {
      Howler._howls.forEach(howl => {
        howl._sounds.forEach(sound => {
          if (!sound._paused && !sound._ended) {
            howl.pause(sound._id);
          }
        });
      });
    }

    resumeAll() {
      Howler._howls.forEach(howl => {
        howl._sounds.forEach(sound => {
          if (sound._paused && !sound._ended) {
            howl.play(sound._id);
          }
        });
      });
    }

    getSound(name){
      return this.sounds[name];
    }

    setHeadphoneMode(isHeadphone) {        
      this.isHeadphone = isHeadphone;
      if (isHeadphone) {
        console.log('🎧 Fone conectado - Ajustando áudio...');
        this.is3D = true;
      } else {
        console.log('🔇 Fone desconectado - Ajustando áudio...');
        if (device.platform != "browser") 
          this.is3D = false;
      }
    }

    // Método para limpar recursos de áudio (importante no iOS)
    cleanup() {
      if (this.sounds) {
        Object.values(this.sounds).forEach(sound => {
          if (sound && typeof sound.unload === 'function') {
            sound.unload();
          }
        });
      }
      // Limpar todos os sons do Howler
      Howler.unload();
    }

         // Método para verificar se o áudio está funcionando no iOS
     checkAudioSupport() {
       if (this.isIOS) { console.log('  |-> 🍎 iOS detectado - Verificando suporte de áudio...'); }
       else { console.log('  |-> 🎵 Verificando suporte de áudio...'); }
        
      // Testar se o Web Audio API está disponível
      if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        console.log('   |-> ✅ Web Audio API suportada');
      } else {
        console.log('   |-> ⚠️ Web Audio API não suportada - usando HTML5 Audio');
      }

      // Verificar se o HTML5 Audio está disponível
      const audio = new Audio();
      if (audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, '')) {
        console.log('   |-> ✅ HTML5 Audio suportado');
      } else {
        console.log('  |-> ❌ HTML5 Audio não suportado');
      }
    }

    // Método para forçar inicialização do áudio no iOS
    forceAudioInit() {
      if (this.isIOS && !this.audioContextInitialized) {
        console.log('  |-> 🔧 Forçando inicialização de áudio no iOS...');
        
        // Tocar todos os sons brevemente para inicializar
        Object.values(this.sounds).forEach(sound => {
          if (sound && typeof sound.play === 'function') {
            const originalVolume = sound.volume();
            sound.volume(0);
            const id = sound.play();
            sound.once('play', () => {
              sound.stop(id);
              sound.volume(originalVolume);
            }, id);
          }
        });
        
        this.audioContextInitialized = true;
      }
    }    
    
}