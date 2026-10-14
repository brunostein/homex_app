import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { createHome, updateHome } from '../services/api-homes';
import { FormScreen, FormField, FormFeedback, FormActions, styles, formError } from '../components/forms/FormKit';

function HomeForm({ userLogged, viewHome }) {
  const navigation = useNavigation();
  const descriptionRef = useRef(null);
  const [name, setName] = useState('');
  const [descr, setDescr] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const editing = !!viewHome;
  const back = () => navigation.navigate('Home');

  useEffect(() => {
    setName(viewHome?.name || '');
    setDescr(viewHome?.descr || '');
    setAttempted(false);
    setError('');
  }, [viewHome]);

  const submit = async () => {
    if (loading) return;
    setAttempted(true);
    setError('');
    if (!name.trim()) return;
    setLoading(true);
    try {
      const data = { name: name.trim(), descr: descr.trim() };
      const result = editing ? await updateHome(viewHome.id, data) : await createHome({ ...data, user_id: userLogged.id });
      if (!result?.success) { setError(formError(result)); return; }
      back();
    } catch (err) { setError(formError(err)); }
    finally { setLoading(false); }
  };

  return <FormScreen title={editing ? 'Editar casa' : 'Adicionar casa'} subtitle={editing ? 'Ajuste os detalhes para deixar tudo do seu jeito.' : 'Dê um nome ao espaço que você quer organizar.'} eyebrow="MINHAS CASAS" icon="home-plus-outline" onBack={back}>
    <Text style={styles.sectionTitle}>Sobre o seu espaço</Text>
    <Text style={styles.sectionDescription}>Pode ser sua casa, apartamento ou aquele cantinho especial.</Text>
    <FormFeedback message={error} />
    <FormField label="Nome" icon="home-outline" placeholder="Ex.: Meu apartamento" value={name} editable={!loading} maxLength={255} error={attempted && !name.trim() ? 'Dê um nome para sua casa.' : ''} helper="Escolha um nome fácil de reconhecer." returnKeyType="next" onSubmitEditing={() => descriptionRef.current?.focus()} onChangeText={text => { setName(text); setError(''); }} />
    <FormField ref={descriptionRef} label="Descrição" optional placeholder="O que torna esse espaço especial?" value={descr} editable={!loading} maxLength={255} multiline helper="Uma breve descrição para identificar melhor sua casa." onChangeText={setDescr} />
    <FormActions onCancel={back} onSubmit={submit} loading={loading} label={editing ? 'Salvar alterações' : 'Criar casa'} icon={editing ? 'check' : 'plus'} />
  </FormScreen>;
}

export default connect(state => ({ userLogged: state.user.user, viewHome: state.home.viewHome }))(HomeForm);
