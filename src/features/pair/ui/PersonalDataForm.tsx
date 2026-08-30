import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Paper, Title, TextInput, Button, Group, FileButton, Avatar, Stack } from '@mantine/core';
import { Upload, User, Check } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { optimizeImage } from '../../../shared/utils/imageOptimizer';
import { uploadWishImage } from '../../add-wish/model/uploadAction';
import { updateProfileInDb } from '../model/pairActions';
import { initAuthListener } from '../../auth/model/authActions';
import type { AppDispatch } from '../../../shared/store/store';
import styles from '../../../pages/settings/SettingsPage.module.scss'; // Переиспользуем стили

interface PersonalDataFormProps {
  user: {
    id: string;
    fullName?: string;
    avatarUrl?: string | null;
  };
}

export const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ user }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [fullName, setFullName] = useState(user.fullName || '');
  const [file, setFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setAvatarPreview(URL.createObjectURL(selectedFile));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsSubmitting(true);

    try {
      let finalAvatarUrl: string | null = user.avatarUrl ? user.avatarUrl : null;

      // Если юзер выбрал новый файл — жмем его и заливаем в облако
      if (file) {
        const optimizedFile = await optimizeImage(file);
        finalAvatarUrl = await uploadWishImage(optimizedFile, user.id);
      }

      const success = await updateProfileInDb(user.id, fullName, finalAvatarUrl);

      if (success) {
        notifications.show({
          title: 'Профиль обновлен ✨',
          message: 'Ваши личные данные успешно сохранены.',
          color: 'green',
        });
        await dispatch(initAuthListener());
      } else {
        notifications.show({
          title: 'Ошибка сервера ❌',
          message: 'Не удалось сохранить изменения.',
          color: 'red',
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder className={styles.card}>
      <Title order={3} size="h4" mb="md" className={styles.cardTitle}>
        Личные данные
      </Title>

      <form onSubmit={handleSave}>
        <Stack gap="md">
          <Group gap="xl" wrap="nowrap" align="center">
            <Avatar
              src={avatarPreview}
              size={70}
              radius="xl"
              alt={fullName}
              classNames={{ placeholder: styles.avatarPlaceholder }}
            >
              <User size={30} />
            </Avatar>

            <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
              {(props) => (
                <Button
                  {...props}
                  variant="light"
                  color="indigo"
                  leftSection={<Upload size={16} />}
                  className={styles.uploadAvatarBtn}
                >
                  Изменить аватар
                </Button>
              )}
            </FileButton>
          </Group>

          <TextInput
            label="Ваше имя"
            placeholder="Как вас зовут?"
            required
            value={fullName}
            onChange={(e) => setFullName(e.currentTarget.value)}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />

          <Button
            type="submit"
            leftSection={<Check size={16} />}
            loading={isSubmitting}
            className={styles.connectButton}
            style={{ alignSelf: 'flex-start' }}
          >
            Сохранить изменения
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
