import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { store } from './shared/store/store';
import App from './app/App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './app/styles/global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider defaultColorScheme="auto">
        <ModalsProvider>
          <Notifications position="top-right" zIndex={1000} />
          <App />
        </ModalsProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>
);
