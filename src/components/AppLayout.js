import React, { useState, useEffect } from 'react';
import { View } from 'react-native';

const AppLayout = (props) => {
  return (
    <View style={{margin: 5}}>
      {props.children}
    </View>
  );
};

export default AppLayout;