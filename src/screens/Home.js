import React, { useState, useEffect } from 'react';
import { Text, View, SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { Avatar, Card, Appbar, Chip, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { setUserHomes, setViewHome } from '../redux/actions/home';
import { getUserHomes, removeHome } from '../services/api-homes';
import { getUserById } from '../services/api-users';
import ScreenActions from '../components/Home/ScreenActions';
import HomeMenu from '../components/Home/HomeMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import AppLayout from '../components/AppLayout';
import { headerStyles } from '../AppStyles';

const Home = (props) => {
  
  const route = useRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = React.useState(false);
  
  const [ onMenuActionsShow, setOnMenuActionsShow ] = useState(false);
  
  const [ onConfirmShow, setOnConfirmShow ] = useState(false);
  const [ onConfirmTitle, setOnConfirmTitle ] = useState("");
  const [ onConfirmMessage, setOnConfirmMessage ] = useState("");
  const [ onConfirmData, setOnConfirmData ] = useState("");

  const screenActionsCallback = (action) => {
    if (action === "add") {
      navigation.navigate('HomeForm', {home: null});
    }
  }

  const homeMenuActionsCallback = (home, action) => {
    if (action === "delete") {
      setOnConfirmTitle(home.name);
      setOnConfirmMessage("Deseja realmente remover esta casa?");
      setOnConfirmShow(true);
      setOnConfirmData({
        "action": action,
        "home": home
      });
    } else if (action === "edit") {
      props.setViewHome(home);
      navigation.navigate("HomeForm");
    } else if (action === "show") {
      props.setViewHome(home);
      navigation.navigate("HomeInfo");
    } else if (action === "share") {
      props.setViewHome(home);
      navigation.navigate("HomeShare");
    }
  }
  
  const onConfirmCallback = () => {
    setOnConfirmShow(false);

    if (onConfirmData.action === "delete") {
      removeHome(onConfirmData.home.id).then(result => {
        if (result !== null && result.success === true) {
          onLoadUserHomes();
        }
      });
    }
  }

  const onLoadUserHomes = () => {
    getUserById(props.userLogged.id).then(result => {
      if (result !== null && result.success === true) {
        let homes = Object.assign(result.data.homes, result.data.homes_shared);
        props.setUserHomes(homes);
      }
    });
  }
  
  const onOpenDrawerMenu = () => {
    navigation.openDrawer();
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await onLoadUserHomes();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (isFocused) {
      onLoadUserHomes();
    }
  },[isFocused]);

  return (
    <ScreenActions callback={screenActionsCallback}>

      <Appbar.Header style={headerStyles.container}>
        <Appbar.Action icon="menu" onPress={onOpenDrawerMenu} />
        <Appbar.Content title="Home-X" subtitle="Minhas casas cadastradas" />
      </Appbar.Header>

      <AppLayout>

        <SafeAreaView>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          >
          
          <View>
          {props.homes.map((home, index) => {
            return (
              <Card key={index} style={{marginBottom: 5}}>
                <Card.Title
                  title={home.name}
                  subtitle={home.descr}
                  left={(props) => <Avatar.Icon {...props} icon={(home.shared_homes === undefined ? "home-account" : "share-variant")} />}
                  right={(props) => {
                    if (home.shared_homes === undefined || home.shared_homes.permission !== "read") {
                      return <HomeMenu visible={onMenuActionsShow} home={home} onClickMenuCallback={homeMenuActionsCallback} />
                    }
                  }}
                />
                <Card.Content>

                  <Divider style={{marginBottom: 15}} />

                  <View style={{
                    alignItems: 'center',
                    flex: 1,
                    justifyContent: 'center'
                  }}>
                  <Text>
                    {(home.shared_homes === undefined || home.shared_homes.permission !== "read") && 
                    <Text>
                    <Chip icon="home-edit-outline" onPress={() => homeMenuActionsCallback(home, 'edit')} style={{marginTop: 25}}>Editar</Chip> 
                    <Chip icon="home-remove" onPress={() => homeMenuActionsCallback(home, 'delete')}>Remover</Chip> 
                    </Text>
                    }
                    <Chip icon="home-search-outline" onPress={() => homeMenuActionsCallback(home, 'show')}>Visualizar</Chip>
                  </Text>
                  </View>
                </Card.Content>
              </Card>
            )
          })}
          </View>
          </ScrollView>
        </SafeAreaView>

        <ConfirmDialog 
          visible={onConfirmShow} 
          title={onConfirmTitle} 
          message={onConfirmMessage} 
          onCalcelCallback={() => setOnConfirmShow(false)} 
          onConfirmCallback={onConfirmCallback} 
        />
      
      </AppLayout>

    </ScreenActions>
  );
}

const mapStateToProps = state => ({
  userLogged: state.user.user,
  homes: state.home.homes
});

const mapDispatchToProps = {
  setUserHomes: (data) => setUserHomes(data),
  setViewHome: (data) => setViewHome(data)
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
