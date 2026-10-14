import React from 'react';
import { ListActionsMenu } from '../lists/ListKit';

export default function CategoryMenu({ data, onClickMenuCallback }) {
  return <ListActionsMenu name={data.category.name} options={[
    { label: 'Editar', icon: 'pencil-outline', onPress: () => onClickMenuCallback(data, 'edit') },
    { label: 'Remover', icon: 'trash-can-outline', danger: true, onPress: () => onClickMenuCallback(data, 'delete') },
  ]} />;
}
