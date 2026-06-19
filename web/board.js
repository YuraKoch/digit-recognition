import { indexOfHighestValue } from '../model/helpers.js';

const STROKE_WIDTH = 20;
const INPUT_SIZE = 28;
const DRAWN_PIXEL_THRESHOLD = 10;
const MIN_PROBABILITY_TO_PREDICT = 0.8;
const MIN_FILL_RATIO = 0.6;
const MAX_FILL_RATIO = 0.7;

export class Board {
  constructor(canvasElement, resultElement, network) {
    this.canvasElement = canvasElement;
    this.resultElement = resultElement;
    this.network = network;
    this.ctx = canvasElement.getContext('2d');
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = STROKE_WIDTH;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
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
    this.resultElement.textContent = '';
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

  predict() {
    if (!this.network) return;

    const input = this.readInput();
    const { probabilities } = this.network.forward(input);
    const digit = indexOfHighestValue(probabilities);
    const probability = probabilities[digit];

    console.log(`this is ${digit} and probability is ${probability}`);
    this.resultElement.textContent = probability > MIN_PROBABILITY_TO_PREDICT
      ? `this is ${digit}`
      : 'I don\'t know';
  }

  readInput() {
    const centeredDrawing = this.createCenteredScaledDrawing();
    const networkInputCanvas = this.resizeToInputSize(centeredDrawing);
    return this.convertToNormalizedInput(networkInputCanvas);
  }

  createCenteredScaledDrawing() {
    const bounds = this.findDrawingBounds();

    if (!bounds) return this.canvasElement;

    const { width, height } = this.canvasElement;
    const canvasSize = width || height;
    const drawingWidth = bounds.width;
    const drawingHeight = bounds.height;
    const drawingSize = Math.max(bounds.width, bounds.height);
    const scale = this.calculateScaleFactor(drawingSize, canvasSize);

    const scaledWidth = drawingWidth * scale;
    const scaledHeight = drawingHeight * scale;
    const destinationX = (width - scaledWidth) / 2;
    const destinationY = (height - scaledHeight) / 2;

    const centeredCanvas = document.createElement('canvas');
    centeredCanvas.width = width;
    centeredCanvas.height = height;

    const centeredCtx = centeredCanvas.getContext('2d');
    centeredCtx.fillStyle = '#000';
    centeredCtx.fillRect(0, 0, width, height);
    centeredCtx.drawImage(
      this.canvasElement,
      bounds.minX, bounds.minY, drawingWidth, drawingHeight,
      destinationX, destinationY, scaledWidth, scaledHeight,
    );

    return centeredCanvas;
  }

  findDrawingBounds() {
    const { width, height } = this.canvasElement;
    const { data } = this.ctx.getImageData(0, 0, width, height);

    let bounds = null;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        // each pixel has 4 values: red, green, blue, alpha
        const redIndex = pixelIndex * 4;
        // const greenIndex = pixelIndex * 4 + 1;
        // const blueIndex = pixelIndex * 4 + 2;
        // const alphaIndex = pixelIndex * 4 + 3;
        const redChannel = data[redIndex]; // min 0, max 255
        const isDrawnPixel = redChannel > DRAWN_PIXEL_THRESHOLD;

        if (!isDrawnPixel) {
          continue;
        }

        if (!bounds) {
          bounds = { minX: x, minY: y, maxX: x, maxY: y };
          continue;
        }

        bounds.minX = Math.min(bounds.minX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.maxY = Math.max(bounds.maxY, y);
        bounds.width = bounds.maxX - bounds.minX + 1;
        bounds.height = bounds.maxY - bounds.minY + 1;
      }
    }

    return bounds;
  }

  calculateScaleFactor(drawingSize, canvasSize) {
    const fillRatio = drawingSize / canvasSize;

    if (fillRatio < MIN_FILL_RATIO) {
      return (canvasSize * MIN_FILL_RATIO) / drawingSize;
    }
    if (fillRatio > MAX_FILL_RATIO) {
      return (canvasSize * MAX_FILL_RATIO) / drawingSize;
    }
    return 1;
  }

  resizeToInputSize(canvas) {
    const smallCanvas = document.createElement('canvas');
    smallCanvas.width = INPUT_SIZE;
    smallCanvas.height = INPUT_SIZE;

    const smallCtx = smallCanvas.getContext('2d');
    smallCtx.drawImage(canvas, 0, 0, INPUT_SIZE, INPUT_SIZE);

    return smallCanvas;
  }

  convertToNormalizedInput(canvas) {
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);

    const normalizedInput = [];

    for (let pixel = 0; pixel < INPUT_SIZE * INPUT_SIZE; pixel++) {
      const redIndex = pixel * 4;
      const redChannel = data[redIndex]; // min 0, max 255
      const normalizedValue = redChannel / 255; // min 0, max 1
      normalizedInput.push(normalizedValue);
    }

    return normalizedInput;
  }
}
