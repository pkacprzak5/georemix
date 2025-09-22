import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TextParticle, type TextParticleProps } from "../ui/text-particle";
import { useDrag } from "@/hooks/use-drag";

const TEXT_PARTICLE_THROTTLE = 400;
const TEXT_PARTICLE_REMOVE_DELAY = 800;

function randomAngle(minAngle: number, maxAngle: number) {
  return Math.round((Math.random() * (maxAngle - minAngle) + minAngle) * 100) / 100;
}

type WindowLayoutProps = {
  title?: string;
  initialPosition?: { x: number; y: number };
  position?: { x: number; y: number };
  setPosition?: (position: { x: number; y: number }) => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
} & React.ComponentProps<"div">;

function WindowLayout({
  className,
  initialPosition,
  position: externalPosition,
  setPosition: externalSetPosition,
  children,
  title = "Window",
  onClose,
  onMinimize,
  onMaximize,
  style,
  ...props
}: WindowLayoutProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const draggableHeaderRef = useRef<HTMLDivElement>(null);

  const [textParticleProps, setTextParticleProps] = useState<TextParticleProps[]>([]);
  const lastClickCreatedAt = useRef<number>(0);

  const [maximized, setMaximized] = useState(false);

  const { position, isDragging } = useDrag({
    initialPosition,
    position: externalPosition,
    setPosition: externalSetPosition,
    ref: draggableHeaderRef,
    style,
  });

  const createClickAnimation = (e: React.MouseEvent) => {
    const now = Date.now();

    if (now - lastClickCreatedAt.current < TEXT_PARTICLE_THROTTLE) {
      return;
    }

    lastClickCreatedAt.current = now;
    const id = now.toString();
    const angle = randomAngle(-30, 30);

    setTextParticleProps((prev) => [
      ...prev,
      {
        x: e.clientX,
        y: e.clientY,
        angle,
        id,
        text: "Click!",
      },
    ]);

    setTimeout(() => {
      setTextParticleProps((prev) => prev.filter((animation) => animation.id !== id));
    }, TEXT_PARTICLE_REMOVE_DELAY);
  };

  const handleIconClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    e.preventDefault();

    createClickAnimation(e);

    if (action) {
      // TODO:  I am not a fun of that. It might make our app
      //        feel sluggish.
      setTimeout(() => action(), 150);
    }
  };

  return (
    <>
      <div
        ref={windowRef}
        data-slot="window"
        className={cn(
          "fixed rounded-base border-2 border-border bg-background text-foreground font-base shadow-shadow min-w-[300px] min-h-[200px] flex flex-col",
          isDragging && "select-none",
          className
        )}
        style={{
          ...style,
          left: position.x,
          top: position.y,
          zIndex: 40,
        }}
        {...props}>
        {/* Header Bar */}
        <div
          ref={draggableHeaderRef}
          data-slot="window-header"
          className={cn(
            "flex items-center justify-between px-4 py-2 bg-main text-main-foreground border-b-2 border-border rounded-t-[3px] select-none",
            "font-heading"
          )}>
          <div className="flex-1 truncate">{title}</div>

          {/* Header Icons */}
          <div className="flex gap-1 ml-2">
            {/* Minimize */}
            <button
              onClick={(e) => {
                setMaximized(false);
                handleIconClick(e, onMinimize);
              }}
              className="window-button"
              aria-label="Minimize">
              <span className="text-xs font-bold">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                  <path d='M6 12h12' />
                </svg>
              </span>
            </button>

            {/* Maximize & minimize */}
            <button
              onClick={(e) => {
                if (!maximized) {
                  handleIconClick(e, onMaximize);
                } else {
                  handleIconClick(e, onMinimize);
                }
                setMaximized(!maximized);
              }}
              className="window-button"
              aria-label="Maximize">
              <span className="text-xs font-bold">
                {!maximized ?
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d='M9.4 21c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6m18 0c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21m0-18c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4M9.4 3c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C3 6.04 3 7.16 3 9.4' />
                  </svg> :
                  <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <path d='M9.75 3.01c-.04 2.79-.247 4.37-1.308 5.432C7.38 9.502 5.799 9.71 3.01 9.75M9.75 21c-.04-2.79-.247-4.371-1.308-5.432S5.799 14.3 3.01 14.26M14.26 3.01c.04 2.79.247 4.37 1.308 5.432C16.629 9.502 18.211 9.71 21 9.75M14.26 21c.04-2.79.247-4.371 1.308-5.432S18.211 14.3 21 14.26' />
                  </svg>}
              </span>
            </button>

            {/* Close */}
            <button
              onClick={(e) => handleIconClick(e, onClose)}
              className="window-button"
              aria-label="Close">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
                <path d='M18 6 6 18M6 6l12 12' />
              </svg>
            </button>
          </div>
        </div>

        {/* Window Body */}
        {children}
      </div>

      {/* Click Animations */}
      {textParticleProps.map((anim) => (
        <TextParticle key={anim.id} {...anim} />
      ))}
    </>
  );
}

function WindowHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-content-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-[data-slot=window-action]:grid-cols-[1fr_auto] mb-4",
        className
      )}
      {...props}
    />
  );
}

function WindowTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-title"
      className={cn("font-heading leading-none text-lg", className)}
      {...props}
    />
  );
}

function WindowDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="window-description" className={cn("text-sm font-base", className)} {...props} />
  );
}

function WindowAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function WindowContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="window-content" className={cn("relative", className)} {...props} />;
}

function WindowBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="window-body" className={cn("flex-1 p-6 overflow-auto", className)} {...props} />
  );
}

function WindowFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="window-footer"
      className={cn("flex items-center mt-4 pt-4 border-t-2 border-border", className)}
      {...props}
    />
  );
}

export {
  WindowLayout as Window,
  WindowHeader,
  WindowTitle,
  WindowDescription,
  WindowContent,
  WindowBody,
  WindowAction,
  WindowFooter,
};
