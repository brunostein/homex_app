import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { connect } from 'react-redux';
import Login from './screens/Login';
import Home from './screens/Home';
import HomeForm from './screens/HomeForm';
import HomeShare from './screens/HomeShare';
import HomeInfo from './screens/HomeInfo';
import HomeItems from './screens/HomeItems';
import HomeCategoryForm from './screens/HomeCategoryForm';

const Drawer = createDrawerNavigator();

const AppDrawerNavigator = (props) => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName={((props.userLogged === null || props.needNewAuth === true) ? "Login" : "Home")}>
        <Drawer.Screen name="Login" component={Login} />
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="HomeForm" component={HomeForm} />
        <Drawer.Screen name="HomeShare" component={HomeShare} />
        <Drawer.Screen name="HomeInfo" component={HomeInfo} />
        <Drawer.Screen name="HomeItems" component={HomeItems} />
        <Drawer.Screen name="HomeCategoryForm" component={HomeCategoryForm} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const mapStateToProps = state => ({
  userLogged: state.user.user,
  needNewAuth: state.user.needNewAuth,
});

export default connect(mapStateToProps)(AppDrawerNavigator);