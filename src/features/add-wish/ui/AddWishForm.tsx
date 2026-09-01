import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Switch,
  Button,
  Group,
  FileButton,
  Image,
  Text,
  Paper,
} from '@mantine/core';
import { Upload, FileImage } from 'lucide-react';
import { supabase } from '../../../shared/api/supabaseClient';
import { uploadWishImage } from '../model/uploadAction';
import { notifications } from '@mantine/notifications';
import styles from './AddWishForm.module.scss';
import { optimizeImage } from '../../../shared/utils/imageOptimizer';
import { Wand2 } from 'lucide-react';

interface AddWishFormProps {
  opened: boolean;
  onClose: () => void;
  onWishAdded: () => void;
  userId: string;
}

export const AddWishForm: React.FC<AddWishFormProps> = ({
  opened,
  onClose,
  onWishAdded,
  userId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [price, setPrice] = useState<string | number>('');
  const [priority, setPriority] = useState<string | null>('2');
  const [isSecret, setIsSecret] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обработка выбора файла и генерация локального превью
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

      if (file) {
        const optimizedFile = await optimizeImage(file);

        finalImageUrl = await uploadWishImage(optimizedFile, userId);

        if (!finalImageUrl) {
          notifications.show({
            title: 'Ошибка загрузки',
            message: 'Не удалось сохранить изображение.',
            color: 'red',
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from('wishes').insert([
        {
          user_id: userId,
          title,
          description: description || null,
          link: link || null,
          image_url: finalImageUrl,
          price: price ? Number(price) : null,
          priority: Number(priority),
          is_secret: isSecret,
        },
      ]);

      if (error) {
        notifications.show({
          title: 'Ошибка добавления',
          message: error.message,
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Успешно добавлено!',
          message: `Желание "${title}" появилось в вашем списке.`,
          color: 'green',
        });

        // Полная очистка стейтов формы
        setTitle('');
        setDescription('');
        setLink('');
        setFile(null);
        setImagePreview(null);
        setPrice('');
        setPriority('2');
        setIsSecret(false);
        onWishAdded();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Добавить новое желание"
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
          label="Название"
          placeholder="Что подарить"
          required
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          classNames={{ label: styles.inputLabel, input: styles.inputField }}
        />

        <Textarea
          label="Описание / Комментарий"
          placeholder="Размер, цвет или где лучше купить..."
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          classNames={{ label: styles.inputLabel, input: styles.inputField }}
        />

        <Group align="flex-end" gap="xs">
          <TextInput
            label="Ссылка на магазин"
            placeholder="Вставьте ссылку на Wildberries, Ozon и др..."
            type="url"
            value={link}
            onChange={(e) => setLink(e.currentTarget.value)}
            style={{ flex: 1 }}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />
          <Button
            variant="light"
            color="indigo"
            onClick={async () => {
              if (!link) {
                notifications.show({
                  title: 'Внимание',
                  message: 'Сначала вставьте ссылку!',
                  color: 'orange',
                });
                return;
              }

              notifications.show({
                id: 'parsing',
                title: 'Магия парсинга',
                message: 'Обходим защиту маркетплейса и читаем данные...',
                loading: true,
                autoClose: false,
              });

              try {
                const res = await fetch(
                  `https://microlink.io/{encodeURIComponent(link)}&prerender=true&device=iPhone+13`
                );
                const json = await res.json();

                if (json.status === 'success' && json.data) {
                  const metadata = json.data;
                  if (metadata.title) setTitle(metadata.title);
                  if (metadata.description) {
                    setDescription(metadata.description.slice(0, 200) + '...');
                  }
                  if (metadata.price) {
                    setPrice(Math.round(metadata.price));
                  }
                  if (metadata.image?.url) {
                    setImagePreview(metadata.image.url);
                    const imgRes = await fetch(metadata.image.url);
                    const blob = await imgRes.blob();
                    const parsedFile = new File([blob], 'product.jpg', { type: 'image/jpeg' });
                    setFile(parsedFile);
                  }

                  notifications.update({
                    id: 'parsing',
                    title: 'Успешно спарсено',
                    message: 'Данные товара добавлены в форму.',
                    color: 'green',
                    autoClose: 3000,
                  });
                } else {
                  throw new Error();
                }
              } catch {
                notifications.update({
                  id: 'parsing',
                  title: 'Парсинг ограничен',
                  message:
                    'Маркетплейс скрыл данные. Пожалуйста, укажите цену и фото самостоятельно.',
                  color: 'orange',
                  autoClose: 4000,
                });
              }
            }}
            style={{ height: '42px' }}
          >
            <Wand2 size={18} />
          </Button>
        </Group>

        {/* Загрузка фото с устройства */}
        <Group align="flex-end" gap="md" wrap="nowrap" mt="xs" className={styles.uploadGroup}>
          <div style={{ flex: 1 }}>
            <Text className={styles.inputLabel} size="sm" fw={500} mb={4}>
              Изображение товара
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
                  {file ? 'Изменить фото' : 'Выбрать файл'}
                </Button>
              )}
            </FileButton>
          </div>

          {/* Отображение аккуратного мини-превью выбранной картинки */}
          {imagePreview && (
            <Paper withBorder radius="md" p={4} className={styles.previewContainer}>
              <Image src={imagePreview} height={50} width={50} radius="sm" fit="cover" />
            </Paper>
          )}
        </Group>

        <Group grow mt="xs">
          <NumberInput
            label="Цена"
            placeholder="В валюте"
            value={price}
            onChange={setPrice}
            min={0}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />

          <Select
            label="Приоритет"
            data={[
              { value: '1', label: 'Низкий' },
              { value: '2', label: 'Средний' },
              { value: '3', label: 'Высокий' },
            ]}
            value={priority}
            onChange={setPriority}
            classNames={{
              label: styles.inputLabel,
              input: styles.inputField,
              dropdown: styles.selectDropdown,
              option: styles.selectOption,
            }}
          />
        </Group>

        <Switch
          label="Сделать сюрпризом"
          description="Твоя половинка не увидит это желание в списке, пока ты сам его не подаришь!"
          checked={isSecret}
          onChange={(e) => setIsSecret(e.currentTarget.checked)}
          mt="md"
          classNames={{
            root: styles.switchRoot,
            label: styles.switchLabel,
            description: styles.switchDescription,
            track: styles.switchTrack,
          }}
        />

        <Button
          type="submit"
          fullWidth
          mt="xl"
          loading={isSubmitting}
          className={styles.submitButton}
        >
          Добавить в список
        </Button>
      </form>
    </Modal>
  );
};
