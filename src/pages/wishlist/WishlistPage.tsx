import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Title, Button, SimpleGrid, Group, Loader, Center, Text, Tabs } from '@mantine/core';
import { Plus, Heart, User } from 'lucide-react';
import type { RootState } from '../../shared/store/store';
import { supabase } from '../../shared/api/supabaseClient';
import { AddWishForm } from '../../features/add-wish/ui/AddWishForm';
import { WishCard, type WishItem } from '../../entities/wish/ui/WishCard';
import styles from './WishlistPage.module.scss';

export const WishlistPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  // Изначально true для корректной синхронизации по правилам React 19
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('own');

  const fetchWishes = useCallback(
    async (isMounted: boolean, currentUserId: string, partnerId: string | null) => {
      try {
        // Формируем безопасный запрос: вытягиваем только записи нашей пары
        let query = supabase.from('wishes').select('*');

        if (partnerId) {
          query = query.or(`user_id.eq.${currentUserId},user_id.eq.${partnerId}`);
        } else {
          query = query.eq('user_id', currentUserId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Ошибка загрузки вишлиста:', error.message);
        } else if (isMounted) {
          setWishes(data as WishItem[]);
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
      fetchWishes(true, user.id, user.partnerId || null);
    }
  };

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const startLoading = async () => {
      await fetchWishes(isMounted, user.id, user.partnerId || null);
    };

    startLoading();

    return () => {
      isMounted = false;
    };
  }, [user, fetchWishes]);

  if (!user) return null;

  const displayedWishes = wishes.filter((wish) => {
    if (activeTab === 'own') {
      return wish.user_id === user.id;
    } else {
      return wish.user_id !== user.id && wish.is_secret === false;
    }
  });

  return (
    <div className={styles.container}>
      <Group justify="space-between" mb="xl" className={styles.headerGroup}>
        <div>
          <Title order={2} className={styles.title}>
            Списки желаний
          </Title>
          <Text size="sm" className={styles.subtitle}>
            Радуйте друг друга подарками и исполняйте мечты.
          </Text>
        </div>
        {activeTab === 'own' && (
          <Button
            leftSection={<Plus size={18} />}
            onClick={() => setModalOpened(true)}
            className={styles.addButton}
          >
            Добавить желание
          </Button>
        )}
      </Group>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        color="indigo"
        mb="xl"
        classNames={{ tab: styles.tabItem, list: styles.tabList }}
      >
        <Tabs.List>
          <Tabs.Tab value="own" leftSection={<User size={16} />}>
            Мои желания
          </Tabs.Tab>
          <Tabs.Tab value="partner" leftSection={<Heart size={16} />}>
            Желания второй половинки
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {loading ? (
        <Center style={{ height: '40vh' }}>
          <Loader color="var(--primary-color)" size="lg" />
        </Center>
      ) : displayedWishes.length === 0 ? (
        <Center
          style={{ height: '30vh', flexDirection: 'column', gap: 'sm' }}
          className={styles.emptyCenter}
        >
          <Text size="lg" className={styles.emptyText}>
            В этом списке пока пусто...
          </Text>
          <Text size="sm" className={styles.emptySubtext}>
            {activeTab === 'own'
              ? 'Самое время зафиксировать свои мечты!'
              : 'Ваша половинка еще не добавила желаний.'}
          </Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {displayedWishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              currentUserId={user.id}
              onStatusChanged={handleRefresh}
            />
          ))}
        </SimpleGrid>
      )}

      <AddWishForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onWishAdded={handleRefresh}
        userId={user.id}
      />
    </div>
  );
};
