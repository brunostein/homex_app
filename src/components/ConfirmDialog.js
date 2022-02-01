import React, { useState, useEffect } from 'react';
import { Paragraph, Dialog, Portal, Button } from 'react-native-paper';

const ConfirmDialog = (props) => {
  const [visible, setVisible] = React.useState(false);
  
  React.useEffect(() => {
    setVisible(props.visible);
  }, [props]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={() => setVisible(false)}>
        <Dialog.Title>{props.title}</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{props.message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={props.onCalcelCallback}>Cancelar</Button>
          <Button onPress={props.onConfirmCallback}>Confirmar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmDialog;