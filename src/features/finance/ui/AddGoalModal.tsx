import React, { useState } from 'react';
import { Modal, TextInput, NumberInput, Button, Stack } from '@mantine/core';
import { createSavingGoalInDb } from '../model/financeActions';
import styles from './AddGoalModal.module.scss';

interface AddGoalModalProps {
  opened: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ opened, onClose, onGoalAdded }) => {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<string | number>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) return;
    setLoading(true);

    const success = await createSavingGoalInDb(title, Number(target));
    if (success) {
      setTitle('');
      setTarget('');
      onGoalAdded();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Новая цель для накоплений 🎯"
      centered
      classNames={{
        content: styles.modalContent,
        header: styles.modalHeader,
        title: styles.modalTitle,
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="На что копим?"
            placeholder="Например: Поездка в Японию, Новый диван..."
            required
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />
          <NumberInput
            label="Сколько нужно собрать?"
            placeholder="Сумма в ₽"
            required
            min={1}
            value={target}
            onChange={setTarget}
            classNames={{ label: styles.inputLabel, input: styles.inputField }}
          />
          <Button type="submit" fullWidth loading={loading} className={styles.submitButton}>
            Создать цель
          </Button>
        </Stack>
      </form>
    </Modal>
  );
};
