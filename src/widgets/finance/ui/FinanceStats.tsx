import React from 'react';
import { SimpleGrid, Paper, Group, Text } from '@mantine/core';
import { ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import styles from '../../../pages/finance/FinancePage.module.scss';

interface FinanceStatsProps {
  totalIncome: number;
  totalExpenses: number;
}

export const FinanceStats: React.FC<FinanceStatsProps> = ({ totalIncome, totalExpenses }) => {
  const totalBalance = totalIncome - totalExpenses;

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <Paper p="md" radius="md" withBorder className={styles.statCard}>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={700} className={styles.statLabel}>
            ОБЩИЙ ДОХОД
          </Text>
          <ArrowUpRight size={16} className={styles.incomeIcon} />
        </Group>
        <Text size="20px" fw={900} className={styles.incomeText}>
          +{totalIncome.toLocaleString('ru-RU')} ₽
        </Text>
      </Paper>

      <Paper p="md" radius="md" withBorder className={styles.statCard}>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={700} className={styles.statLabel}>
            ОБЩИЙ РАСХОД
          </Text>
          <ArrowDownRight size={16} className={styles.expenseIcon} />
        </Group>
        <Text size="20px" fw={900} className={styles.expenseText}>
          -{totalExpenses.toLocaleString('ru-RU')} ₽
        </Text>
      </Paper>

      <Paper p="md" radius="md" withBorder className={`${styles.statCard} ${styles.balanceCard}`}>
        <Group justify="space-between" mb="xs">
          <Text size="xs" fw={700} className={styles.statLabel}>
            ТЕКУЩИЙ БАЛАНС
          </Text>
          <Scale size={16} className={styles.balanceIcon} />
        </Group>
        <Text
          size="20px"
          fw={900}
          className={totalBalance >= 0 ? styles.incomeText : styles.expenseText}
        >
          {totalBalance.toLocaleString('ru-RU')} ₽
        </Text>
      </Paper>
    </SimpleGrid>
  );
};
