import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { gunzipSync } from 'zlib';
import mnistData from 'mnist-data';

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '../node_modules/mnist-data/data');
const baseUrl = 'https://storage.googleapis.com/cvdf-datasets/mnist';

const files = [
  'train-images-idx3-ubyte',
  'train-labels-idx1-ubyte',
  't10k-images-idx3-ubyte',
  't10k-labels-idx1-ubyte',
];

export async function loadMnist(trainSize, testSize) {
  await ensureDownloaded();

  const training = loadSamples(mnistData.training(0, trainSize));
  const test = loadSamples(mnistData.testing(0, testSize));

  return { training, test };
}

async function ensureDownloaded() {
  const allFilesExist = files.every((file) => existsSync(join(dataDir, file)));

  if (allFilesExist) {
    return;
  }

  mkdirSync(dataDir, { recursive: true });

  for (const file of files) {
    await downloadFile(file);
  }

  console.log('MNIST data downloaded.');
}

async function downloadFile(file) {
  console.log(`Downloading ${file}...`);

  const response = await fetch(`${baseUrl}/${file}.gz`);
  if (!response.ok) throw new Error(`Could not download ${file}`);

  const compressed = Buffer.from(await response.arrayBuffer());
  const decompressed = gunzipSync(compressed);
  writeFileSync(join(dataDir, file), decompressed);
}

function loadSamples({ images, labels }) {
  return images.values.map((image, i) => ({
    input: flattenImage(image),
    output: digitToOneHotVector(labels.values[i]),
  }));
}

function flattenImage(image) {
  return image.flat().map((pixel) => pixel / 255);
}

// 5 -> [0, 0, 0, 0, 0, 1, 0, 0, 0, 0]
function digitToOneHotVector(digit) {
  const output = new Array(10).fill(0);
  output[digit] = 1;
  return output;
}
