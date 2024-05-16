import { useCallback, useEffect, useState } from "react";

interface Position {
  x: number;
  y: number;
}

interface IconType {
  handleClick?: (id: number) => Promise<void>;
  stats?: { count: number }[];
  session?: { count: number; percent: number }[];
  children: any;
}

const Icon = ({ handleClick, stats, session, children }: IconType) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [clickable, setClickable] = useState(true);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const moveX =
        (event.clientX - window.innerWidth / 2) / (stats ? 10 : 100);
      const moveY =
        (event.clientY - window.innerHeight / 2) / (stats ? 10 : 100);
      setPosition({ x: moveX, y: moveY });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [stats]);

  useEffect(() => {
    session?.forEach((s, i) => {
      if (s) {
        const id = i + 1;
        const elements = document.querySelectorAll(`.slap-element-${id}`);
        if (elements) {
          elements.forEach((element) => {
            if (session) {
              Array.from(element.classList).forEach((cls) => {
                if (/slap-element-\d+-percent-\d+/.test(cls)) {
                  element.classList.remove(cls);
                }
              });
              element.classList.add(
                `slap-element-${id}-percent-${session[id - 1].percent}`
              );
            }
          });
        }
      }
    });
  }, [session]);

  const handle = useCallback(
    async (event: MouseEvent) => {
      if (!clickable || !stats) return;

      const timeout = 200;

      const target = event.currentTarget as HTMLElement;
      const id = Number(target.id.replace(/[^0-9]/g, ""));

      setClickable(false);
      setTimeout(() => setClickable(true), timeout);

      const elements = document.querySelectorAll(`.slap-element-${id}`);
      if (elements) {
        elements.forEach((element) => {
          if (session) {
            Array.from(element.classList).forEach((cls) => {
              if (/slap-element-\d+-percent-\d+/.test(cls)) {
                element.classList.remove(cls);
              }
            });
            element.classList.add(
              `slap-element-${id}-percent-${session[id - 1].percent}`
            );
          }
          element.classList.add(`animate-slap-element-${id}`);
          setTimeout(
            () => element.classList.remove(`animate-slap-element-${id}`),
            timeout
          );
        });
      }
      if (handleClick) await handleClick(id);
    },
    [stats, session, clickable, handleClick]
  );

  useEffect(() => {
    if (!stats) return;

    stats.forEach((_, i) => {
      const element = document.getElementById(`slap-area-${i + 1}`);
      if (element) element.addEventListener("click", handle);
    });

    return () => {
      stats.forEach((_, i) => {
        const element = document.getElementById(`slap-area-${i + 1}`);
        if (element) element.removeEventListener("click", handle);
      });
    };
  }, [stats, handle]);

  return (
    <div style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
      {children}
    </div>
  );
};

export default Icon;
