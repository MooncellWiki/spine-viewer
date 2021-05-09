import {
  Backdrop,
  Box,
  Card,
  CardContent,
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
import {
  FullscreenExitOutlined,
  FullscreenOutlined,
  GetAppOutlined,
  InfoOutlined,
  RefreshOutlined,
} from '@material-ui/icons';
import { ColorPicker } from 'material-ui-color';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { isMobile, ReqSkelData } from '../utils';
import { AnimationDetail, Spine, SpineRef } from './Spine';
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
  json: string;
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
  json: string;
  animations: string[];
}
export default function Control({ prefix, skin, name }: Props): JSX.Element {
  const skinList = Object.keys(skin);
  const [animationDetail, setAnimationDetail] = useState<AnimationDetail[]>([]);
  const [isLoading, setLoading] = useState(true);
  // const setAnimationDetail = useCallback(innerSetAnimationDetail, [innerSetAnimationDetail]);
  const [isLoop, setLoop] = useState(false);
  const [color, setColor] = useState<string>('ffffffff');
  const [rgb, setRgb] = useState([1, 1, 1, 1]);
  const [speed, setSpeed] = useState(1);
  const [big, setBig] = useState(false);
  const spineRef = useRef<SpineRef>(null);
  const [state, dispatch] = useReducer(
    (state: States, action: ChangeSkin | ChangeModel | Update | ChangeAni) => {
      switch (action.action) {
        case Actions.changeSkin:
          return {
            json: '',
            skin: action.skin,
            modelList: Object.keys(skin[action.skin]),
            model: Object.keys(skin[action.skin])[0],
            animations: [],
            animation: '',
          };
        case Actions.changeModel:
          return {
            ...state,
            json: '',
            model: action.model,
            animations: [],
            animation: '',
          };
        case Actions.update:
          return {
            ...state,
            animation: action.animations[0],
            animations: action.animations,
            json: action.json,
          };
        case Actions.changeAni:
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
      json: '',
    },
  );
  const [open, setOpen] = useState(false);
  useEffect(() => {
    ReqSkelData(prefix + skin[state.skin][state.model].file + '.skel').then(
      (data: any) => {
        const animations = Object.keys(data.animations);
        dispatch({ action: Actions.update, animations, json: data });
      },
    );
  }, [prefix, skin, state.model, state.skin]);
  const [recState, setRecState] = useState(false);
  return (
    <div style={{ width: 'fit-content', position: 'relative' }}>
      <Card style={{ display: 'flex', flexWrap: 'wrap', width: 'fit-content' }}>
        <CardContent style={{ width: 300 }}>
          <FormControl
            variant="outlined"
            style={{
              width: '100%',
              margin: '0.3rem 0',
            }}
            size={'small'}>
            <InputLabel id="skin-select-label">皮肤</InputLabel>
            <Select
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
          <FormControl
            variant="outlined"
            size={'small'}
            style={{
              width: '100%',
              margin: '0.3rem 0',
            }}>
            <InputLabel id="model-select-label">模型</InputLabel>
            <Select
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
          <FormControl
            variant="outlined"
            size={'small'}
            style={{
              width: '100%',
              margin: '0.3rem 0',
            }}>
            <InputLabel id="ani-select-label"></InputLabel>
            <Select
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
          <Grid container justify="space-around">
            <FormControlLabel
              control={
                <Switch
                  value={isLoop}
                  onChange={(e) => {
                    setLoop(e.target.checked);
                  }}
                />
              }
              label="循环播放"
              labelPlacement="end"
            />
            <FormControlLabel
              control={
                <ColorPicker
                  hideTextfield
                  value={'#' + color}
                  onChange={(e) => {
                    setColor(e.hex);
                    setRgb([e.rgb[0] / 255, e.rgb[1] / 255, e.rgb[2] / 255, e.alpha]);
                  }}></ColorPicker>
              }
              label="背景颜色"
              labelPlacement="end"
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
              setSpeed(v as number);
            }}></Slider>
          <Grid container justify="center">
            <Tooltip title="实验性WEBM导出" aria-label="实验性WEBM导出">
              <IconButton
                disabled={!MediaRecorder.isTypeSupported('video/webm')}
                onClick={() => {
                  setRecState(true);
                  spineRef.current?.rec(
                    `${name}-${state.skin}-${state.model}-${state.animation}-x${speed}`,
                  );
                }}>
                <GetAppOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title="重置位置" aria-label="重置位置">
              <IconButton
                onClick={() => {
                  spineRef.current?.reset();
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
            <Tooltip title="动画长度" aria-label="动画长度">
              <IconButton
                onClick={() => {
                  setOpen(true);
                }}>
                <InfoOutlined></InfoOutlined>
              </IconButton>
            </Tooltip>
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
            <Spine
              atlas={prefix + skin[state.skin][state.model].file + '.atlas'}
              skin={skin[state.skin][state.model].skin || 'default'}
              json={state.json}
              ani={state.animation}
              loop={isLoop}
              speed={speed}
              isBig={big}
              color={{
                r: rgb[0],
                g: rgb[1],
                b: rgb[2],
                a: rgb[3],
              }}
              onSuccess={useCallback((details) => {
                setAnimationDetail(details);
                setLoading(false);
              }, [])}
              onRecFinish={() => {
                setRecState(false);
              }}
              ref={spineRef}
            />
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
              {speed}.gif
            </div>
            <LinearProgress color="secondary" />
          </CardContent>
        </Card>
      </Backdrop>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}>
        <DialogTitle>
          {name} - {state.skin} - {state.model}
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>动画</TableCell>
                  <TableCell>持续时间(s)</TableCell>
                  <TableCell>帧数(30/s)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {animationDetail.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.duration}</TableCell>
                    <TableCell>{Math.round(r.duration * 30)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </div>
  );
}
