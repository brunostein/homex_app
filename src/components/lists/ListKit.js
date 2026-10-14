import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import HouseNavigation from '../Home/HouseNavigation';
import { Brand, FormButton, colors, styles as formStyles } from '../forms/FormKit';

export const normalizeSearch = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function ListIconButton({ icon, label, onPress, disabled, danger, style }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed, hovered }) => [styles.iconButton, hovered && { backgroundColor: danger ? colors.errorBackground : '#EAF1F2' }, pressed && { opacity: 0.65 }, disabled && { opacity: 0.35 }, style]}>
    <Icon accessible={false} name={icon} size={20} color={danger ? colors.error : colors.primary} />
  </Pressable>;
}

export function ListActionsMenu({ name, options }) {
  const [visible, setVisible] = useState(false);
  const { width } = useWindowDimensions();
  return <>
    <ListIconButton icon="dots-horizontal" label={`Opções de ${name}`} onPress={() => setVisible(true)} />
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={{ flex: 1, justifyContent: width < 600 ? 'flex-end' : 'center', alignItems: 'center', padding: 20 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar opções" onPress={() => setVisible(false)} style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(17, 38, 47, 0.35)' }]} />
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 360, borderRadius: 20, padding: 16, backgroundColor: colors.white }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}><View style={{ flex: 1, paddingLeft: 8 }}><Text style={styles.meta}>OPÇÕES</Text><Text numberOfLines={2} style={[styles.cardTitle, { fontSize: 17, marginTop: 4 }]}>{name}</Text></View><ListIconButton icon="close" label="Fechar opções" onPress={() => setVisible(false)} /></View>
          {options.map(option => <Pressable key={option.label} accessibilityRole="menuitem" accessibilityLabel={option.label} onPress={() => { setVisible(false); option.onPress(); }} style={({ pressed, hovered }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 52, borderRadius: 10, backgroundColor: pressed || hovered ? (option.danger ? colors.errorBackground : '#EFF5F5') : colors.white })}><Icon accessible={false} name={option.icon} size={21} color={option.danger ? colors.error : colors.primary} /><Text style={{ fontSize: 14, fontWeight: '500', color: option.danger ? colors.error : colors.ink }}>{option.label}</Text></Pressable>)}
        </View>
      </SafeAreaView>
    </Modal>
  </>;
}

export function ListScreen({ children, onBack, onMenu, userName, refreshing, onRefresh }) {
  const { width } = useWindowDimensions();
  return <SafeAreaView style={formStyles.screen} edges={['top', 'left', 'right']}>
    <View style={formStyles.topBar}>
      <View style={[formStyles.topBarInner, { maxWidth: 1160 }]}>
        {onBack ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={formStyles.back}><Icon accessible={false} name="arrow-left" size={21} color={colors.primary} /><Text style={formStyles.backText}>Voltar</Text></Pressable> : <View style={styles.row}>{onMenu && <ListIconButton icon="menu" label="Abrir menu" onPress={onMenu} />}<Brand /></View>}
        {onBack ? <Brand /> : <View style={styles.row}>{width >= 640 && <Text style={styles.userName}>{userName?.split(' ')[0] || 'Minha conta'}</Text>}<View accessibilityLabel={userName || 'Minha conta'} style={styles.userAvatar}><Text style={styles.userInitial}>{userName?.trim().charAt(0).toUpperCase() || 'H'}</Text></View></View>}
      </View>
    </View>
    <HouseNavigation />
    <ScrollView keyboardShouldPersistTaps="handled" refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined} contentContainerStyle={styles.scroll}>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  </SafeAreaView>;
}

export function ListHeading({ eyebrow, title, subtitle, action, actionLabel, actionIcon = 'plus' }) {
  const { width } = useWindowDimensions();
  return <View style={[styles.headingRow, width < 640 && { flexDirection: 'column', alignItems: 'stretch' }]}>
    <View style={{ flex: 1 }}><Text style={[formStyles.eyebrow, { marginBottom: 10 }]}>{eyebrow}</Text><Text accessibilityRole="header" style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
    {action && <FormButton icon={actionIcon} onPress={action}>{actionLabel}</FormButton>}
  </View>;
}

