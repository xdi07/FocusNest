import { useFaceDetection } from "@/contexts/FaceDetectionContext";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

interface BlurredContentProps {
  children: React.ReactNode;
  className?: string;
}

const BlurredContent = ({ children, className = "" }: BlurredContentProps) => {
  const { isChild, isCameraActive } = useFaceDetection();
  
  // Only blur if camera is active and child is detected
  const shouldBlur = isCameraActive && isChild === true;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        animate={{ 
          filter: shouldBlur ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
        className={shouldBlur ? "pointer-events-none select-none" : ""}
      >
        {children}
      </motion.div>
      
      <AnimatePresence>
        {shouldBlur && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-border flex flex-col items-center gap-3 max-w-xs text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Protected Content</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This section is locked for young users. Ask a parent to verify.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlurredContent;
