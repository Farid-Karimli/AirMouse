const exponentialSmoothing = (newLandmarks, landmarkSetter, alpha) => {
  if (smoothedLandmarks.length === 0) {
    landmarkSetter(newLandmarks);
    return newLandmarks;
  }
  const smoothed = newLandmarks.map((landmark, index) => {
    const previous =
      smoothedLandmarks.length > 0 ? smoothedLandmarks[index] : landmark;

    return {
      x: alpha * landmark.x + (1 - alpha) * previous.x,
      y: alpha * landmark.y + (1 - alpha) * previous.y,
      z: alpha * landmark.z + (1 - alpha) * previous.z,
    };
  });

  return smoothed;
};

const movingAverageSmoothing = (
  newLandmarks,
  buffer,
  bufferSetter,
  bufferSize
) => {
  // Update the buffer with the new landmarks
  if (buffer === -1) {
    buffer = [];
  }
  const updatedBuffer = [...buffer, newLandmarks];
  if (updatedBuffer.length > bufferSize) {
    updatedBuffer.shift(); // Remove the oldest set of landmarks
  }
  bufferSetter(updatedBuffer);

  // Compute the average of the coordinates in the buffer
  const smoothed = newLandmarks.map((_, index) => {
    const sum = updatedBuffer.reduce(
      (acc, landmarks) => {
        acc.x += landmarks[index].x;
        acc.y += landmarks[index].y;
        acc.z += landmarks[index].z;
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );

    const count = updatedBuffer.length;
    return {
      x: sum.x / count,
      y: sum.y / count,
      z: sum.z / count,
    };
  });

  return smoothed;
};

export { exponentialSmoothing, movingAverageSmoothing };
