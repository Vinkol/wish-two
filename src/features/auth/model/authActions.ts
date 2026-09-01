import { supabase } from '../../../shared/api/supabaseClient';
import type { AppDispatch, RootState } from '../../../shared/store/store';
import { setUser, logoutSuccess } from '../../../entities/user/model/authSlice';
import { notifications } from '@mantine/notifications';

// Хелпер для получения расширенного профиля пользователя и его партнера
const fetchExtendedProfile = async (userId: string) => {
  // 1. Берем данные текущего пользователя
  const { data: profile } = await supabase
    .from('profiles')
    .select('partner_id, full_name, avatar_url')
    .eq('id', userId)
    .single();

  if (!profile) return null;

  let partnerInfo = null;

  // 2. Если partner_id существует — делаем микро-запрос за данными половинки
  if (profile.partner_id) {
    const { data: partner } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', profile.partner_id)
      .single();

    if (partner) {
      partnerInfo = {
        fullName: partner.full_name,
        avatarUrl: partner.avatar_url,
      };
    }
  }

  return {
    partnerId: profile.partner_id,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    partnerInfo,
  };
};

// Инициализация и слушатель сессии
export const initAuthListener = () => async (dispatch: AppDispatch) => {
  // 1. Проверяем текущую сессию при первой загрузке страницы
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await fetchExtendedProfile(session.user.id);
      dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: profile?.fullName || session.user.user_metadata.full_name,
          avatarUrl: profile?.avatarUrl || session.user.user_metadata.avatar_url,
          partnerId: profile?.partnerId || null,
          partnerInfo: profile?.partnerInfo || null,
        })
      );
    } else {
      dispatch(setUser(null));
    }
  } catch (error) {
    console.error('Ошибка проверки начальной сессии:', error);
    dispatch(setUser(null));
  }

  // Слушаем события авторизации в реальном времени
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await fetchExtendedProfile(session.user.id);
      dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          fullName: profile?.fullName || session.user.user_metadata.full_name,
          avatarUrl: profile?.avatarUrl || session.user.user_metadata.avatar_url,
          partnerId: profile?.partnerId || null,
          partnerInfo: profile?.partnerInfo || null,
        })
      );
    } else {
      dispatch(setUser(null));
    }
  });

  // Возвращаем функцию отписки наружу
  return () => {
    subscription.unsubscribe();
  };
};

// Регистрация нового аккаунта
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    notifications.show({
      title: 'Ошибка регистрации ❌',
      message: error.message,
      color: 'red',
    });
    return null;
  }
  return data;
};

// Вход по Email и Паролю
export const loginWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    notifications.show({
      title: 'Ошибка входа 🔒',
      message: error.message,
      color: 'red',
    });
    return null;
  }

  notifications.show({
    title: 'Успешный вход',
    message: 'Добро пожаловать в ваше пространство желаний!',
    color: 'green',
  });
  return data;
};

// Выход из системы
export const logoutUser = () => async (dispatch: AppDispatch) => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    dispatch(logoutSuccess());
  }
};

// Экшен для реактивного обновления профиля в Redux без перезапуска сессии
export const refreshUserProfile =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    const { user } = getState().auth;
    if (!user?.id) return;

    try {
      const profile = await fetchExtendedProfile(user.id);

      dispatch(
        setUser({
          id: user.id,
          email: user.email,
          fullName: profile?.fullName || user.fullName,
          avatarUrl: profile?.avatarUrl || user.avatarUrl,
          partnerId: profile?.partnerId || null,
          partnerInfo: profile?.partnerInfo || null,
        })
      );
    } catch (error) {
      console.error('Не удалось обновить профиль локально:', error);
    }
  };
