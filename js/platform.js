"use strict";

class Platform {

  constructor(spawn_x, spawn_y) {

    this.x = spawn_x;
    this.y = spawn_y;

    this.vel_y = 0;

    this.broken = false;
    this.respawn = false;

    this.scale = 1.0;

    this.ticks = 300;

    this.bounced = false;
  }

  update() {

    if (Player.isDefeated()) {

      // Break all platforms upon the player's defeat.
      this.break();
    }

    if (this.broken && !this.respawn) {

      // Shrink platform.
      this.scale -= 0.1;

      if (this.scale < 0) {

        --this.ticks;

        if (!Player.isDefeated() && this.ticks < 0) {

          // Set next repair time to 300 to 600 frames (5 to 10 seconds) from now.
          this.ticks = 300 + (getRandomNumber() * 300 | 0);

          this.repair();
        }
      }
    }

    this.vel_y += 0.5;
    this.y += this.vel_y;

    if (this.y > CANVAS_H - TILE_SIZE) {

      // Stop falling near bottom of canvas.

      this.y = CANVAS_H - TILE_SIZE;

      if (!this.bounced) {

        // Do a little bounce for added flair.
        this.vel_y = -5;

        this.bounced = true;
      }
      else {

        this.vel_y = 0;
      }

      if (this.respawn && this.broken) {

        this.respawn = false;
        this.broken = false;
      }
    }
  }

  render() {

    let transform = Poyo.createTransform();

    Poyo.saveTransform(transform);

    if (this.scale > 0) {

      // Shrink the platform with the origin at the center.
      Poyo.translateTransform(transform, this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
      Poyo.scaleTransform(transform, this.scale, this.scale);
      Poyo.translateTransform(transform, -TILE_SIZE / 2, -TILE_SIZE / 2);
      Poyo.useTransform(transform);

      // Draw the platform.
      Poyo.drawClippedBitmap(bitmap_atlas, 0, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0);
    }

    // Reset transformations so as not to break future drawing.
    Poyo.restoreTransform(transform);
    Poyo.useTransform(transform);
  }

  getX() {

    return this.x;
  }

  getY() {

    return this.y;
  }

  break() {

    if (!this.respawn) {

      this.broken = true;
    }
  }

  repair() {

    this.respawn = true;

    this.y = -TILE_SIZE;

    this.scale = 1;

    let pan = (this.x / CANVAS_W - 0.5) * 2;

    Poyo.playSample(sample_slide, master_gain, 1, pan, false, getReference(SLIDE));

    if (this.bounced) {

      this.bounced = false;
    }
  }

  isBroken() {

    return this.broken;
  }

  isRespawning() {

    return this.respawn;
  }
}
