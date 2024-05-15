import * as React from "react";
import { createRoot } from "react-dom/client";
import { useEffect, useState, useRef, useCallback } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

const App = () => {
  const [webcamRunning, setWebcamRunning] = useState(true);
  const handLandmarkerRef = useRef(null); // Use useRef for mutable handLandmarker
  const [lastVideoTime, setLastVideoTime] = useState(-1);
  const [results, setResults] = useState(null);
  const animationFrameId = useRef(null); // Track the animation frame ID

  useEffect(() => {
    startVideo();
    createHandLandmarker();

    const video = document.getElementById("video");
    video.addEventListener("loadeddata", () => {
      if (webcamRunning) {
        predictWebcam();
      }
    });

    // Add event listener to the start button
    const startButton = document.getElementById("start");
    startButton.addEventListener("click", startDetection);

    // Cleanup event listeners on unmount
    return () => {
      video.removeEventListener("loadeddata", predictWebcam);
      startButton.removeEventListener("click", startDetection);
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
          videoElement.onloadedmetadata = () => {
            videoElement.play(); // Ensure the video plays once metadata is loaded
          };
          console.log("Webcam connected");
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
      numHands: 1,
    });

    handLandmarkerRef.current = handLandmarker; // Store in useRef
    console.log("HandLandmarker loaded: ", handLandmarker);
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
      setResults(newResults);

      if (newResults.landmarks) {
        for (const landmarks of newResults.landmarks) {
          console.log(landmarks);
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
      <div id="camera">
        <video autoPlay={true} width={600} height={300} id="video"></video>
        <button id="start">Stop</button>
      </div>
    </div>
  );
};

createRoot(document.body).render(<App />);