export function ListSearch({ value, onChange, placeholder, label, onRefresh, refreshing }) {
  const [focused, setFocused] = useState(false);
  return <View style={styles.searchRow}>
    <View style={[styles.searchBox, focused && formStyles.inputFocused]}><Icon accessible={false} name="magnify" size={22} color={colors.muted} /><TextInput accessibilityLabel={label} placeholder={placeholder} placeholderTextColor="#8798A1" value={value} onChangeText={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoCapitalize="none" returnKeyType="search" style={[formStyles.input, { paddingVertical: 13 }]} />{!!value && <ListIconButton icon="close" label="Limpar busca" onPress={() => onChange('')} style={{ width: 36, height: 36, minHeight: 36 }} />}</View>
    {onRefresh && (refreshing ? <View style={styles.refresh}><ActivityIndicator accessibilityLabel="Atualizando lista" size="small" color={colors.primary} /></View> : <ListIconButton label="Atualizar lista" icon="refresh" onPress={onRefresh} style={styles.refresh} />)}
  </View>;
}

export function ListFilters({ options, value, onChange }) {
  return <View style={styles.filters}>{options.map(option => <Pressable key={option.value} accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: value === option.value }} onPress={() => onChange(option.value)}
    style={({ pressed }) => [styles.filter, value === option.value && styles.filterActive, pressed && { opacity: 0.7 }]}><Text style={[styles.filterLabel, value === option.value && { color: colors.primary }]}>{option.label}</Text>{option.count != null && <View style={[styles.filterCount, value === option.value && { backgroundColor: '#DCE9EB' }]}><Text style={styles.filterNumber}>{option.count}</Text></View>}</Pressable>)}</View>;
}

export function ListBadge({ children, shared = false, warning = false, icon }) {
  return <View style={[styles.badge, shared && { backgroundColor: '#EDF3F5' }, warning && { backgroundColor: colors.soft }]}>{icon && <Icon accessible={false} name={icon} size={13} color={colors.primary} />}<Text style={[styles.badgeText, warning && { color: '#A14F3C' }]}>{children}</Text></View>;
}

export function ListEmpty({ icon = 'home-outline', title, description, action, actionLabel, actionIcon = 'plus', compact = false }) {
  return <View style={[styles.empty, compact && { paddingVertical: 26, borderWidth: 0 }]}>
    <View style={styles.emptyIcon}><Icon accessible={false} name={icon} size={compact ? 25 : 32} color={colors.primary} /></View>
    <Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text>
    {action && <FormButton icon={actionIcon} onPress={action} style={{ marginTop: 20 }}>{actionLabel}</FormButton>}
  </View>;
}

export function ListLoading({ message = 'Carregando seus espaços...' }) {
  return <View accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.meta}>{message}</Text></View>;
}

export const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 48, flexGrow: 1 },
  content: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userName: { color: colors.muted, fontSize: 13 },
  userAvatar: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#EAF1F2', alignItems: 'center', justifyContent: 'center' },
  userInitial: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 28 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginTop: 9 },
  toolbar: { backgroundColor: colors.white, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 24, gap: 14 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, minHeight: 48, backgroundColor: '#F5F8F9', borderRadius: 10, borderWidth: 1, borderColor: '#E9EEF1' },
  refresh: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: '#EDF1F3' },
  filterActive: { backgroundColor: '#EFF5F5', borderColor: '#C8DBDF' },
  filterLabel: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  filterCount: { backgroundColor: '#F0F3F5', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 5, minWidth: 20, alignItems: 'center' },
  filterNumber: { fontSize: 10, fontWeight: '700', color: colors.primary },
  meta: { fontSize: 12, color: colors.muted, lineHeight: 19 },
  results: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 },
  iconButton: { width: 40, height: 40, minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#F0F5F2', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.primary },
  empty: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 18, paddingHorizontal: 24, paddingVertical: 48, alignItems: 'center' },
  emptyIcon: { width: 68, height: 68, backgroundColor: '#EEF4F4', borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 19, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 9 },
  emptyDescription: { maxWidth: 360, fontSize: 13, lineHeight: 21, color: colors.muted, textAlign: 'center' },
  loading: { padding: 48, alignItems: 'center', gap: 16 },
  cardTitle: { fontSize: 19, lineHeight: 26, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
});
