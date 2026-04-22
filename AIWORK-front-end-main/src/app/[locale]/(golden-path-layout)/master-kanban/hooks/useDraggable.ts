import { useState, useEffect, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

export function useDraggable(initialPosition: Position = { x: 0, y: 0 }) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);

  const offset = useRef<Position>({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return {
    position,
    isDragging,
    onMouseDown,
  };
}
