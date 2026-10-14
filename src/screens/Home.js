import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { setUserHomes, setViewHome } from '../redux/actions/home';
import { removeHome } from '../services/api-homes';
import { getUserById } from '../services/api-users';
import HomeMenu from '../components/Home/HomeMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { FormButton, FormFeedback, colors, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListSearch, ListFilters, ListBadge, ListEmpty, ListLoading, normalizeSearch, styles } from '../components/lists/ListKit';

function Home({ userLogged, homes, setUserHomes, setViewHome }) {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const request = useRef(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [gridWidth, setGridWidth] = useState(0);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!userLogged?.id) return;
    const current = ++request.current;
    setError(''); setRefreshing(true);
    try {
      const result = await getUserById(userLogged.id);
      if (current !== request.current) return;
      if (!result?.success) { setError('Não foi possível carregar suas casas. Tente atualizar a lista.'); return; }
      const combined = new Map();
      for (const home of [...(result.data.homes || []), ...(result.data.homes_shared || [])]) {
        if (!combined.has(home.id)) combined.set(home.id, home);
      }
      setUserHomes([...combined.values()]);
    } catch { if (current === request.current) setError('Não foi possível conectar. Tente atualizar a lista.'); }
    finally { if (current === request.current) { setLoading(false); setRefreshing(false); } }
  }, [userLogged?.id, setUserHomes]);

  useEffect(() => { if (focused) load(); return () => { request.current += 1; }; }, [focused, load]);
  const add = () => { setQuery(''); setFilter('all'); setViewHome(null); navigation.navigate('HomeForm', { home: null }); };
  const action = (home, type) => {
    if (type === 'delete') { setError(''); setConfirm(home); return; }
    if (type === 'edit') { setQuery(''); setFilter('all'); }
    setViewHome(home);
    navigation.navigate(type === 'edit' ? 'HomeForm' : type === 'share' ? 'HomeShare' : 'HomeInfo');
  };
  const deleteHome = async () => {
    if (!confirm || deleting) return;
    setDeleting(true); setError(''); setNotice('');
    try {
      const result = await removeHome(confirm.id);
      if (!result?.success) { setError(formError(result, 'Não foi possível remover a casa. Tente novamente.')); return; }
      setUserHomes((homes || []).filter(home => home.id !== confirm.id));
      setConfirm(null); setNotice('Casa removida com sucesso.');
    } catch (err) { setError(formError(err)); }
    finally { setDeleting(false); }
  };

  const allHomes = homes || [];
  const own = allHomes.filter(home => !home.shared_homes);
  const shared = allHomes.filter(home => !!home.shared_homes);
  const search = normalizeSearch(query);
  const visible = allHomes.filter(home => (filter === 'all' || (filter === 'mine' ? !home.shared_homes : !!home.shared_homes)) && normalizeSearch(`${home.name} ${home.descr || ''}`).includes(search));
  const columns = gridWidth >= 1020 ? 3 : gridWidth >= 660 ? 2 : 1;
  const cardWidth = gridWidth ? (gridWidth - 18 * (columns - 1)) / columns : '100%';

  return <ListScreen userName={userLogged?.fullName} onMenu={() => navigation.openDrawer()} refreshing={refreshing && !loading} onRefresh={load}>
    <ListHeading eyebrow="SEU LAR, MAIS ORGANIZADO" title="Minhas casas" subtitle="Seus espaços, suas coisas. Tudo em um só lugar." action={add} actionLabel="Nova casa" />
    <FormFeedback message={error} />
    <FormFeedback message={notice} success />
    <View style={styles.toolbar}>
      <ListSearch value={query} onChange={setQuery} placeholder="Buscar por nome ou descrição" label="Buscar casas" onRefresh={load} refreshing={refreshing} />
      <ListFilters value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Todas', count: allHomes.length }, { value: 'mine', label: 'Minhas', count: own.length }, { value: 'shared', label: 'Compartilhadas', count: shared.length }]} />
    </View>
    {loading ? <ListLoading /> : <>
      <View style={styles.results}><Text style={styles.meta}>{visible.length} {visible.length === 1 ? 'casa' : 'casas'}{search ? (visible.length === 1 ? ' encontrada' : ' encontradas') : ' para cuidar'}</Text><Text style={styles.meta}>Feito para o seu dia a dia</Text></View>
      {!allHomes.length ? <ListEmpty icon="home-plus-outline" title={error ? 'Vamos tentar novamente?' : 'Sua organização começa aqui.'} description={error ? 'Atualize a lista para consultar suas casas.' : 'Adicione sua primeira casa e comece a organizar os itens de cada ambiente.'} action={error ? load : add} actionLabel={error ? 'Atualizar lista' : 'Adicionar minha primeira casa'} actionIcon={error ? 'refresh' : 'plus'} /> : !visible.length ? <ListEmpty icon="home-search-outline" title="Nenhuma casa por aqui." description="Tente outro nome ou selecione um filtro diferente." action={() => { setQuery(''); setFilter('all'); }} actionLabel="Ver todas as casas" actionIcon="filter-remove-outline" /> : null}
      <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
        {visible.map(home => {
          const isShared = !!home.shared_homes;
          const readOnly = home.shared_homes?.permission === 'read';
          return <View key={home.id} testID={`home-card-${home.id}`} style={[styles.card, { width: cardWidth }]}>
            <View style={{ padding: 22, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: isShared ? '#EAF1F3' : colors.soft, alignItems: 'center', justifyContent: 'center' }}><Icon accessible={false} name={isShared ? 'home-group' : 'home-outline'} size={27} color={colors.primary} /></View>
                {!isShared && <HomeMenu home={home} onClickMenuCallback={action} />}
              </View>
              <Text style={[styles.cardTitle, { marginBottom: 8 }]} numberOfLines={2}>{home.name}</Text>
              <Text numberOfLines={2} style={[styles.subtitle, { marginTop: 0, minHeight: 44, marginBottom: 16 }]}>{home.descr || 'Um espaço para organizar do seu jeito.'}</Text>
              <ListBadge shared={isShared} icon={isShared ? 'account-multiple-outline' : 'account-outline'}>{isShared ? (readOnly ? 'Compartilhada · Leitura' : 'Compartilhada') : 'Minha casa'}</ListBadge>
            </View>
            <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#EDF1F3', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {!readOnly && <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${home.name}`} onPress={() => action(home, 'edit')} style={{ paddingVertical: 12, paddingRight: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }}><Icon accessible={false} name="pencil-outline" size={17} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>Editar</Text></Pressable>}
              <FormButton onPress={() => action(home, 'show')} icon="arrow-right" style={{ flex: 1, minHeight: 44, paddingVertical: 11 }}>Abrir casa</FormButton>
            </View>
          </View>;
        })}
      </View>
    </>}
    <ConfirmDialog visible={!!confirm} title="Remover casa?" message={`A casa “${confirm?.name || ''}” , seu inventário, listas de compras, locais, receitas e agenda serão removidos. Essa ação não pode ser desfeita.`} loading={deleting} error={error} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={deleteHome} />
  </ListScreen>;
}

export default connect(state => ({ userLogged: state.user.user, homes: state.home.homes }), { setUserHomes, setViewHome })(Home);
