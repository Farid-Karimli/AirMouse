import * as React from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Sidebar from "./components/Sidebar.jsx";
import Button from "@mui/material/Button";
import { PlayArrow } from "@mui/icons-material";
import { moveMouse, detectClick, getHandIndex } from "./mouseControl/main.js";

import {
  exponentialSmoothing,
  movingAverageSmoothing,
} from "./mouseControl/smoothing.js";

import { config } from "./utils/config.js";

const App = () => {
  const [webcamRunning, setWebcamRunning] = useState(true);
  const handLandmarkerRef = useRef(null); // Use useRef for mutable handLandmarker
  const [lastVideoTime, setLastVideoTime] = useState(-1);
  const [results, setResults] = useState(null);
  const animationFrameId = useRef(null); // Track the animation frame ID
  const [smoothedLandmarks, setSmoothedLandmarks] = useState(-1);

  const [configuration, setConfiguration] = useState(config);

  const alpha = configuration.smoothness;
  const bufferSize = configuration.bufferSize;

  useEffect(() => {
    startVideo();
    createHandLandmarker();

    const video = document.getElementById("video");
    video.addEventListener("loadeddata", () => {
      if (webcamRunning) {
        predictWebcam();
      }
    });

    // Cleanup event listeners on unmount
    return () => {
      video.removeEventListener("loadeddata", predictWebcam);
      // startButton.removeEventListener("click", startDetection);
      cancelAnimationFrame(animationFrameId.current); // Cancel any pending animation frames
    };
  }, []);

  const startVideo = () => {
    const videoElement = document.getElementById("video");
    if (videoElement) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoElement.srcObject = stream;
          videoElement.onloadeddata = () => {
            console.log("Video metadata loaded and playing");
            videoElement.play();
          };
        })
        .catch((error) => {
          alert("Could not connect to webcam: " + error.message);
        });
    }
  };

  const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    ).catch((error) => {
      console.error("Failed to load the wasm file.", error);
    });
    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU",
      },
      runningMode: "video",
      numHands: 2,
    });

    handLandmarkerRef.current = handLandmarker; // Store in useRef
  };

  const predictWebcam = useCallback(async () => {
    if (!handLandmarkerRef.current || !webcamRunning) {
      return;
    }

    const video = document.getElementById("video");
    if (!video || video.readyState !== 4) {
      return;
    }

    const startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
      setLastVideoTime(video.currentTime);
      const newResults = await handLandmarkerRef.current.detectForVideo(
        video,
        startTimeMs
      );

      if (newResults.landmarks.length > 0) {
        const handIndex = getHandIndex(
          configuration.mainHand,
          newResults.handedness
        );
        const smoothed = movingAverageSmoothing(
          newResults.landmarks[handIndex],
          smoothedLandmarks,
          setSmoothedLandmarks,
          bufferSize
        );

        moveMouse(smoothed);

        if (newResults.landmarks.length > 1) {
          console.log(
            "Index 0 handedness: ",
            newResults.handedness[0][0].categoryName
          );
          console.log(
            "Index 1 handedness: ",
            newResults.handedness[1][0].categoryName
          );
          console.log(
            `Index of ${configuration.mainHand} hand: ${handIndex}  `
          );

          detectClick(newResults.handedness, newResults.landmarks);
        }
      }
    }

    // Schedule the next frame
    animationFrameId.current = window.requestAnimationFrame(predictWebcam);
  }, [lastVideoTime, webcamRunning]);

  const startDetection = () => {
    if (!handLandmarkerRef.current) {
      console.log("Wait! handLandmarker not loaded yet.");
      return;
    }

    setWebcamRunning((prevRunning) => {
      const newRunning = !prevRunning;
      const startButton = document.getElementById("start");
      startButton.innerText = newRunning ? "Stop" : "Start";

      if (newRunning) {
        predictWebcam();
      } else {
        cancelAnimationFrame(animationFrameId.current); // Cancel any pending animation frames
      }

      return newRunning;
    });
  };

  return (
    <div id="main">
      <header>
        <p>AirMouse</p>
      </header>
      <div id="content">
        <Sidebar
          configuration={configuration}
          setConfiguration={setConfiguration}
        />
        <div id="camera">
          <video
            autoPlay={true}
            width={800}
            height={400}
            id="video"
            style={{ transform: "scaleX(-1)" }}
          ></video>
          <Button
            id="start"
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={startDetection}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
};

createRoot(document.body).render(<App />);
