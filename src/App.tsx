import { Button, CircularProgress } from '@material-ui/core';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import React, { lazy, Suspense, useState } from 'react';

import { Props } from './component/Control';

const Spine = lazy(() => import('./component/Control'));

function App(props: Props): JSX.Element {
  const [load, setLoad] = useState(false);
  return (
    <div>
      <ScopedCssBaseline>
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
      </ScopedCssBaseline>
    </div>
  );
}
export default App;
