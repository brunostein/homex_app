import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../forms/FormKit';

const sections = [
  { route: 'HomeInfo', label: 'Painel', accessibilityLabel: 'Painel da casa', icon: 'view-dashboard-outline', routes: ['HomeInfo'] },
  { route: 'HomeItems', label: 'Inventário da Casa', accessibilityLabel: 'Inventário da casa', icon: 'package-variant-closed', routes: ['HomeItems', 'HomeLocations'] },
  { route: 'ShoppingLists', label: 'Lista de Compras', accessibilityLabel: 'Lista de compras', icon: 'cart-outline', routes: ['ShoppingLists', 'ShoppingListDetail', 'ShoppingGenerate'] },
  { route: 'Recipes', label: 'Receitas', accessibilityLabel: 'Receitas da casa', icon: 'chef-hat', routes: ['Recipes', 'RecipeDetail'] },
  { route: 'HomeAgenda', label: 'Agenda', accessibilityLabel: 'Agenda da casa', icon: 'calendar-month-outline', routes: ['HomeAgenda'] },
];
function HouseNavigation({ selectedHome }) {
  const route = useRoute(); const navigation = useNavigation(); const focused = useIsFocused();
  const scroll = useRef(null); const positions = useRef({});
  const recipeScreen = ['Recipes', 'RecipeDetail'].includes(route.name);
  const home = recipeScreen ? route.params?.home : selectedHome;
  const active = sections.find(section => section.routes.includes(route.name));
  const reveal = () => { if (active && positions.current[active.route] != null) scroll.current?.scrollTo({ x: Math.max(0, positions.current[active.route] - 20), animated: false }); };
  useEffect(() => { if (focused) reveal(); }, [focused, active?.route, home?.id]);
  if (!home || !active) return null;
  const open = section => {
    if (section.route === 'Recipes') navigation.navigate('Recipes', { home });
    else if (section.route === 'HomeItems') navigation.navigate('HomeItems', { filter: 'all' });
    else if (section.route === 'HomeAgenda') navigation.navigate('HomeAgenda', { filter: 'pending' });
    else navigation.navigate(section.route);
  };
  return <View testID="house-navigation" style={{ backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }}>
    <View style={{ width: '100%', maxWidth: 1160, alignSelf: 'center' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Icon accessible={false} name="home-outline" size={15} color={colors.muted} /><Text numberOfLines={1} style={{ color: colors.muted, fontSize: 12, fontWeight: '600', flex: 1 }}>{home.name}</Text></View>
      <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, gap: 8 }}>
        {sections.map(section => {
          const selected = active.route === section.route;
          return <Pressable key={section.route} accessibilityRole="button" accessibilityLabel={section.accessibilityLabel} accessibilityState={{ selected }} aria-current={selected ? 'page' : undefined} onLayout={event => { positions.current[section.route] = event.nativeEvent.layout.x; if (selected && focused) reveal(); }} onPress={() => open(section)} style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: selected ? colors.primary : pressed ? '#EAF2F2' : '#F5F8F9', borderWidth: 1, borderColor: selected ? colors.primary : '#EDF1F3', opacity: pressed ? 0.8 : 1 })}>
            <Icon accessible={false} name={section.icon} size={18} color={selected ? colors.white : colors.primary} /><Text style={{ color: selected ? colors.white : colors.primary, fontSize: 13, fontWeight: '600' }}>{section.label}</Text>
          </Pressable>;
        })}
      </ScrollView>
    </View>
  </View>;
}
export default connect(state => ({ selectedHome: state.home.viewHome }))(HouseNavigation);
