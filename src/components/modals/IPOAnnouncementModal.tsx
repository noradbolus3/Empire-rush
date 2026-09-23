import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IPOListing } from '../../types/ipo';
import { formatCurrency } from '../../utils/formatCurrency';

type Props = { visible: boolean; listing: IPOListing | null; onClose: () => void };

export default function IPOAnnouncementModal({ visible, listing, onClose }: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 180 }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale, visible]);
  if (!listing) return null;
  return <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <View style={styles.shade}>
      <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safe}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.ring}><Text style={styles.ringText}>◈</Text></View>
          <Text style={styles.eyebrow}>THE OPENING BELL</Text>
          <Text style={styles.title}>YOUR COMPANY IS PUBLIC</Text>
          <Text style={styles.ticker}>{listing.ticker}</Text>
          <Text style={styles.company}>{listing.companyName} · Class A</Text>
          <View style={styles.achievement}><Text style={styles.achievementEyebrow}>ACHIEVEMENT UNLOCKED</Text><Text style={styles.achievementTitle}>PUBLIC COMPANY FOUNDER</Text><Text style={styles.copy}>You sold a 20% minority stake, retained 80% of future business cashflow, and unlocked the public markets.</Text></View>
          <View style={styles.stats}><View><Text style={styles.label}>GROWTH CAPITAL</Text><Text style={styles.value}>{formatCurrency(listing.capitalRaised)}</Text></View><View><Text style={styles.label}>FOUNDER STAKE</Text><Text style={styles.value}>80%</Text></View></View>
          <Text style={styles.next}>Next chapter: build a national company without giving up control.</Text>
          <Pressable onPress={onClose} style={styles.button}><Text style={styles.buttonText}>ENTER THE PUBLIC MARKETS</Text></Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({ shade: { flex: 1, backgroundColor: 'rgba(2, 7, 15, .92)' }, safe: { flex: 1, justifyContent: 'center', padding: 18 }, card: { backgroundColor: '#102238', borderRadius: 28, borderWidth: 1, borderColor: '#28E39A', padding: 22, alignItems: 'center', shadowColor: '#28E39A', shadowOpacity: .24, shadowRadius: 28, shadowOffset: { width: 0, height: 10 }, elevation: 14 }, ring: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#123D34', borderWidth: 1, borderColor: '#FFC857', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, ringText: { color: '#FFC857', fontSize: 38, fontWeight: '900' }, eyebrow: { color: '#49C8FF', fontSize: 10, fontWeight: '900', letterSpacing: 2 }, title: { color: '#F8FAFC', fontSize: 22, lineHeight: 27, textAlign: 'center', fontWeight: '900', marginTop: 8 }, ticker: { color: '#28E39A', fontSize: 46, lineHeight: 52, fontWeight: '900', letterSpacing: 4, marginTop: 14 }, company: { color: '#8EA4BA', fontSize: 11, fontWeight: '800', marginTop: 4 }, achievement: { width: '100%', backgroundColor: '#0B1624', borderRadius: 17, borderWidth: 1, borderColor: '#29425D', padding: 15, marginTop: 22 }, achievementEyebrow: { color: '#FFC857', fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }, achievementTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900', marginTop: 6 }, copy: { color: '#B5D7E8', fontSize: 11, lineHeight: 16, marginTop: 6 }, stats: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 18 }, label: { color: '#8EA4BA', fontSize: 8, fontWeight: '900', letterSpacing: 1 }, value: { color: '#28E39A', fontSize: 18, fontWeight: '900', marginTop: 5 }, next: { color: '#8EA4BA', fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 18 }, button: { width: '100%', backgroundColor: '#28E39A', borderRadius: 13, paddingVertical: 15, alignItems: 'center', marginTop: 18 }, buttonText: { color: '#06101C', fontSize: 11, fontWeight: '900', letterSpacing: .5 } });
