import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthScreenProps } from '../../types/navigation';
import { COLORS, TYPOGRAPHY, SPACING } from '../../utils/constants';

type Props = AuthScreenProps<'OTPVerification'>;

const OTPScreen: React.FC<Props> = ({ route }) => {
  const { phone } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>
        We've sent a verification code to {phone}
      </Text>
      <Text style={styles.note}>
        OTP Screen - To be implemented in Phase 2
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  note: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
});

export default OTPScreen;