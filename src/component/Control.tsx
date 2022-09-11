import {
  Backdrop,
  Badge,
  Box,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  makeStyles,
  MenuItem,
  Select,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { createGenerateClassName, StylesProvider } from '@material-ui/core/styles';
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  GetAppOutlined,
  InfoOutlined,
  RefreshOutlined,
} from '@material-ui/icons';
import { ColorPicker, ColorValue, useTranslate } from 'material-ui-color';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { useEvent } from '../hooks/useEvent';
import zhCN from '../i18n.json';
import { Spine } from '../spine';
import { isMobile } from '../utils';
import { AnimationDetail, Info } from './Info';
// import { AnimationDetail, Spine, SpineRef } from './Spine';
export interface Props {
  prefix: string;
  name: string;
  skin: {
    [key: string]: {
      [key: string]: {
        file: string;
        skin?: string;
      };
    };
  };
}

interface States {
  skin: string;
  modelList: string[];
  model: string;
  animations: string[];
  animation: string;
}
enum Actions {
  changeSkin,
  changeModel,
  changeAni,
  update,
}
interface ChangeSkin {
  action: Actions.changeSkin;
  skin: string;
}
interface ChangeModel {
  action: Actions.changeModel;
  model: string;
}
interface ChangeAni {
  action: Actions.changeAni;
  ani: string;
}
interface Update {
  action: Actions.update;
  animations: string[];
}
const generateClassName = createGenerateClassName({
  productionPrefix: 'spineViewer',
});
const useStyles = makeStyles({
  control: {
    width: '100%',
    margin: '0.3rem 0',
  },
  select: {
    height: 'auto',
  },
  card: {
    display: 'flex',
    flexWrap: 'wrap',
    width: 'fit-content',
  },
});
// interface AnimationDetail {
//   duration: number;
//   name: string;
// }
export default function Control({ prefix, skin, name }: Props): JSX.Element {
  const translate = (v: string): string => {
    return ((zhCN as any)[v] as string) || v;
  };
  useTranslate(() => ({ i18n: { language: 'zhCN' }, t: translate }));
  const classes = useStyles();
  const canvas = useRef<HTMLCanvasElement>(null);
  const spineRef = useRef<Spine | undefined>(undefined);
  const { big, setBig } = useEvent(canvas, spineRef);
  const skinList = Object.keys(skin);
  const [animationDetail, setAnimationDetail] = useState<AnimationDetail[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isLoop, setLoop] = useState(false);
  const [color, setColor] = useState<ColorValue>('00000000');
  const [speed, setSpeed] = useState(1);

  const [state, dispatch] = useReducer(
    (state: States, action: ChangeSkin | ChangeModel | Update | ChangeAni) => {
      if (action.action == Actions.changeSkin) {
        return {
          skin: action.skin,
          modelList: Object.keys(skin[action.skin]),
          model: Object.keys(skin[action.skin])[0],
          animations: [],
          animation: '',
        };
      }
      if (action.action == Actions.changeModel) {
        return {
          ...state,
          model: action.model,
          animations: [],
          animation: '',
        };
      }
      if (action.action == Actions.update) {
        return {
          ...state,
          animation: action.animations[0],
          animations: action.animations,
        };
      }
      if (action.action == Actions.changeAni) {
        const cur = spineRef.current?.getCurrent();
        if (cur) {
          console.log('ani change', cur);
          cur.state.setAnimation(0, action.ani, isLoop);
          cur.state.timeScale = speed;
        }
        return {
          ...state,
          animation: action.ani,
        };
      }
      return state;
    },
    {
      skin: skinList[0],
      modelList: Object.keys(skin[skinList[0]]),
      model: Object.keys(skin[skinList[0]])[0],
      animations: [],
      animation: '',
    },
  );
  const supportWebm =
    window.MediaRecorder && MediaRecorder.isTypeSupported('video/webm') && !isMobile();

  const [recState, setRecState] = useState(false);
  useEffect(() => {
    if (!canvas.current) {
      return;
    }
    spineRef.current = new Spine(canvas.current);
  }, []);
  useEffect(() => {
    console.log('change', state);

    setLoading(true);

    const path = prefix + skin[state.skin][state.model].file;
    spineRef.current
      ?.load(
        `${state.skin}-${state.model}`,
        `${path}.skel`,
        `${path}.atlas`,
        {
          x: -500,
          y: -200,
          scale: 1,
        },
        skin[state.skin][state.model].skin,
      )
      .then(({ skeleton, state: aniState }) => {
        console.log(spineRef.current);
        const animations = skeleton.data.animations.map((v) => v.name);
        dispatch({
          action: Actions.update,
          animations,
        });
        // spine.move(-500, -200);
        // dispatch update 时会把animation选中到第0个

        setAnimationDetail(
          skeleton.data.animations.map((v) => ({ name: v.name, duration: v.duration })),
        );
        setLoading(false);
        spineRef.current?.play(`${state.skin}-${state.model}`);
        console.log('set ani');
        aniState.setAnimation(0, animations[0], isLoop);
        aniState.timeScale = speed;
      });
  }, [prefix, skin, state.model, state.skin]);
  return (
    <StylesProvider generateClassName={generateClassName}>
      <div style={{ width: 'fit-content', position: 'relative' }}>
        <Card className={classes.card}>
          <CardContent style={{ width: 330 }}>
            <FormControl variant="outlined" className={classes.control} size={'small'}>
              <InputLabel id="skin-select-label">皮肤</InputLabel>
              <Select
                classes={{ root: classes.select }}
                labelId="skin-select-label"
                native={isMobile()}
                value={state.skin}
                onChange={(e) => {
                  dispatch({
                    action: Actions.changeSkin,
                    skin: e.target.value as string,
                  });
                }}>
                {skinList.map((v) => {
                  return isMobile() ? (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ) : (
                    <MenuItem value={v} key={v}>
                      {v}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl variant="outlined" size={'small'} className={classes.control}>
              <InputLabel id="model-select-label">模型</InputLabel>
              <Select
                classes={{ root: classes.select }}
                labelId="model-select-label"
                value={state.model}
                native={isMobile()}
                onChange={(e) => {
                  dispatch({
                    action: Actions.changeModel,
                    model: e.target.value as string,
                  });
                }}>
                {state.modelList.map((v) => {
                  return isMobile() ? (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ) : (
                    <MenuItem value={v} key={v}>
                      {v}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl variant="outlined" size={'small'} className={classes.control}>
              <InputLabel id="ani-select-label"></InputLabel>
              <Select
                classes={{ root: classes.select }}
                labelId="ani-select-label"
                native={isMobile()}
                value={state.animation}
                onChange={(e) => {
                  dispatch({
                    action: Actions.changeAni,
                    ani: e.target.value as string,
                  });
                }}>
                {state.animations.map((v) => {
                  return isMobile() ? (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ) : (
                    <MenuItem value={v} key={v}>
                      {v}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <Grid container justifyContent="space-around">
              <FormControlLabel
                control={
                  <Switch
                    value={isLoop}
                    onChange={(e) => {
                      if (!spineRef.current) {
                        return;
                      }
                      const cur = spineRef.current.getCurrent();
                      if (!cur) {
                        return;
                      }
                      const state = cur.state;
                      state.setAnimation(
                        0,
                        state.tracks[0].animation.name,
                        e.target.checked,
                      );
                      setLoop(e.target.checked);
                    }}
                  />
                }
                label="循环播放"
                labelPlacement="bottom"
              />
              <FormControlLabel
                control={
                  <ColorPicker
                    hideTextfield
                    deferred
                    value={'#' + color}
                    onChange={(e) => {
                      console.log(e);
                      const color = e.rgb.map((v) => v / 255);
                      if (color.length == 3) {
                        color.push(1);
                      }
                      if (!spineRef.current) {
                        return;
                      }
                      spineRef.current.bg = color as [number, number, number, number];
                      setColor(e.hex);
                    }}
                  />
                }
                label="背景颜色"
                labelPlacement="bottom"
              />
            </Grid>
            <Typography component="div" style={{ margin: '4px 0' }}>
              <Box textAlign="left">播放速度</Box>
            </Typography>
            <Slider
              aria-labelledby="continuous-slider"
              step={0.1}
              min={0.1}
              max={2}
              // marks={true}
              defaultValue={1}
              value={speed}
              valueLabelDisplay="auto"
              onChange={(_, v: number | number[]) => {
                if (!spineRef.current) {
                  return;
                }
                const cur = spineRef.current.getCurrent();
                if (!cur) {
                  return;
                }
                cur.state.timeScale = v as number;
                setSpeed(v as number);
              }}></Slider>
            <Grid container justifyContent="center">
              {supportWebm ? (
                <Tooltip title="实验性webm导出">
                  <Badge color="primary" badgeContent={'webm'} overlap="rectangular">
                    <IconButton
                      onClick={() => {
                        if (!supportWebm) {
                          return;
                        }
                        setRecState(true);
                        if (!spineRef.current) {
                          return;
                        }
                        spineRef.current
                          .record(
                            state.animation,
                            `${name}-${state.skin}-${state.model}-${state.animation}-x${speed}`,
                          )
                          .then(() => {
                            setRecState(false);
                          });
                      }}>
                      <GetAppOutlined />
                    </IconButton>
                  </Badge>
                </Tooltip>
              ) : undefined}

              <Tooltip title="重置位置" aria-label="重置位置">
                <IconButton
                  onClick={() => {
                    if (!spineRef.current) {
                      return;
                    }
                    spineRef.current.transform(-500, -200, 1);
                  }}>
                  <RefreshOutlined />
                </IconButton>
              </Tooltip>
              {!isMobile() ? (
                <Tooltip title={big ? '缩小' : '放大'} aria-label={big ? '缩小' : '放大'}>
                  <IconButton
                    onClick={() => {
                      setBig(!big);
                    }}>
                    {big ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                  </IconButton>
                </Tooltip>
              ) : null}
              <Info
                title={`${name} - ${state.skin} - ${state.model}`}
                animationDetail={animationDetail}></Info>
            </Grid>
          </CardContent>
          <CardContent>
            <div
              style={{
                width: big ? 1000 : 300,
                height: big ? 1000 : 300,
                overflow: 'hidden',
              }}>
              <Backdrop
                open={isLoading}
                style={{
                  position: 'absolute',
                  width: 300,
                  height: 300,
                  zIndex: 1,
                  top: 'inherit',
                  left: 'inherit',
                  right: 'inherit',
                  bottom: 'inherit',
                }}>
                <CircularProgress />
              </Backdrop>
              <div
                style={{
                  backgroundImage: `
        linear-gradient(45deg, #ccc 25%, transparent 25%), 
        linear-gradient(135deg, #ccc 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, #ccc 75%),
        linear-gradient(135deg, transparent 75%, #ccc 75%)`,
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 0, 12px -12px, 0px 12px',
                }}>
                <div
                  style={{
                    width: 1000,
                    height: 1000,
                    transform: big ? '' : 'scale(0.3,0.3)',
                    transformOrigin: 'top left',
                  }}>
                  <canvas width={1000} height={1000} ref={canvas} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Backdrop
          open={recState}
          style={{
            zIndex: 2,
            right: 'inherit',
            bottom: 'inherit',
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}>
          <Card style={{ width: '50%' }}>
            <CardContent>
              <div style={{ marginBottom: 16 }}>
                正在导出 {name}-{state.skin}-{state.model}-{state.animation}-x
                {speed}.webm
              </div>
              <LinearProgress color="secondary" />
            </CardContent>
          </Card>
        </Backdrop>
      </div>
    </StylesProvider>
  );
}
