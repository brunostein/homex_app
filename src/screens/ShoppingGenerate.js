import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { household } from '../services/api-household';
import { getCategories } from '../services/api-categories';
import ChoiceField from '../components/forms/ChoiceField';
import { FormButton, FormField, FormFeedback, colors, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListLoading, ListEmpty, ListFilters, styles } from '../components/lists/ListKit';
function ShoppingGenerate({ home }) {
  const nav = useNavigation(); const route = useRoute(); const focused = useIsFocused();
  const [lists, setLists] = useState([]); const [listId, setListId] = useState(null); const [newName, setNewName] = useState('');
  const [mode, setMode] = useState('low-stock'); const [rows, setRows] = useState([]); const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const single = route.params?.itemId; const readOnly = home?.shared_homes?.permission === 'read';
  useEffect(() => { if (focused && home) { setListId(route.params?.listId || null); setNewName(''); setMode(single ? 'manual' : 'low-stock'); setError(''); household(home.id, 'shopping-lists').then(setLists).catch(e => setError(formError(e))); } }, [focused, home?.id, single, route.params?.listId]);
  useEffect(() => {
    if (!focused || !home) return;
    let active = true; setLoading(true); setError(''); setRows([]); setSelected({});
    (async () => {
      let result;
      if (single) {
        const cats = await getCategories(home.id); if (!cats?.success) throw new Error('Não foi possível carregar o item.');
        const existing = listId ? (await household(home.id, `shopping-lists/${listId}`)).entries.find(e => e.item_id === single && !e.purchased) : null;
        result = cats.data.flatMap(c => c.items || []).filter(i => i.id === single).map(i => ({ ...i, pending_quantity: existing?.quantity || 0, suggested_quantity: existing ? 0 : 1, final_quantity: existing?.quantity || 1 }));
      } else result = await household(home.id, `shopping-suggestions?mode=${mode === 'manual' ? 'low-stock' : mode}${listId ? '&list_id=' + listId : ''}`);
      if (active) { setRows(result); setSelected(Object.fromEntries(result.filter(i => single || i.suggested_quantity > 0).map(i => [i.id, String(i.final_quantity)]))); }
    })().catch(e => { if (active) setError(formError(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [focused, home?.id, mode, listId, single]);
  const submit = async () => {
    if (busy || readOnly) return;
    if (!listId && !newName.trim()) { setError('Dê um nome à nova lista ou escolha uma existente.'); return; }
    const items = Object.entries(selected).map(([item_id, quantity]) => ({ item_id: Number(item_id), quantity: Number(quantity) }));
    if (!items.length || items.some(i => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 2147483647)) { setError('Selecione os itens e informe quantidades inteiras maiores que zero.'); return; }
    setBusy(true); setError('');
    try { const saved = await household(home.id, 'generate-shopping-list', 'post', { list_id: listId, name: newName, items }); nav.navigate('ShoppingListDetail', { id: saved.id }); } catch (e) { setError(formError(e)); } finally { setBusy(false); }
  };
  if (!home) return null;
  return <ListScreen onBack={() => nav.navigate(route.params?.listId ? 'ShoppingListDetail' : single ? 'HomeItems' : 'ShoppingLists', route.params?.listId ? { id: route.params.listId } : undefined)}>
    <ListHeading eyebrow={home.name} title={single ? 'Adicionar à lista de compras' : 'Gerar lista de compras'} subtitle="Revise os itens e as quantidades antes de confirmar." />
    <FormFeedback message={error} />
    <View style={[styles.card, { padding: 24, marginBottom: 24 }]}>
      <ChoiceField label="Lista de destino" optional emptyLabel="Criar nova lista" value={listId} options={lists.map(l => ({ value: l.id, label: l.name }))} onChange={setListId} disabled={busy} />
      {!listId && <FormField label="Nome da nova lista" value={newName} onChangeText={setNewName} maxLength={255} placeholder="Ex.: Mercado da semana" editable={!busy} />}
      {!single && <View style={{ gap: 10 }}><Text style={styles.cardTitle}>O que você quer repor?</Text><ListFilters value={mode} onChange={setMode} options={[{ value: 'low-stock', label: 'Estoque baixo' }, { value: 'zero-stock', label: 'Estoque zero' }]} /><Text style={styles.meta}>{mode === 'zero-stock' ? 'Todos os itens zerados, mesmo sem controle de reposição. Sem quantidade desejada, sugerimos uma unidade.' : 'Itens com reposição ativada que atingiram a quantidade mínima.'}</Text></View>}
    </View>
    <Text style={[styles.meta, { marginBottom: 16 }]}>As quantidades abaixo são os totais finais na lista escolhida. Compras já pendentes são consideradas para evitar duplicação.</Text>
    {loading ? <ListLoading message="Conferindo seu estoque..." /> : !rows.length ? <ListEmpty icon="package-variant-closed-check" title="Nenhum item nesta seleção." description="Troque o modo de geração ou configure a reposição no inventário." /> : rows.map(row => <View key={row.id} style={[styles.card, { padding: 20, marginBottom: 12 }]}><Pressable accessibilityRole="checkbox" accessibilityLabel={`Selecionar ${row.name}`} accessibilityState={{ checked: selected[row.id] !== undefined }} aria-checked={selected[row.id] !== undefined} disabled={busy || readOnly} onPress={() => setSelected(previous => { const next = { ...previous }; if (next[row.id] !== undefined) delete next[row.id]; else next[row.id] = String(row.final_quantity); return next; })} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', minHeight: 44 }}><Icon name={selected[row.id] !== undefined ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={colors.primary} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{row.name}</Text><Text style={styles.meta}>Estoque: {row.amount} · Já pendentes: {row.pending_quantity} · Faltam adicionar: {row.suggested_quantity}</Text></View></Pressable>{selected[row.id] !== undefined && <FormField label={`Quantidade final de ${row.name}`} value={selected[row.id]} keyboardType="number-pad" inputMode="numeric" maxLength={10} editable={!busy && !readOnly} onChangeText={value => setSelected(s => ({ ...s, [row.id]: value.replace(/[^0-9]/g, '') }))} style={{ marginTop: 16, marginBottom: 0 }} />}</View>)}
    {!readOnly && <FormButton icon="cart-plus" loading={busy} disabled={loading || !Object.keys(selected).length} style={{ marginTop: 12 }} onPress={submit}>Confirmar itens na lista</FormButton>}
  </ListScreen>;
}
export default connect(state => ({ home: state.home.viewHome }))(ShoppingGenerate);
