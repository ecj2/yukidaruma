"use strict";

async function main() {

  if (!Poyo.initialize(CANVAS_W, CANVAS_H)) {

    Poyo.getErrors().forEach(

      (error) => {

        // Display initialization errors.
        Poyo.displayError(error);
      }
    );
  }

  await loadResources();

  reset();

  Poyo.createGameLoop(loop);
}

function setStatus(resource, is_error = false) {

  let status = document.getElementById("status");

  if (is_error) {

    let message = "failed to load " + resource + "!";

    status.innerHTML = "Error: " + message;

    throw new Error(message);
  }
  else {

    status.innerHTML = "Loading " + resource + "...";
  }
}

async function loadResources() {

  setStatus("atlas.png");

  bitmap_atlas = await Poyo.loadBitmap("data/png/atlas.png");

  if (!bitmap_atlas) {

    setStatus("atlas.png", true);
  }

  setStatus("text.png");

  bitmap_text = await Poyo.loadBitmap("data/png/text.png");

  if (!bitmap_text) {

    setStatus("text.png", true);
  }

  setStatus("background.png");

  bitmap_background = await Poyo.loadBitmap("data/png/background.png");

  if (!bitmap_background) {

    setStatus("background.png", true);
  }

  setStatus("score.png");

  bitmap_score = await Poyo.loadBitmap("data/png/score.png");

  if (!bitmap_score) {

    setStatus("score.png", true);
  }

  // Use linear texture filtering on lights (hopefully reduces some banding).
  Poyo.setNewBitmapFlags(Poyo.MIN_LINEAR, Poyo.MAG_LINEAR);

  setStatus("light.png");

  bitmap_light = await Poyo.loadBitmap("data/png/light.png");

  if (!bitmap_light) {

    setStatus("light.png", true);
  }

  setStatus("pop.mp3");

  sample_pop = await Poyo.loadSample("data/mp3/pop.mp3");

  if (!sample_pop) {

    setStatus("pop.mp3", true);
  }

  setStatus("whoosh.mp3");

  sample_whoosh = await Poyo.loadSample("data/mp3/whoosh.mp3");

  if (!sample_whoosh) {

    setStatus("whoosh.mp3", true);
  }

  setStatus("slide.mp3");

  sample_slide = await Poyo.loadSample("data/mp3/slide.mp3");

  if (!sample_slide) {

    setStatus("slide.mp3", true);
  }

  setStatus("defeat.mp3");

  sample_defeat = await Poyo.loadSample("data/mp3/defeat.mp3");

  if (!sample_defeat) {

    setStatus("defeat.mp3", true);
  }

  setStatus("special.mp3");

  sample_special = await Poyo.loadSample("data/mp3/special.mp3");

  if (!sample_special) {

    setStatus("special.mp3", true);
  }

  setStatus("background.mp3");

  sample_background = await Poyo.loadSample("data/mp3/background.mp3");

  if (!sample_background) {

    setStatus("background.mp3", true);
  }

  // Hide the status text.
  document.getElementById("status").style = "display: none";

  // Show fullscreen and source links.
  document.getElementById("grid").style = "display: flex; width: 768px;";

  // Show canvas.
  document.getElementById("poyo").style = "display: inherit";
}

function loop() {

  update();
  render();
}

function update() {

  if (hue < target_hue) {

    hue += 3;
  }
  else if (hue > target_hue) {

    hue -= 3;
  }

  Poyo.getCanvas().style.filter = "hue-rotate(" + hue + "deg)";

  if (Poyo.isKeyDown(Poyo.KEY_D) && Poyo.isKeyDown(Poyo.KEY_0)) {

    // Reset best score.

    highscore = 5000;

    localStorage.setItem("highscore", highscore);
  }

  switch (state) {

    case STATE_INTRO:

      if (!spawn_platforms && Poyo.isKeyPressed(Poyo.KEY_Z)) {

        move_background = true;
      }

      if (move_background) {

        background_vel_y -= 0.25;
        background_y += background_vel_y;

        if (background_y < -CANVAS_H / 2) {

          background_y = -CANVAS_H / 2;
          background_vel_y = 0;

          spawn_platforms = true;
          move_background = false;
        }
      }

      updatePlatforms();

      if (spawn_platforms) {

        --spawn_ticks;

        let number_of_platforms = Platforms.length;

        if (spawn_ticks < 0) {

          spawn_ticks = 6;

          // Spawn in the initial platforms.
          Platforms[number_of_platforms] = new Platform(number_of_platforms * TILE_SIZE, -TILE_SIZE);

          // Break and repair so the whistle sound will play for each.
          Platforms[number_of_platforms].break();
          Platforms[number_of_platforms].repair();
        }

        if (number_of_platforms > 11) {

          // All of the platforms have been spawned. Begin the actual game.
          ++state;
        }
      }
    break;

    case STATE_GAME:

      Snowball.update();

      updatePlatforms();
      updateHearts();

      Player.update();

      if (Player.isDefeated() && Player.getY() > CANVAS_H && Poyo.isKeyPressed(Poyo.KEY_Z)) {

        reset();
      }

      if (score > highscore) {

        // Save new best score.
        localStorage.setItem("highscore", score);
        highscore = localStorage.getItem("highscore");
      }
    break;
  }

  updateBirds();

  updateAnimationFrames();
}

