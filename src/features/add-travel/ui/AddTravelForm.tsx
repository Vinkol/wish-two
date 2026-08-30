import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Group,
  FileButton,
  Image,
  Text,
  Paper,
} from '@mantine/core';
import { Upload, FileImage } from 'lucide-react';
import { supabase } from '../../../shared/api/supabaseClient';
import { optimizeImage } from '../../../shared/utils/imageOptimizer';
import { uploadWishImage } from '../../add-wish/model/uploadAction';
import { notifications } from '@mantine/notifications';
import styles from './AddTravelForm.module.scss';

interface AddTravelFormProps {
  opened: boolean;
  onClose: () => void;
  onTravelAdded: () => void;
  userId: string;
}

export const AddTravelForm: React.FC<AddTravelFormProps> = ({
  opened,
  onClose,
  onTravelAdded,
  userId,
}) => {
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null); // Храним выбранный файл места
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Локальное превью
  const [desiredDate, setDesiredDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обработка выбора файла и генерация превью
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl: string | null = null;

      // Если пользователь выбрал фото места — сжимаем и загружаем в облако
      if (file) {
        const optimizedFile = await optimizeImage(file);
        finalImageUrl = await uploadWishImage(optimizedFile, userId);

        if (!finalImageUrl) {
          notifications.show({
            title: 'Ошибка загрузки ❌',
            message: 'Не удалось сохранить изображение места в облако.',
            color: 'red',
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from('travels').insert([
        {
          user_id: userId,
          destination,
          description: description || null,
          image_url: finalImageUrl, // Записываем ссылку на наше надежное облако
          desired_date: desiredDate || null,
        },
      ]);

      if (error) {
        notifications.show({
          title: 'Ошибка добавления ❌',
          message: error.message,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Маршрут построен! ✈️',
          message: `Место "${destination}" успешно добавлено в ваши планы.`,
          color: 'green',
        });

        // Полная очистка стейтов формы
        setDestination('');
        setDescription('');
        setFile(null);
        setImagePreview(null);
        setDesiredDate('');
        onTravelAdded();
        onClose();
      }
    } catch {
      notifications.show({
        title: 'Ошибка ❌',
        message: 'Произошла непредвиденная ошибка при сохранении поездки.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Добавить новое место"
      centered
      size="md"
      classNames={{
        content: styles.modalContent,
        header: styles.modalHeader,
        title: styles.modalTitle,
      }}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextInput
          label="Город / Страна / Место"
          placeholder="Например: Рим, Италия"
          required
          value={destination}
          onChange={(e) => setDestination(e.currentTarget.value)}
          classNames={{ label: styles.inputLabel, input: styles.inputField }}
        />

        <TextInput
          label="Когда планируем?"
          placeholder="Например: Август 2026 или На годовщину"
          value={desiredDate}
          onChange={(e) => setDesiredDate(e.currentTarget.value)}
          classNames={{ label: styles.inputLabel, input: styles.inputField }}
        />

        <Textarea
          label="Заметки / Планы"
          placeholder="Отели, места для посещения, рестораны..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          classNames={{ label: styles.inputLabel, input: styles.inputField }}
        />

        {/* СЕНЬОР-ФИКС: Загрузка фото путешествия с устройства */}
        <Group align="flex-end" gap="md" wrap="nowrap" mt="xs">
          <div style={{ flex: 1 }}>
            <Text className={styles.inputLabel} size="sm" fw={500} mb={4}>
              Фотография места
            </Text>
            <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
              {(props) => (
                <Button
                  {...props}
                  variant="light"
                  color="indigo"
                  fullWidth
                  leftSection={file ? <FileImage size={18} /> : <Upload size={18} />}
                  className={styles.uploadBtn}
                >
                  {file ? 'Изменить фото' : 'Выбрать файл с устройства'}
                </Button>
              )}
            </FileButton>
            {file && (
              <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
                Выбран файл: {file.name}
              </Text>
            )}
          </div>

          {/* Превью выбранного фото */}
          {imagePreview && (
            <Paper withBorder radius="md" p={4} className={styles.previewContainer}>
              <Image src={imagePreview} height={50} width={50} radius="sm" fit="cover" />
            </Paper>
          )}
        </Group>

        <Button
          type="submit"
          fullWidth
          mt="xl"
          loading={isSubmitting}
          className={styles.submitButton}
        >
          Добавить в планы
        </Button>
      </form>
    </Modal>
  );
};
