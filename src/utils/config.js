export const config = {
  mainHand: "Right", // ["Left", "Right"]

  clickGesture: "index-thumb-pinch",
  clickGestureThreshold: 0.5,

  smoothingTechnique: "exponential", // ["exponential", "moving-average"]
  smoothness: 0.2, // alpha for exponential smoothing
  bufferSize: 5, // buffer size for moving average smoothing
};
