import React, { useState } from 'react';
import {
  Paper,
  Title,
  Stack,
  SegmentedControl,
  NumberInput,
  Select,
  TextInput,
  Button,
} from '@mantine/core';
import { Plus } from 'lucide-react';
import { addTransactionInDb } from '../../../features/finance/model/financeActions';
import styles from '../../../pages/finance/FinancePage.module.scss';

interface TransactionFormProps {
  userId: string;
  onTransactionAdded: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ userId, onTransactionAdded }) => {
  const [transactionType, setTransactionType] = useState<string>('expense');
  const [amount, setAmount] = useState<string | number>('');
  const [category, setCategory] = useState<string | null>('Продукты');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsSubmitting(true);

    const success = await addTransactionInDb(
      userId,
      Number(amount),
      category || 'Другое',
      description,
      transactionType as 'income' | 'expense'
    );

    if (success) {
      setAmount('');
      setDescription('');
      onTransactionAdded();
    }
    setIsSubmitting(false);
  };

  return (
    <Paper p="xl" radius="md" withBorder className={styles.card}>
      <Title order={3} mb="md" size="h4" className={styles.cardTitle}>
        Добавить операцию
      </Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <SegmentedControl
            value={transactionType}
            onChange={(val) => {
              setTransactionType(val);
              setCategory(val === 'income' ? 'Зарплата' : 'Продукты');
            }}
            data={[
              { label: 'Расход', value: 'expense' },
              { label: 'Доход', value: 'income' },
            ]}
            fullWidth
            className={styles.segmentControl}
          />

          <NumberInput
            label="Сумма (₽)"
            placeholder="0.00"
            required
            min={1}
            value={amount}
            onChange={setAmount}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />

          <Select
            label="Категория"
            data={
              transactionType === 'income'
                ? ['Зарплата', 'Фриланс', 'Подарок', 'Инвестиции', 'Другое']
                : [
                    'Продукты',
                    'Кафе и Рестораны',
                    'Развлечения',
                    'Дом / Быт',
                    'Транспорт',
                    'Другое',
                  ]
            }
            value={category}
            onChange={setCategory}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />

          <TextInput
            label="Комментарий"
            placeholder="Например: Аванс или Покупка продуктов"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />

          <Button
            type="submit"
            fullWidth
            leftSection={<Plus size={16} />}
            loading={isSubmitting}
            className={transactionType === 'income' ? styles.btnIncome : styles.btnExpense}
          >
            Зафиксировать
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};
