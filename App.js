import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, storePersistor } from './src/redux/store';
import React from 'react';
import AppDrawerNavigator from './src/AppDrawerNavigator';
import { Provider as PaperProvider } from 'react-native-paper';

export default class App extends React.Component {
  render(){
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={storePersistor}>
          <PaperProvider>
            <AppDrawerNavigator />
          </PaperProvider>
        </PersistGate>
      </Provider>
    );
  }
}
