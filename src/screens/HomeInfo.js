import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, Button, } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AppLayout from '../components/AppLayout';
import { headerStyles } from '../AppStyles';

const HomeInfo = (props) => {
  
  const navigation = useNavigation();
 
  const openHomeItems = () => {
    navigation.navigate('HomeItems');
  }

  return (
    <View>

      <Appbar.Header style={headerStyles.container}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title={props.viewHome.name} subtitle="Informações desta Casa" />
      </Appbar.Header>

      <AppLayout>

        <View>
           <Button icon="clipboard-list" mode="contained" onPress={openHomeItems}>
            Inventário de Produtos
          </Button>
        </View>

      </AppLayout>
    </View>
  );
};

const mapStateToProps = state => ({
  viewHome: state.home.viewHome
});

export default connect(mapStateToProps)(HomeInfo);
