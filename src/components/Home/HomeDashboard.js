import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { FormButton, FormFeedback, colors } from '../forms/FormKit';
import { ListLoading, styles } from '../lists/ListKit';
import { displayDate } from '../../helpers/calendar';

export default function HomeDashboard({ data, loading, error, onRefresh, navigation }) {
  const { width } = useWindowDimensions();
  return <View style={{ marginBottom: 32 }}>
    <FormFeedback message={error} />
    {error && <FormButton secondary icon="refresh" onPress={onRefresh} style={{ marginBottom: 20 }}>Tentar atualizar painel</FormButton>}
    {loading && !data ? <ListLoading message="Preparando o resumo da casa..." /> : data && <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {[
          { id: 'week', value: data.events_this_week, label: 'Eventos da semana', description: `${displayDate(data.week.start)} a ${displayDate(data.week.end)}`, icon: 'calendar-week', action: 'Ver eventos da semana', onPress: () => navigation.navigate('HomeAgenda', { filter: 'week' }) },
          { id: 'zero', value: data.zero_stock_items, label: 'Itens com estoque zero', description: 'Precisam da sua atenção', icon: 'package-variant-remove', warning: data.zero_stock_items > 0, action: 'Ver itens com estoque zero', onPress: () => navigation.navigate('HomeItems', { filter: 'missing' }) },
          { id: 'purchases', value: data.pending_purchases, label: 'Compras pendentes', description: 'Nas listas desta casa', icon: 'cart-outline', action: 'Ver compras pendentes', onPress: () => navigation.navigate('ShoppingLists') },
          { id: 'inventory', value: data.total_items, label: 'Itens no inventário', description: 'Produtos e objetos cadastrados', icon: 'package-variant-closed', action: 'Ver todos os itens do inventário', onPress: () => navigation.navigate('HomeItems', { filter: 'all' }) },
        ].map(metric => <Pressable key={metric.id} accessibilityRole="button" accessibilityLabel={metric.action} onPress={metric.onPress} style={({ pressed }) => [styles.card, { width: width >= 900 ? '23%' : '47%', flexGrow: 1, minWidth: 0, padding: width < 600 ? 16 : 22, opacity: pressed ? 0.75 : 1 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: metric.warning ? colors.soft : '#EAF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon accessible={false} name={metric.icon} size={21} color={metric.warning ? '#A6604D' : colors.primary} /></View>
          <Text testID={`dashboard-${metric.id}`} style={{ fontSize: 34, lineHeight: 41, fontWeight: '700', color: colors.ink }}>{metric.value}</Text>
          <Text style={{ fontSize: 13, lineHeight: 19, fontWeight: '600', color: colors.ink, marginTop: 6 }}>{metric.label}</Text>
          <Text style={[styles.meta, { marginTop: 6 }]}>{metric.description}</Text>
        </Pressable>)}
      </View>
      <Text style={[styles.meta, { marginTop: -12, marginBottom: 24 }]}>{error ? 'Exibindo os dados da última atualização. ' : ''}Semana de segunda a domingo · {data.completed_this_week} {data.completed_this_week === 1 ? 'evento concluído' : 'eventos concluídos'} nesta semana.</Text>
      <View style={[styles.card, { padding: 24 }]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><View style={{ flex: 1, minWidth: 150 }}><Text style={styles.cardTitle}>Próximos compromissos</Text><Text style={styles.meta}>Até cinco compromissos pendentes, a partir de hoje.</Text></View><FormButton secondary icon="calendar-outline" onPress={() => navigation.navigate('HomeAgenda', { filter: 'pending' })}>Ver agenda</FormButton></View>
        {!data.upcoming_events.length ? <View style={{ paddingVertical: 16 }}><Text style={{ color: colors.ink, fontWeight: '600' }}>Nenhum compromisso por vir.</Text><Text style={styles.subtitle}>Os próximos compromissos da casa aparecerão aqui.</Text></View> : data.upcoming_events.map(event => <View key={event.id} testID={`dashboard-event-${event.id}`} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderTopWidth: 1, borderTopColor: '#EDF1F3', paddingVertical: 16 }}>
          <View style={{ width: 46, height: 50, borderRadius: 12, backgroundColor: '#F0F5F5', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontWeight: '700', fontSize: 20 }}>{event.event_date.slice(8)}</Text><Text style={{ color: colors.muted, fontSize: 10 }}>{event.event_date.slice(5, 7)}/{event.event_date.slice(0, 4)}</Text></View>
          <View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontSize: 15, fontWeight: '600', lineHeight: 22 }}>{event.title}</Text><Text style={styles.meta}>{displayDate(event.event_date)} · {event.event_time || 'Dia inteiro'}</Text>{!!event.location && <Text style={styles.meta}>{event.location}</Text>}</View>
        </View>)}
      </View>
    </>}
  </View>;
}
