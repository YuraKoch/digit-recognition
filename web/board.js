import { indexOfHighestValue } from '../model/helpers.js';

const STROKE_WIDTH = 22;
const INPUT_SIZE = 28;

export class Board {
  constructor(canvasElement, resultElement, network) {
    this.canvasElement = canvasElement;
    this.resultElement = resultElement;
    this.network = network;
    this.ctx = canvasElement.getContext('2d');
    this.isDrawing = false;

    canvasElement.addEventListener('pointerdown', (event) => this.startDrawing(event));
    canvasElement.addEventListener('pointermove', (event) => this.draw(event));
    canvasElement.addEventListener('pointerup', () => this.stopDrawing());
    canvasElement.addEventListener('pointerleave', () => this.stopDrawing());

    this.reset();
  }

  reset() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = STROKE_WIDTH;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.resultElement.textContent = '';
  }

  predict() {
    if (!this.network) return;

    const input = this.readInput();
    const { probabilities } = this.network.forward(input);
    const digit = indexOfHighestValue(probabilities);
    const probability = probabilities[digit];

    console.log(`this is ${digit} and probability is ${probability}`);
    this.resultElement.textContent = probability > 0.75
      ? `this is ${digit}`
      : 'I don\'t know';
  }

  readInput() {
    const small = document.createElement('canvas');
    small.width = INPUT_SIZE;
    small.height = INPUT_SIZE;

    const smallCtx = small.getContext('2d');
    smallCtx.drawImage(this.canvasElement, 0, 0, INPUT_SIZE, INPUT_SIZE);

    const { data } = smallCtx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
    const input = [];

    for (let pixel = 0; pixel < INPUT_SIZE * INPUT_SIZE; pixel++) {
      input.push(data[pixel * 4] / 255);
    }

    return input;
  }

  startDrawing(event) {
    event.preventDefault();
    this.isDrawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  draw(event) {
    if (!this.isDrawing) return;

    event.preventDefault();
    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    this.predict();
  }
}
