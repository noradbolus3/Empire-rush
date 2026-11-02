import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type ScrollViewProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import {
  BUSINESS_BACK_LABEL,
  SCREEN_BOTTOM_PADDING,
} from "../navigation/navigationContract";
import { designSystem } from "../theme/designSystem";

export function ScreenScrollView({
  children,
  contentContainerStyle,
  style,
  ...props
}: ScrollViewProps) {
  return (
    <ScrollView
      {...props}
      style={[styles.scroll, style]}
      contentContainerStyle={[
        styles.content,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function ScreenBackButton({
  onPress,
  label = BUSINESS_BACK_LABEL,
  style,
  textStyle,
}: {
  onPress: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Back to ${label.replace(/^‹\s*/, "")}`}
      hitSlop={8}
      style={[styles.backButton, style]}
    >
      <Text style={[styles.backText, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, minHeight: 0 },
  content: { paddingBottom: SCREEN_BOTTOM_PADDING },
  backButton: { minHeight: 40, justifyContent: "center", alignSelf: "flex-start" },
  backText: {
    color: designSystem.colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
});
