import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import HomeDashboard from '../components/Home/HomeDashboard';
import { household } from '../services/api-household';
import { todayDate } from '../helpers/calendar';
import { formError } from '../components/forms/FormKit';
import { colors } from '../components/forms/FormKit';
import { ListScreen, ListHeading, ListBadge, styles } from '../components/lists/ListKit';

function HouseOverview({ viewHome }) {
  const navigation = useNavigation();
  const focused = useIsFocused(); const request = useRef(0);
  const [dashboard, setDashboard] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    const ticket = ++request.current; setLoading(true);
    try { const result = await household(viewHome.id, `dashboard?date=${todayDate()}`); if (ticket === request.current) { setDashboard(result); setError(''); } }
    catch (e) { if (ticket === request.current) setError(formError(e, 'Não foi possível carregar o painel da casa.')); }
    finally { if (ticket === request.current) setLoading(false); }
  }, [viewHome.id]);
  useEffect(() => { if (focused) load(); return () => { request.current += 1; }; }, [focused, load]);
  return <ListScreen onBack={() => navigation.navigate('Home')} onRefresh={load} refreshing={loading && !!dashboard}>
    <ListHeading eyebrow="PAINEL DA CASA" title={viewHome.name} subtitle={viewHome.descr || 'Um olhar sobre o estoque, as compras e a rotina da sua casa.'} action={load} actionLabel="Atualizar painel" actionIcon="refresh" />
    <View style={{ marginBottom: 24 }}><ListBadge shared={!!viewHome.shared_homes} icon="home-outline">{viewHome.shared_homes ? 'Casa compartilhada' : 'Minha casa'}</ListBadge></View>
    <HomeDashboard data={dashboard} loading={loading} error={error} onRefresh={load} navigation={navigation} />
    {!viewHome.shared_homes && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
      {[['pencil-outline', 'Editar casa', 'HomeForm'], ['account-multiple-outline', 'Compartilhar casa', 'HomeShare']].map(([icon, label, screen]) => <Pressable key={screen} accessibilityRole="button" accessibilityLabel={label} onPress={() => navigation.navigate(screen)} style={({ pressed }) => [styles.card, { flexGrow: 1, flexBasis: 230, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, opacity: pressed ? 0.8 : 1 }]}><Icon accessible={false} name={icon} size={23} color={colors.primary} /><Text style={{ color: colors.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text><Icon accessible={false} name="chevron-right" size={20} color={colors.muted} style={{ marginLeft: 'auto' }} /></Pressable>)}
    </View>}
  </ListScreen>;
}
function HomeInfo({ viewHome }) { return viewHome ? <HouseOverview key={viewHome.id} viewHome={viewHome} /> : null; }
export default connect(state => ({ viewHome: state.home.viewHome }))(HomeInfo);
