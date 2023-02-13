import { useEffect, useRef } from 'react';
import styles from './index.module.css';

const GRID_SIZE = 40;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const gridSize = useRef<number>(GRID_SIZE);
  const gridOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewScale = useRef<number>(0);
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const draw = () => {
    if (!canvasRef.current) return;

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    const context = canvasRef.current.getContext('2d');

    if (!context) {
      requestAnimationFrame(draw);
      return;
    }

    const maxWidth = canvasRef.current.width;
    const maxHeight = canvasRef.current.height;

    if (!context) return;
    let stepCountX = 1;
    let stepCountY = 1;

    for (
      let step = gridOffset.current.y % gridSize.current;
      step < maxHeight;
      step +=
        gridSize.current - (mousePosition.current.y < step ? -viewScale.current : viewScale.current)
    ) {
      context.moveTo(0, step);
      context.lineTo(maxWidth, step);
    }

    for (
      let step = gridOffset.current.x % gridSize.current;
      step < maxWidth;
      step +=
        gridSize.current - (mousePosition.current.x < step ? -viewScale.current : viewScale.current)
    ) {
      context.moveTo(step, 0);
      context.lineTo(step, maxHeight);
    }

    context.stroke();

    requestAnimationFrame(draw);
  };

  const handleWheel = (event: WheelEvent) => {
    // if (gridSize.current > 10 && event.deltaY > 0) gridSize.current -= event.deltaY / 10;
    // if (gridSize.current < 200 && event.deltaY < 0) gridSize.current -= event.deltaY / 10;

    if (viewScale.current > -30 && event.deltaY > 0) viewScale.current -= event.deltaY / 100;
    if (viewScale.current < 30 && event.deltaY < 0) viewScale.current -= event.deltaY / 100;
    console.log(viewScale.current);
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (!canvasRef.current) return;

    const initialPosition = { x: event.x, y: event.y };

    const moveEvent = (event: MouseEvent) => {
      gridOffset.current.x = event.x - initialPosition.x;
      gridOffset.current.y = event.y - initialPosition.y;

      if (!canvasRef.current) return;
    };

    canvasRef.current.addEventListener('mousemove', moveEvent);

    const mouseUpEvent = () => {
      if (!canvasRef.current) return;

      canvasRef.current.removeEventListener('mousemove', moveEvent);
      canvasRef.current.removeEventListener('mouseup', mouseUpEvent);
    };

    canvasRef.current.addEventListener('mouseup', mouseUpEvent);
  };

  const globalMouseMove = (event: MouseEvent) => {
    mousePosition.current = { x: event.x, y: event.y };
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    requestAnimationFrame(draw);

    canvasRef.current.addEventListener('mousemove', globalMouseMove);
    canvasRef.current.addEventListener('wheel', handleWheel);
    canvasRef.current.addEventListener('mousedown', handleMouseDown);

    return () => {
      if (!canvasRef.current) return;

      canvasRef.current.removeEventListener('mousemove', globalMouseMove);
      canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      canvasRef.current.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return <canvas className={styles.canvas} ref={canvasRef} />;
}
