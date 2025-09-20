import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LoginScreenWeb from './screens/auth/LoginScreen.web';
import {COLORS, TYPOGRAPHY} from './utils/constants';

const AppWeb: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏛️ Civic Reporter</Text>
        <Text style={styles.subtitle}>Web Demo Version</Text>
      </View>
      <LoginScreenWeb />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white,
    marginBottom: 5,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    opacity: 0.9,
  },
});

export default AppWeb;