import { motion } from "framer-motion";
import mondjaiLogo from "@/assets/mondjai-logo.png";

export const SplashScreen = () => (
  <div
    className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
    style={{
      background: "linear-gradient(180deg, #FFFFFF 0%, #E3FBF1 100%)",
    }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      <img
        src={mondjaiLogo}
        alt="MonDjai"
        className="h-24 w-auto object-contain drop-shadow-[0_10px_28px_rgba(15,203,130,0.35)]"
      />
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="mt-4 font-display text-2xl font-bold tracking-tight"
        style={{ color: "#0B3D2E" }}
      >
        MonDjai
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="mt-6 w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin"
      />
    </motion.div>
  </div>
);
