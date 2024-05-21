import { mouse, Point, straightTo, screen } from "@nut-tree/nut-js";
// import { id2landmark, landmark2id } from "../utils/utils.js";

const calculateDistance = (point1, point2) => {
  return Math.sqrt(
    Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
  );
};

// This is for testing.
async function moveToMiddle() {
  const width = await screen.width();
  const height = await screen.height();
  //console.log(width, height);
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

async function moveMouse(handedness, landmarks) {
  var index = 0;
  /* if (handedness[0][0].category_name == "Left" || handedness.length == 1) {
    index = 0;
  } else {
    index = 1;
  } */

  const indexFingerTip = landmarks[index][8];

  const screenCoords = await convertLandmarksToScreenCoords(indexFingerTip);
  await mouse.move(straightTo(screenCoords));
}

async function detectClick(handedness, landmarks) {
  const right_hand_index = 1;

  const thumb = landmarks[right_hand_index][4];
  const index_finger = landmarks[right_hand_index][8];

  const distance = calculateDistance(thumb, index_finger);
  if (distance < 0.05) {
    await mouse.leftClick();
  }
}
export { moveMouse, detectClick };
