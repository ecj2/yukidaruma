"use strict";

Player = new class {

  constructor() {

    this.x = CANVAS_W / 2 - TILE_SIZE / 2;
    this.y = -TILE_SIZE;

    this.vel_y = 0;

    this.move_speed = 3;

    this.facing_direction = FACING_RIGHT;

    this.bounced = false;
    this.spawned = false;
    this.defeated = false;
    this.grounded = false;
  }

  update() {

    this.vel_y += 0.5;
    this.y += this.vel_y;

    if (this.defeated) {

      return;
    }

    if (this.y > CANVAS_H - TILE_SIZE * 2) {

      // Snap the player to the platform level.

      if (!this.bounced) {

        if (!this.spawned) {

          this.spawned = true;
        }

        this.bounced = true;

        this.vel_y = -10;

        return;
      }

      this.y = CANVAS_H - TILE_SIZE * 2;

      this.vel_y = 0;

      this.grounded = true;
    }

    let moving = false;

    if (this.spawned && Poyo.isKeyDown(Poyo.KEY_LEFT)) {

      this.x -= this.move_speed;

      this.facing_direction = FACING_LEFT;

      moving = true;
    }
    else if (this.spawned && Poyo.isKeyDown(Poyo.KEY_RIGHT)) {

      this.x += this.move_speed;

      this.facing_direction = FACING_RIGHT;

      moving = true;
    }

    if (moving) {

      if (this.grounded) {

        // Bounce up and down as the player moves.

        this.vel_y = -3;

        this.grounded = false;
      }
    }

    if (this.x < 0) {

      // Don't allow player to exit left of view.

      this.x = 0;

      this.vel_y = 0;
    }
    else if (this.x + TILE_SIZE > CANVAS_W) {

      // Don't allow player to exit right of view.

      this.x = CANVAS_W - TILE_SIZE;

      this.vel_y = 0;
    }

    for (const Platform of Platforms) {

      if (this.spawned && isColliding(this.x, 0, Platform.getX(), 0)) {

        if (Platform.isBroken()) {

          if (this.facing_direction === FACING_LEFT) {

            let player_left = this.x;
            let platform_right = Platform.getX() + TILE_SIZE;

            let distance = platform_right - player_left;

            this.x += distance;
          }
          else {

            let player_right = this.x + TILE_SIZE;
            let platform_left = Platform.getX();

            let distance = player_right - platform_left;

            this.x -= distance;
          }

          // Collision already detected; skip checking against other platforms.
          break;
        }
      }
    }

    if (this.x < 0 || this.x + TILE_SIZE > CANVAS_W) {

      // If the buggy collision sends the player out of view, kill him. Does this ever occur?
      this.defeat();
    }
  }

  render() {

    let transform = Poyo.createTransform();

    Poyo.saveTransform(transform);

    switch (this.facing_direction) {

      case FACING_LEFT:

        // Flip to face left.
        Poyo.scaleTransform(transform, -1, 1);
        Poyo.translateTransform(transform, -this.x - TILE_SIZE, this.y);
      break;

      case FACING_RIGHT:

        Poyo.translateTransform(transform, this.x, this.y);
      break;
    }

    Poyo.useTransform(transform);

    if (this.defeated) {

      // Draw defeated player.
      Poyo.drawClippedBitmap(bitmap_atlas, TILE_SIZE * 4, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0);
    }
    else {

      // Draw player.
      Poyo.drawClippedBitmap(bitmap_atlas, TILE_SIZE * 1, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0);
    }

    // Return to identity transform so as not to damage future drawing calls.
    Poyo.restoreTransform(transform);
    Poyo.useTransform(transform);
  }

  getX() {

    return this.x;
  }

  getY() {

    return this.y;
  }

  getFacingDirection() {

    return this.facing_direction;
  }

  defeat() {

    // Stop background music.
    Poyo.stopSample(0);

    if (!this.defeated) {

      // Bounce up.
      this.vel_y = -15;

      let pan = (this.x / CANVAS_W - 0.5) * 2;

      Poyo.playSample(sample_defeat, master_gain, 1, pan, false);
    }

    this.defeated = true;
  }

  isDefeated() {

    return this.defeated;
  }

  isSpawned() {

    return this.spawned;
  }

  increaseSpeed() {

    this.move_speed += 0.5;
  }
};
