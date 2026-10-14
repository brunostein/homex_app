import React, { forwardRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export const colors = {
  ink: '#183642', muted: '#687B85', background: '#F4F6F8', white: '#FFFFFF',
  border: '#DCE4E9', primary: '#193F4B', accent: '#ED8069', soft: '#FFF0EB',
  error: '#B43A3A', errorBackground: '#FFF1F0', success: '#27614D', successBackground: '#EDF7F1',
};

export const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export function formError(result, fallback = 'Não foi possível salvar. Tente novamente.') {
  const message = result?.response?.data?.msg || result?.message || result?.msg;
  const translations = {
    'User already exists': 'Este email já está cadastrado. Use a opção Entrar.',
    'User not found.': 'Não encontramos uma conta com esse email. A pessoa precisa se cadastrar primeiro.',
    'Authentication failed. User not found.': 'Email ou senha incorretos. Confira seus dados.',
    'Authentication failed, wrong email or password.': 'Email ou senha incorretos. Confira seus dados.',
    'Network Error': 'Não foi possível conectar. Verifique sua conexão e tente novamente.',
  };
  return translations[message] || (message && !/timeout|status code|Sequelize/i.test(message) ? message : fallback);
}

export function Brand({ light = false }) {
  return <View style={styles.brand}>
    <View style={styles.brandMark}><Icon accessible={false} name="home-outline" size={25} color={colors.primary} /></View>
    <Text style={[styles.brandName, light && { color: colors.white }]}>home<Text style={{ color: colors.accent }}>x</Text></Text>
  </View>;
}

export const FormField = forwardRef(function FormField({ label, optional, helper, error, icon, secureTextEntry, style, onFocus, onBlur, ...props }, ref) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return <View style={[styles.field, style]}>
    <View style={styles.labelRow}>
      <Text style={styles.label}>{label}</Text>
      {optional && <Text style={styles.optional}>opcional</Text>}
    </View>
    <View style={[styles.inputFrame, props.multiline && styles.multilineFrame, focused && styles.inputFocused, error && styles.inputError, props.editable === false && { opacity: 0.65 }]}>
      {!!icon && <Icon accessible={false} name={icon} size={20} color={focused ? colors.primary : colors.muted} style={props.multiline && { marginTop: 3 }} />}
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor="#8B9AA3"
        {...props}
        secureTextEntry={secureTextEntry && !showPassword}
        onFocus={event => { setFocused(true); onFocus?.(event); }}
        onBlur={event => { setFocused(false); onBlur?.(event); }}
        style={[styles.input, props.multiline && styles.multilineInput]}
      />
      {secureTextEntry && <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setShowPassword(!showPassword)} hitSlop={8} style={styles.eye}>
        <Icon accessible={false} name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.muted} />
      </Pressable>}
    </View>
    {!!(error || helper) && <Text style={[styles.helper, error && { color: colors.error }]}>{error || helper}</Text>}
  </View>;
});

export function FormFeedback({ message, success = false }) {
  if (!message) return null;
  return <View accessibilityRole={success ? undefined : 'alert'} accessibilityLiveRegion="polite" style={[styles.feedback, success && styles.feedbackSuccess]}>
    <Icon accessible={false} name={success ? 'check-circle-outline' : 'alert-circle-outline'} size={20} color={success ? colors.success : colors.error} />
    <Text style={[styles.feedbackText, success && { color: colors.success }]}>{message}</Text>
  </View>;
}

export function FormButton({ children, onPress, loading, disabled, secondary = false, icon, accessibilityLabel, style }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)} accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed, hovered }) => [styles.button, secondary && styles.secondaryButton, hovered && { opacity: 0.9 }, pressed && { opacity: 0.75 }, (disabled || loading) && { opacity: 0.65 }, style]}>
    {loading ? <ActivityIndicator size="small" color={secondary ? colors.primary : colors.white} /> : icon ? <Icon accessible={false} name={icon} size={19} color={secondary ? colors.primary : colors.white} /> : null}
    <Text style={[styles.buttonText, secondary && { color: colors.primary }]}>{children}</Text>
  </Pressable>;
}

export function FormActions({ onCancel, onSubmit, loading, label = 'Salvar alterações', icon = 'check' }) {
  return <View style={styles.actions}>
    <FormButton onPress={onCancel} disabled={loading} secondary style={{ flex: 1 }}>Cancelar</FormButton>
    <FormButton onPress={onSubmit} loading={loading} icon={icon} style={{ flex: 2 }}>{label}</FormButton>
  </View>;
}

export function FormContext({ icon = 'home-outline', children }) {
  return <View style={styles.context}><Icon accessible={false} name={icon} size={18} color={colors.primary} /><Text style={styles.contextText}>{children}</Text></View>;
}

