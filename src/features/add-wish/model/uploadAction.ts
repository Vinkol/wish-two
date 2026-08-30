import { supabase } from '../../../shared/api/supabaseClient';

export const uploadWishImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Генерируем уникальное имя файла: папка юзера / таймштамп-название
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Отправляем файл в хранилище Supabase
    const { error: uploadError } = await supabase.storage
      .from('wish-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Ошибка загрузки в Storage:', uploadError.message);
      return null;
    }

    // Получаем публичную ссылку на загруженную картинку
    const { data } = supabase.storage.from('wish-images').getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Критическая ошибка Storage:', error);
    return null;
  }
};
