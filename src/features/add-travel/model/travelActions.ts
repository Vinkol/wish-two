import { supabase } from '../../../shared/api/supabaseClient';

// Удалить путешествие
export const deleteTravelInDb = async (travelId: string) => {
  const { error } = await supabase.from('travels').delete().eq('id', travelId);
  if (error) {
    console.error('Ошибка удаления путешествия:', error.message);
    return false;
  }
  return true;
};
