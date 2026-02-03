import { useFaceDetection } from "@/contexts/FaceDetectionContext";
import { motion } from "framer-motion";
import { Camera, CameraOff, Scan, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const FaceDetectionControl = () => {
  const { isChild, isDetecting, isCameraActive, startDetection, stopDetection, lastCheck } = useFaceDetection();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isCameraActive 
              ? isChild 
                ? "bg-warning/20" 
                : "bg-success/20"
              : "bg-muted"
          }`}>
            {isCameraActive ? (
              isChild ? (
                <ShieldAlert className="w-6 h-6 text-warning" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-success" />
              )
            ) : (
              <Camera className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-bold text-foreground">Parental Protection</p>
            <p className="text-xs text-muted-foreground">
              {isCameraActive 
                ? isChild === null 
                  ? "Detecting face..." 
                  : isChild 
                    ? "Child mode active" 
                    : "Adult mode active"
                : "Face detection off"
              }
            </p>
          </div>
        </div>
        
        {isDetecting && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Scan className="w-5 h-5 text-primary" />
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isCameraActive ? (
          <Button
            onClick={startDetection}
            className="flex-1 gradient-primary"
          >
            <Camera className="w-4 h-4 mr-2" />
            Enable Protection
          </Button>
        ) : (
          <Button
            onClick={stopDetection}
            variant="outline"
            className="flex-1"
          >
            <CameraOff className="w-4 h-4 mr-2" />
            Disable
          </Button>
        )}
      </div>

      {lastCheck && isCameraActive && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Last check: {lastCheck.toLocaleTimeString()}
        </p>
      )}
    </motion.div>
  );
};

export default FaceDetectionControl;
