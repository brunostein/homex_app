import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, TextInput, Avatar, Card, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { createHome, updateHome } from '../services/api-homes';
import AppLayout from '../components/AppLayout';
import { headerStyles } from '../AppStyles';

const HomeForm = (props) => {

  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [descr, setDescr] = useState('');
  
  const onAddHome = () => {

    let data = {
      user_id: props.userLogged.id,
      name,
      descr
    }

    createHome(data).then(result => {
      if (result !== null && result.success === true) {
        navigation.navigate('Home');
      }
    });
  }
  
  const onUpdateHome = () => {

    let data = {
      name,
      descr
    }

    updateHome(props.viewHome, data).then(result => {
      if (result !== null && result.success === true) {
        navigation.navigate('Home');
      }
    });
  }
  
  const onFormActionCallback = () => {
    if (props.viewHome !== null) {
      onUpdateHome();
    } else {
      onAddHome();
    }
  }
  
  const onLoadPage = () => {
    setName("");
    setDescr("");
    
    if (props.viewHome !== null) {
      setName(props.viewHome.name);
      setDescr(props.viewHome.descr);
    }
  }

  useEffect(() => {
    onLoadPage();
  }, []);

  return (
    <View>

      <Appbar.Header style={headerStyles.container}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="Gerenciamento de Casas" subtitle={(props.viewHome !== null ? "Atualizar Casa: " + props.viewHome.name : "Adicionar uma nova Casa")} />
      </Appbar.Header>
      
      <AppLayout>

        <Card style={{marginBottom: 5}}>
          <Card.Content>
            <Text style={{marginBottom: 15, fontSize: 18}}>Informações da Casa</Text>
            <TextInput
              label="Nome"
              value={name}
              onChangeText={text => setName(text)}
              style={{marginBottom:10}}
            />
            <TextInput
              label="Descrição"
              value={descr}
              onChangeText={text => setDescr(text)}
            />
            <Button icon="content-save" mode="outlined" onPress={() => onFormActionCallback()} style={{marginTop: 15}}>
              {(props.viewHome !== null ? "Atualizar" : "Cadastrar")}
            </Button>
          </Card.Content>
        </Card>

      </AppLayout>
    </View>
  );
};

const mapStateToProps = state => ({
  userLogged: state.user.user,
  viewHome: state.home.viewHome
});

export default connect(mapStateToProps)(HomeForm);