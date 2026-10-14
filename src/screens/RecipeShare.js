import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { getRecipe, shareRecipe, unshareRecipe } from '../services/api-recipes';
import { FormScreen, FormField, FormFeedback, FormActions, FormContext, styles, colors, isEmail, formError } from '../components/forms/FormKit';
import { ListEmpty, ListIconButton, ListLoading } from '../components/lists/ListKit';
import ConfirmDialog from '../components/ConfirmDialog';

export default function RecipeShare() {
  const navigation = useNavigation(); const route = useRoute();
  const focused = useIsFocused();
  const id = route.params?.id; const home = route.params?.home || null;
  const [recipe, setRecipe] = useState(null); const [people, setPeople] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true); const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(''); const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState(null); const [removing, setRemoving] = useState(false); const [removeError, setRemoveError] = useState('');
  const back = () => navigation.navigate('RecipeDetail', { id, home });
  useEffect(() => {
    if (!focused) return;
    let active = true;
    setInitialLoading(true); setRecipe(null); setPeople([]); setError(''); setNotice(''); setEmail(''); setAttempted(false);
    getRecipe(id).then(result => {
      if (!active) return;
      setRecipe(result.data); setPeople(result.data.shared_with || []);
      if (!result.data.can_edit) setError('Apenas o autor pode gerenciar os compartilhamentos desta receita.');
    }).catch(err => { if (active) setError(formError(err)); }).finally(() => { if (active) setInitialLoading(false); });
    return () => { active = false; };
  }, [id, focused]);
  const submit = async () => {
    if (loading) return;
    setAttempted(true); setError(''); setNotice('');
    if (!isEmail(email)) return;
    setLoading(true);
    try {
      const result = await shareRecipe(id, email.trim());
      setPeople(previous => previous.some(person => person.id === result.data.id) ? previous : [...previous, result.data]);
      setNotice(result.already_shared ? 'Esta pessoa já tem acesso à receita.' : 'Receita compartilhada com sucesso!'); setEmail(''); setAttempted(false);
    } catch (err) { setError(formError(err, 'Não foi possível compartilhar. Tente novamente.')); }
    finally { setLoading(false); }
  };
  const remove = async () => {
    if (removing || !confirm) return;
    setRemoving(true); setRemoveError('');
    try {
      await unshareRecipe(id, confirm.id); setPeople(previous => previous.filter(person => person.id !== confirm.id)); setConfirm(null); setNotice('Acesso individual removido com sucesso.');
    } catch (err) { setRemoveError(formError(err)); }
    finally { setRemoving(false); }
  };
  return <FormScreen title="Compartilhar receita" subtitle="Boas receitas ficam ainda melhores quando são compartilhadas." eyebrow="RECEITAS EM BOA COMPANHIA" icon="account-multiple-plus-outline" onBack={back}>
    <FormFeedback message={error} /><FormFeedback message={notice} success />
    {initialLoading ? <ListLoading message="Carregando compartilhamentos..." /> : recipe?.can_edit && <>
      <FormContext icon="book-open-page-variant-outline">{recipe.title}</FormContext>
      <Text style={styles.sectionTitle}>Com quem você quer compartilhar?</Text><Text style={styles.sectionDescription}>A pessoa precisa ter conta no Home-X. Ela poderá ler os ingredientes e o modo de preparo, sem alterar sua receita.</Text>
      <FormField label="Email" icon="email-outline" placeholder="pessoa@exemplo.com" value={email} onChangeText={text => { setEmail(text); setError(''); }} editable={!loading} maxLength={255} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={attempted && !isEmail(email) ? 'Informe um email válido.' : ''} returnKeyType="send" onSubmitEditing={submit} />
      <FormActions onCancel={back} onSubmit={submit} loading={loading} label="Compartilhar receita" icon="account-plus-outline" />
      <View style={{ marginTop: 28, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 }}>
        <Text style={styles.sectionTitle}>Compartilhada com{people.length ? ` · ${people.length}` : ''}</Text>
        {!!recipe.home_id && <Text style={[styles.helper, { marginBottom: 12 }]}>Quem tem acesso à casa também pode consultar esta receita. Os acessos individuais estão listados abaixo.</Text>}
        {!people.length ? <ListEmpty compact icon="account-group-outline" title="Ainda não há acessos individuais." description="Compartilhe esta receita com alguém que faz parte da sua rotina." /> : people.map(person => <View key={person.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF1F3' }}><View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontWeight: '600' }}>{person.fullName}</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>{person.email}</Text></View><ListIconButton icon="account-remove-outline" label={`Remover acesso de ${person.fullName}`} danger onPress={() => { setRemoveError(''); setConfirm(person); }} /></View>)}
      </View>
    </>}
    <ConfirmDialog visible={!!confirm} title="Remover acesso?" message={`${confirm?.fullName || 'Esta pessoa'} deixará de ter acesso individual à receita. O acesso pela casa, se houver, continua disponível.`} loading={removing} error={removeError} onCalcelCallback={() => setConfirm(null)} onConfirmCallback={remove} />
  </FormScreen>;
}
