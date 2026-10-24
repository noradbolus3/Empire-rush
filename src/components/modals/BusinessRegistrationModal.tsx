import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OperatingStructure } from '../../types/business';
import { designSystem } from '../../theme/designSystem';
import { formatCurrency } from '../../utils/formatCurrency';

const { colors, spacing, radius, controls } = designSystem;
const C = {
  page: colors.surfaceDark,
  surface: colors.surfaceDark,
  surfaceRaised: colors.surfaceDarkRaised,
  selected: colors.successDarkSoft,
  warningSurface: colors.dangerDarkSoft,
  text: colors.textOnDark,
  secondary: colors.textOnDarkSecondary,
  tertiary: colors.textOnDarkMuted,
  border: colors.borderDark,
  borderStrong: colors.borderDarkStrong,
  accent: colors.successDark,
  warning: colors.dangerDark,
};

type Props = {
  visible: boolean;
  cash: number;
  suggestedName?: string;
  onClose: () => void;
  onIncorporate: (name: string, structure: OperatingStructure, fee: number) => void;
};

export function BusinessRegistrationModal({
  visible,
  cash,
  suggestedName = 'Copper & Bloom Market',
  onClose,
  onIncorporate,
}: Props) {
  const [name, setName] = useState(suggestedName);
  const [structure, setStructure] = useState<OperatingStructure>('Licensed_Legal');
  const [certified, setCertified] = useState(false);
  const incorporationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setName(suggestedName);
      setStructure('Licensed_Legal');
      setCertified(false);
    }

    return () => {
      if (incorporationTimer.current) clearTimeout(incorporationTimer.current);
    };
  }, [visible, suggestedName]);

  const submit = () => {
    const fee = 0;
    if (!name.trim()) {
      Alert.alert('Name your company', 'Choose a registered company name to continue.');
      return;
    }
    if (cash < fee) {
      Alert.alert('Insufficient cash', `This charter requires ${formatCurrency(fee)} in filing fees.`);
      return;
    }
    if (incorporationTimer.current) clearTimeout(incorporationTimer.current);
    setCertified(true);
    incorporationTimer.current = setTimeout(() => {
      incorporationTimer.current = null;
      onIncorporate(name.trim(), structure, fee);
    }, 450);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior="padding" style={styles.keyboard}>
          <SafeAreaView edges={['bottom']} style={styles.sheet}>
            <View style={styles.grabber} />
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text style={styles.kicker}>COMPANY SETUP</Text>
                  <Text style={styles.title}>Set up your first company</Text>
                  <Text style={styles.subtitle}>
                    Choose a structure for this venture. It shapes your tax profile and operating risk.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close company setup"
                  onPress={onClose}
                  style={styles.close}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLabel}>COMPANY NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                returnKeyType="done"
                placeholder="Enter a company name"
                placeholderTextColor={C.tertiary}
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>OPERATING STRUCTURE</Text>
              <Pressable
                onPress={() => setStructure('Licensed_Legal')}
                style={[styles.choice, structure === 'Licensed_Legal' && styles.choiceSelected]}
              >
                <View style={styles.choiceHeader}>
                  <View style={styles.radioOuter}>
                    {structure === 'Licensed_Legal' && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.choiceCopy}>
                    <Text style={styles.choiceTitle}>Main Street Legal</Text>
                    <Text style={styles.choiceMeta}>Conservative structure · 15% audited tax</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Best for</Text>
                  <Text style={styles.detailValue}>Stable growth and government contracts</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setStructure('Shadow_Underground')}
                style={[styles.choice, structure === 'Shadow_Underground' && styles.choiceWarning]}
              >
                <View style={styles.choiceHeader}>
                  <View style={[styles.radioOuter, structure === 'Shadow_Underground' && styles.radioWarning]}>
                    {structure === 'Shadow_Underground' && <View style={styles.radioInnerWarning} />}
                  </View>
                  <View style={styles.choiceCopy}>
                    <Text style={[styles.choiceTitle, structure === 'Shadow_Underground' && styles.warningText]}>
                      Shadow Route
                    </Text>
                    <Text style={styles.choiceMeta}>Higher margin · greater compliance exposure</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Best for</Text>
                  <Text style={styles.detailValue}>Fast expansion with more operating risk</Text>
                </View>
              </Pressable>

              <View style={styles.summary}>
                <Text style={styles.summaryLabel}>AVAILABLE CASH</Text>
                <Text style={styles.summaryValue}>{formatCurrency(cash)}</Text>
              </View>

              {certified && (
                <View style={styles.verified}>
                  <View style={styles.verifiedDot} />
                  <Text style={styles.verifiedText}>Structure verified · ready to launch</Text>
                </View>
              )}

              <View style={styles.actions}>
                <Pressable onPress={onClose} style={styles.cancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={submit} style={styles.primary}>
                  <Text style={styles.primaryText}>LAUNCH COMPANY</Text>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(1, 7, 15, 0.42)',
  },
  keyboard: {
    width: '100%',
    maxHeight: '94%',
  },
  sheet: {
    backgroundColor: C.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: 14,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    borderWidth: 1,
    borderColor: C.borderStrong,
    overflow: 'hidden',
  },
  content: {
    paddingBottom: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 3,
    borderRadius: 3,
    backgroundColor: C.border,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 16,
  },
  kicker: {
    color: C.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    color: C.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    marginTop: 7,
  },
  subtitle: {
    color: C.secondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: C.secondary,
    fontSize: 23,
    lineHeight: 25,
  },
  fieldLabel: {
    color: C.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginTop: 22,
    marginBottom: 8,
  },
  input: {
    color: C.text,
    backgroundColor: C.page,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  choice: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    padding: 15,
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  choiceSelected: {
    borderColor: C.accent,
    backgroundColor: C.selected,
  },
  choiceWarning: {
    borderColor: C.warning,
    backgroundColor: C.warningSurface,
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  radioWarning: {
    borderColor: C.warning,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.accent,
  },
  radioInnerWarning: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.warning,
  },
  choiceCopy: {
    flex: 1,
  },
  choiceTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
  },
  warningText: {
    color: C.warning,
  },
  choiceMeta: {
    color: C.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  detailRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: `${C.border}99`,
    marginTop: 13,
    paddingTop: 11,
  },
  detailLabel: {
    width: 58,
    color: C.tertiary,
    fontSize: 10,
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    color: C.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 20,
    paddingTop: 15,
  },
  summaryLabel: {
    color: C.tertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  summaryValue: {
    color: C.text,
    fontSize: 17,
    fontWeight: '800',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
  },
  verifiedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.accent,
    marginRight: 8,
  },
  verifiedText: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancel: {
    flex: 1,
    minHeight: controls.primaryHeight,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: C.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  primary: {
    flex: 1.55,
    minHeight: controls.primaryHeight,
    borderRadius: 10,
    backgroundColor: C.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: C.page,
    fontSize: 13,
    fontWeight: '800',
  },
});

export default BusinessRegistrationModal;
