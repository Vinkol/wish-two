import React, { useState } from 'react';
import {
  Paper,
  Title,
  Text,
  NumberInput,
  Button,
  Progress,
  Group,
  Stack,
  ActionIcon,
  Center,
} from '@mantine/core';
import { Landmark, Trash2, Coins, Plus } from 'lucide-react';
import {
  updateSavingsInDb,
  deleteSavingGoalInDb,
} from '../../../features/finance/model/financeActions';
import { AddGoalModal } from '../../../features/finance/ui/AddGoalModal';
import styles from './SavingsCard.module.scss';
import { openConfirmDialog } from '../../../shared/ui/confirm-dialog/confirmDialog';

interface SavingGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

interface SavingsCardProps {
  goals: SavingGoal[];
  onRefresh: () => void;
}

export const SavingsCard: React.FC<SavingsCardProps> = ({ goals, onRefresh }) => {
  const [modalOpened, setModalOpened] = useState(false);

  const [depositAmounts, setDepositAmounts] = useState<Record<string, string | number>>({});
  const [submittingGoalId, setSubmittingGoalId] = useState<string | null>(null);

  const handleDeposit = async (goalId: string, currentAmount: number) => {
    const amount = depositAmounts[goalId];
    if (!amount) return;
    setSubmittingGoalId(goalId);

    const newAmount = currentAmount + Number(amount);
    const success = await updateSavingsInDb(goalId, newAmount);
    if (success) {
      setDepositAmounts((prev) => ({ ...prev, [goalId]: '' }));
      onRefresh();
    }
    setSubmittingGoalId(null);
  };

  const handleDeleteClick = (goal: SavingGoal) => {
    openConfirmDialog({
      title: 'Удаление копилки 🎯',
      message: (
        <>
          Вы уверены, что хотите удалить цель накоплений <b>{goal.title}</b>? Все зафиксированные
          сбережения по этой цели будут стёрты.
        </>
      ),
      confirmLabel: 'Убрать',
      onConfirm: async () => {
        const success = await deleteSavingGoalInDb(goal.id);
        if (success) onRefresh();
      },
    });
  };

  return (
    <Paper p="xl" radius="md" withBorder className={styles.card}>
      <Group justify="space-between" mb="xl" className={styles.headerGroup}>
        <Group gap="xs">
          <Landmark size={22} className={styles.landmarkIcon} />
          <Title order={3} size="h4" className={styles.title}>
            Копилки на мечты
          </Title>
        </Group>
        <Button
          size="xs"
          variant="light"
          leftSection={<Plus size={14} />}
          onClick={() => setModalOpened(true)}
          className={styles.createButton}
        >
          Создать цель
        </Button>
      </Group>

      {goals.length === 0 ? (
        <Center className={styles.emptyCenter}>
          <Text size="sm" className={styles.emptyText}>
            У вас пока нет active целей накопления
          </Text>
        </Center>
      ) : (
        <Stack gap="xl">
          {goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            return (
              <Stack key={goal.id} gap="xs" className={styles.goalRow}>
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div>
                    <Text fw={700} size="md" className={styles.goalTitle}>
                      {goal.title}
                    </Text>
                    <Text size="xs" className={styles.goalSub}>
                      Накоплено: {goal.current_amount.toLocaleString('ru-RU')} ₽ из{' '}
                      {goal.target_amount.toLocaleString('ru-RU')} ₽
                    </Text>
                  </div>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={() => handleDeleteClick(goal)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </ActionIcon>
                </Group>

                <Progress
                  value={progress}
                  size="md"
                  radius="xl"
                  striped
                  animated={progress < 100}
                  className={styles.progressBar}
                />

                <Group gap="xs" align="flex-end" mt="xs" wrap="nowrap">
                  <NumberInput
                    placeholder="Сумма пополнения"
                    min={1}
                    size="xs"
                    value={depositAmounts[goal.id] || ''}
                    onChange={(val) => setDepositAmounts((prev) => ({ ...prev, [goal.id]: val }))}
                    className={styles.inputFieldContainer}
                    classNames={{ input: styles.inputField }}
                  />
                  <Button
                    size="xs"
                    leftSection={<Coins size={14} />}
                    loading={submittingGoalId === goal.id}
                    onClick={() => handleDeposit(goal.id, goal.current_amount)}
                    className={styles.depositButton}
                  >
                    Пополнить
                  </Button>
                </Group>
              </Stack>
            );
          })}
        </Stack>
      )}

      <AddGoalModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onGoalAdded={onRefresh}
      />
    </Paper>
  );
};
