import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getRecipes, deleteRecipe } from '../services/api-recipes';
import { FormButton, FormFeedback, colors, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListSearch, ListFilters, ListBadge, ListEmpty, ListLoading, ListActionsMenu, normalizeSearch, styles } from '../components/lists/ListKit';
import ConfirmDialog from '../components/ConfirmDialog';

function RecipeCollection({ home, user }) {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const request = useRef(0);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [gridWidth, setGridWidth] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const canCreate = !home || home.user_id === user.id;
  const load = useCallback(async () => {
    const current = ++request.current;
    setRefreshing(true); setError('');
    try {
      const result = await getRecipes(home?.id);
      if (current === request.current) {
        if (result.success) setRecipes(result.data);
        else setError(formError(result, 'Não foi possível carregar suas receitas.'));
      }
    } catch (err) { if (current === request.current) setError(formError(err, 'Não foi possível carregar suas receitas. Tente atualizar a lista.')); }
    finally { if (current === request.current) { setLoading(false); setRefreshing(false); } }
  }, [home?.id]);
  useEffect(() => { if (focused) load(); return () => { request.current += 1; }; }, [focused, load]);
  const add = () => navigation.navigate('RecipeForm', { id: null, home: home || null });
  const open = recipe => navigation.navigate('RecipeDetail', { id: recipe.id, home: home || null });
  const remove = async () => {
    if (!confirm || deleting) return;
    setDeleting(true); setDeleteError('');
    try {
      await deleteRecipe(confirm.id);
      setRecipes(previous => previous.filter(recipe => recipe.id !== confirm.id)); setConfirm(null);
    } catch (err) { setDeleteError(formError(err, 'Não foi possível remover a receita.')); }
    finally { setDeleting(false); }
  };
  const search = normalizeSearch(query);
  const visible = recipes.filter(recipe => (filter === 'all' || (filter === 'mine' ? recipe.can_edit : !recipe.can_edit)) && normalizeSearch(`${recipe.title} ${recipe.description || ''} ${recipe.ingredients}`).includes(search));
  const columns = gridWidth >= 700 ? 2 : 1;
  const cardWidth = gridWidth ? (gridWidth - 18 * (columns - 1)) / columns : '100%';
  return <ListScreen onBack={home ? () => navigation.navigate('HomeInfo') : undefined} onMenu={!home ? () => navigation.openDrawer() : undefined} userName={user.fullName} refreshing={refreshing && !loading} onRefresh={load}>
    <ListHeading eyebrow={home ? home.name.toUpperCase() : 'SABORES PARA GUARDAR E COMPARTILHAR'} title="Receitas" subtitle={home ? 'As receitas que fazem parte desta casa.' : 'Suas receitas favoritas e as que compartilharam com você.'} action={canCreate ? add : undefined} actionLabel="Nova receita" />
    <FormFeedback message={error} />
    <View style={styles.toolbar}><ListSearch label="Buscar receitas" placeholder="Buscar receita ou ingrediente" value={query} onChange={setQuery} onRefresh={load} refreshing={refreshing} /><ListFilters value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Todas', count: recipes.length }, { value: 'mine', label: 'Minhas', count: recipes.filter(recipe => recipe.can_edit).length }, { value: 'shared', label: 'Compartilhadas', count: recipes.filter(recipe => !recipe.can_edit).length }]} /></View>
    {loading ? <ListLoading message="Abrindo seu caderno de receitas..." /> : !visible.length ? <ListEmpty icon="book-open-page-variant-outline" title={error ? 'Não conseguimos abrir suas receitas.' : recipes.length ? 'Nenhuma receita encontrada.' : 'Toda boa receita merece ser guardada.'} description={error ? 'Tente atualizar a lista.' : recipes.length ? 'Tente outro termo ou veja todas as receitas.' : canCreate ? 'Cadastre os ingredientes e o modo de preparo. Depois, compartilhe com quem você gosta.' : 'Ainda não há receitas disponíveis para você nesta casa.'} action={error ? load : recipes.length ? () => { setQuery(''); setFilter('all'); } : canCreate ? add : undefined} actionLabel={error ? 'Atualizar lista' : recipes.length ? 'Ver todas as receitas' : 'Cadastrar primeira receita'} actionIcon={error ? 'refresh' : recipes.length ? 'filter-remove-outline' : 'plus'} /> : <>
      <Text style={[styles.meta, { marginBottom: 16 }]}>{visible.length} {visible.length === 1 ? 'receita para preparar' : 'receitas para preparar'}</Text>
      <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>{visible.map(recipe => <View key={recipe.id} testID={`recipe-${recipe.id}`} style={[styles.card, { width: cardWidth }]}>
        <View style={{ padding: 24, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' }}><Icon accessible={false} name="chef-hat" size={27} color={colors.primary} /></View>{recipe.can_edit && <ListActionsMenu name={recipe.title} options={[{ label: 'Editar', icon: 'pencil-outline', onPress: () => navigation.navigate('RecipeForm', { id: recipe.id, home: home || null }) }, { label: 'Compartilhar', icon: 'account-multiple-outline', onPress: () => navigation.navigate('RecipeShare', { id: recipe.id, home: home || null }) }, { label: 'Remover', icon: 'trash-can-outline', danger: true, onPress: () => { setDeleteError(''); setConfirm(recipe); } }]} />}</View>
          <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text><Text numberOfLines={2} style={[styles.subtitle, { minHeight: 44, marginBottom: 16 }]}>{recipe.description || 'Ingredientes e preparo para você ter sempre à mão.'}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><ListBadge shared={!recipe.can_edit} icon={recipe.can_edit ? 'account-outline' : 'account-multiple-outline'}>{recipe.can_edit ? 'Minha receita' : 'Compartilhada · Leitura'}</ListBadge>{!!recipe.prep_minutes && <ListBadge icon="clock-outline">{recipe.prep_minutes} min</ListBadge>}{!!recipe.servings && <ListBadge icon="silverware-fork-knife">{recipe.servings} {recipe.servings === 1 ? 'porção' : 'porções'}</ListBadge>}</View>
        </View>
        <View style={{ padding: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EDF1F3', flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text numberOfLines={2} style={[styles.meta, { flex: 1 }]}>Por {recipe.author?.fullName || 'você'}</Text><FormButton onPress={() => open(recipe)} icon="arrow-right" style={{ minHeight: 44, paddingVertical: 11 }}>Ver receita</FormButton></View>
      </View>)}</View>
    </>}
    <ConfirmDialog visible={!!confirm} title="Remover receita?" message={`A receita “${confirm?.title || ''}” e seus compartilhamentos serão removidos. Essa ação não pode ser desfeita.`} loading={deleting} error={deleteError} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={remove} />
  </ListScreen>;
}
function Recipes({ user }) { const route = useRoute(); const home = route.params?.home; return <RecipeCollection key={home?.id || 'all'} home={home} user={user} />; }
export default connect(state => ({ user: state.user.user }))(Recipes);
