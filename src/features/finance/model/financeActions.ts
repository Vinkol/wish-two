import { supabase } from '../../../shared/api/supabaseClient';

// Универсальное добавление: Доход или Расход
export const addTransactionInDb = async (
  userId: string,
  amount: number,
  category: string,
  description: string,
  type: 'income' | 'expense'
) => {
  const { error } = await supabase.from('expenses').insert([
    {
      user_id: userId,
      amount,
      category,
      description: description || null,
      type,
    },
  ]);

  if (error) {
    console.error('Ошибка добавления транзакции:', error.message);
    return false;
  }
  return true;
};

// Создать новую цель для накоплений
export const createSavingGoalInDb = async (title: string, targetAmount: number) => {
  const { error } = await supabase.from('savings').insert([
    {
      title,
      target_amount: targetAmount,
      current_amount: 0.0,
    },
  ]);

  if (error) {
    console.error('Ошибка создания цели:', error.message);
    return false;
  }
  return true;
};

// Пополнить копилку
export const updateSavingsInDb = async (savingId: string, newAmount: number) => {
  const { error } = await supabase
    .from('savings')
    .update({ current_amount: newAmount })
    .eq('id', savingId);

  if (error) {
    console.error('Ошибка обновления копилки:', error.message);
    return false;
  }
  return true;
};

// Сбросить/Удалить цель
export const deleteSavingGoalInDb = async (goalId: string) => {
  const { error } = await supabase.from('savings').delete().eq('id', goalId);

  if (error) {
    console.error('Ошибка удаления цели:', error.message);
    return false;
  }
  return true;
};
