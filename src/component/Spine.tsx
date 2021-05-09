import hammer from 'hammerjs';
import React, {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import spine from '../spine/runtime/spine-widget';
import { downloadBlob, isFirefox } from '../utils';

export interface SpineProps {
  json: string;
  atlas: string;
  ani: string;
  loop: boolean;
  skin: string;
  speed: number;
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  isBig: boolean;
  onSuccess: (data: AnimationDetail[]) => void;
  onRecFinish: () => void;
  ref: Ref<{ reset: () => void }>;
}
export interface AnimationDetail {
  duration: number;
  name: string;
}
interface Position {
  x: number;
  y: number;
}

export type SpineRef = {
  reset: () => void;
  rec: (filename: string) => void;
} | null;
export const Spine = forwardRef<SpineRef, SpineProps>(
  (
    {
      json,
      ani,
      atlas,
      color,
      loop,
      skin,
      speed,
      isBig,
      onSuccess,
      onRecFinish,
    }: SpineProps,
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<spine.SpineWidget>();
    const speedRef = useRef(1);
    const aniRef = useRef('');
    const loopRef = useRef(false);
    const colorRef = useRef({ r: 1, g: 1, b: 1, a: 1 });

    const prevPositionRef = useRef<Position>();
    const hammerRef = useRef<HammerManager>();

    const recRef = useRef(false);
    const recChunks = useRef<Blob[]>([]);
    const recDone = useRef<() => void>();
    const mediaRecorder = useRef<MediaRecorder>();
    const recName = useRef('');

    const isBigRef = useRef(false);

    const [scale, setScale] = useState(1);

    useEffect(() => {
      recDone.current = onRecFinish;
    }, [onRecFinish]);

    useEffect(() => {
      isBigRef.current = isBig;
    }, [isBig]);

    useImperativeHandle(ref, () => {
      return {
        reset: () => {
          const widget = widgetRef.current;
          if (widget) {
            widget.skeleton.x = 500;
            widget.skeleton.y = 200;
          }
        },
        rec: (filename) => {
          if (recRef.current) {
            return;
          }
          recName.current = filename;
          recRef.current = true;
          const widget = widgetRef.current;
          if (!widget) {
            return;
          }
          widget.state.setAnimation(0, aniRef.current, false);
        },
      };
    });

    useEffect(() => {
      if (!containerRef.current) {
        return;
      }
      const hm = new hammer(containerRef.current);
      hm.get('pinch').set({ enable: true });
      hm.on('panstart', () => {
        if (widgetRef.current) {
          prevPositionRef.current = {
            x: widgetRef.current.skeleton.x,
            y: widgetRef.current.skeleton.y,
          };
        }
      });
      hm.on('panmove', (e) => {
        if (widgetRef.current && prevPositionRef.current) {
          widgetRef.current.skeleton.x =
            prevPositionRef.current.x + e.deltaX / (isBigRef.current ? 1 : 0.3);
          widgetRef.current.skeleton.y =
            prevPositionRef.current.y - e.deltaY / (isBigRef.current ? 1 : 0.3);
        }
      });
      hm.on('panend', (e) => {
        if (widgetRef.current && prevPositionRef.current) {
          widgetRef.current.skeleton.x =
            prevPositionRef.current.x + e.deltaX / (isBigRef.current ? 1 : 0.3);
          widgetRef.current.skeleton.y =
            prevPositionRef.current.y - e.deltaY / (isBigRef.current ? 1 : 0.3);
          prevPositionRef.current = undefined;
        }
      });
      hm.on('pinchin', () => {
        const widget = widgetRef.current;
        if (!widget) {
          return;
        }
        setScale((v) => {
          if (v - 0.1 <= 0) {
            return v;
          } else {
            return v - 0.1;
          }
        });
      });
      hm.on('pinchout', () => {
        const widget = widgetRef.current;
        if (!widget) {
          return;
        }
        setScale((v) => v + 0.1);
      });

      hammerRef.current = hm;
      const wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        const widget = widgetRef.current;
        if (!widget) {
          return;
        }
        const delta = isFirefox() ? e.deltaY / 30 : e.deltaY * -0.001;
        setScale((v) => {
          if (v + delta <= 0) {
            return v;
          } else {
            return v + delta;
          }
        });
      };
      containerRef.current.addEventListener('wheel', wheelHandler);
      return () => {
        hammerRef.current?.destroy();
        containerRef.current?.removeEventListener('wheel', wheelHandler);
      };
    }, []);

    // 如果json变了 立刻释放widget
    useEffect(() => {
      if (widgetRef.current && json.length !== 0) {
        widgetRef.current = undefined;
      }
    }, [json, scale]);

    // 动画
    useEffect(() => {
      aniRef.current = ani;
      if (ani.length === 0) {
        return;
      }
      const widget = widgetRef.current;
      // 如果是换.skel导致的ani变化 widget在前面已经被设成undefined 这里直接return 后面重新渲染
      if (!widget) {
        return;
      }
      // 单纯是动画变了 不需要重新渲染widget 直接调用api换在播放的动画
      widget.state.setAnimation(0, ani, loopRef.current);
    }, [ani]);

    // 循环
    useEffect(() => {
      loopRef.current = loop;
      const widget = widgetRef.current;
      if (!widget) {
        return;
      }
      widget.state.setAnimation(0, widget.state.tracks[0].animation.name, loop);
    }, [loop]);

    //播放速度
    useEffect(() => {
      speedRef.current = speed;
      const widget = widgetRef.current;
      if (!widget) {
        return;
      }
      widget.state.timeScale = speed;
    }, [speed]);

    //背景颜色
    useEffect(() => {
      const widget = widgetRef.current;
      if (!widget) {
        return;
      }
      // @ts-ignore
      widget.backgroundColor = color;
      colorRef.current = color;
    }, [color]);

    useEffect(() => {
      // json和ani会一起置空 只判断一个就行
      if (json.length === 0) {
        return;
      }
      if (!containerRef.current) {
        return;
      }
      new spine.SpineWidget(containerRef.current, {
        jsonContent: json,
        atlas: atlas,
        animation: aniRef.current,
        backgroundColor: '#ffffffff',
        debug: false,
        loop: loopRef.current,
        skin: skin,
        scale: scale,
        x: 500,
        y: 200,
        fitToCanvas: false,
        premultipliedAlpha: true,
        success: (widget) => {
          console.log(widget);
          widgetRef.current = widget;
          widget.state.addListener({
            start: () => {
              if (recRef.current) {
                //captureStream js有 但是ts没有（因为firefox）
                //https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/882
                // @ts-ignore
                const stream = widget.canvas.captureStream(60);
                const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mr.ondataavailable = (e: BlobEvent) => {
                  recChunks.current.push(e.data);
                };
                mr.onstop = () => {
                  const blob = new Blob(recChunks.current, {
                    type: 'video/webm',
                  });
                  downloadBlob(blob, recName.current || 'output');
                  if (recDone.current) {
                    recDone.current();
                  }
                };
                mr.start();
                mediaRecorder.current = mr;
              }
            },
            complete: () => {
              if (recRef.current) {
                recRef.current = false;
                mediaRecorder.current?.stop();
              }
            },
            interrupt: () => {},
            end: () => {},
            dispose: () => {},
            event: () => {},
          });
          // @ts-ignore
          widget.backgroundColor = colorRef.current;
          widget.state.timeScale = speedRef.current;
          onSuccess(
            widget.skeleton.data.animations.map((v) => {
              return { duration: v.duration, name: v.name };
            }),
          );
        },
      });
    }, [atlas, json, onSuccess, scale, skin]);

    return (
      <div
        style={{
          width: 1000,
          height: 1000,
          transform: isBig ? '' : 'scale(0.3,0.3)',
          transformOrigin: 'top left',
        }}
        ref={containerRef}></div>
    );
  },
);
