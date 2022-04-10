import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import { InfoOutlined } from '@material-ui/icons';
import React, { useState } from 'react';
export interface AnimationDetail {
  duration: number;
  name: string;
}
export function Info(props: {
  title: string;
  animationDetail: AnimationDetail[];
}): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Tooltip title="动画长度" aria-label="动画长度">
        <IconButton
          onClick={() => {
            setOpen(true);
          }}>
          <InfoOutlined></InfoOutlined>
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}>
        <DialogTitle>{props.title}</DialogTitle>
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
                {props.animationDetail.map((r) => (
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
    </>
  );
}