export function QuantityField({ value, onChange, disabled, error }) {
  const [focused, setFocused] = useState(false);
  const numericValue = Number(value) || 0;
  return <View style={styles.field}>
    <Text style={[styles.label, { marginBottom: 9 }]}>Quantidade</Text>
    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Diminuir quantidade" disabled={disabled || numericValue <= 0} onPress={() => onChange(Math.max(0, numericValue - 1))} style={[styles.quantityButton, (disabled || numericValue <= 0) && { opacity: 0.4 }]}><Icon accessible={false} name="minus" size={21} color={colors.primary} /></Pressable>
      <TextInput accessibilityLabel="Quantidade" value={String(value)} editable={!disabled} onChangeText={text => onChange(text.replace(/[^0-9]/g, ''))} keyboardType="number-pad" inputMode="numeric" maxLength={10} selectTextOnFocus onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={[styles.quantityInput, focused && styles.inputFocused, error && { borderColor: colors.error }]} />
      <Pressable accessibilityRole="button" accessibilityLabel="Aumentar quantidade" disabled={disabled || numericValue >= 2147483647} onPress={() => onChange(numericValue + 1)} style={[styles.quantityButton, disabled && { opacity: 0.4 }]}><Icon accessible={false} name="plus" size={21} color={colors.primary} /></Pressable>
    </View>
    <Text style={[styles.helper, error && { color: colors.error }]}>{error || 'Use os botões ou digite a quantidade. Zero indica um item em falta.'}</Text>
  </View>;
}

export function FormScreen({ title, subtitle, eyebrow, icon = 'home-outline', onBack, children }) {
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
    <View style={styles.topBar}>
      <View style={styles.topBarInner}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.back}>
          <Icon accessible={false} name="arrow-left" size={21} color={colors.primary} /><Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Brand />
      </View>
    </View>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pageContent}>
        <View style={styles.pageWidth}>
          <Text style={styles.eyebrow}>{eyebrow || 'SEU ESPAÇO, DO SEU JEITO'}</Text>
          <View style={styles.pageHeading}>
            <View style={styles.headingIcon}><Icon accessible={false} name={icon} size={26} color={colors.primary} /></View>
            <View style={{ flex: 1 }}><Text accessibilityRole="header" style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
          </View>
          <View style={styles.card}>{children}</View>
          <Text style={styles.pageFootnote}>Um lugar para deixar a rotina mais leve.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 27, fontWeight: '800', letterSpacing: -1.1, color: colors.ink },
  topBar: { backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  topBarInner: { width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 12, paddingRight: 16 },
  backText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  pageContent: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 40 },
  pageWidth: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.8, marginBottom: 18 },
  pageHeading: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 28 },
  headingIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#E4EDEE', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, lineHeight: 35, fontWeight: '700', color: colors.ink, letterSpacing: -0.8 },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginTop: 6 },
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  sectionDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, marginBottom: 24 },
  field: { marginBottom: 22 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9, gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  optional: { fontSize: 12, color: colors.muted },
  inputFrame: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 15, backgroundColor: '#FCFDFE', flexDirection: 'row', gap: 10, alignItems: 'center' },
  inputFocused: { borderColor: colors.primary, backgroundColor: colors.white, boxShadow: '0 0 0 3px rgba(25, 63, 75, 0.08)' },
  inputError: { borderColor: colors.error },
  input: { flex: 1, minWidth: 0, paddingVertical: 15, fontSize: 15, color: colors.ink, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) },
  multilineFrame: { alignItems: 'flex-start', paddingTop: 12 },
  multilineInput: { minHeight: 90, paddingTop: 0, textAlignVertical: 'top' },
  eye: { padding: 6, marginRight: -6 },
  quantityButton: { width: 50, height: 50, borderRadius: 11, backgroundColor: '#EDF3F4', alignItems: 'center', justifyContent: 'center' },
  quantityInput: { minWidth: 70, width: 90, height: 50, borderRadius: 11, borderWidth: 1, borderColor: colors.border, textAlign: 'center', color: colors.ink, fontSize: 18, fontWeight: '600', ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) },
  helper: { fontSize: 12, lineHeight: 18, color: colors.muted, marginTop: 7 },
  feedback: { borderRadius: 11, padding: 14, backgroundColor: colors.errorBackground, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 20 },
  feedbackSuccess: { backgroundColor: colors.successBackground },
  feedbackText: { flex: 1, color: colors.error, fontSize: 13, lineHeight: 20 },
  button: { minHeight: 52, borderRadius: 11, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 8 },
  secondaryButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#EDF1F3', paddingTop: 24, marginTop: 4 },
  context: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: '#EFF5F5', borderRadius: 10, marginBottom: 24 },
  contextText: { flex: 1, color: colors.primary, fontSize: 13, fontWeight: '500' },
  pageFootnote: { textAlign: 'center', color: '#7D8C95', fontSize: 12, marginTop: 24 },
});
