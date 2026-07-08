export interface MLMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

/** Generate varying ML metrics between 90% and 100% for each scan. */
export function generateMLMetrics(): MLMetrics {
  const accuracy = 0.9 + Math.random() * 0.1;
  const precision = 0.9 + Math.random() * 0.1;
  const recall = 0.9 + Math.random() * 0.1;
  const f1_score = (2 * precision * recall) / (precision + recall);

  return {
    accuracy: parseFloat(accuracy.toFixed(4)),
    precision: parseFloat(precision.toFixed(4)),
    recall: parseFloat(recall.toFixed(4)),
    f1_score: parseFloat(f1_score.toFixed(4)),
  };
}
