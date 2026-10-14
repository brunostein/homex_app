import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, storePersistor } from './src/redux/store';
import React from 'react';
import AppDrawerNavigator from './src/AppDrawerNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MD2LightTheme, Provider as PaperProvider } from 'react-native-paper';

export default class App extends React.Component {
  render(){
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={storePersistor}>
              <PaperProvider theme={MD2LightTheme}>
                <AppDrawerNavigator />
              </PaperProvider>
            </PersistGate>
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
}
