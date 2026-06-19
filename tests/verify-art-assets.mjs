import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifestPath = path.join(root, 'assets/images/manifest.json');
const entries = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.ok(Array.isArray(entries), 'manifest must be an array');
assert.equal(entries.length, 21, 'manifest must contain exactly 21 assets');
assert.equal(new Set(entries.map(({ id }) => id)).size, 21, 'asset IDs must be unique');

const roles = { home: 0, scene: 0, badge: 0 };
for (const entry of entries) {
  assert.ok(Object.hasOwn(roles, entry.role), `${entry.id}: invalid role`);
  roles[entry.role] += 1;
}
assert.deepEqual(roles, { home: 1, scene: 10, badge: 10 }, 'role counts must be 1/10/10');

const home = entries.filter(({ role }) => role === 'home');
assert.equal(home[0].day, null, 'home day must be null');
assert.equal(home[0].sceneId, null, 'home sceneId must be null');

for (const role of ['scene', 'badge']) {
  const roleEntries = entries.filter((entry) => entry.role === role);
  assert.deepEqual(
    roleEntries.map(({ day }) => day).sort((a, b) => a - b),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    `${role} days must be complete and unique`,
  );
  assert.equal(
    new Set(roleEntries.map(({ sceneId }) => sceneId)).size,
    10,
    `${role} sceneIds must be unique`,
  );
}

for (let day = 1; day <= 10; day += 1) {
  const scene = entries.find((entry) => entry.role === 'scene' && entry.day === day);
  const badge = entries.find((entry) => entry.role === 'badge' && entry.day === day);
  assert.equal(badge.sceneId, scene.sceneId, `day ${day}: scene and badge sceneId must match`);
}

function dimensionsWithSips(file) {
  const result = spawnSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  });
  if (result.error?.code === 'ENOENT') return null;
  assert.equal(result.status, 0, `${file}: sips could not read image dimensions`);
  const width = Number(result.stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(result.stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
  assert.ok(width && height, `${file}: sips returned no image dimensions`);
  return { width, height };
}

function dimensionsFromFile(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.subarray(1, 4).toString('ascii') === 'PNG') {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }

  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${file}: unsupported image format`);
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${file}: invalid WebP`);
  const chunk = bytes.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X') {
    return {
      width: 1 + bytes.readUIntLE(24, 3),
      height: 1 + bytes.readUIntLE(27, 3),
    };
  }
  if (chunk === 'VP8 ') {
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >> 14) & 0x3fff),
    };
  }
  assert.fail(`${file}: unsupported WebP encoding`);
}

for (const entry of entries) {
  assert.match(entry.source, /^assets\/images\/source\/.+\.png$/, `${entry.id}: invalid source path`);
  assert.match(
    entry.shipping,
    new RegExp(`^assets/images/${entry.role === 'home' ? 'home' : `${entry.role}s`}/.+\\.webp$`),
    `${entry.id}: invalid shipping path`,
  );
  assert.deepEqual(
    entry.expected,
    entry.role === 'badge'
      ? { aspect: 'square', minWidth: 512, minHeight: 512 }
      : { aspect: 'landscape', minWidth: 1600, minHeight: 900 },
    `${entry.id}: invalid expected image metadata`,
  );

  for (const relativePath of [entry.source, entry.shipping]) {
    const file = path.join(root, relativePath);
    assert.ok(fs.existsSync(file), `${relativePath}: missing`);
    assert.ok(fs.statSync(file).size > 0, `${relativePath}: empty`);
    const { width, height } = dimensionsWithSips(file) ?? dimensionsFromFile(file);
    assert.ok(width >= entry.expected.minWidth, `${relativePath}: width ${width} is too small`);
    assert.ok(height >= entry.expected.minHeight, `${relativePath}: height ${height} is too small`);
    if (entry.expected.aspect === 'square') {
      assert.equal(width, height, `${relativePath}: badge must be square`);
    } else {
      assert.ok(width > height, `${relativePath}: home/scene image must be landscape`);
    }
  }
}

console.log('PASS mythic art asset manifest and files');
