import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getRecipe } from '../services/api-recipes';
import { FormButton, FormFeedback, colors, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListBadge, ListLoading, styles } from '../components/lists/ListKit';

export default function RecipeDetail() {
  const navigation = useNavigation(); const route = useRoute(); const focused = useIsFocused();
  const id = route.params?.id; const home = route.params?.home || null;
  const request = useRef(0);
  const { width } = useWindowDimensions();
  const [recipe, setRecipe] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    const current = ++request.current;
    setLoading(true); setError(''); setRecipe(null);
    try { const result = await getRecipe(id); if (current === request.current) setRecipe(result.data); }
    catch (err) { if (current === request.current) setError(formError(err, 'Não foi possível abrir esta receita.')); }
    finally { if (current === request.current) setLoading(false); }
  }, [id]);
  useEffect(() => { if (focused) load(); return () => { request.current += 1; }; }, [focused, load]);
  return <ListScreen onBack={() => navigation.navigate('Recipes', { home })}>
    <FormFeedback message={error} />
    {loading ? <ListLoading message="Abrindo a receita..." /> : !recipe ? <FormButton onPress={() => navigation.navigate('Recipes', { home })} secondary>Voltar às receitas</FormButton> : <>
      <ListHeading eyebrow={home ? home.name.toUpperCase() : 'CADERNO DE RECEITAS'} title={recipe.title} subtitle={recipe.description || 'Um sabor para guardar e preparar de novo.'} action={recipe.can_edit ? () => navigation.navigate('RecipeShare', { id, home }) : undefined} actionLabel="Compartilhar receita" actionIcon="account-multiple-outline" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 24 }}>
        <ListBadge shared={!recipe.can_edit} icon="account-outline">{recipe.can_edit ? 'Minha receita' : `Por ${recipe.author?.fullName || 'outra pessoa'}`}</ListBadge>
        {!!recipe.prep_minutes && <ListBadge icon="clock-outline">{recipe.prep_minutes} min</ListBadge>}
        {!!recipe.servings && <ListBadge icon="silverware-fork-knife">{recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}</ListBadge>}
        {!recipe.can_edit && <ListBadge shared icon="eye-outline">Acesso de leitura</ListBadge>}
      </View>
      {recipe.can_edit && <FormButton secondary icon="pencil-outline" onPress={() => navigation.navigate('RecipeForm', { id, home })} style={{ alignSelf: 'flex-start', marginBottom: 24 }}>Editar receita</FormButton>}
      <View style={{ flexDirection: width >= 850 ? 'row' : 'column', alignItems: 'flex-start', gap: 20 }}>
        <View style={[styles.card, { padding: 24, flex: width >= 850 ? 1 : undefined, width: width < 850 ? '100%' : undefined }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 }}><Icon accessible={false} name="basket-outline" size={23} color={colors.primary} /><Text accessibilityRole="header" style={styles.cardTitle}>Ingredientes</Text></View>
          {recipe.ingredients.split(/\r?\n/).filter(line => line.trim()).map((line, index) => <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderTopWidth: index ? 1 : 0, borderTopColor: '#EDF1F3' }}><View style={{ width: 6, height: 6, marginTop: 9, backgroundColor: colors.accent, borderRadius: 3 }} /><Text style={{ flex: 1, color: colors.ink, fontSize: 15, lineHeight: 25 }}>{line.trim()}</Text></View>)}
        </View>
        <View style={[styles.card, { padding: 24, flex: width >= 850 ? 2 : undefined, width: width < 850 ? '100%' : undefined }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 }}><Icon accessible={false} name="chef-hat" size={23} color={colors.primary} /><Text accessibilityRole="header" style={styles.cardTitle}>Modo de preparo</Text></View>
          {recipe.instructions.split(/\r?\n/).filter(line => line.trim()).map((line, index) => <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 12 }}><View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontWeight: '700' }}>{index + 1}</Text></View><Text style={{ flex: 1, color: colors.ink, fontSize: 15, lineHeight: 26 }}>{line.trim().replace(/^\d+[.)-]\s*/, '')}</Text></View>)}
        </View>
      </View>
    </>}
  </ListScreen>;
}
