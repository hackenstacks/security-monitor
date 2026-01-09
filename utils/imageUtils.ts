
/**
 * Captures the current frame of a video element and returns it as a base64 encoded JPEG.
 * @param videoElement The HTMLVideoElement to capture the frame from.
 * @returns A promise that resolves with the base64 data URL string, or null if an error occurs.
 */
export const captureFrameFromVideo = (videoElement: HTMLVideoElement): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!videoElement) {
      resolve(null);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(null);
      return;
    }

    // Set the video's current time to the beginning to capture a representative frame.
    // A small delay ensures the frame is loaded.
    videoElement.currentTime = 1; 
    
    videoElement.onseeked = () => {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Reset time and remove listener
        videoElement.currentTime = 0;
        videoElement.onseeked = null;

        // The result will be like "data:image/jpeg;base64,..."
        // We need to strip the prefix for the Gemini API.
        const base64Data = dataUrl.split(',')[1];
        resolve(base64Data || null);
    };

    videoElement.onerror = () => {
        videoElement.onseeked = null;
        videoElement.onerror = null;
        resolve(null);
    }
  });
};
