import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBridgeY,
  getBridgePitch,
  getClearanceHeight,
  getWalkthroughCoords,
  BASE_Y,
  ARCH_RISE,
  HALF_LEN
} from './bridgeMath';

test('bridge elevation at midpoint (x=0) is peak arch elevation', () => {
  const peakY = getBridgeY(0);
  assert.equal(peakY, BASE_Y + ARCH_RISE);
});

test('bridge elevation at abutment ends (x=±HALF_LEN) equals base elevation', () => {
  assert.equal(getBridgeY(-HALF_LEN), BASE_Y);
  assert.equal(getBridgeY(HALF_LEN), BASE_Y);
});

test('bridge elevation beyond abutment ends remains clamped to base elevation', () => {
  assert.equal(getBridgeY(HALF_LEN + 10), BASE_Y);
  assert.equal(getBridgeY(-HALF_LEN - 10), BASE_Y);
});

test('bridge pitch at peak (x=0) is exactly 0 horizontal', () => {
  assert.equal(getBridgePitch(0), 0);
});

test('bridge pitch is symmetric and negative on positive X slope', () => {
  const pitchWest = getBridgePitch(-20);
  const pitchEast = getBridgePitch(20);
  assert.ok(pitchWest > 0, 'West incline should have positive upward slope');
  assert.ok(pitchEast < 0, 'East incline should have negative downward slope');
  assert.ok(Math.abs(pitchWest + pitchEast) < 1e-9, 'Slopes should be symmetric');
});

test('water clearance height is greatest at arch summit', () => {
  const midClearance = getClearanceHeight(0, 0.38);
  const abutmentClearance = getClearanceHeight(HALF_LEN, 0.38);
  assert.ok(midClearance > abutmentClearance);
  assert.ok(midClearance > 5.0, 'Summit clearance should be more than 5 meters above river');
});

test('walkthrough trajectory stays on the right side lane and moves East to West', () => {
  const start = getWalkthroughCoords(0);
  const mid = getWalkthroughCoords(0.5);
  const end = getWalkthroughCoords(1.0);

  assert.equal(start.position.x, 56.0);
  assert.equal(mid.position.x, 0.0);
  assert.equal(end.position.x, -56.0);

  // Both should be in right-hand lane (-Z)
  assert.equal(start.position.z, -1.65);
  assert.equal(mid.position.z, -1.65);
  assert.equal(end.position.z, -1.65);

  // Target points forward along the walking direction
  assert.ok(start.target.x < start.position.x);
});
