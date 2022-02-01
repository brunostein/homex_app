import * as React from 'react';
import { View } from 'react-native';
import { Button, Menu, Divider, Provider } from 'react-native-paper';

const CategoryMenu = (props) => {
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
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<Button onPress={openMenu} icon="dots-vertical"></Button>}>
        <Menu.Item onPress={() => { props.onClickMenuCallback(props.data, 'edit') }} title="Editar" />
        <Menu.Item onPress={() => { props.onClickMenuCallback(props.data, 'delete') }} title="Remover" />
      </Menu>
    </View>
  );
};

export default CategoryMenu;