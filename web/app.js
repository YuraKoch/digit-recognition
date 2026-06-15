import { NeuralNetwork } from '../model/neural-network.js';
import { Board } from './board.js';
import weights from '../weights.json' with { type: 'json' };

const canvasElement = document.getElementById('canvas');
const resultElement = document.getElementById('result');

const network = new NeuralNetwork();
network.loadWeights(weights);

const board = new Board(canvasElement, resultElement, network);

document.getElementById('clear').addEventListener('click', () => board.reset());
