import { supabase } from '../../../shared/api/supabaseClient';
import { notifications } from '@mantine/notifications';

// Функция для отправки запроса/связывания по Email
export const linkPartnerByEmail = async (currentUserId: string, partnerEmail: string) => {
  // 1. Ищем профиль партнера по email
  const { data: partnerProfile, error: findError } = await supabase
    .from('profiles')
    .select('id, partner_id')
    .eq('email', partnerEmail.trim().toLowerCase())
    .maybeSingle();

  if (findError) {
    console.error('Ошибка поиска партнера:', findError.message);
    notifications.show({
      title: 'Ошибка базы данных',
      message: 'Не удалось выполнить поиск пользователя.',
      color: 'red',
    });
    return false;
  }

  // Проверяем, существует ли пользователь в таблице profiles вообще
  if (!partnerProfile) {
    notifications.show({
      title: 'Пользователь не найден',
      message: 'Убедитесь, что ваша половинка уже зарегистрировалась и ввела правильный Email.',
      color: 'orange',
    });
    return false;
  }

  // Проверяем, свободен ли партнер
  if (partnerProfile.partner_id) {
    notifications.show({
      title: 'Доступ ограничен',
      message: 'Этот пользователь уже состоит в паре с кем-то другим!',
      color: 'orange',
    });
    return false;
  }

  // Защита от связи с самим собой
  if (partnerProfile.id === currentUserId) {
    notifications.show({
      title: 'Внимание',
      message: 'Нельзя связать аккаунт с самим собой! Введите Email вашей половинки.',
      color: 'orange',
    });
    return false;
  }

  // 2. Делаем взаимное связывание (двунаправленная связь в БД)
  const { error: updateCurrentError } = await supabase
    .from('profiles')
    .update({ partner_id: partnerProfile.id })
    .eq('id', currentUserId);

  const { error: updatePartnerError } = await supabase
    .from('profiles')
    .update({ partner_id: currentUserId })
    .eq('id', partnerProfile.id);

  if (updateCurrentError || updatePartnerError) {
    console.error('Ошибка при связывании аккаунтов:', updateCurrentError || updatePartnerError);
    notifications.show({
      title: 'Ошибка связывания',
      message: 'Произошла непредвиденная ошибка на сервере при обновлении профилей.',
      color: 'red',
    });
    return false;
  }

  // Успешный финал
  notifications.show({
    title: 'Успешно связано!',
    message: 'Ваши пространства объединены. Добро пожаловать в совместный режим!',
    color: 'green',
  });

  return true;
};

// Функция разрыва связи
export const unlinkPartner = async (currentUserId: string, partnerId: string) => {
  const { error: errorCurrent } = await supabase
    .from('profiles')
    .update({ partner_id: null })
    .eq('id', currentUserId);
  const { error: errorPartner } = await supabase
    .from('profiles')
    .update({ partner_id: null })
    .eq('id', partnerId);

  if (errorCurrent || errorPartner) {
    console.error('Ошибка при разрыве связи:', errorCurrent || errorPartner);
    notifications.show({
      title: 'Ошибка сервера',
      message: 'Не удалось корректно разорвать связь аккаунтов.',
      color: 'red',
    });
    return false;
  }

  notifications.show({
    title: 'Связь разорвана',
    message: 'Ваши аккаунты больше не объединены.',
    color: 'gray',
  });

  return true;
};

// Обновление имени и аватарки
export const updateProfileInDb = async (
  userId: string,
  fullName: string,
  avatarUrl: string | null
) => {
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
    })
    .eq('id', userId);

  if (error) {
    console.error('Ошибка обновления профиля:', error.message);
    return false;
  }
  return true;
};
