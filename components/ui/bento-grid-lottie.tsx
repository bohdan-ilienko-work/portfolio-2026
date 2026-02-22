"use client";

import Lottie from "react-lottie";

import animationData from "@/data/confetti.json";

interface BentoGridLottieProps {
  trigger: number;
}

const BentoGridLottie = ({ trigger }: BentoGridLottieProps) => {
  if (trigger === 0) return null;

  return (
    <button
      tabIndex={-1}
      className="pointer-events-none absolute -bottom-5 right-0 cursor-default"
    >
      <Lottie
        key={trigger}
        options={{
          loop: false,
          autoplay: true,
          animationData,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
          },
        }}
      />
    </button>
  );
};

export default BentoGridLottie;
