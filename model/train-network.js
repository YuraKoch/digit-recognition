import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadMnist } from './mnist.js';
import { calculateAccuracy, shuffleArray } from './helpers.js';
import { NeuralNetwork } from './neural-network.js';

const TRAIN_SIZE = 60000;
const TEST_SIZE = 10000;
const EPOCHS = 10;

async function trainNetwork() {
  const { training, test } = await loadMnist(TRAIN_SIZE, TEST_SIZE);

  console.log('Start training...');
  console.log(`Training size: ${training.length}`);
  console.log(`Test size: ${test.length}`);

  const network = new NeuralNetwork();

  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    const shuffledTraining = shuffleArray(training);
    for (const sample of shuffledTraining) {
      network.trainOnSample(sample);
    }
    console.log(`Epoch ${epoch}/${EPOCHS} | test accuracy: ${calculateAccuracy(network, test)}%`);
  }

  saveFileToRoot('weights.json', network.getWeights());
  console.log('Weights saved to weights.json');
}

function saveFileToRoot(filename, data) {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = dirname(currentFilePath);
  const projectRoot = join(currentDir, '..');
  const filePath = join(projectRoot, filename);

  writeFileSync(filePath, JSON.stringify(data));
}

await trainNetwork();
