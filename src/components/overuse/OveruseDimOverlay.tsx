import { motion } from "framer-motion";

const OveruseDimOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[55] pointer-events-none"
    aria-hidden
  >
    <div className="absolute inset-0 bg-foreground/30" />
    <motion.div
      animate={{ opacity: [0.35, 0.6, 0.35] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0"
      style={{
        boxShadow: "inset 0 0 80px 10px hsl(var(--destructive) / 0.45)",
      }}
    />
  </motion.div>
);

export default OveruseDimOverlay;