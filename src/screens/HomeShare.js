import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ChoiceField from '../components/forms/ChoiceField';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { shareHome, getHomeById } from '../services/api-homes';
import { FormScreen, FormField, FormFeedback, FormActions, FormContext, styles, colors, formError, isEmail } from '../components/forms/FormKit';

function HomeShare({ viewHome }) {
  const navigation = useNavigation(); const focused = useIsFocused();
  const [permission, setPermission] = useState('read');
  const [email, setEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const back = () => navigation.navigate('Home');
  const emailError = !email.trim() ? 'Informe o email de quem você quer convidar.' : !isEmail(email) ? 'Informe um email válido.' : '';

  useEffect(() => {
    if (!focused) return;
    let active = true; setPermission('read');
    setEmail(''); setAttempted(false); setError(''); setNotice(''); setSharedUsers([]);
    if (viewHome) {
      setLoadingUsers(true);
      getHomeById(viewHome.id).then(result => {
        if (!active) return;
        if (result?.success) setSharedUsers(result.data.shared_users || []);
        else setError('Não foi possível carregar os compartilhamentos. Tente abrir esta tela novamente.');
      }).catch(() => { if (active) setError('Não foi possível carregar os compartilhamentos.'); })
        .finally(() => { if (active) setLoadingUsers(false); });
    }
    return () => { active = false; };
  }, [viewHome?.id, focused]);

  const submit = async () => {
    if (loading) return;
    setAttempted(true); setError(''); setNotice('');
    if (emailError) return;
    setLoading(true);
    try {
      const result = await shareHome(viewHome.id, { email: email.trim(), permission });
      if (!result?.success) { setError(formError(result, 'Não foi possível compartilhar a casa. Tente novamente.')); return; }
      setNotice('Casa compartilhada com sucesso!'); setEmail(''); setAttempted(false);
      const updated = await getHomeById(viewHome.id);
      if (updated?.success) setSharedUsers(updated.data.shared_users || []);
    } catch (err) { setError(formError(err)); }
    finally { setLoading(false); }
  };

  if (!viewHome) return null;
  return <FormScreen title="Compartilhar casa" subtitle="Compartilhe a organização com quem faz parte da sua rotina." eyebrow="COMPARTILHAR CASA" icon="account-multiple-plus-outline" onBack={back}>
    <FormContext>{viewHome.name}</FormContext>
    <Text style={styles.sectionTitle}>Quem acompanha sua casa?</Text>
    <Text style={styles.sectionDescription}>Informe o email de uma pessoa que já tenha conta no Home-X. Escolha se ela poderá apenas consultar ou também organizar o inventário e as compras. Para alterar um acesso existente, informe novamente o email.</Text>
    <FormFeedback message={error} />
    <FormFeedback message={notice} success />
    <FormField label="Email" icon="email-outline" placeholder="pessoa@exemplo.com" autoComplete="email" autoCapitalize="none" keyboardType="email-address" value={email} editable={!loading} maxLength={255} error={attempted && emailError} helper="Apenas o dono da casa pode gerenciar os acessos." onChangeText={text => { setEmail(text); setError(''); setNotice(''); }} returnKeyType="send" onSubmitEditing={submit} />
    <ChoiceField label="Permissão" value={permission} options={[{ value: 'read', label: 'Somente leitura' }, { value: 'write', label: 'Pode editar inventário e compras' }]} onChange={setPermission} disabled={loading} />
    <FormActions onCancel={back} onSubmit={submit} loading={loading} label="Compartilhar casa" icon="account-plus-outline" />
    <View style={{ marginTop: 32, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 }}>
      <Text style={styles.sectionTitle}>Pessoas com acesso{sharedUsers.length ? ` · ${sharedUsers.length}` : ''}</Text>
      {loadingUsers ? <ActivityIndicator color={colors.primary} style={{ margin: 24 }} /> : !sharedUsers.length ? (
        <View style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}><Icon accessible={false} name="account-group-outline" size={32} color="#9CADB5" /><Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>Por enquanto, só você por aqui.{'\n'}Convide alguém para acompanhar sua casa.</Text></View>
      ) : sharedUsers.map(user => <View key={user.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 }}>
        <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: '#EAF2F2', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.primary, fontWeight: '700' }}>{user.fullName?.trim().charAt(0).toUpperCase() || '?'}</Text></View>
        <View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontWeight: '600', fontSize: 14 }}>{user.fullName}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{user.email}</Text></View>
        <Icon accessible={false} name={user.shared_homes?.permission === 'write' ? 'pencil-outline' : 'eye-outline'} size={18} color={colors.muted} />
      </View>)}
    </View>
  </FormScreen>;
}

export default connect(state => ({ viewHome: state.home.viewHome }))(HomeShare);
