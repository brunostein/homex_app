import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Switch, ActivityIndicator, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getCategories, removeCategory } from '../services/api-categories';
import { updateItem, createItem, removeItem } from '../services/api-items';
import { setCategories as persistCategories } from '../redux/actions/category';
import ConfirmDialog from '../components/ConfirmDialog';
import CategoryMenu from '../components/HomeItems/CategoryMenu';
import ChoiceField from '../components/forms/ChoiceField';
import { household, locationPath } from '../services/api-household';
import { FormButton, FormField, FormFeedback, FormActions, QuantityField, styles as formStyles, colors, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListSearch, ListFilters, ListBadge, ListEmpty, ListLoading, ListIconButton, normalizeSearch, styles } from '../components/lists/ListKit';

function Inventory({ home, persistCategories }) {
  const navigation = useNavigation();
  const focused = useIsFocused(); const initialFilter = useRoute().params?.filter || 'all';
  const { width } = useWindowDimensions();
  const narrow = width < 600;
  const request = useRef(0);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const [editor, setEditor] = useState(null);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemError, setItemError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyItems, setBusyItems] = useState({});
  const busyRef = useRef(new Set());
  const readOnly = home.shared_homes?.permission === 'read';

  const load = useCallback(async () => {
    const current = ++request.current;
    setRefreshing(true); setError('');
    try {
      const [result, nextLocations] = await Promise.all([getCategories(home.id), household(home.id, 'locations')]);
      if (current !== request.current) return false;
      if (!result?.success) { setError('Não foi possível carregar o inventário. Tente atualizar a lista.'); return false; }
      const next = (result.data || []).map(category => ({ ...category, items: category.items || [] }));
      setCategories(next); setLocations(nextLocations);
      return true;
    } catch { if (current === request.current) setError('Não foi possível conectar. Tente atualizar a lista.'); return false; }
    finally { if (current === request.current) { setLoading(false); setRefreshing(false); } }
  }, [home.id, persistCategories]);
  useEffect(() => { if (focused) { setFilter(initialFilter); setQuery(''); load(); } return () => { request.current += 1; }; }, [focused, load, initialFilter]);

  useEffect(() => { if (!loading) persistCategories(categories); }, [categories, loading, persistCategories]);

  useEffect(() => { if (query || filter !== 'all') setCollapsed({}); }, [query, filter]);

  const newCategory = () => { setQuery(''); setFilter('all'); navigation.navigate('HomeCategoryForm', { category: null }); };
  const openEditor = (category, item = null) => {
    if (itemLoading) return;
    setCollapsed(previous => ({ ...previous, [category.id]: false }));
    setEditor({ categoryId: category.id, itemId: item?.id || null, name: item?.name || '', amount: Number(item?.amount) || 0, location_id: item?.location_id || null, restock_enabled: !!item?.restock_enabled, minimum_amount: item?.minimum_amount == null ? '0' : String(item.minimum_amount), target_amount: item?.target_amount == null ? '1' : String(item.target_amount) });
    setItemError(''); setAttempted(false); setNotice('');
  };
  const save = async () => {
    if (!editor || itemLoading) return;
    setAttempted(true); setItemError('');
    const amount = Number(editor.amount);
    if (!editor.name.trim() || editor.amount === '' || !Number.isInteger(amount) || amount < 0 || amount > 2147483647) return;
    if (editor.restock_enabled && (!/^\d+$/.test(String(editor.minimum_amount)) || !/^\d+$/.test(String(editor.target_amount)) || Number(editor.target_amount) <= Number(editor.minimum_amount) || Number(editor.target_amount) > 2147483647)) { setItemError('A quantidade desejada deve ser maior que a mínima.'); return; }
    setItemLoading(true);
    try {
      const payload = { category_id: editor.categoryId, name: editor.name.trim(), amount, location_id: editor.location_id, restock_enabled: editor.restock_enabled, minimum_amount: Number(editor.minimum_amount), target_amount: Number(editor.target_amount) };
      const result = editor.itemId ? await updateItem(editor.itemId, payload) : await createItem(payload);
      if (!result?.success) { setItemError(formError(result, 'Não foi possível salvar o item. Tente novamente.')); return; }
      const saved = result.data;
      setCategories(previous => previous.map(category => category.id !== editor.categoryId ? category : { ...category, items: editor.itemId ? category.items.map(item => item.id === editor.itemId ? saved : item) : [...category.items, saved] }));
      setNotice(editor.itemId ? 'Item atualizado com sucesso.' : 'Item adicionado ao inventário.');
      setEditor(null);
    } catch (err) { setItemError(formError(err)); }
    finally { setItemLoading(false); }
  };
  const changeAmount = async (categoryId, item, increment) => {
    if (busyRef.current.has(item.id)) return;
    const amount = Number(item.amount || 0) + increment;
    if (amount < 0 || amount > 2147483647) return;
    busyRef.current.add(item.id); setBusyItems(previous => ({ ...previous, [item.id]: true })); setError('');
    try {
      const result = await updateItem(item.id, { amount });
      if (!result?.success) { setError('Não foi possível atualizar a quantidade. Tente novamente.'); return; }
      setCategories(previous => previous.map(category => category.id !== categoryId ? category : { ...category, items: category.items.map(current => current.id === item.id ? { ...current, amount } : current) }));
    } catch { setError('Não foi possível atualizar a quantidade. Tente novamente.'); }
    finally { busyRef.current.delete(item.id); setBusyItems(previous => ({ ...previous, [item.id]: false })); }
  };
  const askDelete = (category, item = null) => { setError(''); setDeleteError(''); setConfirm({ category, item }); };
  const remove = async () => {
    if (!confirm || deleting) return;
    setDeleting(true); setDeleteError('');
    try {
      const result = confirm.item ? await removeItem(confirm.item.id) : await removeCategory(confirm.category.id);
      if (!result?.success) { setDeleteError('Não foi possível remover. Tente novamente.'); return; }
      setCategories(previous => confirm.item ? previous.map(category => category.id !== confirm.category.id ? category : { ...category, items: category.items.filter(item => item.id !== confirm.item.id) }) : previous.filter(category => category.id !== confirm.category.id));
      if (editor?.categoryId === confirm.category.id && (!confirm.item || editor.itemId === confirm.item.id)) setEditor(null);
      setNotice(confirm.item ? 'Item removido com sucesso.' : 'Categoria removida com sucesso.'); setConfirm(null);
    } catch { setDeleteError('Não foi possível remover. Tente novamente.'); }
    finally { setDeleting(false); }
  };

  const allItems = categories.flatMap(category => category.items);
  const missing = allItems.filter(item => Number(item.amount || 0) === 0).length;
  const search = normalizeSearch(query);
  const filtered = categories.map(category => ({ ...category, visibleItems: category.items.filter(item => (filter !== 'missing' || Number(item.amount || 0) === 0) && (!search || normalizeSearch(category.name).includes(search) || normalizeSearch(item.name + ' ' + locationPath(locations, item.location_id)).includes(search))) })).filter(category => editor?.categoryId === category.id || category.visibleItems.length || (filter === 'all' && (!search || normalizeSearch(category.name).includes(search))));

  return <ListScreen onBack={() => navigation.navigate('HomeInfo')} refreshing={refreshing && !loading} onRefresh={load}>
    <ListHeading eyebrow={home.name.toUpperCase()} title="Inventário da casa" subtitle="Veja o que você tem e mantenha cada coisa no seu lugar." action={!readOnly ? newCategory : undefined} actionLabel="Nova categoria" />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}><FormButton secondary icon="map-marker-outline" onPress={() => navigation.navigate('HomeLocations')}>Locais da casa</FormButton>{!readOnly && <FormButton secondary icon="playlist-plus" onPress={() => navigation.navigate('ShoppingGenerate', { itemId: null, listId: null })}>Gerar lista de compras</FormButton>}</View>
    {readOnly && <View style={{ marginBottom: 20 }}><ListBadge shared icon="eye-outline">Acesso de leitura</ListBadge></View>}
    <FormFeedback message={error} /><FormFeedback message={notice} success />
    {!loading && <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
      {[[categories.length, 'Categorias', 'view-grid-outline'], [allItems.length, 'Itens', 'package-variant-closed'], [missing, 'Em falta', 'package-variant-remove']].map(([value, label, icon], index) => <View key={label} style={[styles.card, { flex: 1, padding: narrow ? 14 : 20, gap: 9 }]}><Icon accessible={false} name={icon} size={21} color={index === 2 && missing ? '#B2644E' : colors.muted} /><Text style={{ color: colors.ink, fontWeight: '700', fontSize: 28 }}>{value}</Text><Text style={[styles.meta, { fontSize: 12 }]}>{label}</Text></View>)}
    </View>}
    <View style={styles.toolbar}>
      <ListSearch value={query} onChange={setQuery} placeholder="Buscar item, categoria ou local" label="Buscar no inventário" onRefresh={load} refreshing={refreshing} />
      <ListFilters value={filter} onChange={setFilter} options={[{ value: 'all', label: 'Todos os itens', count: allItems.length }, { value: 'missing', label: 'Em falta', count: missing }]} />
    </View>
    {loading ? <ListLoading message="Organizando seu inventário..." /> : !categories.length ? <ListEmpty icon="view-grid-plus-outline" title={error ? 'Seu inventário não carregou.' : 'Vamos dar lugar às suas coisas?'} description={error ? 'Tente atualizar a lista para consultar seus itens.' : readOnly ? 'Ainda não há categorias nesta casa.' : 'Comece por uma categoria, como Cozinha ou Quarto. Depois, adicione os itens.'} action={error ? load : !readOnly ? newCategory : undefined} actionLabel={error ? 'Atualizar lista' : 'Criar primeira categoria'} actionIcon={error ? 'refresh' : 'plus'} /> : !filtered.length ? <ListEmpty icon="magnify" title={filter === 'missing' && !query ? 'Tudo em dia por aqui.' : 'Nenhum item encontrado.'} description={filter === 'missing' && !query ? 'Não há itens com quantidade zero no seu inventário.' : 'Tente outro termo ou veja todos os itens da casa.'} action={() => { setQuery(''); setFilter('all'); }} actionLabel="Ver todos os itens" actionIcon="filter-remove-outline" /> : null}
    {!loading && filtered.map(category => <View key={category.id} testID={`category-${category.id}`} style={[styles.card, { marginBottom: 20 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: narrow ? 16 : 22 }}>
        <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: '#EDF4F4', alignItems: 'center', justifyContent: 'center' }}><Icon accessible={false} name="view-grid-outline" size={21} color={colors.primary} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`${collapsed[category.id] ? 'Expandir' : 'Recolher'} categoria ${category.name}`} accessibilityState={{ expanded: !collapsed[category.id] }} onPress={() => setCollapsed(previous => ({ ...previous, [category.id]: !previous[category.id] }))} style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}><Text style={[styles.cardTitle, { fontSize: 17 }]}>{category.name}</Text><Text style={styles.meta}>{category.items.length} {category.items.length === 1 ? 'item' : 'itens'}</Text></Pressable>
        {!readOnly && <><ListIconButton icon="plus" label={`Adicionar item em ${category.name}`} disabled={itemLoading} onPress={() => openEditor(category)} /><CategoryMenu data={{ category }} onClickMenuCallback={(data, type) => type === 'edit' ? navigation.navigate('HomeCategoryForm', { category: data.category }) : askDelete(category)} /></>}
        {readOnly && <ListIconButton icon={collapsed[category.id] ? 'chevron-down' : 'chevron-up'} label={`${collapsed[category.id] ? 'Expandir' : 'Recolher'} ${category.name}`} onPress={() => setCollapsed(previous => ({ ...previous, [category.id]: !previous[category.id] }))} />}
      </View>
      {!collapsed[category.id] && <View style={{ borderTopWidth: 1, borderTopColor: '#EDF1F3' }}>
        {editor?.categoryId === category.id && !readOnly && <View style={{ padding: 20, margin: narrow ? 12 : 20, backgroundColor: '#F5F8F9', borderWidth: 1, borderColor: colors.border, borderRadius: 14, maxWidth: 640, alignSelf: 'center', width: narrow ? '92%' : '95%' }}>
          <Text style={formStyles.sectionTitle}>{editor.itemId ? 'Editar item' : 'Um novo item para organizar'}</Text><Text style={formStyles.sectionDescription}>Na categoria {category.name}. Preencha os detalhes abaixo.</Text>
          <FormFeedback message={itemError} />
          <FormField label="Item" icon="package-variant-closed" placeholder="Ex.: Arroz, toalhas, livros…" value={editor.name} editable={!itemLoading} maxLength={255} error={attempted && !editor.name.trim() ? 'Informe o nome do item.' : ''} onChangeText={name => setEditor(previous => ({ ...previous, name }))} returnKeyType="done" onSubmitEditing={save} />
          <QuantityField value={editor.amount} onChange={amount => setEditor(previous => ({ ...previous, amount }))} disabled={itemLoading} error={attempted && (editor.amount === '' || !Number.isInteger(Number(editor.amount)) || Number(editor.amount) < 0 || Number(editor.amount) > 2147483647) ? 'Informe uma quantidade inteira entre 0 e 2147483647.' : ''} />
          <ChoiceField label="Local do item" optional value={editor.location_id} options={locations.map(l => ({ value: l.id, label: locationPath(locations, l.id) }))} disabled={itemLoading} onChange={location_id => setEditor(e => ({ ...e, location_id }))} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}><View style={{ flex: 1 }}><Text style={formStyles.label}>Controlar reposição</Text><Text style={formStyles.helper}>Receba sugestões de compra quando o estoque estiver baixo.</Text></View><Switch accessibilityLabel="Controlar reposição" value={editor.restock_enabled} disabled={itemLoading} onValueChange={restock_enabled => setEditor(e => ({ ...e, restock_enabled }))} trackColor={{ true: colors.primary }} /></View>
          {editor.restock_enabled && <><FormField label="Quantidade mínima" value={String(editor.minimum_amount)} maxLength={10} keyboardType="number-pad" inputMode="numeric" editable={!itemLoading} onChangeText={value => setEditor(e => ({ ...e, minimum_amount: value.replace(/[^0-9]/g, '') }))} /><FormField label="Quantidade desejada" value={String(editor.target_amount)} maxLength={10} keyboardType="number-pad" inputMode="numeric" editable={!itemLoading} onChangeText={value => setEditor(e => ({ ...e, target_amount: value.replace(/[^0-9]/g, '') }))} /></>}
          <FormActions onCancel={() => setEditor(null)} onSubmit={save} loading={itemLoading} label={editor.itemId ? 'Salvar alterações' : 'Adicionar item'} icon={editor.itemId ? 'check' : 'plus'} />
        </View>}
        {!category.visibleItems.length && <ListEmpty compact icon="package-variant" title={category.items.length ? 'Nenhum item corresponde à busca.' : 'Uma categoria pronta para começar.'} description={category.items.length ? 'Busque outro item ou ajuste o filtro.' : readOnly ? 'Ainda não há itens nesta categoria.' : 'Use o botão + para adicionar seu primeiro item.'} />}
        {category.visibleItems.map(item => {
          const amount = Number(item.amount || 0);
          const busy = !!busyItems[item.id];
          return <View key={item.id} testID={`item-${item.id}`} style={{ paddingHorizontal: narrow ? 18 : 24, paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#F0F3F5', flexDirection: narrow ? 'column' : 'row', alignItems: narrow ? 'stretch' : 'center', gap: narrow ? 14 : 24 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 }}><View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: amount === 0 ? colors.soft : '#F3F6F8', alignItems: 'center', justifyContent: 'center' }}><Icon accessible={false} name="package-variant-closed" size={19} color={amount === 0 ? '#A6604D' : colors.muted} /></View><View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontSize: 15, fontWeight: '600', lineHeight: 22 }}>{item.name}</Text>{!!item.location_id && <Text style={styles.meta}>{locationPath(locations, item.location_id)}</Text>}{item.restock_enabled && <Text style={styles.meta}>Reposição: mínimo {item.minimum_amount} · desejado {item.target_amount}</Text>}{amount === 0 && <Text style={{ fontSize: 11, color: '#A6604D', marginTop: 4 }}>Em falta</Text>}</View></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
              <View accessibilityLabel={`Quantidade de ${item.name}`} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 2 }}>
                {!readOnly && <ListIconButton icon="minus" label={`Diminuir ${item.name}`} disabled={busy || amount === 0} onPress={() => changeAmount(category.id, item, -1)} />}
                <View style={{ minWidth: 42, paddingHorizontal: 8, alignItems: 'center' }}>{busy ? <ActivityIndicator size="small" color={colors.primary} /> : <Text accessibilityLiveRegion="polite" style={{ fontSize: 16, fontWeight: '700', color: colors.primary, paddingVertical: readOnly ? 10 : 0 }}>{amount}</Text>}</View>
                {!readOnly && <ListIconButton icon="plus" label={`Aumentar ${item.name}`} disabled={busy || amount >= 2147483647} onPress={() => changeAmount(category.id, item, 1)} />}
              </View>
              {!readOnly && <View style={{ flexDirection: 'row', gap: 4 }}><ListIconButton icon="cart-plus" label={`Adicionar ${item.name} à lista de compras`} disabled={busy} onPress={() => navigation.navigate('ShoppingGenerate', { itemId: item.id, listId: null })} /><ListIconButton icon="pencil-outline" label={`Editar ${item.name}`} disabled={busy || itemLoading} onPress={() => openEditor(category, item)} /><ListIconButton icon="trash-can-outline" label={`Remover ${item.name}`} disabled={busy} danger onPress={() => askDelete(category, item)} /></View>}
            </View>
          </View>;
        })}
      </View>}
    </View>)}
    <ConfirmDialog visible={!!confirm} title={confirm?.item ? 'Remover item?' : 'Remover categoria?'} message={confirm?.item ? `O item “${confirm.item.name}” será removido do inventário.` : `A categoria “${confirm?.category.name || ''}” e todos os seus itens serão removidos. Essa ação não pode ser desfeita.`} loading={deleting} error={deleteError} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={remove} />
  </ListScreen>;
}

function HomeItems({ viewHome, persistCategories }) {
  if (!viewHome) return null;
  return <Inventory key={viewHome.id} home={viewHome} persistCategories={persistCategories} />;
}
export default connect(state => ({ viewHome: state.home.viewHome }), { persistCategories })(HomeItems);
