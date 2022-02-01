import * as React from 'react';
import { FAB, Portal, Provider } from 'react-native-paper';
import { screenActionsStyles } from '../../AppStyles';

const ScreenActions = (props) => {

  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <Provider>
      <Portal>
        {props.children}
        <FAB.Group
          fabStyle={screenActionsStyles.bgColor}
          open={open}
          icon={open ? 'menu-open' : 'menu'}
          actions={[
            { 
              icon: 'plus', 
              label: 'Adicionar',
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