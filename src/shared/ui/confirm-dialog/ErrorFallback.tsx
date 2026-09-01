import React from 'react';
import { Title, Text, Button, Paper, Stack, Center } from '@mantine/core';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  return (
    <Center style={{ height: '80vh', width: '100%', padding: '24px' }}>
      <Paper
        withBorder
        shadow="md"
        radius="lg"
        p="xl"
        style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <Stack align="center" gap="md" style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(248, 113, 113, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={32} color="#f87171" />
          </div>

          <Title order={2} style={{ color: 'var(--text-main)', fontWeight: 800 }}>
            Что-то пошло не так
          </Title>

          <Text size="sm" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Произошла непредвиденная ошибка при отрисовке интерфейса. Но не переживайте, ваши данные
            в безопасности.
          </Text>

          {error && (
            <Paper
              withBorder
              p="xs"
              radius="md"
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-color)',
                maxHeight: '100px',
                overflowY: 'auto',
              }}
            >
              <Text
                size="xs"
                color="red"
                style={{ fontFamily: 'monospace', wordBreak: 'break-all', fontStyle: 'italic' }}
              >
                {error.toString()}
              </Text>
            </Paper>
          )}

          <Button
            fullWidth
            mt="sm"
            onClick={onReset}
            leftSection={<RotateCcw size={16} />}
            style={{
              backgroundColor: 'var(--primary-color)',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            Вернуться в ритм
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
};
