import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createCategory, updateCategory } from '../services/api-categories';
import { FormScreen, FormField, FormFeedback, FormActions, FormContext, styles, colors, formError } from '../components/forms/FormKit';

function HomeCategoryForm({ viewHome }) {
  const route = useRoute();
  const navigation = useNavigation();
  const category = route.params?.category || null;
  const [name, setName] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const back = () => navigation.navigate('HomeItems', { filter: 'all' });

  useEffect(() => {
    setName(category?.name || '');
    setAttempted(false);
    setError('');
  }, [category, viewHome?.id]);

  const submit = async () => {
    if (loading) return;
    setAttempted(true);
    setError('');
    if (!name.trim()) return;
    setLoading(true);
    try {
      const result = category ? await updateCategory(category.id, { name: name.trim() }) : await createCategory({ home_id: viewHome.id, name: name.trim() });
      if (!result?.success) { setError(formError(result)); return; }
      back();
    } catch (err) { setError(formError(err)); }
    finally { setLoading(false); }
  };

  if (!viewHome) return null;
  return <FormScreen title={category ? 'Editar categoria' : 'Nova categoria'} subtitle="Agrupe seus itens por tipo. O ambiente e a gaveta são definidos no local de cada item." eyebrow="ORGANIZAR INVENTÁRIO" icon="view-grid-plus-outline" onBack={back}>
    <FormContext>{viewHome.name}</FormContext>
    <Text style={styles.sectionTitle}>{category ? 'Detalhes da categoria' : 'Crie uma categoria'}</Text>
    <Text style={styles.sectionDescription}>Fica mais fácil encontrar o que você precisa.</Text>
    <FormFeedback message={error} />
    <FormField label="Nome" icon="tag-outline" placeholder="Ex.: Alimentos" value={name} editable={!loading} maxLength={255} error={attempted && !name.trim() ? 'Informe o nome da categoria.' : ''} onChangeText={text => { setName(text); setError(''); }} returnKeyType="done" onSubmitEditing={submit} />
    {!category && <View style={{ marginBottom: 26 }}>
      <Text style={[styles.helper, { marginTop: 0, marginBottom: 10 }]}>PRECISA DE UMA IDEIA?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {['Alimentos', 'Limpeza', 'Ferramentas', 'Utensílios'].map(suggestion => <Pressable key={suggestion} accessibilityRole="button" accessibilityLabel={`Usar sugestão ${suggestion}`} accessibilityState={{ selected: name === suggestion }} disabled={loading} onPress={() => setName(suggestion)} style={{ paddingVertical: 9, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1, borderColor: name === suggestion ? colors.primary : colors.border, backgroundColor: name === suggestion ? '#EAF2F2' : '#F8FAFB' }}><Text style={{ color: colors.primary, fontSize: 13 }}>{suggestion}</Text></Pressable>)}
      </View>
    </View>}
    <FormActions onCancel={back} onSubmit={submit} loading={loading} label={category ? 'Salvar alterações' : 'Criar categoria'} icon={category ? 'check' : 'plus'} />
  </FormScreen>;
}

export default connect(state => ({ viewHome: state.home.viewHome }))(HomeCategoryForm);
