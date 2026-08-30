import { supabase } from '../../../shared/api/supabaseClient';

// Функция бронирования подарка
export const bookWishInDb = async (wishId: string, userId: string) => {
  const { error } = await supabase
    .from('wishes')
    .update({
      is_booked: true,
      booked_by: userId,
    })
    .eq('id', wishId);

  if (error) {
    console.error('Ошибка бронирования:', error.message);
    return false;
  }
  return true;
};

// Функция отмены бронирования
export const unbookWishInDb = async (wishId: string) => {
  const { error } = await supabase
    .from('wishes')
    .update({
      is_booked: false,
      booked_by: null,
    })
    .eq('id', wishId);

  if (error) {
    console.error('Ошибка отмены бронирования:', error.message);
    return false;
  }
  return true;
};

// удаление желания
export const deleteWishInDb = async (wishId: string) => {
  const { error } = await supabase.from('wishes').delete().eq('id', wishId);
  if (error) {
    console.error('Ошибка удаления желания:', error.message);
    return false;
  }
  return true;
};
