import React, { useState } from 'react';
import { Card, Image, Text, Badge, Button, Group, Stack, ActionIcon } from '@mantine/core';
import { ExternalLink, EyeOff, CheckCircle, Trash2, Gift } from 'lucide-react';
import {
  bookWishInDb,
  unbookWishInDb,
  deleteWishInDb,
} from '../../../features/book-wish/model/bookWishActions';
import styles from './WishCard.module.scss';
import { openConfirmDialog } from '../../../shared/ui/confirm-dialog/confirmDialog';

export interface WishItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  link: string | null;
  image_url: string | null;
  price: number | null;
  priority: number;
  is_secret: boolean;
  is_booked: boolean;
  booked_by: string | null;
}

interface WishCardProps {
  wish: WishItem;
  currentUserId: string;
  onStatusChanged: () => void;
}

export const WishCard: React.FC<WishCardProps> = ({ wish, currentUserId, onStatusChanged }) => {
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwnWish = wish.user_id === currentUserId;
  const isBookedByMe = wish.booked_by === currentUserId;

  const handleBookingToggle = async () => {
    setLoading(true);
    if (isBookedByMe) {
      const success = await unbookWishInDb(wish.id);
      if (success) onStatusChanged();
    } else {
      const success = await bookWishInDb(wish.id, currentUserId);
      if (success) onStatusChanged();
    }
    setLoading(false);
  };

  const handleDeleteWish = () => {
    openConfirmDialog({
      title: 'Удаление желания 🗑️',
      message: (
        <>
          Вы уверены, что хотите удалить желание <b>{wish.title}</b> из вашего списка? Это действие
          нельзя будет отменить.
        </>
      ),
      confirmLabel: 'Убрать',
      onConfirm: async () => {
        setIsDeleting(true);
        const success = await deleteWishInDb(wish.id);
        if (success) onStatusChanged();
        setIsDeleting(false);
      },
    });
  };

  const getPriorityBadge = (prio: number) => {
    switch (prio) {
      case 3:
        return (
          <Badge color="red" variant="filled" className={styles.glassBadge}>
            Высокий 🔥
          </Badge>
        );
      case 1:
        return (
          <Badge color="gray" variant="filled" className={styles.glassBadge}>
            Низкий 🧸
          </Badge>
        );
      default:
        return (
          <Badge color="indigo" variant="filled" className={styles.glassBadge}>
            Средний ⭐
          </Badge>
        );
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
      <Card.Section className={styles.imageSection}>
        {wish.image_url ? (
          <Image src={wish.image_url} height={200} alt={wish.title} className={styles.image} />
        ) : (
          /* Премиальный градиентный плейсхолдер с иконкой подарка */
          <div className={styles.placeholderGradient}>
            <Gift size={40} className={styles.placeholderIcon} />
          </div>
        )}

        {/* Парящие стеклянные бейджи поверх картинки */}
        <div className={styles.floatingBadges}>
          {wish.is_secret && (
            <Badge
              color="violet"
              variant="filled"
              className={styles.glassBadge}
              leftSection={<EyeOff size={12} />}
            >
              Секрет
            </Badge>
          )}
          {getPriorityBadge(wish.priority)}
        </div>
      </Card.Section>

      <Stack justify="space-between" mt="md" style={{ flexGrow: 1 }}>
        <div>
          <Group justify="space-between" mb="xs" align="flex-start" wrap="nowrap">
            <Text fw={700} className={styles.title}>
              {wish.title}
            </Text>

            {/* СЕНЬОР-ФИКС: Оставили только ActionIcon удаления, убрав громоздкие дубликаты бейджей */}
            {isOwnWish && (
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={handleDeleteWish}
                loading={isDeleting}
                className={styles.deleteIcon}
              >
                <Trash2 size={16} />
              </ActionIcon>
            )}
          </Group>

          {wish.price && (
            <Text fw={800} size="xl" className={styles.price} mb="xs">
              {wish.price.toLocaleString('ru-RU')} ₽
            </Text>
          )}

          <Text size="sm" className={styles.description} lineClamp={3}>
            {wish.description || 'Нет описания'}
          </Text>
        </div>

        <Group mt="md" gap="xs">
          {wish.link && (
            <Button
              component="a"
              href={wish.link}
              target="_blank"
              variant="light"
              color="gray"
              flex={1}
              leftSection={<ExternalLink size={15} />}
              className={styles.storeButton}
            >
              Магазин
            </Button>
          )}

          {!isOwnWish && (
            <Button
              flex={2}
              loading={loading}
              onClick={handleBookingToggle}
              disabled={wish.is_booked && !isBookedByMe}
              leftSection={isBookedByMe ? <CheckCircle size={15} /> : null}
              className={`${styles.actionButton} ${
                isBookedByMe
                  ? styles.bookedByMe
                  : wish.is_booked
                    ? styles.alreadyBooked
                    : styles.giftButton
              }`}
            >
              {isBookedByMe
                ? 'Вы забронировали'
                : wish.is_booked
                  ? 'Уже забронировано'
                  : 'Подарить'}
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
};
