import { mouse, Point, straightTo, screen } from "@nut-tree/nut-js";
import { id2landmark, landmark2id } from "../utils/utils.js";

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

async function moveMouse(landmarks) {
  const indexFingerTip = landmarks[landmark2id["INDEX_FINGER_TIP"]];

  const screenCoords = await convertLandmarksToScreenCoords(indexFingerTip);
  await mouse.move(straightTo(screenCoords));
}

async function detectClick(handedness, landmarks) {
  const right_hand_index = 1;

  const thumb = landmarks[right_hand_index][landmark2id["THUMB_TIP"]];
  const index_finger =
    landmarks[right_hand_index][landmark2id["INDEX_FINGER_TIP"]];

  try {
    const distance = calculateDistance(thumb, index_finger);
    if (distance < 0.05) {
      await mouse.leftClick();
    }
  } catch (error) {
    console.error("Error in detectClick", error);
  }
}

const getHandIndex = (configHand, handedness) => {
  if (handedness.length === 1) {
    console.log("One hand detected. ", handedness);
    return 0;
  }
  console.log("Two hands detected. ", handedness);
  if (handedness[0][0].categoryName === configHand) {
    return 1;
  } else {
    return 0;
  }
};

export { moveMouse, detectClick, getHandIndex };
