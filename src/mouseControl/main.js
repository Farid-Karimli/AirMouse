import { mouse, Point, straightTo, screen } from "@nut-tree/nut-js";

// This is for testing.
async function moveToMiddle() {
  const width = await screen.width();
  const height = await screen.height();
  console.log(width, height);
  const middle = new Point(width / 2, height / 2);
  await mouse.move(straightTo(middle));
}

async function convertLandmarksToScreenCoords(landmark) {
  const width = await screen.width();
  const height = await screen.height();

  const x = width - landmark.x * width;
  const y = landmark.y * height;

  const screenCoords = new Point(x, y);
  return screenCoords;
}

async function moveMouse(landmark) {
  const screenCoords = await convertLandmarksToScreenCoords(landmark);
  await mouse.move(straightTo(screenCoords));
}

export default moveMouse;
