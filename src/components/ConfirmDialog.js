import React from 'react';
import { Text, View } from 'react-native';
import { Dialog, Portal } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { FormButton, FormFeedback, colors } from './forms/FormKit';

export default function ConfirmDialog({ visible, title, message, onCalcelCallback, onConfirmCallback, loading, error, confirmLabel = 'Remover', icon = 'trash-can-outline' }) {
  return <Portal><Dialog visible={!!visible} dismissable={!loading} onDismiss={onCalcelCallback} style={{ backgroundColor: colors.white, borderRadius: 20, width: '90%', marginHorizontal: 0, maxWidth: 440, alignSelf: 'center' }}>
    <View style={{ marginHorizontal: 24, marginTop: 24, marginBottom: 4, width: 48, height: 48, borderRadius: 15, backgroundColor: colors.errorBackground, alignItems: 'center', justifyContent: 'center' }}><Icon accessible={false} name={icon} size={24} color={colors.error} /></View>
    <Dialog.Title style={{ color: colors.ink, fontWeight: '700', fontSize: 22 }}>{title}</Dialog.Title>
    <Dialog.Content><Text style={{ color: colors.muted, fontSize: 14, lineHeight: 23 }}>{message}</Text>{!!error && <View style={{ marginTop: 16 }}><FormFeedback message={error} /></View>}</Dialog.Content>
    <View style={{ flexDirection: 'row', gap: 12, padding: 24, paddingTop: 4 }}><FormButton secondary disabled={loading} onPress={onCalcelCallback} style={{ flex: 1 }}>Cancelar</FormButton><FormButton loading={loading} onPress={onConfirmCallback} style={{ flex: 1, backgroundColor: colors.error }}>{confirmLabel}</FormButton></View>
  </Dialog></Portal>;
}
