import { useState, useRef } from "react";
import { BurstParticle, type BurstParticleProps } from "@/components/ui/burst-particle";

const BURST_PARTICLE_THROTTLE = 300;
const BURST_PARTICLE_REMOVE_DELAY = 400;
const PARTICLE_COUNT = 8;

function randomAngle(minAngle: number, maxAngle: number) {
  return Math.round((Math.random() * (maxAngle - minAngle) + minAngle) * 100) / 100;
}

export function useBurstAnimation() {
  const [burstParticleProps, setBurstParticleProps] = useState<BurstParticleProps[]>([]);
  const lastBurstCreatedAt = useRef<number>(0);

  const createBurstAnimation = (e: React.MouseEvent) => {
    const now = Date.now();

    if (now - lastBurstCreatedAt.current < BURST_PARTICLE_THROTTLE) {
      return;
    }

    lastBurstCreatedAt.current = now;

    // Create multiple particles in a burst pattern
    const newParticles: BurstParticleProps[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (360 / PARTICLE_COUNT) * i + randomAngle(-15, 15);
      const delay = Math.random() * 100; // Stagger the animation slightly

      newParticles.push({
        x: e.clientX,
        y: e.clientY,
        angle,
        id: `${now}-${i}`,
        delay,
      });
    }

    setBurstParticleProps((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setBurstParticleProps((prev) =>
        prev.filter((particle) => !newParticles.some((newP) => newP.id === particle.id))
      );
    }, BURST_PARTICLE_REMOVE_DELAY);
  };

  const renderBurstAnimations = () => {
    return burstParticleProps.map((particle) => <BurstParticle key={particle.id} {...particle} />);
  };

  return { createBurstAnimation, renderBurstAnimations, burstParticleProps };
}
