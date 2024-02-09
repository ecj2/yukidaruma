"use strict";

class Heart {

  constructor(spawn_x) {

    this.x = spawn_x;
    this.y = -TILE_SIZE;

    this.spawn = spawn_x;

    this.fall_speed = (global_speed > 6 ? 6 : global_speed);

    if ((getRandomNumber() * 9 | 0) == 0) {

      this.fall_speed += 2;
    }

    this.destroyed = false;

    this.type = TYPE_NORMAL;

    if (Hearts.length > 9 && (getRandomNumber() * 100 | 0) % 20 == 1 || (global_speed > 5 && (getRandomNumber() * 100 | 0) % 10 == 1)) {

      let active_hearts = 0;

      Hearts.forEach(

        (Heart) => {

          if (!Heart.isDestroyed()) {

            ++active_hearts;
          }
        }
      );

      if (active_hearts > 2) {

        this.type = TYPE_SPECIAL;
      }
    }

    this.vel_y = 0;

    this.ticks = 0;

    this.tint = Poyo.createColor(238, 47, 64);

    if (((getRandomNumber() * 100) | 0) % 10 == 0) {

      // Spawn some hearts with a green-ish tint.
      this.tint = Poyo.createColor(63, 216, 90);
    }

    this.used_ability = false;

    this.next = 0;

    this.scale = 1.0;
  }

  update() {

    if (this.destroyed) {

      // Fall with added velocity upon being destroyed.
      ++this.vel_y;
      this.y += this.vel_y + this.fall_speed;

      return;
    }

    if (Player.isDefeated()) {

      // Destroy all hearts upon the player's defeat.
      this.destroy();
    }

    // Scale the heart as though it were pulsating.
    this.scale = 1 + Math.cos(Poyo.getTime() * 3) / 5;

    if (getDistance(this.x, this.y, Player.getX(), Player.getY()) < TILE_SIZE - (TILE_SIZE / 8)) {

      // Heart collided with player.

      Player.defeat();

      this.type = TYPE_NORMAL;
      this.destroy();
    }

    Platforms.forEach(

      (Platform) => {

        if ((Platform.isRespawning() || !Platform.isBroken()) && isColliding(this.x, this.y, Platform.getX(), Platform.getY())) {

          // Heart collided with platform.

          this.type = TYPE_NORMAL;

          if (!Platform.isRespawning()) {

            Platform.break();
          }

          this.destroy();

          Poyo.playSample(sample_pop, master_gain, 1, false, getRandomReference());
        }
      }
    );

    // Move the heart down the screen.
    this.y += this.fall_speed / (this.type == TYPE_SPECIAL ? 2 : 1);

    if (this.y > CANVAS_H) {

      // Change type to normal to prevent activating special ability.
      this.type = TYPE_NORMAL;

      // Destroy heart when it falls out of view.
      this.destroy();
    }
  }

  render() {

    if (this.destroy && this.y > CANVAS_H) {

      return;
    }

    if (this.type == TYPE_SPECIAL) {

      --this.ticks;

      if (this.ticks < 0) {

        this.ticks = 4;

        // Make special hearts flash with color.
        this.tint = special_tints[this.next];

        ++this.next;

        if (this.next > special_tints.length - 1) {

          this.next = 0;
        }
      }
    }

    if (!this.destroyed) {

      let transform = Poyo.createTransform();

      Poyo.saveTransform(transform);

      // Scale the heart as though it were pulsating.
      Poyo.translateTransform(transform, this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
      Poyo.scaleTransform(transform, this.scale, this.scale);
      Poyo.translateTransform(transform, -TILE_SIZE / 2, -TILE_SIZE / 2);
      Poyo.useTransform(transform);

      // Draw the heart.
      Poyo.drawClippedBitmap(bitmap_atlas, TILE_SIZE * 2, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0, this.tint);

      // Reset transformations so as not to break future drawing.
      Poyo.restoreTransform(transform);
      Poyo.useTransform(transform);
    }
    else {

      // Draw destroyed heart.
      Poyo.drawClippedBitmap(bitmap_atlas, TILE_SIZE * 5, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, this.x, this.y, this.tint);
    }
  }

  getX() {

    return this.x;
  }

  getY() {

    return this.y;
  }

  destroy() {

    this.destroyed = true;

    if (!this.used_ability && this.type == TYPE_SPECIAL) {

      // Player struck a special heart.

      target_hue += 45;

      if (target_hue > 360) {

        target_hue -= 360;
      }

      this.used_ability = true;

      hit_special = true;

      Poyo.playSample(sample_special, master_gain, 1, false, getRandomReference());

      Hearts.forEach(

        (Heart) => {

          if (!Heart.isDestroyed()) {

            // Convert to normal heart to prevent the ability from being used again.
            Heart.type = TYPE_NORMAL;

            Heart.destroy();
            Heart.calculateScore();
          }
        }
      );

      hit_special = false;

      Platforms.forEach(

        (Platform) => {

          if (!Platform.isRespawning() && Platform.isBroken()) {

            // Repair broken platforms.
            Platform.repair();
          }
        }
      );
    }
  }

  isDestroyed() {

    return this.destroyed;
  }

  getScale() {

    return this.scale;
  }

  getTint() {

    return this.tint;
  }

  calculateScore() {

    // Get the height from bottom of canvas in TILE_SIZE increments.
    let height = ((CANVAS_H - this.y + TILE_SIZE / 2) / TILE_SIZE) | 0;

    if (hit_special) {

      // Force awarding of only 10 points.
      height = 3;
    }

    let increase = 0;

    if (height == 7 || height == 6) {

      increase = 300;
    }
    else if (height == 5) {

      increase = 100;
    }
    else if (height == 4) {

      increase = 50;
    }
    else {

      increase = 10;
    }

    score += increase;

    texts.push({x: this.x, y: this.y, value: increase, ticks_fade: 60, ticks_linger: 0});
  }
}
