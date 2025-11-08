"use strict";

// Bitmaps.
let bitmap_text;
let bitmap_atlas;
let bitmap_light;
let bitmap_score;
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

// Miscellaneous.
let animation_ticks = 0;
let animation_frame = 0;

let heart_ticks = 90;

let score = 0;
let highscore = (localStorage.getItem("highscore") === null ? 5000 : localStorage.highscore);

let last_spawn_x = 0;

let texts = [];

let global_speed;

let state = STATE_INTRO;

let spawn_ticks = 0;
let spawn_platforms = false;
let move_background = false;

// This can't be 0.
let seed = 1;

let birds_x = CANVAS_W + TILE_SIZE;
let birds_y = 0;

let special_tints = [

  Poyo.createColor(255, 0, 0),

  Poyo.createColor(255, 255, 0),

  Poyo.createColor(0, 255, 0),

  Poyo.createColor(0, 0, 255)
];

let background_y = CANVAS_H;
let background_vel_y = 0;

let hit_special = false;

let master_gain = 0.75;

let music_speed = 1.0;

let goal;
let goals_met;

let score_y = -TILE_SIZE;
let transitioned_score = false;

let show_try_again = false;
let defeat_y = -TILE_SIZE;
let show_again_direction = 1;

let hue = 0;
let target_hue = 0;
