import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { FormField, colors, styles } from './FormKit';
export default function ChoiceField({ label, value, options, onChange, disabled, emptyLabel = 'Não informado', optional = false }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState('');
  const selected = options.find(o => String(o.value) === String(value));
  return <View style={styles.field}>
    <Text style={[styles.label, { marginBottom: 9 }]}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={() => { setQuery(''); setOpen(true); }} style={[styles.inputFrame, { opacity: disabled ? 0.6 : 1 }]}><Text style={{ flex: 1, color: selected ? colors.ink : colors.muted }}>{selected?.label || emptyLabel}</Text><Icon name="chevron-down" size={20} color={colors.muted} /></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(17,38,47,.35)', justifyContent: 'center', padding: 20 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 560, maxHeight: '85%', alignSelf: 'center', backgroundColor: colors.white, borderRadius: 20, padding: 24 }}>
          <Text style={styles.sectionTitle}>{label}</Text><FormField label={`Buscar ${label.toLowerCase()}`} value={query} onChangeText={setQuery} placeholder="Digite para filtrar" />
          <ScrollView keyboardShouldPersistTaps="handled">
            {(optional ? [{ value: null, label: emptyLabel }, ...options] : options).filter(o => o.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(o => <Pressable key={String(o.value)} accessibilityRole="button" accessibilityLabel={o.label} onPress={() => { onChange(o.value); setOpen(false); }} style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border }}><Text style={{ color: colors.ink, fontSize: 14 }}>{o.label}</Text></Pressable>)}
            {!options.length && <Text style={styles.helper}>Nenhuma opção cadastrada.</Text>}
          </ScrollView>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar seleção" onPress={() => setOpen(false)} style={{ padding: 16 }}><Text style={{ color: colors.primary, textAlign: 'center' }}>Fechar</Text></Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  </View>;
}
