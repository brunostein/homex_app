import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import { Appbar, TextInput, Card, Button, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { shareHome, getHomeById } from '../services/api-homes';
import AppLayout from '../components/AppLayout';
import { headerStyles } from '../AppStyles';

const HomeShare = (props) => {
  
  const navigation = useNavigation();

  const [ email, setEmail ] = useState('');
  const [ sharedUsers, setSharedUsers ] = useState([]);

  const onShareHome = () => {

    let data = {
      email,
    }

    shareHome(props.viewHome.id, data).then(result => {
      console.log(result);
      if (result !== null && result.success === true) {
        navigation.navigate('Home');
      }
    });
  }
  
  const onLoadSharedUsers = () => {
    getHomeById(props.viewHome.id).then(result => {
      if (result !== null && result.success === true) {
        setSharedUsers(result.data.shared_users);
      }
    });
  }
  
  const onFormActionCallback = () => {
    onShareHome();
  }
  
  const onLoadPage = () => {
    setEmail("");
    onLoadSharedUsers();
  }
  
  React.useEffect(() => {
    onLoadPage();
  }, [props]);

  return (
    <View>

      <Appbar.Header style={headerStyles.container}>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title={props.viewHome.name} subtitle="Compartilhar Casa" />
      </Appbar.Header>
      
      <AppLayout>
        
        <Card style={{marginBottom: 5}}>
          <Card.Content>
            <Text style={{marginBottom: 15, fontSize: 18}}>Email</Text>
            <TextInput
              label="Email"
              value={email}
              onChangeText={text => setEmail(text)}
              style={{marginBottom:10}}
            />
            <Button icon="content-save" mode="outlined" onPress={() => onFormActionCallback()} style={{marginTop: 15}}>
              Compartilhar
            </Button>
          </Card.Content>
        </Card>

        <List.Section>
          <List.Subheader>Compartilhado com</List.Subheader>
            {sharedUsers.map(user => {
              return <List.Item title={user.fullName} left={() => <List.Icon icon="share-variant" />} />
            })}
        </List.Section>
        

      </AppLayout>
    </View>
  );
};

const mapStateToProps = state => ({
  userLogged: state.user.user,
  viewHome: state.home.viewHome
});

export default connect(mapStateToProps)(HomeShare);