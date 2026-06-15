import { randomMatrix, sum } from './helpers.js';

const INPUT_SIZE = 784;
const HIDDEN_SIZE = 256;
const OUTPUT_SIZE = 10;
const LEARNING_RATE = 0.1;

export class NeuralNetwork {
  constructor() {
    this.hiddenWeights = randomMatrix(INPUT_SIZE, HIDDEN_SIZE);
    this.hiddenBiases = new Array(HIDDEN_SIZE).fill(0);
    this.outputWeights = randomMatrix(HIDDEN_SIZE, OUTPUT_SIZE);
    this.outputBiases = new Array(OUTPUT_SIZE).fill(0);
  }

  forward(input) {
    const hiddenScores = calculateLayerScores(input, this.hiddenWeights, this.hiddenBiases);
    const hiddenActivations = hiddenScores.map(sigmoid);

    const outputScores = calculateLayerScores(hiddenActivations, this.outputWeights, this.outputBiases);
    const probabilities = softmax(outputScores);

    return { hiddenActivations, probabilities };
  }

  trainOnSample(sample) {
    const { input, output } = sample;
    const { hiddenActivations, probabilities } = this.forward(input);

    const outputErrors = calculateOutputErrors(probabilities, output);
    const hiddenErrors = calculateHiddenErrors(outputErrors, this.outputWeights, hiddenActivations);

    this.updateWeightsWithErrors(this.outputWeights, this.outputBiases, hiddenActivations, outputErrors);
    this.updateWeightsWithErrors(this.hiddenWeights, this.hiddenBiases, input, hiddenErrors);
  }

  // for each connection in current layer
  // weight = weight - LEARNING_RATE * previousLayerValue * error
  // bias = bias - LEARNING_RATE * error
  updateWeightsWithErrors(weights, biases, previousLayer, errors) {
    previousLayer.forEach((previousValue, previousNeuron) => {
      // errors size is same as current layer size
      errors.forEach((error, currentNeuron) => {
        const weightChange = LEARNING_RATE * previousValue * error;
        weights[previousNeuron][currentNeuron] -= weightChange;
      });
    });

    // errors size is same as biases size
    errors.forEach((error, currentNeuron) => {
      const biasChange = LEARNING_RATE * error;
      biases[currentNeuron] -= biasChange;
    });
  }

  getWeights() {
    return {
      hiddenWeights: this.hiddenWeights,
      hiddenBiases: this.hiddenBiases,
      outputWeights: this.outputWeights,
      outputBiases: this.outputBiases,
    };
  }

  loadWeights(weights) {
    this.hiddenWeights = weights.hiddenWeights;
    this.hiddenBiases = weights.hiddenBiases;
    this.outputWeights = weights.outputWeights;
    this.outputBiases = weights.outputBiases;
  }
}

// for each neuron in current layer
// score = sum(previousLayerValue * connectionWeight) + bias
function calculateLayerScores(previousLayer, weights, biases) {
  // biases size is same as current layer size
  return biases.map((bias, currentNeuron) => {
    const weightedInputs = previousLayer.map((previousValue, previousNeuron) => {
      const connectionWeight = weights[previousNeuron][currentNeuron];
      return previousValue * connectionWeight;
    });

    const score = sum(weightedInputs) + bias;
    return score;
  });
}

// for softmax + cross-entropy output error is prediction - target
function calculateOutputErrors(probabilities, target) {
  return probabilities.map((probability, i) => probability - target[i]);
}

// for each neuron in hidden layer
// error = sum(outputError * connectionWeight) * sigmoid'(activation)
function calculateHiddenErrors(outputErrors, outputWeights, hiddenActivations) {
  // hiddenActivations size is same as hidden layer size
  return hiddenActivations.map((activation, hiddenNeuron) => {
    const weightedErrors = outputErrors.map((outputError, outputNeuron) => {
      const connectionWeight = outputWeights[hiddenNeuron][outputNeuron];
      return outputError * connectionWeight;
    });

    const error = sum(weightedErrors) * sigmoidDerivative(activation);
    return error;
  });
}

function sigmoid(score) {
  return 1 / (1 + Math.exp(-score));
}

function sigmoidDerivative(activation) {
  return activation * (1 - activation);
}

function softmax(scores) {
  const exps = scores.map((score) => Math.exp(score));
  const sumOfExps = sum(exps);
  return exps.map((exp) => exp / sumOfExps);
}
