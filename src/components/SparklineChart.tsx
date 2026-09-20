import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export function SparklineChart({ data, width, height, isPositive }: { data: number[]; width: number; height: number; isPositive: boolean }) {
  if (!data || data.length < 2) return <View style={[styles.empty, { width, height }]}><Text style={styles.emptyText}>MARKET DATA PENDING</Text></View>;
  const min = Math.min(...data); const max = Math.max(...data); const range = max - min || 1; const color = isPositive ? '#10B981' : '#EF4444';
  const points = data.map((value, index) => `${(index / (data.length - 1)) * width},${height - ((value - min) / range) * (height - 8) - 4}`);
  const path = `M ${points.join(' L ')}`; const area = `${path} L ${width},${height} L 0,${height} Z`; const gradientId = `spark-${isPositive ? 'up' : 'down'}`;
  return <Svg height={height} width={width}><Defs><LinearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><Stop offset="0%" stopColor={color} stopOpacity="0.25" /><Stop offset="100%" stopColor={color} stopOpacity="0" /></LinearGradient></Defs><Path d={area} fill={`url(#${gradientId})`} /><Path d={path} fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" /></Svg>;
}
const styles = StyleSheet.create({ empty: { justifyContent: 'center', alignItems: 'center' }, emptyText: { color: '#8190A5', fontSize: 7, fontWeight: '900' } });
