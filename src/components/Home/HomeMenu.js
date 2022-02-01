import * as React from 'react';
import { View } from 'react-native';
import { Button, Menu, Divider, Provider } from 'react-native-paper';

const HomeMenu = (props) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => {
    setVisible(true);
  }

  const closeMenu = () => {
    setVisible(false);
  }
  
  React.useEffect(() => {
    setVisible(props.visible);
  }, [props]);

  return (
    <View
      style={{
        //paddingTop: 50,
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button onPress={openMenu} icon="dots-vertical"></Button>}>
        <Menu.Item onPress={() => { props.onClickMenuCallback(props.home, 'edit') }} title="Editar" />
        <Menu.Item onPress={() => { props.onClickMenuCallback(props.home, 'delete') }} title="Remover" />
        <Menu.Item onPress={() => { props.onClickMenuCallback(props.home, 'share') }} title="Compartilhar" />
      </Menu>
    </View>
  );
};

export default HomeMenu;