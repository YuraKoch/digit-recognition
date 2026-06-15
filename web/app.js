import { NeuralNetwork } from '../model/neural-network.js';
import { Board } from './board.js';

const canvasElement = document.getElementById('canvas');
const resultElement = document.getElementById('result');

resultElement.textContent = 'loading model...';

const response = await fetch('./weights.json');
const weights = await response.json();
const network = new NeuralNetwork();
network.loadWeights(weights);
resultElement.textContent = '';

const board = new Board(canvasElement, resultElement, network);

document.getElementById('clear').addEventListener('click', () => board.reset());
