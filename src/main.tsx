import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.tsx'
import { Tuple, configureStore } from '@reduxjs/toolkit';
import reducers from './reducers/index.ts';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga'
import sagas from '@/sagas';
import Api from './lib/api.ts';
const sagaMiddleware = createSagaMiddleware(
  {
    context: {
      api: new Api("http://localhost:8888")
    }
  }
);

const store = configureStore({
  reducer: reducers,
  middleware: () => { return new Tuple(sagaMiddleware); }
});

sagaMiddleware.run(sagas);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
