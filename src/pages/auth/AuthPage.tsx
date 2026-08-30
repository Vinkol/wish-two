import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import {
  Button,
  Paper,
  Title,
  Container,
  Text,
  TextInput,
  PasswordInput,
  Anchor,
} from '@mantine/core';
import type { RootState } from '../../shared/store/store';
import { loginWithEmail, signUpWithEmail } from '../../features/auth/model/authActions';
import styles from './AuthPage.module.scss';
import { notifications } from '@mantine/notifications';

export const AuthPage: React.FC = () => {
  const { isAuth, isLoading } = useSelector((state: RootState) => state.auth);
  const [type, setType] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuth && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (type === 'register') {
        const data = await signUpWithEmail(email, password, fullName);
        if (data) {
          notifications.show({
            title: 'Добро пожаловать!',
            message: 'Регистрация прошла успешно. Входим в систему...',
            color: 'green',
            autoClose: 4000,
          });
        }
      } else {
        await loginWithEmail(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Container size={420} my={40} className={styles.container}>
        <Title ta="center" className={styles.title}>
          {type === 'login' ? 'Вход в WishTwo' : 'Создать аккаунт'}
        </Title>
        <Text size="sm" ta="center" mt={5} className={styles.subtitle}>
          {type === 'login' ? 'Еще нет аккаунта? ' : 'Уже есть аккаунт? '}
          <Anchor
            size="sm"
            component="button"
            type="button"
            color="var(--primary-color)"
            onClick={() => setType(type === 'login' ? 'register' : 'login')}
          >
            {type === 'login' ? 'Регистрация' : 'Войти'}
          </Anchor>
        </Text>

        <Paper withBorder shadow="xl" p={30} mt={30} radius="md" className={styles.card}>
          <form onSubmit={handleSubmit}>
            {type === 'register' && (
              <TextInput
                label="Имя"
                placeholder="Ваше имя"
                required
                value={fullName}
                onChange={(event) => setFullName(event.currentTarget.value)}
                mb="md"
                classNames={{ label: styles.inputLabel, input: styles.inputField }}
              />
            )}

            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              mb="md"
              classNames={{ label: styles.inputLabel, input: styles.inputField }}
            />

            <PasswordInput
              label="Пароль"
              placeholder="Ваш пароль"
              required
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              mb="xl"
              classNames={{
                label: styles.inputLabel,
                input: styles.inputField,
                innerInput: styles.passwordInner,
              }}
            />

            <Button type="submit" fullWidth loading={isSubmitting} className={styles.submitButton}>
              {type === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};
