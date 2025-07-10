class Sounds {
    ids = [];
    constructor() {
        this.loadSounds();
    }

    // Load sounds using Howler.js
    loadSounds() {
      this.sounds = {
        step: new Howl({
          src: ['/assets/sounds/step1.mp3'],
          html5 : true,
          volume: 0.3
        }),
        run: new Howl({
          src: ['/assets/sounds/step1.mp3'],
          html5 : true,
          volume: 1
        }),
        clap: new Howl({
          src: ['/assets/sounds/clap1.mp3'],
          html5 : true,
          volume: 0.5
        }),
        bigDark: new Howl({
          src: ['/assets/sounds/bigdark.mp3'],
          html5 : true,
          volume: 1
        }),
        scream: new Howl({
          src: ['/assets/sounds/scream.mp3'],
          html5 : true,
          sprite: {
            dead: [521, 3408],
            dead2: [3861, 6870],
            hurt: [7878, 8818],
            hurt2: [9235, 10453],
            hurt3: [10835, 11948],
            hurt4: [12348, 13409]
          },          
          volume: 1
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
                let idx = this.ids.indexOf(id);
                if (idx > -1)
                  this.ids.splice(idx, 1);
                this.sounds[name].stop(id);
                if (sprite != null) {
                  newid = this.sounds[name].play(sprite, id);
                  if (newid > 0) { this.ids.push([name, newid]); }
                  return newid;
                } else {
                  newid = this.sounds[name].play(id);
                  if (newid > 0) { this.ids.push([name, newid]); }
                  return newid;
                }
              }
            }

            //console.log(`Playing sound: "${name}"-"${sprite}"`);

            if (sprite != null) {
              newid = this.sounds[name].play(sprite);
              if (newid > 0) { this.ids.push([name, newid]); }
              return newid;
            }
            else {
              newid = this.sounds[name].play();
              if (newid > 0) { this.ids.push([name, newid]); }
              return newid;
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
      for (const id in this.ids) {
          this.sounds[id[0]].pause(id[1]);
      }
    }

    resumeAll() {
      for (const id in this.ids) {
          this.sounds[id[0]].play(id[1]);
      }
    }

}