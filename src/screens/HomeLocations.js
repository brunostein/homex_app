import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import { household, locationPath } from '../services/api-household';
import { FormField, FormFeedback, FormActions, FormButton, styles as fs, formError } from '../components/forms/FormKit';
import ChoiceField from '../components/forms/ChoiceField';
import { ListScreen, ListHeading, ListLoading, ListEmpty, ListIconButton, styles } from '../components/lists/ListKit';
import ConfirmDialog from '../components/ConfirmDialog';
function HomeLocations({ home }) {
  const nav = useNavigation(); const focused = useIsFocused();
  const [locations, setLocations] = useState([]); const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [confirm, setConfirm] = useState(null);
  const readOnly = home?.shared_homes?.permission === 'read';
  const load = async () => { try { setLocations(await household(home.id, 'locations')); } catch (e) { setError(formError(e)); } finally { setLoading(false); } };
  useEffect(() => { if (focused && home) { setEditor(null); setError(''); load(); } }, [focused, home?.id]);
  const save = async () => {
    if (!editor.name.trim()) { setError('Informe o nome do local.'); return; }
    setBusy(true); setError('');
    try { await household(home.id, `locations${editor.id ? '/' + editor.id : ''}`, editor.id ? 'put' : 'post', editor); setEditor(null); await load(); } catch (e) { setError(formError(e)); } finally { setBusy(false); }
  };
  const remove = async () => { setBusy(true); setError(''); try { await household(home.id, `locations/${confirm.id}`, 'delete'); setConfirm(null); await load(); } catch (e) { setError(formError(e)); setConfirm(null); } finally { setBusy(false); } };
  if (!home) return null;
  const excluded = id => { const visited = new Set(); while (id && !visited.has(id)) { if (id === editor?.id) return true; visited.add(id); id = locations.find(l => l.id === id)?.parent_id; } return false; };
  return <ListScreen onBack={() => nav.navigate('HomeItems')} onRefresh={load}>
    <ListHeading eyebrow={home.name} title="Locais da casa" subtitle="Cadastre ambientes, armários e gavetas para encontrar suas coisas." action={!readOnly ? () => { setEditor({ name: '', parent_id: null }); setError(''); } : undefined} actionLabel="Novo local" />
    <FormFeedback message={error} />
    {editor && <View style={[styles.card, { padding: 24, marginBottom: 24 }]}><Text style={fs.sectionTitle}>{editor.id ? 'Editar local' : 'Novo local'}</Text><FormField label="Nome do local" value={editor.name} maxLength={255} editable={!busy} onChangeText={name => setEditor(e => ({ ...e, name }))} placeholder="Ex.: Cozinha, Armário, Gaveta" /><ChoiceField label="Dentro de" optional emptyLabel="Ambiente principal" value={editor.parent_id} options={locations.filter(l => !excluded(l.id)).map(l => ({ value: l.id, label: locationPath(locations, l.id) }))} onChange={parent_id => setEditor(e => ({ ...e, parent_id }))} disabled={busy} /><FormActions loading={busy} onCancel={() => setEditor(null)} onSubmit={save} label="Salvar local" /></View>}
    {loading ? <ListLoading /> : !locations.length ? <ListEmpty icon="map-marker-outline" title="Onde cada coisa fica?" description="Comece por um ambiente e adicione suas subdivisões." /> : locations.map(l => <View key={l.id} style={[styles.card, { padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 }]}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{l.name}</Text><Text style={styles.meta}>{locationPath(locations, l.id)}</Text></View>{!readOnly && <><ListIconButton icon="pencil-outline" label={`Editar local ${l.name}`} onPress={() => { setError(''); setEditor(l); }} /><ListIconButton icon="trash-can-outline" label={`Remover local ${l.name}`} danger onPress={() => setConfirm(l)} /></>}</View>)}
    <ConfirmDialog visible={!!confirm} title="Remover local?" message={`Remover ${confirm?.name || 'este local'}? Locais com itens ou subdivisões precisam ser esvaziados primeiro.`} loading={busy} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={remove} />
  </ListScreen>;
}
export default connect(state => ({ home: state.home.viewHome }))(HomeLocations);
