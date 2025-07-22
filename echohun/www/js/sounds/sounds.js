class Sounds {
    constructor() {
        this.loadSounds();
    }

    // Load sounds using Howler.js
    loadSounds() {
      this.sounds = {
        step: new Howl({
          src: ['/assets/sounds/step1.mp3'],
          html5 : false,
          volume: 0.3
        }),
        run: new Howl({
          src: ['/assets/sounds/step1.mp3'],
          html5 : false,
          volume: 0.3
        }),
        enemy_echo: new Howl({
          src: ['/assets/sounds/step1.mp3'],
          html5 : false,
          volume: 0
        }),
        clap: new Howl({
          src: ['/assets/sounds/clap1.mp3'],
          html5 : false,
          volume: 0.5
        }),
        ddChasing: new Howl({
          src: ['/assets/sounds/bigdark.mp3'],
          html5 : false,
          volume: 0
        }),
        scream: new Howl({
          src: ['/assets/sounds/scream.mp3'],
          html5 : false,
          sprite: {
            dead: [521, 3408],
            dead2: [3861, 6870],
            hurt: [7878, 8818],
            hurt2: [9235, 10453],
            hurt3: [10835, 11948],
            hurt4: [12348, 13409]
          },          
          volume: 0.1
        }),
        beep: new Howl({
          src: ['/assets/sounds/beep.mp3'],
          html5 : false,
          volume: 0,
          sprite: {
            echo: [780, 1100],
          },          
        }),
      };
    }

    // Play a sound by name
    play(name_and_srite, id = 0, forcenew = true) {      
        if (name_and_srite == null)
          return null;

        var name  = name_and_srite.split(".")[0];
        var sprite = name_and_srite.split(".")[1] || null;
        var newid = -1;       

        if (this.sounds[name]) {            
          if (id > 0) {
            if (!forcenew && this.sounds[name].playing(id)) {
              //console.warn(`Sound "${name}"-"${sprite}" is already playing.`);
              return null;
            } else {
              //console.warn(`Stop and play againg sound: "${name}"-"${sprite}".`);              
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

          //console.log(`Playing sound: "${name}"-"${sprite}"`);

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

    getSound(name) {
      return this.sounds[name];
    }
}