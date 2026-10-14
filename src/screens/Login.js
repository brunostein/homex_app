import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux'
import { setLoggedUser, setNeedNewAuth } from '../redux/actions/user'
import { setUserHomes } from '../redux/actions/home'
import { setApiData } from '../redux/actions/api'
import config from "../config"
import { signIn, signUp } from '../services/api-users'
import { Brand, FormField, FormButton, FormFeedback, colors, styles as formStyles, formError, isEmail } from '../components/forms/FormKit';

const Login = (props) => {

  const [ showForm, setShowForm ] = useState("signin");
  const [ userFullName, setUserFullName ] = useState("");
  const [ userEmail, setUserEmail ] = useState("");
  const [ userPassword, setUserPassword ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(props.needNewAuth ? 'Entre novamente para continuar.' : '');
  const registering = showForm === 'signup';
  const [attempted, setAttempted] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const wide = width >= 960;
  const emailError = !userEmail.trim() ? 'Informe seu email.' : !isEmail(userEmail) ? 'Use um email válido, como voce@exemplo.com.' : '';
  const passwordError = !userPassword ? 'Informe sua senha.' : '';
  const nameError = registering && !userFullName.trim() ? 'Como podemos chamar você?' : '';

  const submit = async (register = false) => {
    if (loading) return;
    setAttempted(true);
    setError('');
    setNotice('');
    if (!config.api.host) {
      setError('O serviço está indisponível no momento. Tente novamente em instantes.');
      return;
    }
    if (emailError || passwordError || (register && nameError)) {
      setError(!userEmail.trim() || !userPassword || (register && !userFullName.trim()) ? 'Preencha todos os campos.' : 'Confira o email informado.');
      return;
    }
    setLoading(true);
    try {
      props.setApiData(null);
      const result = register
        ? await signUp({ fullName: userFullName.trim(), email: userEmail.trim(), password: userPassword })
        : await signIn(userEmail.trim(), userPassword);
      if (!result?.success) {
        setError(formError(result, 'Não foi possível concluir. Confira seus dados e tente novamente.'));
        return;
      }
      if (register) {
        setShowForm('signin');
        setAttempted(false);
        setNotice('Conta criada com sucesso! Entre com seu email e senha.');
      } else {
        props.setUserHomes([...(result.data.homes || []), ...(result.data.homes_shared || [])]);
        props.setNeedNewAuth(false);
        props.setLoggedUser(result.data);
      }
    } catch (err) {
      setError(formError(err, 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const changeForm = () => {
    setShowForm(registering ? 'signin' : 'signup');
    setAttempted(false);
    setError('');
    setNotice('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[auth.layout, { minHeight: height - insets.top - insets.bottom }, wide && auth.wide]}>
            {wide ? (
              <View style={auth.brandPanel}>
                <Brand light />
                <View style={auth.brandContent}>
                  <View style={auth.pill}><View style={auth.pillDot} /><Text style={auth.pillText}>MAIS LEVEZA NO DIA A DIA</Text></View>
                  <Text style={auth.hero}>Sua casa,{'\n'}mais organizada<Text style={{ color: colors.accent }}>.</Text></Text>
                  <Text style={auth.heroDescription}>Menos tempo procurando. Mais tempo aproveitando o seu lar.</Text>
                  <View style={auth.preview}>
                    <View style={auth.previewTop}><View style={auth.previewIcon}><Icon accessible={false} name="home-heart" size={26} color={colors.accent} /></View><View><Text style={auth.previewTitle}>Tudo no seu lugar</Text><Text style={auth.previewSubtitle}>Um cuidado a menos na sua rotina</Text></View></View>
                    {[['package-variant-closed', 'Saiba o que você tem'], ['view-grid-outline', 'Organize por ambientes'], ['account-multiple-outline', 'Cuide da casa em companhia']].map(([icon, text]) => (
                      <View key={icon} style={auth.feature}><Icon accessible={false} name={icon} size={19} color="#A8C4C9" /><Text style={auth.featureText}>{text}</Text><Icon accessible={false} name="check" size={17} color={colors.accent} /></View>
                    ))}
                  </View>
                </View>
                <Text style={auth.brandFooter}>SEU LAR. SUA ROTINA. TUDO MAIS SIMPLES.</Text>
              </View>
            ) : <View style={auth.mobileBrand}><Brand /><Text style={auth.mobileTagline}>Sua casa, mais organizada.</Text></View>}
            <View style={[auth.formPanel, !wide && { paddingTop: 8, paddingHorizontal: 20 }]}>
              <View style={[auth.formCard, !wide && { padding: 24 }]}>
                <View style={auth.formIcon}><Icon accessible={false} name={registering ? 'account-plus-outline' : 'door-open'} size={25} color={colors.primary} /></View>
                <Text style={formStyles.eyebrow}>{registering ? 'UM NOVO COMEÇO' : 'BOM TER VOCÊ POR AQUI'}</Text>
                <Text accessibilityRole="header" style={auth.formTitle}>{registering ? 'Crie sua conta' : 'Sinta-se em casa.'}</Text>
                <Text style={auth.formDescription}>{registering ? 'Seu primeiro passo para uma casa mais organizada.' : 'Entre para continuar cuidando do seu espaço.'}</Text>
                <FormFeedback message={error} />
                <FormFeedback message={notice} success />
                {registering && <FormField key="full-name" label="Nome completo" icon="account-outline" placeholder="Como você se chama?" autoComplete="name" value={userFullName} editable={!loading} maxLength={255} error={attempted && nameError} returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()} onChangeText={text => { setUserFullName(text); setError(''); }} />}
                <FormField key="email" ref={emailRef} label="Email" icon="email-outline" placeholder="voce@exemplo.com" autoComplete="email" autoCapitalize="none" keyboardType="email-address" value={userEmail} editable={!loading} maxLength={255} error={attempted && emailError} returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()} onChangeText={text => { setUserEmail(text); setError(''); }} />
                <FormField key="password" ref={passwordRef} label="Senha" icon="lock-outline" placeholder={registering ? 'Escolha uma senha' : 'Digite sua senha'} autoComplete={registering ? 'new-password' : 'current-password'} secureTextEntry value={userPassword} editable={!loading} error={attempted && passwordError} returnKeyType="go" onChangeText={text => { setUserPassword(text); setError(''); }} onSubmitEditing={() => submit(registering)} />
                <FormButton onPress={() => submit(registering)} loading={loading} icon="arrow-right">{registering ? 'Cadastrar' : 'Entrar'}</FormButton>
                <View style={auth.switchRow}>
                  <Text style={auth.switchHint}>{registering ? 'Já faz parte do Home-X?' : 'Primeira vez por aqui?'}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel={registering ? 'Já tenho conta. Entrar' : 'Não tenho conta. Criar conta'} disabled={loading} onPress={changeForm} style={auth.switchButton}>
                    <Text style={auth.switchText}>{registering ? 'Entrar na minha conta' : 'Criar minha conta'}</Text><Icon accessible={false} name="arrow-up-right" size={16} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
              <Text style={auth.formFooter}>Organização começa com um pequeno passo.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const auth = StyleSheet.create({
  layout: { flex: 1 }, wide: { flexDirection: 'row' },
  brandPanel: { width: '44%', backgroundColor: colors.primary, padding: 44, justifyContent: 'space-between', overflow: 'hidden' },
  brandContent: { width: '100%', maxWidth: 410, alignSelf: 'center', paddingVertical: 50 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.6, color: '#A8C4C9' },
  hero: { fontSize: 52, lineHeight: 59, fontWeight: '700', color: 'white', letterSpacing: -2 },
  heroDescription: { fontSize: 16, lineHeight: 27, color: '#B6CDD2', marginTop: 22, maxWidth: 320 },
  preview: { marginTop: 40, padding: 22, borderRadius: 18, backgroundColor: '#254C58', borderColor: '#3B606A', borderWidth: 1 },
  previewTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  previewIcon: { height: 48, width: 48, backgroundColor: '#315966', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  previewTitle: { fontSize: 15, fontWeight: '700', color: 'white' }, previewSubtitle: { fontSize: 11, color: '#B6CDD2', marginTop: 5 },
  feature: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#3B606A' },
  featureText: { flex: 1, color: '#DFEAED', fontSize: 13 },
  brandFooter: { color: '#A8C4C9', fontSize: 9, letterSpacing: 1.6 },
  mobileBrand: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  mobileTagline: { fontSize: 12, color: colors.muted, marginTop: 10 },
  formPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  formCard: { width: '100%', maxWidth: 460, padding: 36, borderRadius: 24, backgroundColor: 'white', borderWidth: 1, borderColor: colors.border, boxShadow: '0 8px 40px rgba(24, 54, 66, 0.04)' },
  formIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.soft, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  formTitle: { color: colors.ink, fontSize: 30, fontWeight: '700', letterSpacing: -1, marginTop: -6 },
  formDescription: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 10, marginBottom: 28 },
  switchRow: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EDF1F3', marginTop: 28, paddingTop: 22 },
  switchHint: { fontSize: 12, color: colors.muted }, switchButton: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 10 },
  switchText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  formFooter: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 24, marginBottom: 16 },
});

const mapStateToProps = state => ({
  userLogged: state.user.user,
  needNewAuth: state.user.needNewAuth
});

const mapDispatchToProps = {
  setNeedNewAuth,
  setLoggedUser: (data) => setLoggedUser(data),
  setApiData: (data) => setApiData(data),
  setUserHomes: (data) => setUserHomes(data)
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
