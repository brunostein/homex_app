import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux'
import { setLoggedUser } from '../redux/actions/user'
import { setUserHomes } from '../redux/actions/home'
import { setApiData } from '../redux/actions/api'
import config from "../config"
import { signIn, signUp } from '../services/api-users'
import { useNavigation } from '@react-navigation/native';
import { loginStyles } from '../AppStyles';

const Login = (props) => {

  const [ showForm, setShowForm ] = useState("signin");
  const [ userFullName, setUserFullName ] = useState("");
  const [ userEmail, setUserEmail ] = useState("");
  const [ userPassword, setUserPassword ] = useState("");
  const navigation = useNavigation();

  const signInAction = () => {
    let email = userEmail;
    let password = userPassword;

    setApiData(null);

    signIn(email, password).then(result => {
      if (result !== undefined && result.success === true) {

        let homes = Object.assign(result.data.homes, result.data.homes_shared);

        props.setLoggedUser(result.data);
        props.setUserHomes(homes);

        navigation.navigate('Home');
      }
    });
  }

  const signUpAction = () => {
    let fullName = userFullName;
    let email = userEmail;
    let password = userPassword;

    let userData = {
      fullName,
      email,
      password
    };

    signUp(userData).then(result => {
      if (result !== undefined && result.success === true) {
        setShowForm('signin');
      }
    });
  }

  useEffect(() => {
    if (props.userLogged !== null) {
      navigation.navigate('Home');
    }
  }, [props]);

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.logo}>{config.app.name}</Text>
      {(showForm === "signin")
      ? 
      <>
        <View style={loginStyles.inputView} >
          <TextInput  
            style={loginStyles.inputText}
            placeholder="Email..." 
            placeholderTextColor="#003f5c"
            onChangeText={text => setUserEmail(text)}/>
        </View>
        <View style={loginStyles.inputView} >
          <TextInput  
            secureTextEntry
            style={loginStyles.inputText}
            placeholder="Password..." 
            placeholderTextColor="#003f5c"
            onChangeText={text => setUserPassword(text)}/>
        </View>
        <TouchableOpacity>
          <Text style={loginStyles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={loginStyles.signInBtn} onPress={signInAction}>
          <Text style={loginStyles.loginText}>Signin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={loginStyles.signUpBtn} onPress={() => setShowForm('signup') }>
          <Text style={loginStyles.loginText}>Signup</Text>
        </TouchableOpacity>
      </>
      :
      <>
        <View style={loginStyles.inputView} >
          <TextInput  
            style={loginStyles.inputText}
            placeholder="Nome Completo..." 
            placeholderTextColor="#003f5c"
            onChangeText={text => setUserFullName(text)}/>
        </View>
        <View style={loginStyles.inputView} >
          <TextInput  
            style={loginStyles.inputText}
            placeholder="Email..." 
            placeholderTextColor="#003f5c"
            onChangeText={text => setUserEmail(text)}/>
        </View>
        <View style={loginStyles.inputView} >
          <TextInput  
            secureTextEntry
            style={loginStyles.inputText}
            placeholder="Password..." 
            placeholderTextColor="#003f5c"
            onChangeText={text => setUserPassword(text)}/>
        </View>
        <TouchableOpacity style={loginStyles.signUpBtn} onPress={signUpAction}>
          <Text style={loginStyles.loginText}>Signup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={loginStyles.signInBtn} onPress={() => setShowForm('signin') }>
          <Text style={loginStyles.loginText}>Signin</Text>
        </TouchableOpacity>
      </>
      }
    </View>
  );
}

const mapStateToProps = state => ({
  userLogged: state.user.user
});

const mapDispatchToProps = {
  setLoggedUser: (data) => setLoggedUser(data),
  setApiData: (data) => setApiData(data),
  setUserHomes: (data) => setUserHomes(data)
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
