import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import ChoiceField from './ChoiceField';
import { FormField, colors, styles as formStyles, formError } from './FormKit';
import { ListSearch, ListLoading, ListEmpty, normalizeSearch, styles } from '../lists/ListKit';
import { getCategories } from '../../services/api-categories';

export default function InventoryProductPicker({ home, inventoryId, onInventoryChange, selected, onChange, disabled }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setCategories([]); setCategoryId(null); setQuery(''); setError('');
    if (!inventoryId) return;
    setLoading(true);
    getCategories(inventoryId).then(result => {
      if (!active) return;
      if (!result?.success) throw new Error('Não foi possível carregar os produtos. Tente novamente.');
      setCategories(result.data || []);
    }).catch(e => { if (active) setError(formError(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [inventoryId, retry]);
  const items = categories.flatMap(category => (category.items || []).map(item => ({ ...item, category_name: category.name })));
  const visible = items.filter(item => (!categoryId || item.category_id === categoryId) && normalizeSearch(item.name + ' ' + item.category_name).includes(normalizeSearch(query)));
  return <>
    <ChoiceField label="Inventário de origem" emptyLabel="Selecione o inventário" value={inventoryId} options={[{ value: home.id, label: `Inventário da casa · ${home.name}` }]} disabled={disabled} onChange={id => { onInventoryChange(id); onChange({}); }} />
    {!inventoryId ? <Text style={[formStyles.helper, { marginTop: -12, marginBottom: 24 }]}>Selecione o inventário para listar os produtos desta casa.</Text> : <>
      <Text style={formStyles.sectionTitle}>Produtos do inventário</Text>
      <Text style={formStyles.sectionDescription}>Selecione os produtos e informe quanto deseja comprar. O estoque será atualizado somente ao confirmar a compra.</Text>
      {loading ? <ListLoading message="Carregando produtos do inventário..." /> : error ? <ListEmpty title="Não foi possível listar os produtos." description={error} action={() => setRetry(n => n + 1)} actionLabel="Tentar novamente" actionIcon="refresh" /> : <>
        <ChoiceField label="Filtrar por categoria" optional emptyLabel="Todas as categorias" value={categoryId} options={categories.map(c => ({ value: c.id, label: c.name }))} onChange={setCategoryId} disabled={disabled} />
        <ListSearch label="Buscar produtos do inventário" placeholder="Buscar produto ou categoria" value={query} onChange={setQuery} />
        <Text accessibilityLiveRegion="polite" style={[styles.meta, { marginVertical: 12 }]}>{Object.keys(selected).length} produtos selecionados</Text>
        {!visible.length ? <ListEmpty compact icon="package-variant" title={items.length ? 'Nenhum produto encontrado.' : 'Este inventário ainda não tem produtos.'} description={items.length ? 'Ajuste a busca ou a categoria.' : 'Você pode criar a lista e adicionar compras avulsas depois.'} /> : visible.map(item => <View key={item.id} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <Pressable accessibilityRole="checkbox" accessibilityLabel={`Selecionar produto ${item.name}`} accessibilityState={{ checked: selected[item.id] !== undefined }} aria-checked={selected[item.id] !== undefined} disabled={disabled} onPress={() => { const next = { ...selected }; if (next[item.id] !== undefined) delete next[item.id]; else next[item.id] = '1'; onChange(next); }} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12 }}>
            <Icon accessible={false} name={selected[item.id] !== undefined ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={colors.primary} />
            <View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontWeight: '600', fontSize: 15 }}>{item.name}</Text><Text style={styles.meta}>{item.category_name} · Em estoque: {Number(item.amount) || 0}</Text></View>
          </Pressable>
          {selected[item.id] !== undefined && <FormField label={`Comprar ${item.name}: quantidade`} value={selected[item.id]} keyboardType="number-pad" inputMode="numeric" maxLength={10} editable={!disabled} onChangeText={value => onChange({ ...selected, [item.id]: value.replace(/[^0-9]/g, '') })} style={{ marginTop: 12, marginBottom: 0 }} />}
        </View>)}
      </>}
    </>}
  </>;
}
