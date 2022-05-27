import hammer from 'hammerjs';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

import { Spine } from '../spine';
import { isFirefox } from '../utils';
export function useEvent(
  canvas: React.RefObject<HTMLCanvasElement>,
  spineRef: MutableRefObject<Spine | undefined>,
): {
  big: boolean;
  setBig: React.Dispatch<React.SetStateAction<boolean>>;
} {
  const [big, setBig] = useState(false);
  const isBigRef = useRef(false);
  const startPosition = useRef<{ x: number; y: number }>();
  useEffect(() => {
    isBigRef.current = big;
  }, [big]);
  useEffect(() => {
    if (!canvas.current) {
      return;
    }
    const hm = new hammer(canvas.current);
    const getPosition = () => {
      return spineRef.current!.position;
    };

    hm.get('pinch').set({ enable: true });
    hm.on('panstart', () => {
      if (!spineRef.current) {
        return;
      }
      const { x, y } = getPosition();
      startPosition.current = {
        x,
        y,
      };
    });
    hm.on('panmove', (e) => {
      if (!spineRef.current) {
        return;
      }
      const { scale } = getPosition();
      const { x, y } = startPosition.current!;
      // console.log(e.deltaX, e.deltaY);
      const ratio = (isBigRef.current ? 1 : 10 / 3) / scale;
      spineRef.current.move(x - e.deltaX * ratio, y + e.deltaY * ratio);
    });
    hm.on('panend', () => {
      startPosition.current = undefined;
    });
    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      const widget = canvas.current;
      if (!widget) {
        return;
      }
      const delta = isFirefox() ? e.deltaY / -480 : e.deltaY * -0.001;
      if (!spineRef.current) {
        return;
      }
      const { scale } = getPosition();
      if (scale + delta <= 0) {
        return;
      }
      spineRef.current?.scale(scale + delta);
    };
    canvas.current.addEventListener('wheel', wheelHandler);
    return () => {
      hm.destroy();
      canvas.current?.removeEventListener('wheel', wheelHandler);
    };
  }, []);
  return {
    big,
    setBig,
  };
}