function updatePlatforms() {

  Platforms.forEach(

    (Platform) => {

      Platform.update();
    }
  );
}

function updateHearts() {

  Hearts.forEach(

    (Heart) => {

      Heart.update();
    }
  );

  --heart_ticks;

  if (score >= goal) {

    // Increase game speed for every 1,000-ish points collected.

    goal = score + 1000;

    Player.increaseSpeed();
    Snowball.increaseSpeed();

    global_speed += 0.5;
    music_speed += 0.25;

    ++goals_met;
  }

  if (!Player.isDefeated() && heart_ticks < 0) {

    let i = 0;
    let number_to_spawn = 1;

    if (global_speed >= 7) {

      // Spawn three at a time at crazy speeds.
      number_to_spawn = 3;
    }
    else if (global_speed >= 4) {

      // Twice as many at higher speeds.
      number_to_spawn = 2;
    }

    for (i; i < number_to_spawn; ++i) {

      heart_ticks = 30 - (Math.min(70, goals_met * 10) * 0.25);

      // Pick a random platform spot to spawn the heart above.
      let spawn_x = getRandomRange(Platforms.length);

      let spacing = 2;

      if (global_speed >= 4) {

        spacing = 1;
      }

      while (Math.abs(spawn_x - last_spawn_x) < spacing) {

        // Pick a new random spot, as the last was too close to the previous heart.
        spawn_x = getRandomRange(Platforms.length);
      }

      last_spawn_x = spawn_x;

      Hearts[Hearts.length] = new Heart(spawn_x * TILE_SIZE);
    }

    // Increase background music as the game progresses. Cap to 4x to appease Firefox.
    Poyo.adjustSample(getReference(BACKGROUND), master_gain - 0.5, Math.min(4, music_speed), 0, true);
  }
}

function updateBirds() {

  // Move birds left.
  --birds_x;

  // Slowly bob birds up and down.
  birds_y = Math.sin(Poyo.getTime() * 4) * TILE_SIZE / 16;

  if (birds_x < -TILE_SIZE * 3) {

    // Loop birds again.
    birds_x = CANVAS_W + TILE_SIZE;
  }
}

function updateAnimationFrames() {

  ++animation_ticks;

  if (animation_ticks > 60 / 4) {

    animation_ticks = 0;

    ++animation_frame;

    if (animation_frame > 1) {

      animation_frame = 0;
    }
  }
}

function render() {

  Poyo.clearToColor(Poyo.createColor(155, 183, 195));

  renderBackground();

  renderPlatforms();

  switch (state) {

    case STATE_INTRO:

      // Draw intro text.
      Poyo.drawClippedBitmap(bitmap_text, 0, animation_frame * CANVAS_H * 2, CANVAS_W, CANVAS_H * 2, 0, background_y - CANVAS_H, Poyo.createColor(0, 255, 0));
    break;

    case STATE_GAME:

      renderLights();

      Poyo.useInstancing(true);

      renderHearts();

      Snowball.render();
      Player.render();

      Poyo.useInstancing(false);

    break;
  }

  renderText();
}

function renderBackground() {

  Poyo.useInstancing(true);

  // Draw background.
  Poyo.drawClippedBitmap(bitmap_background, 0, animation_frame * CANVAS_H, CANVAS_W, CANVAS_H, 0, background_y + CANVAS_H / 2);

  // Draw birds.
  Poyo.drawClippedBitmap(bitmap_background, TILE_SIZE * 12, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, birds_x, birds_y + background_y + CANVAS_H / 2);

  Poyo.useInstancing(false);
}

function renderPlatforms() {

  Poyo.useInstancing(true);

  Platforms.forEach(

    (Platform) => {

      Platform.render();
    }
  );

  Poyo.useInstancing(false);
}

function renderHearts() {

  Hearts.forEach(

    (Heart) => {

      Heart.render();
    }
  );
}

