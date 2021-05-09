import { Button, CircularProgress, makeStyles } from '@material-ui/core';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import React, { lazy, Suspense, useState } from 'react';

import { Props } from './component/Control';

const Spine = lazy(() => import('./component/Control'));
const useStyles = makeStyles({
  baseline: {
    width: 'fit-content',
  },
});
function App(props: Props): JSX.Element {
  const theme = createMuiTheme({
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
          <Suspense fallback={<CircularProgress color="secondary" />}>
            <Spine {...props} />
          </Suspense>
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
