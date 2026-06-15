# Digit Recognition

A neural network for recognizing handwritten MNIST digits, written from scratch in pure JavaScript.

Architecture:
**784 → 256 → 10** (sigmoid + softmax)

## Quick start

```bash
npm install
npm run train
```

The first run downloads the full MNIST dataset (60,000 train + 10,000 test images) into `node_modules/mnist-data/data/`.
After training, `weights.json` is created in the project root.
