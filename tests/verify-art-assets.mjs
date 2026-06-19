import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifestPath = path.join(root, 'assets/images/manifest.json');
const entries = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.ok(Array.isArray(entries), 'manifest must be an array');
assert.equal(entries.length, 21, 'manifest must contain exactly 21 assets');
assert.equal(new Set(entries.map(({ id }) => id)).size, 21, 'asset IDs must be unique');
assert.equal(new Set(entries.map(({ source }) => source)).size, 21, 'source paths must be unique');
assert.equal(new Set(entries.map(({ shipping }) => shipping)).size, 21, 'shipping paths must be unique');

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

function dimensionsWithPillow(file) {
  const script = [
    'from PIL import Image',
    'import sys',
    'with Image.open(sys.argv[1]) as image:',
    '    image.verify()',
    'with Image.open(sys.argv[1]) as image:',
    '    image.load()',
    '    print(f"{image.width} {image.height}")',
  ].join('\n');
  const result = spawnSync('python3', ['-c', script, file], { encoding: 'utf8' });
  if (result.error?.code === 'ENOENT') return null;
  if (result.error) assert.fail(`${file}: unable to launch Pillow probe: ${result.error.message}`);
  const stderr = result.stderr.trim();
  if (result.status !== 0 && /No module named ['"]PIL/.test(stderr)) return null;
  assert.equal(
    result.status,
    0,
    `${file}: Pillow could not decode image${stderr ? `: ${stderr}` : ''}`,
  );
  const match = result.stdout.trim().match(/^(\d+) (\d+)$/);
  assert.ok(match, `${file}: Pillow returned no image dimensions`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

function decodedDimensions(file) {
  const dimensions = dimensionsWithSips(file) ?? dimensionsWithPillow(file);
  assert.ok(
    dimensions,
    'No real image decoder is available; install macOS sips or Python 3 with Pillow',
  );
  return dimensions;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngDimensions(bytes, file) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.ok(bytes.length >= 33, `${file}: truncated PNG`);
  assert.ok(bytes.subarray(0, 8).equals(signature), `${file}: invalid PNG signature`);

  let offset = 8;
  let dimensions;
  let sawIend = false;
  let sawIdat = false;
  let chunkIndex = 0;
  while (offset < bytes.length) {
    assert.ok(offset + 12 <= bytes.length, `${file}: truncated PNG chunk header`);
    const payloadLength = bytes.readUInt32BE(offset);
    const type = bytes.subarray(offset + 4, offset + 8).toString('ascii');
    const payloadStart = offset + 8;
    const payloadEnd = payloadStart + payloadLength;
    const chunkEnd = payloadEnd + 4;
    assert.ok(payloadEnd >= payloadStart && chunkEnd <= bytes.length, `${file}: truncated PNG ${type} chunk`);
    assert.equal(
      bytes.readUInt32BE(payloadEnd),
      crc32(bytes.subarray(offset + 4, payloadEnd)),
      `${file}: invalid PNG ${type} CRC`,
    );

    if (chunkIndex === 0) {
      assert.equal(type, 'IHDR', `${file}: invalid PNG first chunk`);
      assert.equal(payloadLength, 13, `${file}: invalid PNG IHDR length`);
      const width = bytes.readUInt32BE(payloadStart);
      const height = bytes.readUInt32BE(payloadStart + 4);
      assert.ok(width > 0 && width <= 0x7fffffff, `${file}: invalid PNG width`);
      assert.ok(height > 0 && height <= 0x7fffffff, `${file}: invalid PNG height`);
      const bitDepth = bytes[payloadStart + 8];
      const colorType = bytes[payloadStart + 9];
      const validDepths = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
      };
      assert.ok(validDepths[colorType]?.includes(bitDepth), `${file}: invalid PNG color type/bit depth`);
      assert.equal(bytes[payloadStart + 10], 0, `${file}: invalid PNG compression method`);
      assert.equal(bytes[payloadStart + 11], 0, `${file}: invalid PNG filter method`);
      assert.ok(bytes[payloadStart + 12] <= 1, `${file}: invalid PNG interlace method`);
      dimensions = { width, height };
    }
    if (type === 'IDAT') {
      assert.ok(payloadLength > 0, `${file}: invalid PNG empty IDAT`);
      sawIdat = true;
    }
    if (type === 'IEND') {
      assert.equal(payloadLength, 0, `${file}: invalid PNG IEND length`);
      assert.equal(chunkEnd, bytes.length, `${file}: invalid PNG data after IEND`);
      sawIend = true;
    }

    offset = chunkEnd;
    chunkIndex += 1;
  }
  assert.ok(sawIdat, `${file}: invalid PNG missing IDAT`);
  assert.ok(sawIend, `${file}: invalid PNG missing IEND`);
  return dimensions;
}

function webpChunk(bytes, offset, file) {
  assert.ok(offset + 8 <= bytes.length, `${file}: truncated WebP chunk header`);
  const type = bytes.subarray(offset, offset + 4).toString('ascii');
  const payloadLength = bytes.readUInt32LE(offset + 4);
  const payloadStart = offset + 8;
  const payloadEnd = payloadStart + payloadLength;
  const chunkEnd = payloadEnd + (payloadLength & 1);
  assert.ok(payloadEnd >= payloadStart && chunkEnd <= bytes.length, `${file}: truncated WebP ${type} chunk`);
  return { type, payloadLength, payloadStart, payloadEnd, chunkEnd };
}

function webpImageDimensions(bytes, chunk, file) {
  const { type, payloadLength, payloadStart } = chunk;
  if (type === 'VP8 ') {
    assert.ok(payloadLength > 10, `${file}: truncated WebP VP8 payload`);
    assert.equal(bytes[payloadStart] & 1, 0, `${file}: invalid WebP VP8 key frame`);
    assert.ok(
      bytes.subarray(payloadStart + 3, payloadStart + 6).equals(Buffer.from([0x9d, 0x01, 0x2a])),
      `${file}: invalid WebP VP8 signature`,
    );
    const width = bytes.readUInt16LE(payloadStart + 6) & 0x3fff;
    const height = bytes.readUInt16LE(payloadStart + 8) & 0x3fff;
    assert.ok(width > 0 && height > 0, `${file}: invalid WebP VP8 dimensions`);
    return { width, height };
  }
  if (type === 'VP8L') {
    assert.ok(payloadLength > 5, `${file}: truncated WebP VP8L payload`);
    assert.equal(bytes[payloadStart], 0x2f, `${file}: invalid WebP VP8L signature`);
    const bits = bytes.readUInt32LE(payloadStart + 1);
    assert.equal(bits >>> 29, 0, `${file}: invalid WebP VP8L version`);
    return {
      width: 1 + (bits & 0x3fff),
      height: 1 + ((bits >>> 14) & 0x3fff),
    };
  }
  assert.fail(`${file}: invalid WebP image chunk ${type}`);
}

function webpDimensions(bytes, file) {
  assert.ok(bytes.length >= 20, `${file}: truncated WebP`);
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${file}: invalid WebP RIFF signature`);
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${file}: invalid WebP signature`);
  assert.equal(bytes.readUInt32LE(4), bytes.length - 8, `${file}: invalid WebP RIFF size`);

  const first = webpChunk(bytes, 12, file);
  assert.ok(['VP8 ', 'VP8L', 'VP8X'].includes(first.type), `${file}: invalid WebP first chunk ${first.type}`);
  if (first.type !== 'VP8X') {
    assert.equal(first.chunkEnd, bytes.length, `${file}: invalid WebP trailing chunks`);
    return webpImageDimensions(bytes, first, file);
  }

  assert.equal(first.payloadLength, 10, `${file}: invalid WebP VP8X length`);
  const dimensions = {
    width: 1 + bytes.readUIntLE(first.payloadStart + 4, 3),
    height: 1 + bytes.readUIntLE(first.payloadStart + 7, 3),
  };
  let offset = first.chunkEnd;
  let imageCount = 0;
  while (offset < bytes.length) {
    const chunk = webpChunk(bytes, offset, file);
    if (chunk.type === 'VP8 ' || chunk.type === 'VP8L') {
      const imageDimensions = webpImageDimensions(bytes, chunk, file);
      assert.deepEqual(imageDimensions, dimensions, `${file}: invalid WebP canvas dimensions`);
      imageCount += 1;
    }
    offset = chunk.chunkEnd;
  }
  assert.equal(offset, bytes.length, `${file}: invalid WebP chunk bounds`);
  assert.equal(imageCount, 1, `${file}: invalid WebP image payload count`);
  return dimensions;
}

function dimensionsFromFile(file) {
  const bytes = fs.readFileSync(file);
  const extension = path.extname(file).toLowerCase();
  if (extension === '.png') return pngDimensions(bytes, file);
  if (extension === '.webp') return webpDimensions(bytes, file);
  assert.fail(`${file}: unsupported image extension`);
}

function assertSafeAssetPath(relativePath, expectedDirectory, extension, label) {
  assert.equal(typeof relativePath, 'string', `${label}: path must be a string`);
  assert.ok(!path.posix.isAbsolute(relativePath), `${label}: absolute paths are forbidden`);
  assert.ok(!path.win32.isAbsolute(relativePath), `${label}: absolute paths are forbidden`);
  assert.ok(!relativePath.split(/[\\/]/).includes('..'), `${label}: path traversal is forbidden`);
  assert.equal(path.posix.normalize(relativePath), relativePath, `${label}: path must be normalized`);
  assert.ok(
    relativePath.startsWith(`${expectedDirectory}/`),
    `${label}: path must stay under ${expectedDirectory}/`,
  );
  assert.equal(path.posix.extname(relativePath), extension, `${label}: path must end in ${extension}`);
  const expectedRoot = path.resolve(root, expectedDirectory);
  const resolved = path.resolve(root, relativePath);
  assert.ok(resolved.startsWith(`${expectedRoot}${path.sep}`), `${label}: path escapes expected root`);
}

assert.throws(
  () => assertSafeAssetPath('/tmp/escape.png', 'assets/images/source', '.png', 'fixture'),
  /absolute paths are forbidden/,
  'asset paths must reject absolute paths',
);
assert.throws(
  () => assertSafeAssetPath('assets/images/source/../escape.png', 'assets/images/source', '.png', 'fixture'),
  /path traversal is forbidden/,
  'asset paths must reject parent traversal',
);

const fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'mythic-art-verifier-'));
try {
  const malformedPng = Buffer.alloc(24);
  malformedPng.write('PNG', 1, 'ascii');
  malformedPng.writeUInt32BE(1600, 16);
  malformedPng.writeUInt32BE(900, 20);
  const malformedPngPath = path.join(fixtureDirectory, 'malformed.png');
  fs.writeFileSync(malformedPngPath, malformedPng);
  assert.throws(
    () => dimensionsFromFile(malformedPngPath),
    /invalid PNG|truncated PNG/,
    'fallback must reject malformed PNG headers',
  );

  const pngChunkFixture = (type, payload) => {
    const typeBytes = Buffer.from(type, 'ascii');
    const chunk = Buffer.alloc(12 + payload.length);
    chunk.writeUInt32BE(payload.length, 0);
    typeBytes.copy(chunk, 4);
    payload.copy(chunk, 8);
    chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, payload])), 8 + payload.length);
    return chunk;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1600, 0);
  ihdr.writeUInt32BE(900, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const headerOnlyPng = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunkFixture('IHDR', ihdr),
    pngChunkFixture('IDAT', Buffer.alloc(0)),
    pngChunkFixture('IEND', Buffer.alloc(0)),
  ]);
  const headerOnlyPngPath = path.join(fixtureDirectory, 'header-only.png');
  fs.writeFileSync(headerOnlyPngPath, headerOnlyPng);
  assert.throws(
    () => dimensionsFromFile(headerOnlyPngPath),
    /invalid PNG empty IDAT/,
    'fallback must reject a PNG with no compressed image payload',
  );

  const malformedWebp = Buffer.alloc(30);
  malformedWebp.write('RIFF', 0, 'ascii');
  malformedWebp.writeUInt32LE(22, 4);
  malformedWebp.write('WEBPVP8 ', 8, 'ascii');
  malformedWebp.writeUInt32LE(10, 16);
  malformedWebp[20] = 0;
  malformedWebp.set([0x9d, 0x01, 0x2a], 23);
  malformedWebp.writeUInt16LE(1600, 26);
  malformedWebp.writeUInt16LE(900, 28);
  const malformedWebpPath = path.join(fixtureDirectory, 'malformed.webp');
  fs.writeFileSync(malformedWebpPath, malformedWebp);
  assert.throws(
    () => dimensionsFromFile(malformedWebpPath),
    /truncated WebP VP8 payload/,
    'fallback must reject header-only VP8',
  );

  const headerOnlyVp8l = Buffer.alloc(26);
  headerOnlyVp8l.write('RIFF', 0, 'ascii');
  headerOnlyVp8l.writeUInt32LE(18, 4);
  headerOnlyVp8l.write('WEBPVP8L', 8, 'ascii');
  headerOnlyVp8l.writeUInt32LE(5, 16);
  headerOnlyVp8l[20] = 0x2f;
  const vp8lBits = (1599 | (899 << 14)) >>> 0;
  headerOnlyVp8l.writeUInt32LE(vp8lBits, 21);
  const headerOnlyVp8lPath = path.join(fixtureDirectory, 'header-only-vp8l.webp');
  fs.writeFileSync(headerOnlyVp8lPath, headerOnlyVp8l);
  assert.throws(
    () => dimensionsFromFile(headerOnlyVp8lPath),
    /truncated WebP VP8L payload/,
    'fallback must reject header-only VP8L',
  );
} finally {
  fs.rmSync(fixtureDirectory, { recursive: true, force: true });
}

for (const entry of entries) {
  assertSafeAssetPath(entry.source, 'assets/images/source', '.png', `${entry.id} source`);
  assertSafeAssetPath(
    entry.shipping,
    `assets/images/${entry.role === 'home' ? 'home' : `${entry.role}s`}`,
    '.webp',
    `${entry.id} shipping`,
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
    const structuralDimensions = dimensionsFromFile(file);
    const { width, height } = decodedDimensions(file);
    assert.deepEqual(
      { width, height },
      structuralDimensions,
      `${relativePath}: decoder dimensions do not match image header`,
    );
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
