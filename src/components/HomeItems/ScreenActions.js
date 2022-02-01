import React, { useState } from 'react';
import { FAB, Portal, Provider, Colors } from 'react-native-paper';
import { screenActionsStyles } from '../../AppStyles';

const ScreenActions = (props) => {
  const [state, setState] = useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <Provider>
      <Portal>
        {props.children}
        <FAB.Group
          color={Colors.white}
          fabStyle={screenActionsStyles.bgColor}
          open={open}
          icon={open ? 'menu-open' : 'menu'}
          actions={[
            { 
              icon: 'plus', 
              label: 'Adicionar Categoria',
              onPress: () => props.callback("add") 
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