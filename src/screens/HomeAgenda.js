import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { household } from '../services/api-household';
import { todayDate, displayDate, parseDate, dateInput, timeInput, validTime, dateHeading, weekRange } from '../helpers/calendar';
import { FormField, FormActions, FormFeedback, colors, styles as formStyles, formError } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListSearch, ListFilters, ListBadge, ListEmpty, ListLoading, ListIconButton, normalizeSearch, styles } from '../components/lists/ListKit';
import ConfirmDialog from '../components/ConfirmDialog';

function Calendar({ home }) {
  const navigation = useNavigation(); const focused = useIsFocused(); const initialFilter = useRoute().params?.filter || 'pending';
  const request = useRef(0); const busyRef = useRef(false);
  const [events, setEvents] = useState([]); const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('pending');
  const [editor, setEditor] = useState(null); const [attempted, setAttempted] = useState(false); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [confirm, setConfirm] = useState(null); const [deleteError, setDeleteError] = useState('');
  const readOnly = home.shared_homes?.permission === 'read'; const today = todayDate(); const week = weekRange(today);
  const inWeek = event => event.event_date >= week.start && event.event_date <= week.end;
  const load = useCallback(async () => {
    const ticket = ++request.current; setRefreshing(true);
    try { const result = await household(home.id, 'events'); if (ticket === request.current) { setEvents(result); setError(''); } }
    catch (e) { if (ticket === request.current) setError(formError(e, 'Não foi possível carregar a agenda.')); }
    finally { if (ticket === request.current) { setLoading(false); setRefreshing(false); } }
  }, [home.id]);
  useEffect(() => { if (focused) { setFilter(initialFilter); setQuery(''); setEditor(null); setConfirm(null); setError(''); load(); } return () => { request.current += 1; }; }, [focused, load, initialFilter]);
  const open = (event = null) => {
    if (busyRef.current) return;
    setEditor(event ? { ...event, date: displayDate(event.event_date), time: event.event_time || '', description: event.description || '', location: event.location || '' } : { title: '', date: displayDate(todayDate()), time: '', description: '', location: '' });
    setAttempted(false); setError(''); setNotice('');
  };
  const change = key => value => { setEditor(previous => ({ ...previous, [key]: value })); setError(''); };
  const run = async work => {
    if (busyRef.current || readOnly) return;
    busyRef.current = true; setBusy(true); setError(''); setNotice('');
    try { await work(); await load(); } catch (e) { setError(formError(e)); } finally { busyRef.current = false; setBusy(false); }
  };
  const save = () => {
    setAttempted(true);
    if (!editor.title.trim() || !parseDate(editor.date) || !validTime(editor.time)) return;
    run(async () => {
      await household(home.id, `events${editor.id ? '/' + editor.id : ''}`, editor.id ? 'put' : 'post', { title: editor.title, event_date: parseDate(editor.date), event_time: editor.time || null, description: editor.description, location: editor.location });
      setNotice(editor.id ? 'Compromisso atualizado.' : 'Compromisso adicionado à agenda.'); setEditor(null);
    });
  };
  const complete = event => run(async () => { await household(home.id, `events/${event.id}/completion`, 'patch', { completed: !event.completed }); setNotice(event.completed ? 'Compromisso reaberto.' : 'Compromisso concluído.'); });
  const remove = async () => {
    if (busyRef.current || readOnly || !confirm) return;
    busyRef.current = true; setBusy(true); setDeleteError('');
    try { await household(home.id, `events/${confirm.id}`, 'delete'); if (editor?.id === confirm.id) setEditor(null); setConfirm(null); setNotice('Compromisso removido.'); await load(); }
    catch (e) { setDeleteError(formError(e)); } finally { busyRef.current = false; setBusy(false); }
  };
  const counts = { week: events.filter(inWeek).length, all: events.length, pending: events.filter(e => !e.completed).length, today: events.filter(e => e.event_date === today).length, completed: events.filter(e => e.completed).length };
  const shown = events.filter(event => (filter === 'all' || (filter === 'week' && inWeek(event)) || (filter === 'pending' && !event.completed) || (filter === 'completed' && event.completed) || (filter === 'today' && event.event_date === today)) && normalizeSearch(`${event.title} ${event.description || ''} ${event.location || ''} ${displayDate(event.event_date)}`).includes(normalizeSearch(query)));
  const dates = [...new Set(shown.map(e => e.event_date))];
  return <ListScreen onBack={() => navigation.navigate('HomeInfo')} refreshing={refreshing && !loading} onRefresh={load}>
    <ListHeading eyebrow={home.name} title="Agenda da casa" subtitle="Organize visitas, manutenção e os compromissos de quem mora aqui." action={!readOnly ? () => open() : undefined} actionLabel="Novo compromisso" actionIcon="calendar-plus" />
    {readOnly && <View style={{ marginBottom: 20 }}><ListBadge shared icon="eye-outline">Acesso de leitura</ListBadge></View>}
    <FormFeedback message={error} /><FormFeedback message={notice} success />
    {editor && <View style={[styles.card, { padding: 24, marginBottom: 24 }]}>
      <Text style={formStyles.sectionTitle}>{editor.id ? 'Editar compromisso' : 'Novo compromisso'}</Text>
      <Text style={formStyles.sectionDescription}>Informe a data e, se quiser, o horário, o local e outros detalhes.</Text>
      <FormField label="Título do compromisso" icon="calendar-text-outline" value={editor.title} maxLength={255} editable={!busy} onChangeText={change('title')} placeholder="Ex.: Revisão do ar-condicionado" error={attempted && !editor.title.trim() ? 'Informe o título do compromisso.' : ''} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <FormField label="Data" icon="calendar-outline" value={editor.date} placeholder="DD/MM/AAAA" helper="Dia, mês e ano." keyboardType="number-pad" inputMode="numeric" maxLength={10} editable={!busy} onChangeText={value => change('date')(dateInput(value))} error={attempted && !parseDate(editor.date) ? 'Informe uma data válida no formato DD/MM/AAAA.' : ''} style={{ flexGrow: 1, flexBasis: 210 }} />
        <FormField label="Horário" optional icon="clock-outline" value={editor.time} placeholder="HH:MM" helper="Deixe vazio para o dia inteiro." keyboardType="number-pad" inputMode="numeric" maxLength={5} editable={!busy} onChangeText={value => change('time')(timeInput(value))} error={attempted && !validTime(editor.time) ? 'Use um horário entre 00:00 e 23:59.' : ''} style={{ flexGrow: 1, flexBasis: 180 }} />
      </View>
      <FormField label="Local do compromisso" optional icon="map-marker-outline" value={editor.location} maxLength={255} editable={!busy} onChangeText={change('location')} placeholder="Ex.: Em casa, salão de festas, endereço…" />
      <FormField label="Descrição do compromisso" optional value={editor.description} maxLength={5000} multiline editable={!busy} onChangeText={change('description')} placeholder="Detalhes e informações úteis para a casa." />
      <FormActions loading={busy} onCancel={() => { setEditor(null); setError(''); }} onSubmit={save} label="Salvar compromisso" />
    </View>}
    <View style={styles.toolbar}>
      <ListSearch value={query} onChange={setQuery} label="Buscar na agenda" placeholder="Buscar compromisso, local ou data" onRefresh={load} refreshing={refreshing} />
      <ListFilters value={filter} onChange={setFilter} options={[{ value: 'pending', label: 'Pendentes', count: counts.pending }, { value: 'today', label: 'Hoje', count: counts.today }, { value: 'week', label: 'Esta semana', count: counts.week }, { value: 'all', label: 'Todos', count: counts.all }, { value: 'completed', label: 'Concluídos', count: counts.completed }]} />
    </View>
    {loading ? <ListLoading message="Carregando a agenda da casa..." /> : !shown.length ? <ListEmpty icon="calendar-blank-outline" title={error ? 'Sua agenda não carregou.' : !events.length ? 'Uma casa com a rotina organizada.' : 'Nenhum compromisso nesta seleção.'} description={error ? 'Atualize a lista para tentar novamente.' : !events.length ? readOnly ? 'Ainda não há compromissos nesta casa.' : 'Cadastre o primeiro compromisso e compartilhe a rotina da casa.' : 'Ajuste a busca ou veja todos os compromissos.'} action={error ? load : events.length ? () => { setQuery(''); setFilter('all'); } : !readOnly ? () => open() : undefined} actionLabel={error ? 'Tentar novamente' : events.length ? 'Ver todos os compromissos' : 'Criar primeiro compromisso'} /> : dates.map(date => <View key={date} style={{ marginBottom: 24 }}>
      <Text accessibilityRole="header" style={{ color: colors.primary, fontSize: 15, fontWeight: '700', marginBottom: 12 }}>{dateHeading(date)}</Text>
      {shown.filter(e => e.event_date === date).map(event => <View key={event.id} testID={`calendar-event-${event.id}`} style={[styles.card, { padding: 20, marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 170 }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}><ListBadge icon="clock-outline">{event.event_time || 'Dia inteiro'}</ListBadge>{event.completed ? <ListBadge icon="check-circle-outline">Concluído</ListBadge> : event.event_date === today ? <ListBadge shared icon="calendar-today">Hoje</ListBadge> : event.event_date < today ? <ListBadge warning icon="calendar-alert">Data passada</ListBadge> : null}</View><Text style={[styles.cardTitle, event.completed && { color: colors.muted }]}>{event.title}</Text>{!!event.location && <Text style={styles.subtitle}>{event.location}</Text>}{!!event.description && <Text style={[styles.meta, { marginTop: 10 }]}>{event.description}</Text>}</View>
          {!readOnly && <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}><ListIconButton icon={event.completed ? 'undo' : 'check-circle-outline'} label={`${event.completed ? 'Reabrir' : 'Concluir'} ${event.title}`} disabled={busy} onPress={() => complete(event)} /><ListIconButton icon="pencil-outline" label={`Editar compromisso ${event.title}`} disabled={busy} onPress={() => open(event)} /><ListIconButton icon="trash-can-outline" label={`Remover compromisso ${event.title}`} disabled={busy} danger onPress={() => { setDeleteError(''); setConfirm(event); }} /></View>}
        </View>
      </View>)}
    </View>)}
    <ConfirmDialog visible={!!confirm} title="Remover compromisso?" message={`O compromisso “${confirm?.title || ''}” será removido da agenda desta casa.`} loading={busy} error={deleteError} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={remove} />
  </ListScreen>;
}
function HomeAgenda({ home }) { return home ? <Calendar key={home.id} home={home} /> : null; }
export default connect(state => ({ home: state.home.viewHome }))(HomeAgenda);
