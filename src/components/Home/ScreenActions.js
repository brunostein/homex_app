import * as React from 'react';
import { FAB, Portal, MD2LightTheme, Provider } from 'react-native-paper';
import { screenActionsStyles } from '../../AppStyles';

const ScreenActions = (props) => {

  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <Provider theme={MD2LightTheme}>
      {props.children}
      <Portal>
        <FAB.Group
          accessibilityLabel="Ações da casa"
          fabStyle={screenActionsStyles.bgColor}
          open={open}
          icon={open ? 'menu-open' : 'menu'}
          actions={[
            {
              icon: 'plus',
              label: 'Adicionar',
              onPress: () => { setState({ open: false }); props.callback("add"); }
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </Provider>
  );
};

export default ScreenActions;
