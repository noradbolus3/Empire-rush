import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { designSystem } from "../../theme/designSystem";

type ShellTab = { id: string; label: string };

type Props = {
  eyebrow: string;
  title: string;
  monogram: string;
  tabs?: ShellTab[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  onBack: () => void;
  children: React.ReactNode;
};

const colors = designSystem.colors;

export function SpecializedBusinessShell({ eyebrow, title, monogram, tabs = [], activeTab, onTabChange, onBack, children }: Props) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to business registry" style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <Text style={styles.back}>‹ BUSINESS REGISTRY</Text>
          </Pressable>
          <View style={styles.brandRow}>
            <View style={styles.logo}><Text style={styles.logoText}>{monogram}</Text></View>
            <View style={styles.brandCopy}>
              <Text style={styles.eyebrow}>{eyebrow}</Text>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
            </View>
            <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
          </View>
          {tabs.length > 0 && onTabChange && activeTab && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabScroller}
              contentContainerStyle={styles.tabRow}
            >
              {tabs.map((tab) => {
                const selected = tab.id === activeTab;
                return <Pressable
                  key={tab.id}
                  onPress={() => onTabChange(tab.id)}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${tab.label} business view`}
                  style={({ pressed }) => [styles.tab, selected && styles.tabActive, pressed && styles.pressed]}
                >
                  <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
                </Pressable>;
              })}
            </ScrollView>
          )}
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { padding: designSystem.spacing.screen, paddingBottom: 124 },
  backButton: { minHeight: 32, justifyContent: "center", alignSelf: "flex-start", marginBottom: 10 },
  back: { color: colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  logo: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.border, marginRight: 11 },
  logoText: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  brandCopy: { flex: 1, paddingRight: 8 },
  eyebrow: { color: colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  title: { color: colors.textPrimary, fontSize: 22, lineHeight: 28, fontWeight: "800", marginTop: 3 },
  liveBadge: { flexDirection: "row", alignItems: "center", borderRadius: designSystem.radius.round, backgroundColor: colors.successSoft, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 5 },
  liveText: { color: colors.success, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  tabScroller: { flexGrow: 0, flexShrink: 0, marginHorizontal: -4, marginBottom: 14 },
  tabRow: { alignItems: "center", gap: 8, paddingHorizontal: 4 },
  tab: { minHeight: 40, paddingHorizontal: 13, borderRadius: designSystem.radius.control, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },
  tabTextActive: { color: "#FFFFFF" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
