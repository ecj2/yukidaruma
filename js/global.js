// Bitmaps.
let bitmap_text;
let bitmap_atlas;
let bitmap_light;
let bitmaps_score;
let bitmap_background;

// Samples.
let sample_pop;
let sample_slide;
let sample_defeat;
let sample_whoosh;
let sample_special;
let sample_background;

// Objects.
let Player;
let Snowball;

// Object arrays.
let Hearts = [];
let Platforms = [];

// Constants.
const CANVAS_W = 768;
const CANVAS_H = 432;
const TILE_SIZE = 64;
const FACING_LEFT = 0;
const FACING_RIGHT = 1;
const TYPE_NORMAL = 0;
const TYPE_SPECIAL = 1;
const STATE_INTRO = 0;
const STATE_GAME = 1;
const STATE_DEFEAT = 2;

// Functions.

function isColliding(a_x, a_y, b_x, b_y, a_w, a_h, b_w, b_h) {

  if (a_w == undefined || a_h == undefined || b_w == undefined || b_h == undefined) {

    // Default to tile size for all dimensions.
    a_w = TILE_SIZE;
    a_h = TILE_SIZE;
    b_w = TILE_SIZE;
    b_h = TILE_SIZE;
  }

  return a_x + a_w > b_x && a_x < b_x + b_w && a_y + a_h > b_y && a_y < b_y + b_h;
}

function getDistance(a_x, a_y, b_x, b_y) {

  // Move origins to centers.
  a_x += TILE_SIZE / 2;
  a_y += TILE_SIZE / 2;
  b_x += TILE_SIZE / 2;
  b_y += TILE_SIZE / 2;

  return Math.sqrt(Math.pow(b_x - a_x, 2) + Math.pow(b_y - a_y, 2));
}

function convertDegreesToRadians(degrees) {

  return degrees * Math.PI / 180;
}

// Miscellaneous.
let animation_ticks = 0;
let animation_frame = 0;

let heart_ticks = 90;

let score = 0;
let highscore = (localStorage.getItem("highscore") == null ? 5000 : localStorage.highscore);

let last_spawn_x = 0;

let texts = [];

let global_speed;

let state = STATE_INTRO;

let spawn_ticks = 0;
let spawn_platforms = false;
let move_background = false;

// This can't be 0.
let seed = 1;

function getRandomNumber() {

  // Use the so-called "xorshift algorithm" as described on https://en.wikipedia.org/wiki/Xorshift.

  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;

  let number = Math.abs(seed);

  let number_of_digits = number.toString().length;

  let divisor = "1";

  let i = 0;

  for (i; i < number_of_digits; ++i) {

    divisor += "0";
  }

  // Return a pseudo-random number between 0.0 and 1.0.
  return number / parseInt(divisor);
}

let birds_x = CANVAS_W + TILE_SIZE;
let birds_y = 0;

let special_tints = [

  Poyo.createColor(255, 0, 0),

  Poyo.createColor(255, 255, 0),

  Poyo.createColor(0, 255, 0),

  Poyo.createColor(0, 0, 255)
];

let reference_counter = 0;

function getRandomReference() {

  ++reference_counter;

  return reference_counter;
}

let background_y = CANVAS_H;
let background_vel_y = 0;

let hit_special = false;

let master_gain = 0.75;

function setSeed(s) {

  seed = s;
}

let music_speed = 1.0;

function getRandomRange(max) {

  return (getRandomNumber() * 100 | 0) % max;
}

let goal;
let goals_met;

let score_y = -TILE_SIZE;
let transitioned_score = false;

let show_try_again = false;
let defeat_y = -TILE_SIZE;
let show_again_direction = 1;

let hue = 0;
let target_hue = 0;
