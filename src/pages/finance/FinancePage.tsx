import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Title, Text, SimpleGrid, Paper, Group, Stack, Loader, Center } from '@mantine/core';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { RootState } from '../../shared/store/store';
import { supabase } from '../../shared/api/supabaseClient';
import { SavingsCard } from '../../widgets/finance/ui/SavingsCard';
import { FinanceStats } from '../../widgets/finance/ui/FinanceStats';
import { TransactionForm } from '../../widgets/finance/ui/TransactionForm';
import styles from './FinancePage.module.scss';

interface TransactionItem {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  type: 'income' | 'expense';
  created_at: string;
}

interface SavingGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
}

export const FinancePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [savings, setSavings] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(
    async (isMounted: boolean, currentUserId: string, partnerId: string | null) => {
      try {
        let expensesQuery = supabase.from('expenses').select('*');
        const savingsQuery = supabase.from('savings').select('*');

        if (partnerId) {
          expensesQuery = expensesQuery.or(`user_id.eq.${currentUserId},user_id.eq.${partnerId}`);
        } else {
          expensesQuery = expensesQuery.eq('user_id', currentUserId);
        }

        const [transRes, savingsRes] = await Promise.all([
          expensesQuery.order('created_at', { ascending: false }),
          savingsQuery.order('created_at', { ascending: false }),
        ]);

        if (isMounted) {
          if (transRes.data) setTransactions(transRes.data as TransactionItem[]);
          if (savingsRes.data) setSavings(savingsRes.data as SavingGoal[]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    },
    []
  );

  const handleRefresh = () => {
    setLoading(true);
    if (user) {
      fetchData(true, user.id, user.partnerId || null);
    }
  };

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const startLoading = async () => {
      await fetchData(isMounted, user.id, user.partnerId || null);
    };
    startLoading();

    return () => {
      isMounted = false;
    };
  }, [user, fetchData]);

  if (loading) {
    return (
      <Center style={{ height: '50vh' }}>
        <Loader color="var(--primary-color)" size="lg" />
      </Center>
    );
  }

  if (!user) return null;

  // Расчет агрегаций для пропсов
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Stack gap="xl" className={styles.container}>
      <div>
        <Title order={2} className={styles.title}>
          Общий счет
        </Title>
        <Text size="sm" className={styles.subtitle}>
          Контролируйте совместный бюджет, распределяйте доходы и копите на общие мечты.
        </Text>
      </div>

      {/* Вынесли блок аналитики */}
      <FinanceStats totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <SavingsCard goals={savings} onRefresh={handleRefresh} />

        {/* Вынесли сложную форму добавления */}
        <TransactionForm userId={user.id} onTransactionAdded={handleRefresh} />
      </SimpleGrid>

      {/* История последних транзакций */}
      <Paper p="xl" radius="md" withBorder className={styles.card}>
        <Title order={3} mb="md" size="h4" className={styles.cardTitle}>
          Последние операции
        </Title>
        {recentTransactions.length === 0 ? (
          <Text size="sm" className={styles.emptyText}>
            Операций пока не зафиксировано
          </Text>
        ) : (
          <Stack gap="sm">
            {recentTransactions.map((trans) => (
              <Group key={trans.id} justify="space-between" p="xs" className={styles.historyRow}>
                <Group gap="sm">
                  {trans.type === 'income' ? (
                    <ArrowUpRight size={20} className={styles.incomeIcon} />
                  ) : (
                    <ArrowDownRight size={20} className={styles.expenseIcon} />
                  )}
                  <div>
                    <Text fw={600} size="sm" className={styles.historyCategory}>
                      {trans.category}
                    </Text>
                    {trans.description && (
                      <Text size="xs" className={styles.historyDescription}>
                        {trans.description}
                      </Text>
                    )}
                  </div>
                </Group>
                <Text
                  fw={700}
                  className={trans.type === 'income' ? styles.incomeText : styles.expenseText}
                >
                  {trans.type === 'income' ? '+' : '-'}
                  {trans.amount.toLocaleString('ru-RU')} ₽
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};
