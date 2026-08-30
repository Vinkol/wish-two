import React from 'react';
import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogOptions {
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}

export const openConfirmDialog = ({
  title,
  message,
  confirmLabel = 'Удалить',
  onConfirm,
}: ConfirmDialogOptions) => {
  modals.openConfirmModal({
    title,
    centered: true,
    classNames: {
      content: styles.modalContent,
      header: styles.modalHeader,
      title: styles.modalTitle,
    },
    children: (
      <Text size="sm" className={styles.modalText}>
        {message}
      </Text>
    ),

    labels: { confirm: confirmLabel, cancel: '' },
    confirmProps: { className: styles.modalConfirmBtn },
    cancelProps: { style: { display: 'none' } },
    onConfirm,
  });
};
