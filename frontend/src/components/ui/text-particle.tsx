export type TextParticleProps = {
  x: number;
  y: number;
  angle: number;
  id: string;
  text: string;
};

export function TextParticle(props: TextParticleProps) {
  const { x, y, angle, id, text } = props;

  return (
    <div
      key={id}
      className="pointer-events-none fixed z-50 select-none animate-[float-up_0.8s_ease-out_forwards] text-white font-heading text-3xl text-shadow-lg"
      style={
        {
          WebkitTextStroke: "0.5px var(--border)",
          ["--angle"]: `${angle}deg`,
          // TODO:  I believe this offsets work only for "Click!".
          //        We probably need to compute rendered text width in other cases.
          left: x - 20,
          top: y - 10,
        } as React.CSSProperties & { ["--angle"]?: string }
      }>
      {text}
    </div>
  );
}
