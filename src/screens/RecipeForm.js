import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { createRecipe, getRecipe, updateRecipe } from '../services/api-recipes';
import { FormScreen, FormField, FormFeedback, FormActions, FormContext, styles, formError } from '../components/forms/FormKit';
import { ListLoading } from '../components/lists/ListKit';

export default function RecipeForm() {
  const route = useRoute(); const navigation = useNavigation();
  const focused = useIsFocused();
  const id = route.params?.id; const home = route.params?.home || null;
  const empty = { title: '', description: '', ingredients: '', instructions: '', prep_minutes: '', servings: '' };
  const [values, setValues] = useState(empty);
  const [loading, setLoading] = useState(false); const [initialLoading, setInitialLoading] = useState(!!id);
  const [error, setError] = useState(''); const [attempted, setAttempted] = useState(false); const [canEdit, setCanEdit] = useState(!id);
  const back = () => navigation.navigate(id ? 'RecipeDetail' : 'Recipes', id ? { id, home } : { home });
  useEffect(() => {
    if (!focused) return;
    let active = true;
    setValues(empty); setAttempted(false); setError(''); setCanEdit(!id); setInitialLoading(!!id);
    if (id) getRecipe(id).then(result => {
      if (!active) return;
      if (!result.data.can_edit) { setError('Você pode consultar esta receita, mas apenas o autor pode editar.'); return; }
      const recipe = result.data;
      setValues({ title: recipe.title, description: recipe.description || '', ingredients: recipe.ingredients, instructions: recipe.instructions, prep_minutes: recipe.prep_minutes == null ? '' : String(recipe.prep_minutes), servings: recipe.servings == null ? '' : String(recipe.servings) }); setCanEdit(true);
    }).catch(err => { if (active) setError(formError(err)); }).finally(() => { if (active) setInitialLoading(false); });
    return () => { active = false; };
  }, [id, home?.id, focused]);
  const change = key => text => { setValues(previous => ({ ...previous, [key]: text })); setError(''); };
  const invalidTime = values.prep_minutes !== '' && (Number(values.prep_minutes) < 1 || Number(values.prep_minutes) > 1440);
  const invalidServings = values.servings !== '' && (Number(values.servings) < 1 || Number(values.servings) > 1000);
  const submit = async () => {
    if (loading || !canEdit) return;
    setAttempted(true); setError('');
    if (!values.title.trim() || !values.ingredients.trim() || !values.instructions.trim() || invalidTime || invalidServings) return;
    setLoading(true);
    try {
      const payload = { ...values, prep_minutes: values.prep_minutes === '' ? null : Number(values.prep_minutes), servings: values.servings === '' ? null : Number(values.servings) };
      const result = id ? await updateRecipe(id, payload) : await createRecipe({ ...payload, home_id: home?.id || null });
      if (!result.success) { setError(formError(result)); return; }
      navigation.navigate('RecipeDetail', { id: result.data.id, home });
    } catch (err) { setError(formError(err, 'Não foi possível salvar a receita. Seus campos foram mantidos.')); }
    finally { setLoading(false); }
  };
  return <FormScreen title={id ? 'Editar receita' : 'Nova receita'} subtitle="Guarde os sabores que fazem parte da sua rotina." eyebrow="CADERNO DE RECEITAS" icon="chef-hat" onBack={back}>
    <FormContext icon={home ? 'home-outline' : 'book-open-page-variant-outline'}>{home ? home.name : 'Seu caderno de receitas'}</FormContext>
    <FormFeedback message={error} />
    {initialLoading ? <ListLoading message="Carregando a receita..." /> : canEdit && <>
      <Text style={styles.sectionTitle}>O que vamos preparar?</Text><Text style={styles.sectionDescription}>Os campos marcados como opcionais podem ficar para depois.</Text>
      <FormField label="Nome da receita" icon="chef-hat" placeholder="Ex.: Bolo de cenoura da família" value={values.title} maxLength={255} editable={!loading} onChangeText={change('title')} error={attempted && !values.title.trim() ? 'Dê um nome à receita.' : ''} />
      <FormField label="Descrição" optional placeholder="Uma lembrança, uma dica ou o que torna essa receita especial." value={values.description} maxLength={1000} multiline editable={!loading} onChangeText={change('description')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <FormField label="Tempo de preparo" optional icon="clock-outline" placeholder="Ex.: 40" helper="Em minutos, até 1440." value={values.prep_minutes} editable={!loading} onChangeText={text => change('prep_minutes')(text.replace(/[^0-9]/g, ''))} maxLength={4} keyboardType="number-pad" inputMode="numeric" error={attempted && invalidTime ? 'Use de 1 a 1440 minutos.' : ''} style={{ flexGrow: 1, flexBasis: 190 }} />
        <FormField label="Porções" optional icon="silverware-fork-knife" placeholder="Ex.: 6" helper="Quantas porções rende?" value={values.servings} editable={!loading} onChangeText={text => change('servings')(text.replace(/[^0-9]/g, ''))} maxLength={4} keyboardType="number-pad" inputMode="numeric" error={attempted && invalidServings ? 'Use de 1 a 1000 porções.' : ''} style={{ flexGrow: 1, flexBasis: 190 }} />
      </View>
      <FormField label="Ingredientes" placeholder={'2 cenouras\n3 ovos\n1 xícara de farinha'} helper="Escreva um ingrediente por linha, incluindo a quantidade." value={values.ingredients} maxLength={10000} multiline editable={!loading} onChangeText={change('ingredients')} error={attempted && !values.ingredients.trim() ? 'Informe os ingredientes da receita.' : ''} />
      <FormField label="Modo de preparo" placeholder={'Preaqueça o forno a 180 °C.\nBata os ingredientes e misture a farinha.\nAsse até dourar.'} helper="Separe as etapas por linha. Vamos numerá-las para facilitar a leitura." value={values.instructions} maxLength={10000} multiline editable={!loading} onChangeText={change('instructions')} error={attempted && !values.instructions.trim() ? 'Explique como preparar a receita.' : ''} />
      {!!home && <Text style={[styles.helper, { marginBottom: 20 }]}>As pessoas com acesso a esta casa também poderão consultar esta receita.</Text>}
      <FormActions onCancel={back} onSubmit={submit} loading={loading} label={id ? 'Salvar alterações' : 'Salvar receita'} icon="check" />
    </>}
  </FormScreen>;
}
