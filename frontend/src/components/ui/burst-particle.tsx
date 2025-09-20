export type BurstParticleProps = {
  x: number;
  y: number;
  angle: number;
  id: string;
  delay: number;
};

export function BurstParticle(props: BurstParticleProps) {
  const { x, y, angle, id, delay } = props;

  // Convert angle to radians and calculate movement distances
  const angleRad = (angle * Math.PI) / 180;
  const midDistance = 25;
  const endDistance = 40;

  const dx = Math.cos(angleRad) * midDistance;
  const dy = Math.sin(angleRad) * midDistance;
  const dxEnd = Math.cos(angleRad) * endDistance;
  const dyEnd = Math.sin(angleRad) * endDistance;

  return (
    <div
      key={id}
      className="pointer-events-none fixed z-50 select-none animate-[burst-out_0.3s_ease-out_forwards] will-change-transform"
      style={
        {
          ["--dx"]: `${dx}px`,
          ["--dy"]: `${dy}px`,
          ["--dx-end"]: `${dxEnd}px`,
          ["--dy-end"]: `${dyEnd}px`,
          left: x - 8,
          top: y - 1,
          animationDelay: `${delay}ms`,
          containIntrinsicSize: "16px 2px",
        } as React.CSSProperties & {
          ["--dx"]?: string;
          ["--dy"]?: string;
          ["--dx-end"]?: string;
          ["--dy-end"]?: string;
        }
      }>
      <div
        className="w-2 h-0.5 rounded-full"
        style={{
          backgroundColor: "var(--background)",
          transform: `rotate(${angle}deg)`,
        }}
      />
    </div>
  );
}
