import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Title, Text, Group, ActionIcon, Stack } from '@mantine/core';
import { Heart, Sun, Moon, ArrowRight } from 'lucide-react';
import type { AppDispatch, RootState } from '../../shared/store/store';
import { toggleTheme } from '../../entities/user/model/authSlice';
import styles from './PresentationPage.module.scss';

export const PresentationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.auth);

  return (
    <div className={styles.hero}>
      {/* Мини-шапка для переключения темы на главной */}
      <header className={styles.header}>
        <Container size="md" className={styles.headerContainer}>
          <Group gap={8}>
            <Heart color="var(--primary-color)" fill="var(--primary-color)" size={22} />
            <span className={styles.logoText}>WishTwo</span>
          </Group>
          <ActionIcon
            onClick={() => dispatch(toggleTheme())}
            variant="subtle"
            size="lg"
            radius="md"
            className={styles.themeToggleBtn}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </ActionIcon>
        </Container>
      </header>

      {/* Главный контент */}
      <Container size="md" className={styles.container}>
        <Stack gap="xl" align="center">
          <Title className={styles.title}>
            Наше пространство <span className={styles.gradientText}>желаний</span>
          </Title>

          <Text className={styles.subtitle} size="lg">
            Личный цифровой хаб для двоих. Делитесь идеями подарков, тайно бронируйте сюрпризы,
            планируйте совместные путешествия и управляйте общим бюджетом.
          </Text>

          <Group justify="center" mt="md">
            <Button
              component={Link}
              to="/auth"
              size="xl"
              radius="md"
              className={styles.mainButton}
              rightSection={<ArrowRight size={18} />}
            >
              Создать вишлист
            </Button>
          </Group>
        </Stack>
      </Container>
    </div>
  );
};
