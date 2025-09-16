
import React, { useState, useRef, useCallback } from 'react';
import { LoadingIcon } from './LoadingIcon';

interface ImageInputProps {
  onImageSelect: (imageBase64: string) => void;
  isLoading: boolean;
}

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, isLoading }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
            console.error("Video play error:", err);
            setCameraError("Could not start video playback. Please check permissions and device.");
        });
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access denied or error:", err);
      setCameraError("Camera access denied or not available. Please check browser permissions.");
      setIsCameraOpen(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64String = canvas.toDataURL('image/jpeg');
        setPreview(base64String);
        onImageSelect(base64String);
      }
      stopCamera();
    }
  };

  return (
    <div className="p-6 bg-slate-800 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-semibold mb-6 text-center text-indigo-300">Identify a Book by its Cover</h2>
      
      {!isCameraOpen && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <label htmlFor="file-upload" className="flex-1 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-150 text-center flex items-center justify-center gap-2">
            <i className="fas fa-upload"></i> Upload Cover Image
          </label>
          <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isLoading} />
          
          <button 
            onClick={startCamera} 
            disabled={isLoading}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-150 flex items-center justify-center gap-2"
          >
            <i className="fas fa-camera"></i> Use Camera
          </button>
        </div>
      )}

      {cameraError && <p className="text-red-400 text-sm mb-4 text-center">{cameraError}</p>}

      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-4 rounded-lg shadow-xl w-full max-w-lg">
            <video ref={videoRef} className="w-full h-auto max-h-[60vh] rounded-md border-2 border-indigo-500" playsInline muted />
            <div className="mt-4 flex justify-around">
              <button 
                onClick={captureImage} 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-150 flex items-center gap-2"
              >
                <i className="fas fa-camera-retro"></i> Capture
              </button>
              <button 
                onClick={stopCamera} 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-150 flex items-center gap-2"
              >
                <i className="fas fa-times-circle"></i> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {preview && !isCameraOpen && (
        <div className="mt-6 border-2 border-dashed border-slate-600 p-4 rounded-lg bg-slate-700/50">
          <h3 className="text-lg font-medium mb-3 text-indigo-300">Selected Image Preview:</h3>
          <img src={preview} alt="Book cover preview" className="max-w-xs mx-auto rounded-md shadow-lg max-h-80 object-contain" />
        </div>
      )}
      {isLoading && preview && (
         <div className="mt-4 flex justify-center items-center gap-2 text-indigo-300">
            <LoadingIcon /> Processing...
         </div>
      )}
    </div>
  );
};
