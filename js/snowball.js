Snowball = new class {

  constructor() {

    this.x = 0;
    this.y = 0;

    this.theta = 0.0;

    this.show = false;

    this.speed = 8;

    this.facing_direction = FACING_RIGHT;
  }

  update() {

    if (!this.show && Player.isSpawned() && !Player.isDefeated() && Poyo.isKeyPressed(Poyo.KEY_Z)) {

      this.show = true;

      this.facing_direction = Player.getFacingDirection();

      switch (this.facing_direction) {

        case FACING_LEFT:

          this.theta = convertDegreesToRadians(135);
        break;

        case FACING_RIGHT:

          this.theta = convertDegreesToRadians(45);
        break;
      }

      // Spawn snowball inside player.
      this.x = Player.getX();
      this.y = Player.getY();

      Poyo.playSample(sample_whoosh, master_gain, 1, false, getRandomReference());
    }

    if (!this.show) {

      return;
    }

    // Move snowball in proper direction.
    this.x += Math.cos(this.theta) * this.speed;
    this.y += Math.sin(-this.theta) * this.speed;

    if (this.x < -TILE_SIZE || this.x > CANVAS_W || this.y < -TILE_SIZE) {

      // Hide snowball once it leaves the view.
      this.show = false;
    }

    let i = 0;
    let length = Hearts.length;

    for (i; i < length; ++i) {

      let distance = getDistance(this.x, this.y, Hearts[i].getX(), Hearts[i].getY());

      if (!Hearts[i].isDestroyed() && Hearts[i].y + TILE_SIZE / 2 > 0 && distance < TILE_SIZE) {

        // Snowball collided with a heart.

        Hearts[i].destroy();
        Hearts[i].calculateScore();

        Poyo.playSample(sample_pop, master_gain, 1, false, getRandomReference());

        this.show = false;

        break;
      }
    }
  }

  render() {

    if (!this.show) {

      return;
    }

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

    // Draw snowball.
    Poyo.drawClippedBitmap(bitmap_atlas, TILE_SIZE * 3, animation_frame * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0, 0);

    // Return to identity transform so as not to damage future drawing calls.
    Poyo.restoreTransform(transform);
    Poyo.useTransform(transform);
  }

  increaseSpeed() {

    this.speed += 0.5;
  }
};
