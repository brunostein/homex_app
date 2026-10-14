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
import Recipes from './screens/Recipes';
import RecipeForm from './screens/RecipeForm';
import RecipeDetail from './screens/RecipeDetail';
import RecipeShare from './screens/RecipeShare';

import HomeAgenda from './screens/HomeAgenda';
import HomeLocations from './screens/HomeLocations';
import ShoppingLists from './screens/ShoppingLists';
import ShoppingListDetail from './screens/ShoppingListDetail';
import ShoppingGenerate from './screens/ShoppingGenerate';

const Drawer = createDrawerNavigator();

const AppDrawerNavigator = (props) => {
  return (
    <NavigationContainer>
      <Drawer.Navigator screenOptions={{ headerShown: false }}>
        {(props.userLogged === null || props.needNewAuth) ? (
          <Drawer.Screen name="Login" component={Login} options={{ swipeEnabled: false }} />
        ) : (
          <>
            <Drawer.Screen name="Home" component={Home} options={{ title: 'Minhas casas' }} />
            <Drawer.Screen name="Recipes" component={Recipes} options={{ title: 'Receitas' }} listeners={({ navigation }) => ({ drawerItemPress: event => { event.preventDefault(); navigation.closeDrawer(); navigation.navigate('Recipes', { home: null }); } })} />
            <Drawer.Screen name="RecipeForm" component={RecipeForm} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="RecipeDetail" component={RecipeDetail} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="RecipeShare" component={RecipeShare} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeAgenda" component={HomeAgenda} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeLocations" component={HomeLocations} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="ShoppingLists" component={ShoppingLists} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="ShoppingListDetail" component={ShoppingListDetail} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="ShoppingGenerate" component={ShoppingGenerate} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeForm" component={HomeForm} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeShare" component={HomeShare} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeInfo" component={HomeInfo} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeItems" component={HomeItems} options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HomeCategoryForm" component={HomeCategoryForm} options={{ drawerItemStyle: { display: 'none' } }} />
          </>
        )}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const mapStateToProps = state => ({
  userLogged: state.user.user,
  needNewAuth: state.user.needNewAuth,
});

export default connect(mapStateToProps)(AppDrawerNavigator);