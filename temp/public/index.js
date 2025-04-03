// Wrap in an async IIFE to use await at the top level.
(async function() {
    // Load pre-trained models from the "models" folder (ensure the model files are there)
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models')
    ]);
  
    // Start the video stream
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        video.srcObject = stream;
      })
      .catch(err => console.error("Error accessing webcam:", err));
  
    // When video is playing, start processing frames
    video.addEventListener('play', () => {
      const canvas = document.getElementById('overlay');
      // Match canvas dimensions to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
  
      // Run face detection every 100 ms
      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
  
        // Resize detections to display size
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the detections and landmarks on the canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  
        // To authenticate, you could compare the computed face descriptor (resizedDetections[n].descriptor)
        // with stored embeddings using a distance metric.
      }, 100);
    });
  })();
  