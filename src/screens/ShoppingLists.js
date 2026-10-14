import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { household } from '../services/api-household';
import { FormField, FormActions, FormFeedback, FormButton, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListLoading, ListEmpty, ListIconButton, styles } from '../components/lists/ListKit';
import InventoryProductPicker from '../components/forms/InventoryProductPicker';
import ConfirmDialog from '../components/ConfirmDialog';
function ShoppingLists({ home }) {
  const nav = useNavigation(); const focused = useIsFocused();
  const [lists, setLists] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [inventoryId, setInventoryId] = useState(null); const [selectedProducts, setSelectedProducts] = useState({});
  const [editor, setEditor] = useState(null); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState(null);
  const readOnly = home?.shared_homes?.permission === 'read';
  const load = async () => { try { setLists(await household(home.id, 'shopping-lists')); } catch (e) { setError(formError(e)); } finally { setLoading(false); } };
  useEffect(() => { if (focused && home) { setEditor(null); setError(''); load(); } }, [focused, home?.id]);
  const save = async () => { if (!editor.id && !inventoryId) { setError('Selecione o inventário de origem.'); return; }
    const items = Object.entries(selectedProducts).map(([item_id, quantity]) => ({ item_id: Number(item_id), quantity: Number(quantity) }));
    if (!editor.id && items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 2147483647)) { setError('Informe quantidades inteiras maiores que zero para os produtos selecionados.'); return; }
    if (!editor.name.trim()) { setError('Dê um nome à lista.'); return; } setBusy(true); setError(''); try { const saved = await household(home.id, `shopping-lists${editor.id ? '/' + editor.id : ''}`, editor.id ? 'put' : 'post', { name: editor.name, ...(!editor.id ? { inventory_home_id: inventoryId, items } : {}) }); setEditor(null); await load(); if (!editor.id) nav.navigate('ShoppingListDetail', { id: saved.id }); } catch (e) { setError(formError(e)); } finally { setBusy(false); } };
  const remove = async () => { setBusy(true); setError(''); try { await household(home.id, `shopping-lists/${confirm.id}`, 'delete'); setConfirm(null); await load(); } catch (e) { setError(formError(e)); setConfirm(null); } finally { setBusy(false); } };
  if (!home) return null;
  return <ListScreen onBack={() => nav.navigate('HomeInfo')} onRefresh={load}>
    <ListHeading eyebrow={home.name} title="Lista de compras" subtitle="Organize o mercado, as ferramentas e o que mais a casa precisar." action={!readOnly ? () => { setInventoryId(null); setSelectedProducts({}); setError(''); setEditor({ name: '' }); } : undefined} actionLabel="Nova lista" />
    <FormFeedback message={error} />
    {!readOnly && <View style={{ marginBottom: 24 }}><FormButton secondary icon="playlist-plus" onPress={() => nav.navigate('ShoppingGenerate', { itemId: null, listId: null })}>Gerar lista de compras</FormButton></View>}
    {editor && <View style={[styles.card, { padding: 24, marginBottom: 24 }]}><FormField label="Nome da lista" value={editor.name} maxLength={255} onChangeText={name => setEditor(e => ({ ...e, name }))} editable={!busy} placeholder="Ex.: Mercado da semana" /><View>{!editor.id && <InventoryProductPicker home={home} inventoryId={inventoryId} onInventoryChange={id => { setInventoryId(id); setError(''); }} selected={selectedProducts} onChange={products => { setSelectedProducts(products); setError(''); }} disabled={busy} />}</View><FormActions loading={busy} onCancel={() => setEditor(null)} onSubmit={save} label={editor.id ? 'Salvar nome' : 'Criar lista'} /></View>}
    {loading ? <ListLoading /> : !lists.length ? <ListEmpty icon="cart-outline" title="As próximas compras começam aqui." description="Crie uma lista ou gere sugestões a partir do inventário." /> : lists.map(list => <View key={list.id} testID={`shopping-list-${list.id}`} style={[styles.card, { padding: 24, marginBottom: 16 }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{list.name}</Text><Text style={styles.subtitle}>{list.pending} pendentes · {list.purchased} comprados</Text></View>{!readOnly && <><ListIconButton icon="pencil-outline" label={`Renomear ${list.name}`} onPress={() => setEditor(list)} /><ListIconButton icon="trash-can-outline" label={`Remover lista ${list.name}`} danger onPress={() => setConfirm(list)} /></>}</View><FormButton secondary style={{ marginTop: 18 }} onPress={() => nav.navigate('ShoppingListDetail', { id: list.id })}>Abrir lista</FormButton></View>)}
    <ConfirmDialog visible={!!confirm} title="Remover lista?" message={`A lista “${confirm?.name || ''}” e suas compras serão removidas. O inventário permanece como está.`} loading={busy} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={remove} />
  </ListScreen>;
}
export default connect(state => ({ home: state.home.viewHome }))(ShoppingLists);
