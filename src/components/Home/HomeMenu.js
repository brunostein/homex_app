import React from 'react';
import { ListActionsMenu } from '../lists/ListKit';

export default function HomeMenu({ home, onClickMenuCallback }) {
  return <ListActionsMenu name={home.name} options={[
    { label: 'Editar', icon: 'pencil-outline', onPress: () => onClickMenuCallback(home, 'edit') },
    { label: 'Compartilhar', icon: 'account-multiple-outline', onPress: () => onClickMenuCallback(home, 'share') },
    { label: 'Remover', icon: 'trash-can-outline', danger: true, onPress: () => onClickMenuCallback(home, 'delete') },
  ]} />;
}
