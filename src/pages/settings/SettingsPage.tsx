import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Title, Text, Paper, TextInput, Button, Stack, Group, Alert, Avatar } from '@mantine/core';
import { Heart, UserCheck, UserX, Link2 } from 'lucide-react';
import type { AppDispatch, RootState } from '../../shared/store/store';
import { linkPartnerByEmail, unlinkPartner } from '../../features/pair/model/pairActions';
import { initAuthListener } from '../../features/auth/model/authActions';
import { PersonalDataForm } from '../../features/pair/ui/PersonalDataForm'; // Импорт виджета
import { openConfirmDialog } from '../../shared/ui/confirm-dialog/confirmDialog';
import styles from './SettingsPage.module.scss';

export const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerEmail) return;
    setLoading(true);

    const success = await linkPartnerByEmail(user.id, partnerEmail);
    if (success) {
      setPartnerEmail('');
      await dispatch(initAuthListener());
      window.location.reload();
    }
    setLoading(false);
  };

  const handleDisconnectClick = () => {
    if (!user.partnerId) return;
    openConfirmDialog({
      title: 'Разрыв связи аккаунтов 💔',
      message:
        'Вы уверены, что хотите разорвать связь профилей? Ваши общие списки желаний, поездки и кошелек больше не будут синхронизированы.',
      confirmLabel: 'Разорвать',
      onConfirm: async () => {
        setLoading(true);
        const success = await unlinkPartner(user.id, user.partnerId!);
        if (success) {
          await dispatch(initAuthListener());
          window.location.reload();
        }
        setLoading(false);
      },
    });
  };

  return (
    <Stack gap="xl" className={styles.wrapper}>
      <div>
        <Title order={2} className={styles.title}>
          Настройки профиля
        </Title>
        <Text size="sm" className={styles.subtitle}>
          Управляйте своим аккаунтом и совместным доступом.
        </Text>
      </div>

      {/* НОВАЯ КАРТОЧКА: Редактирование личных данных */}
      <PersonalDataForm user={user} />

      <Paper p="xl" radius="md" withBorder className={styles.card}>
        <Title order={3} size="h4" mb="md" className={styles.cardTitle}>
          Статус отношений
        </Title>

        {user.partnerId ? (
          <Stack gap="md">
            {/* Визуальный блок "Вы в паре" */}
            <Paper withBorder p="sm" radius="md" className={styles.partnerPairBlock}>
              <Group justify="center" gap="lg">
                <Avatar src={user.avatarUrl} size="md" radius="xl" />
                <Heart size={20} color="var(--primary-color)" fill="var(--primary-color)" />
                <Avatar src={user.partnerInfo?.avatarUrl || null} size="md" radius="xl" />
              </Group>
              <Text size="xs" c="dimmed" ta="center" mt="sm">
                Вы связаны с <b>{user.partnerInfo?.fullName || 'Половинка'}</b>
              </Text>
            </Paper>

            <Button
              variant="outline"
              leftSection={<UserX size={16} />}
              onClick={handleDisconnectClick}
              loading={loading}
              className={styles.disconnectButton}
            >
              Разорвать связь аккаунтов
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <Alert
              icon={<Link2 size={16} />}
              title="Вы один в пространстве"
              radius="md"
              classNames={{
                root: styles.alertSingle,
                title: styles.alertTitle,
              }}
            >
              <span className={styles.alertTextContent}>
                Чтобы начать делиться желаниями и вести совместный счет, подключите аккаунт вашей
                половинки.
              </span>
            </Alert>

            <form onSubmit={handleConnect}>
              <Group align="flex-end" gap="xs">
                <TextInput
                  label="Email вашей половинки"
                  placeholder="partner@example.com"
                  required
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.currentTarget.value)}
                  className={styles.inputContainer}
                  classNames={{ label: styles.inputLabel, input: styles.inputField }}
                />
                <Button
                  type="submit"
                  leftSection={<UserCheck size={16} />}
                  loading={loading}
                  className={styles.connectButton}
                >
                  Связать
                </Button>
              </Group>
            </form>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};
