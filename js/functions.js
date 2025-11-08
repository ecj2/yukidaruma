"use strict";

function setSeed(s) {

  seed = s;
}

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

function getRandomRange(max) {

  return (getRandomNumber() * 100 | 0) % max;
}

function isColliding(a_x, a_y, b_x, b_y, a_w, a_h, b_w, b_h) {

  if (a_w === undefined || a_h === undefined || b_w === undefined || b_h === undefined) {

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
