import React, { useState } from 'react';
import { Card, Image, Text, Badge, Button, Stack, Group, ActionIcon } from '@mantine/core';
import { Calendar, Compass, MapPin, Trash2 } from 'lucide-react';
import styles from './TravelCard.module.scss';
import { deleteTravelInDb } from '../../../features/add-travel/model/travelActions';
import { openConfirmDialog } from '../../../shared/ui/confirm-dialog/confirmDialog';

export interface TravelItem {
  id: string;
  destination: string;
  description: string | null;
  image_url: string | null;
  desired_date: string | null;
  is_visited: boolean;
}

interface TravelCardProps {
  travel: TravelItem;
  onToggleVisited: (id: string, currentStatus: boolean) => void;
  onTravelDeleted: () => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({
  travel,
  onToggleVisited,
  onTravelDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenDeleteModal = () =>
    openConfirmDialog({
      title: 'Удаление путешествия ✈️',
      message: (
        <>
          Вы уверены, что хотите удалить поездку в <b>{travel.destination}</b>? Это действие нельзя
          будет отменить.
        </>
      ),
      confirmLabel: 'Убрать',
      onConfirm: async () => {
        setIsDeleting(true);
        const success = await deleteTravelInDb(travel.id);
        if (success) onTravelDeleted();
        setIsDeleting(false);
      },
    });

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
      <Card.Section className={styles.imageSection}>
        {travel.image_url ? (
          <Image
            src={travel.image_url}
            height={200}
            alt={travel.destination}
            className={styles.image}
          />
        ) : (
          /* Премиальный градиентный плейсхолдер с компасом */
          <div className={styles.placeholderGradient}>
            <Compass size={40} className={styles.placeholderIcon} />
          </div>
        )}

        {/* Стильный стеклянный статус парит поверх фото */}
        <div className={styles.floatingBadges}>
          <Badge className={styles.glassBadge}>
            {travel.is_visited ? 'Посещено ✓' : 'В планах 🚀'}
          </Badge>
        </div>
      </Card.Section>

      <Stack justify="space-between" mt="md" style={{ flexGrow: 1 }}>
        <div>
          <Group justify="space-between" mb="xs" wrap="nowrap" align="flex-start">
            <Group gap={6} wrap="nowrap">
              <MapPin size={18} className={styles.locationIcon} />
              <Text fw={700} size="lg" className={styles.title}>
                {travel.destination}
              </Text>
            </Group>

            {/* СЕНЬОР-ФИКС: Оставили только иконку удаления, убрав дублирующий бейдж */}
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              onClick={handleOpenDeleteModal}
              loading={isDeleting}
              className={styles.deleteIcon}
            >
              <Trash2 size={16} />
            </ActionIcon>
          </Group>

          {travel.desired_date && (
            <Group gap={6} mb="xs" className={styles.dateGroup}>
              <Calendar size={14} />
              <Text size="xs" fw={500}>
                {travel.desired_date}
              </Text>
            </Group>
          )}

          <Text size="sm" className={styles.description} lineClamp={4}>
            {travel.description || 'Пока нет заметок.'}
          </Text>
        </div>

        <Button
          onClick={() => onToggleVisited(travel.id, travel.is_visited)}
          fullWidth
          mt="md"
          className={`${styles.actionButton} ${
            travel.is_visited ? styles.btnReturn : styles.btnVisited
          }`}
        >
          {travel.is_visited ? 'Вернуть в планы' : 'Мы тут были! 🎉'}
        </Button>
      </Stack>
    </Card>
  );
};
