import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FaceDetectionContextType {
  isChild: boolean | null;
  isDetecting: boolean;
  isCameraActive: boolean;
  startDetection: () => void;
  stopDetection: () => void;
  lastCheck: Date | null;
}

const FaceDetectionContext = createContext<FaceDetectionContextType | undefined>(undefined);

export const useFaceDetection = () => {
  const context = useContext(FaceDetectionContext);
  if (!context) {
    throw new Error("useFaceDetection must be used within FaceDetectionProvider");
  }
  return context;
};

interface Props {
  children: React.ReactNode;
  checkInterval?: number; // in milliseconds
}

export const FaceDetectionProvider = ({ children, checkInterval = 10000 }: Props) => {
  const [isChild, setIsChild] = useState<boolean | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx || video.readyState !== 4) return null;
    
    canvas.width = 320;
    canvas.height = 240;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL("image/jpeg", 0.7);
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!isCameraActive) return;
    
    const imageBase64 = captureFrame();
    if (!imageBase64) return;
    
    setIsDetecting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("estimate-age", {
        body: { imageBase64 }
      });
      
      if (error) {
        console.error("Age estimation error:", error);
        return;
      }
      
      if (data.error) {
        // No face detected or other issue - keep current state
        console.log("Detection issue:", data.error);
        return;
      }
      
      const wasChild = isChild;
      setIsChild(data.isChild);
      setLastCheck(new Date());
      
      // Show notification on status change
      if (wasChild !== null && wasChild !== data.isChild) {
        if (data.isChild) {
          toast.info("Child detected - Settings are now protected", {
            icon: "🔒",
          });
        } else {
          toast.success("Adult verified - Full access granted", {
            icon: "🔓",
          });
        }
      }
    } catch (err) {
      console.error("Failed to analyze frame:", err);
    } finally {
      setIsDetecting(false);
    }
  }, [captureFrame, isCameraActive, isChild]);

  const startDetection = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 320, height: 240 }
      });
      
      streamRef.current = stream;
      
      // Create hidden video element
      if (!videoRef.current) {
        const video = document.createElement("video");
        video.style.position = "absolute";
        video.style.left = "-9999px";
        video.autoplay = true;
        video.playsInline = true;
        document.body.appendChild(video);
        videoRef.current = video;
      }
      
      // Create hidden canvas
      if (!canvasRef.current) {
        const canvas = document.createElement("canvas");
        canvas.style.display = "none";
        document.body.appendChild(canvas);
        canvasRef.current = canvas;
      }
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setIsCameraActive(true);
      
      // Initial check after video starts
      setTimeout(analyzeFrame, 1000);
      
      // Set up continuous monitoring
      intervalRef.current = setInterval(analyzeFrame, checkInterval);
      
      toast.success("Face detection started", { icon: "📷" });
    } catch (err) {
      console.error("Failed to start camera:", err);
      toast.error("Camera access denied. Please enable camera permissions.");
    }
  }, [checkInterval, analyzeFrame]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    toast.info("Face detection stopped", { icon: "📷" });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      if (videoRef.current && videoRef.current.parentNode) {
        videoRef.current.parentNode.removeChild(videoRef.current);
      }
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
      }
    };
  }, [stopDetection]);

  return (
    <FaceDetectionContext.Provider
      value={{
        isChild,
        isDetecting,
        isCameraActive,
        startDetection,
        stopDetection,
        lastCheck,
      }}
    >
      {children}
    </FaceDetectionContext.Provider>
  );
};
