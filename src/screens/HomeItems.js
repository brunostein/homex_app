import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, RefreshControl, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { Appbar, Card, Avatar, Chip, Colors, IconButton, TextInput, Divider } from 'react-native-paper';
import { getCategories, removeCategory } from '../services/api-categories';
import { getUnitsMeasurements } from '../services/api-units-measurements';
import { updateItem, createItem, removeItem } from '../services/api-items';
import { setCategories } from '../redux/actions/category';
import { setUnitsMeasurements } from '../redux/actions/unit_measurement';
import AppLayout from '../components/AppLayout';
import ScreenActions from '../components/HomeItems/ScreenActions';
import ConfirmDialog from '../components/ConfirmDialog';
import CategoryMenu from '../components/HomeItems/CategoryMenu';
import { headerStyles, generalStyles } from '../AppStyles';

const HomeItems = (props) => {
  
  const route = useRoute();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  
  const [ formCategoryAction, setFormCategoryAction ] = useState(null);
  const [ formCategoryId, setFormCategoryId ] = useState();
  const [ formCategoryName, setFormCategoryName ] = useState();

  const [ formItemAction, setFormItemAction ] = useState(null);
  const [ formItemCategoryId, setFormItemCategoryId ] = useState();
  const [ formItemId, setFormItemId ] = useState(null);
  const [ formItemName, setFormItemName ] = useState();
  const [ formItemAmount, setFormItemAmount ] = useState(0);
  
  const [ onMenuActionsShow, setOnMenuActionsShow ] = useState(false);
  
  const [ onConfirmShow, setOnConfirmShow ] = useState(false);
  const [ onConfirmTitle, setOnConfirmTitle ] = useState("");
  const [ onConfirmMessage, setOnConfirmMessage ] = useState("");
  const [ onConfirmData, setOnConfirmData ] = useState("");
  
  const [ refreshing, setRefreshing ] = useState(false);
  
  const [ expanded, setExpanded ] = useState(true);
  
  const screenActionsCallback = (action) => {
    if (action === "add") {
      navigation.navigate('HomeCategoryForm', {category: null});
    }
  }
  
  const categoryMenuActionsCallback = (data, action) => {
    if (action === "delete") {
      setOnConfirmTitle(data.category.name);
      setOnConfirmMessage("Deseja realmente remover esta categoria. Todos os itens desta categoria serão removidos?");
      setOnConfirmShow(true);
      setOnConfirmData({
        "action": "delete-category",
        "category": data.category,
        "indexCategory": data.indexCategory
      });
    } else if (action === "edit") {
      navigation.navigate('HomeCategoryForm', data);
    }
  }

  const addItemToogleForm = (indexCategory) => {

    let categories = [...props.categories];
    let category = categories[indexCategory];
    
    setFormItemCategoryId(category.id);

    if (!categories[indexCategory].openItemForm) {
      categories[indexCategory].openItemForm = true;
      setFormItemAction('add');
    } else {
      categories[indexCategory].openItemForm = false;
      setFormItemAction(null);
    }

    props.setCategories(categories);

  }
  
  const editItem = (indexCategory, indexItem) => {
    
    let categories = [...props.categories];
    let item = categories[indexCategory].items[indexItem];
    
    if (item !== null) {
      setFormItemCategoryId(item.category_id);
      setFormItemId(item.id);
      setFormItemName(item.name);
      setFormItemAmount(item.amount);
      setFormItemAction('update');
      categories[indexCategory].openItemForm = true;
      props.setCategories(categories);
    }
  }
  
  const onConfirmCallback = async () => {
    setOnConfirmShow(false);
    
    let categories = [...props.categories];
    
    if (onConfirmData.action === "delete-category") {
      let categoryId = onConfirmData.category.id;
      if (categoryId) {
        let result = await removeCategory(categoryId);
        if (result !== undefined && result.success === true) {
          delete categories[onConfirmData.indexCategory];
          props.setCategories(categories);
        }
      }

    } else if (onConfirmData.action === "delete-item") {
      
      let item = categories[onConfirmData.indexCategory].items[onConfirmData.indexItem];
      
      if (item) {
        let result = await removeItem(item.id);
        if (result !== undefined && result.success === true) {
          delete categories[indexCategory].items[indexItem];
          props.setCategories(categories);
        }
      }
    }
  }
  
  const confirmDeleteItem = async (indexCategory, indexItem) => {
    
    let categories = [...props.categories];
    let item = categories[indexCategory].items[indexItem];
    
    if (item !== null) {
      setOnConfirmTitle(item.name);
      setOnConfirmMessage("Deseja realmente remover este Item?");
      setOnConfirmShow(true);
      setOnConfirmData({
        "action": "delete-item",
        indexCategory,
        indexItem
      });
    }
  }
  
  const deleteItem = async (indexCategory, indexItem) => {
    
    let categories = [...props.categories];
    let item = categories[indexCategory].items[indexItem];
    
    if (item) {
      let result = await removeItem(item.id);
      if (result !== undefined && result.success === true) {
        delete categories[indexCategory].items[indexItem];
        props.setCategories(categories);
      }
    }
  }
  
  const saveCategory = async () => {
    
    if (formCategoryAction == "add") {
      let data = {
        home_id: props.viewHome.id,
        name: formCategoryName,
      }
      
      let result = await createCategory(data);
      if (result !== undefined && result.success === true) {
        reloadCategories();
      }

    } else if (formItemAction == "update") {
      let data = {
        name: formCategoryName,
      }

      let result = await updateCategory(formCategoryId, data);
      if (result !== undefined && result.success === true) {
        reloadCategories();
      }
    }

    setFormCategoryId(null);
    setFormCategoryName("");
    setFormCategoryAction(null);
  }
  
  const saveItem = async () => {
    
    if (formItemAction == "add") {
      let data = {
        category_id: formItemCategoryId,
        name: formItemName,
        amount: formItemAmount
      }
      
      let result = await createItem(data);
      if (result !== undefined && result.success === true) {
        reloadCategories();
      }

    } else if (formItemAction == "update") {
      let data = {
        category_id: formItemCategoryId,
        name: formItemName,
        amount: formItemAmount
      }
      
      let result = await updateItem(formItemId, data);
      if (result !== undefined && result.success === true) {
        reloadCategories();
      }
    }
    
    setFormItemCategoryId(null);
    setFormItemId(null);
    setFormItemName("");
    setFormItemAmount(0);
    setFormItemAction(null);
  }
  
  const closeForm = (form, indexCategory) => {
    
    let categories = [...props.categories];
    
    if (form == "item") {
      categories[indexCategory].openItemForm = false;

      setFormItemCategoryId(null);
      setFormItemId(null);
      setFormItemName("");
      setFormItemAmount(0);
      setFormItemAction(null);

    } else if (form == "category") {
      categories[indexCategory].openCategoryForm = false;
      
      setFormCategoryId(null);
      setFormCategoryName("");
      setFormCategoryAction(null);
    }
    props.setCategories(categories);
  }
  
  const increaseItem = (indexCategory, indexItem) => {

    let categories = [...props.categories];
    let amount = categories[indexCategory].items[indexItem].amount+1;
    let itemId = categories[indexCategory].items[indexItem].id;

    let data = {
      amount
    };
    updateItem(itemId, data).then(result => {
      if (result !== undefined && result.success === true) {
        categories[indexCategory].items[indexItem].amount = amount;
        props.setCategories(categories);
      }
    });    
  }

  const decreaseItem = (indexCategory, indexItem) => {

    let categories = [...props.categories];
    let amount = categories[indexCategory].items[indexItem].amount-1;
    
    if (amount < 0) {
      return;
    }
    
    let itemId = categories[indexCategory].items[indexItem].id;
    let data = {
      amount
    };
    updateItem(itemId, data).then(result => {
      if (result !== undefined && result.success === true) {
        categories[indexCategory].items[indexItem].amount = amount;
        props.setCategories(categories);
      }
    });
  }

  const reloadUnitsMeasurements = async () => {
    getUnitsMeasurements().then(result => {
      if (result && result.success === true) {
        props.setUnitsMeasurements(result.data);
      }
    });
  }
  
  const reloadCategories = async () => {
    if (props.viewHome !== null) {
      getCategories(props.viewHome.id).then(result => {
        if (result && result.success === true) {
          props.setCategories(result.data);
        }
      });
    }
  }
  
  const onLoadScreen = async () => {
    reloadCategories();
    reloadUnitsMeasurements();
  }
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await reloadCategories();
    await reloadUnitsMeasurements();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (isFocused) {
      onLoadScreen();
    }
  }, [route, isFocused]);

  return (
    <ScreenActions callback={screenActionsCallback}>

      <Appbar.Header style={headerStyles.container}>
        <Appbar.BackAction onPress={() => navigation.navigate('HomeInfo')} />
        <Appbar.Content title={props.viewHome.name} subtitle="Inventário de Produtos" />
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
            {(props.categories !== null) && props.categories.map((category, index) => {
              return (
               <Card key={index} style={{marginBottom: 5}}>
                <Card.Title
                  title={category.name}
                  left={(props) => <Avatar.Icon {...props} icon="clipboard-list" style={generalStyles.itemCategoryIcon} />}
                  right={(props) => {
                    return (
                    <Text>
                      <IconButton {...props} icon="plus" onPress={() => addItemToogleForm(index) } />
                      <CategoryMenu visible={onMenuActionsShow} data={{category: category, indexCategory:index}} onClickMenuCallback={categoryMenuActionsCallback} />
                    </Text>
                    )
                  }}
                />
                <Card.Content>

                  <Divider />

                  {((category.openCategoryForm || false) === true) && 
                    <Card style={{marginBottom: 10}}>
                      <Card.Content>
                        <Text style={{marginBottom: 10}}>Adicionar Nova Categoria</Text>
                        <View style={{flex:1, alignItem:'center'}}>
                          <TextInput
                            label="Nome"
                            value={formCategoryName}
                            onChangeText={text => setFormCategoryName(text)}
                          />
                          <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                          }}>
                            <Text>
                              <Chip 
                                icon="content-save" 
                                onPress={() => saveCategory()}
                              >
                                Salvar
                              </Chip>
                              <IconButton
                                icon="close"
                                color={Colors.red500}
                                size={20}
                                onPress={() => closeForm('category', index)}
                              />
                            </Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  }

                  {((category.openItemForm || false) === true) && 
                    <Card style={{marginBottom: 10}}>
                      <Card.Content>
                        <Text style={{marginBottom: 10}}>Adicionar Novo Item</Text>
                        <View style={{flex:1, alignItem:'center'}}>
                          <TextInput
                            label="Item"
                            value={formItemName}
                            onChangeText={text => setFormItemName(text)}
                          />
                          <View style={{
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 10,
                          }}>
                            <Text>
                              <Chip icon="plus" style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} onPress={() => setFormItemAmount(formItemAmount+1)}></Chip>
                              <Chip mode="outlined" style={{borderRadius: 0}}>{formItemAmount}</Chip>
                              <Chip icon="minus" style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}} onPress={() => setFormItemAmount(formItemAmount-1)}></Chip>
                              <Chip icon="content-save" style={{left: 10}} onPress={() => saveItem()}>Salvar</Chip>
                              <IconButton
                                icon="close"
                                color={Colors.red500}
                                size={20}
                                onPress={() => closeForm('item', index)}
                              />
                            </Text>
                          </View>
                        </View>
                      </Card.Content>
                    </Card>
                  }

                  {category.items.map((item, itemIndex) => {
                    return (
                      <View key={itemIndex} style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 10
                      }}>
                        <Text style={{
                          flex: 1,
                          justifyContent: 'flex-start',
                        }}>
                          {(item ? item.name : "")}
                        </Text>
                        <Text style={{
                          flex: 0,
                          justifyContent: 'flex-end',                          
                        }}>
                          <Chip icon="plus" style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} onPress={() => increaseItem(index, itemIndex)}></Chip>
                          <Chip mode="outlined" style={{borderRadius: 0}}>{(item ? item.amount : 0)}</Chip>
                          <Chip icon="minus" style={{borderTopLeftRadius: 0, borderBottomLeftRadius: 0}} onPress={() => decreaseItem(index, itemIndex)}></Chip>
                          <IconButton
                            icon="square-edit-outline"
                            color={Colors.red500}
                            size={20}
                            onPress={() => editItem(index, itemIndex)}
                          />
                          <IconButton
                            icon="delete"
                            color={Colors.red500}
                            size={20}
                            onPress={() => confirmDeleteItem(index, itemIndex)}
                          />                                   
                        </Text>
                      </View>
                    )
                  })}
                </Card.Content>
              </Card>
              )
            })}

            <ConfirmDialog 
              visible={onConfirmShow} 
              title={onConfirmTitle} 
              message={onConfirmMessage} 
              onCalcelCallback={() => setOnConfirmShow(false)} 
              onConfirmCallback={onConfirmCallback} 
            />
          </ScrollView>
        </SafeAreaView>

      </AppLayout>

    </ScreenActions>
  );
};

const mapStateToProps = state => ({
  categories: state.category.categories,
  unitsMeasurements: (state.unit_measurement ? state.unit_measurement.units_measurements : null),
  viewHome: state.home.viewHome
});

const mapDispatchToProps = {
  setCategories: (data) => setCategories(data),
  setUnitsMeasurements: (data) => setUnitsMeasurements(data)
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeItems);
