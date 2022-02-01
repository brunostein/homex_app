import { StyleSheet } from 'react-native';

export const generalStyles = StyleSheet.create({
  itemCategoryIcon: {
    backgroundColor: '#003f5c',
    marginLeft: 0
  },
  positionLeft: {
    left: 10
  }
});

export const screenActionsStyles = StyleSheet.create({
  bgColor: {
    backgroundColor: '#fb5b5a',
  }
});

export const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: '#003f5c'
  }
});

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003f5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    fontWeight:"bold",
    fontSize:50,
    color:"#fb5b5a",
    marginBottom:40
  },
  inputView:{
    width:"80%",
    backgroundColor:"#465881",
    borderRadius:25,
    height:50,
    marginBottom:20,
    justifyContent:"center",
    padding:20
  },
  inputText:{
    height:50,
    color:"white"
  },
  forgot:{
    color:"white",
    fontSize:11
  },
  signInBtn:{
    width:"80%",
    backgroundColor:"#fb5b5a",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginTop:40,
    marginBottom:10
  },
  signUpBtn:{
    width:"80%",
    backgroundColor:"#ccc",
    borderRadius:25,
    height:50,
    alignItems:"center",
    justifyContent:"center",
    marginTop:40,
    marginBottom:0
  },
  loginText:{
    color:"white"
  }
});
