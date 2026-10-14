import React, { useState } from 'react';
import { FAB, Portal, MD2LightTheme, Provider, MD2Colors as Colors } from 'react-native-paper';
import { screenActionsStyles } from '../../AppStyles';

const ScreenActions = (props) => {
  const [state, setState] = useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <Provider theme={MD2LightTheme}>
      {props.children}
      <Portal>
        <FAB.Group
          accessibilityLabel="Ações do inventário"
          color={Colors.white}
          fabStyle={screenActionsStyles.bgColor}
          open={open}
          icon={open ? 'menu-open' : 'menu'}
          actions={[
            {
              icon: 'plus',
              label: 'Adicionar Categoria',
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
