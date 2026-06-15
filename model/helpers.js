export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function calculateAccuracy(network, samples) {
  let correctSamples = 0;
  const totalSamples = samples.length;

  for (const sample of samples) {
    const { probabilities } = network.forward(sample.input);
    const prediction = indexOfHighestValue(probabilities);
    const correctDigit = sample.output.indexOf(1);

    if (prediction === correctDigit) correctSamples++;
  }

  const accuracy = (correctSamples / totalSamples) * 100;
  return accuracy.toFixed(2);
}

export function indexOfHighestValue(values) {
  let bestIndex = 0;

  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[bestIndex]) bestIndex = i;
  }

  return bestIndex;
}

export function randomMatrix(rows, cols) {
  const scale = Math.sqrt(2 / rows);
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() * 2 - 1) * scale)
  );
}

export function sum(numbers) {
  return numbers.reduce((total, number) => total + number, 0);
}
