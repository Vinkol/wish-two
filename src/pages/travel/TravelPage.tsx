import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Title, Button, SimpleGrid, Group, Loader, Center, Text } from '@mantine/core';
import { Plus } from 'lucide-react';
import type { RootState } from '../../shared/store/store';
import { supabase } from '../../shared/api/supabaseClient';
import { AddTravelForm } from '../../features/add-travel/ui/AddTravelForm';
import { TravelCard, type TravelItem } from '../../entities/travel/ui/TravelCard';
import styles from './TravelPage.module.scss';

export const TravelPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [travels, setTravels] = useState<TravelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);

  const fetchTravels = useCallback(
    async (isMounted: boolean, currentUserId: string, partnerId: string | null) => {
      try {
        // Изолируем запрос контента по паре пользователей
        let query = supabase.from('travels').select('*');

        if (partnerId) {
          query = query.or(`user_id.eq.${currentUserId},user_id.eq.${partnerId}`);
        } else {
          query = query.eq('user_id', currentUserId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Ошибка загрузки поездок:', error.message);
        } else if (isMounted) {
          setTravels(data as TravelItem[]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    },
    []
  );

  const handleRefresh = () => {
    setLoading(true);
    if (user) {
      fetchTravels(true, user.id, user.partnerId || null);
    }
  };

  const handleToggleVisited = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('travels')
      .update({ is_visited: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Ошибка обновления статуса:', error.message);
    } else {
      setTravels((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_visited: !currentStatus } : t))
      );
    }
  };

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const startLoading = async () => {
      await fetchTravels(isMounted, user.id, user.partnerId || null);
    };

    startLoading();

    return () => {
      isMounted = false;
    };
  }, [user, fetchTravels]);

  return (
    <div className={styles.container}>
      <Group justify="space-between" mb="xl" className={styles.headerGroup}>
        <div>
          <Title order={2} className={styles.title}>
            Нашие совместные путешествия
          </Title>
          <Text size="sm" className={styles.subtitle}>
            Города и страны, которые мы мечтаем посетить вместе.
          </Text>
        </div>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => setModalOpened(true)}
          className={styles.addButton}
        >
          Добавить место
        </Button>
      </Group>

      {loading ? (
        <Center style={{ height: '50vh' }}>
          <Loader color="var(--accent-color)" size="lg" />
        </Center>
      ) : travels.length === 0 ? (
        <Center
          style={{ height: '40vh', flexDirection: 'column', gap: 'md' }}
          className={styles.emptyCenter}
        >
          <Text size="lg" className={styles.emptyText}>
            Маршруты еще не построены...
          </Text>
          <Text size="sm" className={styles.emptySubtext}>
            Куда бы вы хотели поехать в следующий раз?
          </Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {travels.map((travel) => (
            <TravelCard
              key={travel.id}
              travel={travel}
              onToggleVisited={handleToggleVisited}
              onTravelDeleted={handleRefresh}
            />
          ))}
        </SimpleGrid>
      )}

      {user && (
        <AddTravelForm
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          onTravelAdded={handleRefresh}
          userId={user.id}
        />
      )}
    </div>
  );
};
