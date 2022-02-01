import * as React from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, Avatar, Card, IconButton, Button, TextInput } from 'react-native-paper';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { getUserHomes, createHome, updateHome } from '../services/api-homes';
import { createCategory, updateCategory } from '../services/api-categories';
import AppLayout from '../components/AppLayout';
import { headerStyles } from '../AppStyles';

const HomeCategoryForm = (props) => {

  const route = useRoute();
  const navigation = useNavigation();
  const [category, setCategory] = React.useState(null);
  const [name, setName] = React.useState('');
  
  const onAddCategory = () => {

    let data = {
      home_id: props.viewHome.id,
      name,
    }

    createCategory(data).then(result => {
      if (result !== null && result.success === true) {
        navigation.navigate('HomeItems');
      }
    });
  }
  
  const onUpdateCategory = () => {

    let data = {
      name,
    }

    updateCategory(category.id, data).then(result => {
      if (result !== null && result.success === true) {
        navigation.navigate('HomeItems');
      }
    });
  }
  
  const onFormActionCallback = () => {
    if (category !== null) {
      onUpdateCategory();
    } else {
      onAddCategory();
    }
  }
  
  const onLoadPage = () => {
    let { category } = route.params;
    
    setCategory(null);
    setName("");

    if (category !== null) {
      setCategory(category);
      setName(category.name);
    }
  }
  
  React.useEffect(() => {
    onLoadPage();
  }, [route]);

  return (
    <View>
      <Appbar.Header style={headerStyles.container}>
        <Appbar.BackAction onPress={() => navigation.navigate('HomeItems')} />
        <Appbar.Content title="Home-X" subtitle={(category ? "Atualizar Categoria: " + name : "Adicionar uma nova Categoria")} />
      </Appbar.Header>

      <AppLayout>
        
        <Card style={{marginBottom: 5}}>
          <Card.Content>
            <Text style={{marginBottom: 15, fontSize: 18}}>Informações da Categoria</Text>
            <TextInput
              label="Nome"
              value={name}
              onChangeText={text => setName(text)}
              style={{marginBottom:10}}
            />
            <Button icon="content-save" mode="outlined" onPress={() => onFormActionCallback()} style={{marginTop: 15}}>
              {(category ? "Atualizar" : "Cadastrar")}
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

export default connect(mapStateToProps)(HomeCategoryForm);