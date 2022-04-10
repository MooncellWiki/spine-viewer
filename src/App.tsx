import { Button, makeStyles } from '@material-ui/core';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import React, { useState } from 'react';

import Spine, { Props } from './component/Control';

const useStyles = makeStyles({
  baseline: {
    width: 'fit-content',
  },
});
function App(props: Props): JSX.Element {
  const theme = createTheme({
    overrides: {
      MuiPopover: {
        root: {
          boxSizing: 'border-box',
          '& *': {
            boxSizing: 'border-box',
          },
        },
      },
    },
  });
  const classes = useStyles();
  const [load, setLoad] = useState(false);
  return (
    <ScopedCssBaseline className={classes.baseline}>
      <ThemeProvider theme={theme}>
        {load ? (
          <Spine {...props} />
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setLoad(true);
            }}>
            点击加载
          </Button>
        )}
      </ThemeProvider>
    </ScopedCssBaseline>
  );
}
export default App;