function renderLights() {

  let WebGL2 = Poyo.getContext();

  // Use additive blending.
  WebGL2.blendFunc(WebGL2.SRC_ALPHA, WebGL2.ONE);

  let light_size = Poyo.getBitmapWidth(bitmap_light);

  Poyo.useInstancing(true);

  Hearts.forEach(

    (Heart) => {

      if (!Heart.isDestroyed()) {

        let tint = Heart.getTint();

        if (tint.b == 64 / 255) {

          // Use pure red for non-green hearts.
          tint = Poyo.createColor(255, 0, 0);
        }

        Poyo.drawScaledBitmap(bitmap_light, light_size / 2, light_size / 2, Heart.getScale(), Heart.getScale(), Heart.getX() + TILE_SIZE / 2, Heart.getY() + TILE_SIZE / 2, tint);
      }
    }
  );

  Poyo.useInstancing(false);

  // Return to Poyo's default blend mode.
  WebGL2.blendFunc(WebGL2.SRC_ALPHA, WebGL2.ONE_MINUS_SRC_ALPHA);
}

function reset() {

  Hearts = [];
  Platforms = [];

  Player = new Player.constructor();
  Snowball = new Snowball.constructor();

  setSeed(Date.now());

  state = STATE_INTRO;

  spawn_ticks = 0;

  texts = [];

  score = 0;

  heart_ticks = 90;

  global_speed = 1;

  music_speed = 1;

  goal = 1000;
  goals_met = 0;

  // Play background music.
  Poyo.playSample(sample_background, master_gain - 0.5, 1, 0, true, getReference(BACKGROUND));
}

function renderText() {

  if (state == STATE_GAME && !transitioned_score && score_y < 0) {

    score_y += 3;

    if (score_y > 0) {

      score_y = 0;

      transitioned_score = true;
    }
  }

  Poyo.useInstancing(true);

  texts.forEach(

    (Text) => {

      if (Text.y > CANVAS_H) {

        return;
      }

      ++Text.ticks_linger;

      if (Text.ticks_linger >= 30) {

        // Fade-out over 1/10th of a second.
        Text.ticks_fade -= 6;
      }

      if (Text.ticks_fade >= 0) {

        let text_tile_x = 0;

        let tint = Poyo.createColor(0, 0, 0);

        switch (Text.value) {

          case 300:

            text_tile_x = 0;

            tint = Poyo.createColor(255, 128, 0);
          break;

          case 100:

            text_tile_x = 1;

            tint = Poyo.createColor(255, 255, 0);
          break;

          case 50:

            text_tile_x = 2;

            tint = Poyo.createColor(0, 128, 255);
          break;

          case 10:

            text_tile_x = 3;

            tint = Poyo.createColor(134, 171, 84);
          break;
        }

        tint.a = (Text.ticks_fade / 60);

        // Draw score increases.
        Poyo.drawClippedBitmap(bitmap_atlas, text_tile_x * TILE_SIZE, 2 * TILE_SIZE + TILE_SIZE * animation_frame, TILE_SIZE, TILE_SIZE, Text.x, Text.y, tint);
      }
    }
  );

  Poyo.useInstancing(false);

  Poyo.useInstancing(true);

  let score_string = score.toString();

  let i = 0;
  let length = score_string.length;

  for (i; i < length; ++i) {

    // Draw score.
    Poyo.drawClippedBitmap(bitmap_score, parseInt(score_string[i]) * TILE_SIZE, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, i * TILE_SIZE / 2, score_y);
  }

  let best_string = highscore.toString();

  i = 0;
  length = best_string.length;

  let distance_from_right = TILE_SIZE / 2 * length + TILE_SIZE / 2;

  for (i; i < length; ++i) {

    // Draw best / highest score right-aligned at the top-right of the screen.
    Poyo.drawClippedBitmap(bitmap_score, parseInt(best_string[i]) * TILE_SIZE, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, CANVAS_W + i * TILE_SIZE / 2 - distance_from_right, score_y);
  }

  if (Player.isDefeated()) {

    show_try_again = true;
  }

  if (show_try_again) {

    target_hue = 0;

    let bitmap_width = Poyo.getBitmapWidth(bitmap_score);

    let x = CANVAS_W / 2 - bitmap_width / 2;
    let y = CANVAS_H / 2 - TILE_SIZE / 2;

    if (state == STATE_INTRO && show_again_direction == 1) {

      show_again_direction = -1;
    }

    defeat_y += 9 * show_again_direction;

    if (defeat_y < -TILE_SIZE) {

      defeat_y = -TILE_SIZE;

      show_try_again = false;

      show_again_direction = 1;
    }
    else if (defeat_y > y) {

      defeat_y = y;
    }

    // Draw "try again" text.
    Poyo.drawClippedBitmap(bitmap_score, 0, TILE_SIZE * 2 + animation_frame * TILE_SIZE, bitmap_width, TILE_SIZE, x, defeat_y);
  }

  Poyo.useInstancing(false);
}
