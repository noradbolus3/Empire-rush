import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export type FounderProfile = {
  founderName: string;
  avatarKey: string | null;
  companyName: string;
  logoKey: string;
  customLogoUri: string | null;
};

type Props = {
  initialProfile?: Partial<FounderProfile> | null;
  onComplete: (profile: FounderProfile) => void;
};

const avatarOptions = [
  { key: 'founder', source: require('../../assets/onboarding/avatar-founder.png') },
  { key: 'founder-2', source: require('../../assets/onboarding/avatar-founder-2.png') },
  { key: 'founder-3', source: require('../../assets/onboarding/avatar-founder-3.png') },
  { key: 'founder-4', source: require('../../assets/onboarding/avatar-founder-4.png') },
  { key: 'founder-5', source: require('../../assets/onboarding/avatar-founder-5.png') },
] as const;

const logoOptions = [
  { key: 'logo-01', category: 'Modern', source: require('../../assets/onboarding/logo-01.png') },
  { key: 'logo-02', category: 'Classic', source: require('../../assets/onboarding/logo-02.png') },
  { key: 'logo-03', category: 'Tech', source: require('../../assets/onboarding/logo-03.png') },
  { key: 'logo-04', category: 'Industry', source: require('../../assets/onboarding/logo-04.png') },
  { key: 'logo-05', category: 'Luxury', source: require('../../assets/onboarding/logo-05.png') },
  { key: 'logo-06', category: 'Modern', source: require('../../assets/onboarding/logo-06.png') },
  { key: 'logo-07', category: 'Classic', source: require('../../assets/onboarding/logo-07.png') },
  { key: 'logo-08', category: 'Tech', source: require('../../assets/onboarding/logo-08.png') },
  { key: 'logo-09', category: 'Industry', source: require('../../assets/onboarding/logo-09.png') },
  { key: 'logo-10', category: 'Luxury', source: require('../../assets/onboarding/logo-10.png') },
  { key: 'logo-11', category: 'Modern', source: require('../../assets/onboarding/logo-11.png') },
  { key: 'logo-12', category: 'Classic', source: require('../../assets/onboarding/logo-12.png') },
  { key: 'logo-13', category: 'Tech', source: require('../../assets/onboarding/logo-13.png') },
  { key: 'logo-14', category: 'Industry', source: require('../../assets/onboarding/logo-14.png') },
  { key: 'logo-15', category: 'Luxury', source: require('../../assets/onboarding/logo-15.png') },
] as const;

const categories = ['All', 'Modern', 'Classic', 'Tech', 'Industry', 'Luxury'] as const;

type Category = (typeof categories)[number];

export default function FirstLaunchOnboarding({ initialProfile, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [founderName, setFounderName] = useState(initialProfile?.founderName ?? '');
  const [avatarKey, setAvatarKey] = useState<string | null>(initialProfile?.avatarKey ?? 'founder');
  const [companyName, setCompanyName] = useState(initialProfile?.companyName ?? '');
  const [logoKey, setLogoKey] = useState(initialProfile?.logoKey ?? 'logo-01');
  const [customLogoUri, setCustomLogoUri] = useState<string | null>(initialProfile?.customLogoUri ?? null);
  const [category, setCategory] = useState<Category>('All');

  const visibleLogos = useMemo(
    () => category === 'All' ? logoOptions : logoOptions.filter((logo) => logo.category === category),
    [category],
  );

  const continueToCompany = () => {
    if (!founderName.trim()) {
      Alert.alert('Founder profile', 'Enter your name to create your founder profile.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(2);
  };

  const continueToConfirmation = () => {
    if (!companyName.trim()) {
      Alert.alert('Company identity', 'Enter a company name before continuing.');
      return;
    }
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(3);
  };

  const pickCustomLogo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to choose a custom company logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setCustomLogoUri(result.assets[0].uri);
      setLogoKey('custom');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const finish = () => {
    if (!founderName.trim() || !companyName.trim()) return;
    const profile: FounderProfile = {
      founderName: founderName.trim(),
      avatarKey,
      companyName: companyName.trim(),
      logoKey,
      customLogoUri,
    };
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(profile);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <View style={styles.brandWrap}>
              <Text style={styles.crown}>♛</Text>
              <View>
                <Text style={styles.brand}>BUILD<Text style={styles.brandBlue}>BOSS</Text></Text>
                <Text style={styles.brandSub}>BUSINESS EMPIRE</Text>
              </View>
            </View>
            <View style={styles.stepWrap}>
              <Text style={styles.stepText}>Step {step} of 3</Text>
              <View style={styles.progressTrack}>
                {[1, 2, 3].map((item) => <View key={item} style={[styles.progressDot, item <= step && styles.progressDotActive]} />)}
              </View>
            </View>
          </View>

          {step === 1 && (
            <StepFrame
              image={require('../../assets/onboarding/founder-hero.png')}
              title="Welcome to BuildBoss!"
              subtitle="Create your identity and start building your business empire."
            >
              <SectionHeading icon="●" title="What is your name?" copy="Enter your name to create your founder profile." />
              <Input value={founderName} onChangeText={setFounderName} placeholder="Enter your name" />
              <Text style={styles.helper}>This name will be displayed in your profile and across the game.</Text>
              <Text style={styles.label}>CHOOSE YOUR AVATAR <Text style={styles.optional}>(OPTIONAL)</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
                {avatarOptions.map((avatar) => (
                  <Pressable key={avatar.key} onPress={() => setAvatarKey(avatar.key)} style={[styles.avatarChoice, avatarKey === avatar.key && styles.avatarChoiceActive]}>
                    <Image source={avatar.source} style={styles.avatarImage} />
                    {avatarKey === avatar.key && <View style={styles.check}><Text style={styles.checkText}>✓</Text></View>}
                  </Pressable>
                ))}
              </ScrollView>
              <PrimaryButton title="Continue  →" onPress={continueToCompany} />
            </StepFrame>
          )}

          {step === 2 && (
            <StepFrame
              image={require('../../assets/onboarding/company-hero.png')}
              title="Name Your Company"
              subtitle="Give your first company a unique identity."
            >
              <Input value={companyName} onChangeText={setCompanyName} placeholder="Enter company name" />
              <Text style={styles.label}>CHOOSE YOUR COMPANY LOGO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
                {categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, category === item && styles.categoryChipActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.logoGrid}>
                {visibleLogos.map((logo) => (
                  <Pressable key={logo.key} onPress={() => { setLogoKey(logo.key); setCustomLogoUri(null); }} style={[styles.logoChoice, logoKey === logo.key && styles.logoChoiceActive]}>
                    <Image source={logo.source} style={styles.logoImage} />
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable style={styles.uploadButton} onPress={pickCustomLogo}>
                {customLogoUri ? <Image source={{ uri: customLogoUri }} style={styles.uploadPreview} /> : <Text style={styles.uploadIcon}>↥</Text>}
                <View><Text style={styles.uploadTitle}>{customLogoUri ? 'Custom logo selected' : 'Upload Custom Logo (Optional)'}</Text><Text style={styles.uploadCopy}>Use your own logo (PNG/JPG, max 2MB)</Text></View>
              </Pressable>
              <PrimaryButton title="Continue  →" onPress={continueToConfirmation} />
            </StepFrame>
          )}

          {step === 3 && (
            <StepFrame
              image={require('../../assets/onboarding/confirm-hero.png')}
              title="All Set, Founder!"
              subtitle="Your journey to building a business empire begins now."
              darkOverlay
            >
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>YOUR PROFILE</Text>
                <View style={styles.profileRow}>
                  {avatarKey ? <Image source={avatarOptions.find((item) => item.key === avatarKey)?.source} style={styles.profileAvatar} /> : <View style={styles.profileAvatarFallback}><Text>F</Text></View>}
                  <View style={styles.summaryCopy}><Text style={styles.summaryName}>{founderName}</Text><Text style={styles.summaryRole}>♛  Founder</Text></View>
                  <Pressable onPress={() => setStep(1)}><Text style={styles.edit}>Edit  ✎</Text></Pressable>
                </View>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>YOUR COMPANY</Text>
                <View style={styles.profileRow}>
                  {customLogoUri && logoKey === 'custom' ? <Image source={{ uri: customLogoUri }} style={styles.companyLogo} /> : <Image source={logoOptions.find((item) => item.key === logoKey)?.source} style={styles.companyLogo} />}
                  <View style={styles.summaryCopy}><Text style={styles.summaryName}>{companyName}</Text><Text style={styles.summaryRole}>Building a Better Tomorrow</Text></View>
                  <Pressable onPress={() => setStep(2)}><Text style={styles.edit}>Edit  ✎</Text></Pressable>
                </View>
              </View>
              <View style={styles.promiseRow}>
                {['Start Your First Business', 'Grow & Expand', 'Build a Global Empire'].map((text, index) => <View key={text} style={styles.promise}><Text style={styles.promiseIcon}>{['↗', '▥', '◎'][index]}</Text><Text style={styles.promiseTitle}>{text}</Text><Text style={styles.promiseCopy}>{['Choose a business and start earning', 'Unlock new companies and increase revenue', 'Become the ultimate business tycoon'][index]}</Text></View>)}
              </View>
              <PrimaryButton title="Enter Your Empire  →" onPress={finish} />
            </StepFrame>
          )}
          {step > 1 && <Pressable onPress={() => setStep((current) => current - 1)} style={styles.back}><Text style={styles.backText}>← Back</Text></Pressable>}
          <View style={styles.pageDots}>{[1, 2, 3].map((item) => <View key={item} style={[styles.pageDot, item === step && styles.pageDotActive]} />)}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepFrame({ image, title, subtitle, children, darkOverlay = false }: { image: number; title: string; subtitle: string; children: React.ReactNode; darkOverlay?: boolean }) {
  return <View style={styles.frame}><View style={styles.hero}><Image source={image} style={styles.heroImage} /><View style={[styles.heroShade, darkOverlay && styles.heroShadeStrong]} /><View style={styles.heroCopy}><Text style={styles.heroTitle}>{title}</Text><Text style={styles.heroSubtitle}>{subtitle}</Text></View></View><View style={styles.sheet}>{children}</View></View>;
}

function SectionHeading({ icon, title, copy }: { icon: string; title: string; copy: string }) { return <View style={styles.sectionHeading}><View style={styles.sectionIcon}><Text style={styles.sectionIconText}>{icon}</Text></View><View><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionCopy}>{copy}</Text></View></View>; }
function Input({ value, onChangeText, placeholder }: { value: string; onChangeText: (text: string) => void; placeholder: string }) { return <View style={styles.inputWrap}><Text style={styles.inputIcon}>♟</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#7E8B9D" style={styles.input} autoCapitalize="words" returnKeyType="done" /></View>; }
function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) { return <Pressable onPress={onPress} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}><Text style={styles.primaryText}>{title}</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F8FC' }, flex: { flex: 1 }, scrollContent: { paddingBottom: 44 },
  topBar: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 }, crown: { color: '#D9A528', fontSize: 30 }, brand: { color: '#0E1830', fontSize: 23, lineHeight: 24, fontWeight: '900', letterSpacing: -1.1 }, brandBlue: { color: '#1C72DC' }, brandSub: { color: '#253653', fontSize: 8, fontWeight: '800', letterSpacing: 1.1, marginTop: 1 }, stepWrap: { alignItems: 'flex-end', width: 122 }, stepText: { color: '#18253F', fontSize: 12, fontWeight: '800', marginBottom: 8 }, progressTrack: { height: 6, width: 116, backgroundColor: '#CAD3DE', borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#BAC6D3', borderWidth: 2, borderColor: '#F4F8FC' }, progressDotActive: { backgroundColor: '#1976E8', width: 13, height: 13 },
  frame: { marginHorizontal: 12, borderRadius: 24, overflow: 'hidden', shadowColor: '#6C7B8E', shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 4 }, hero: { height: 210, position: 'relative', justifyContent: 'flex-end' }, heroImage: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' }, heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(2, 21, 45, 0.2)' }, heroShadeStrong: { backgroundColor: 'rgba(2, 20, 48, 0.42)' }, heroCopy: { paddingHorizontal: 20, paddingBottom: 18 }, heroTitle: { color: '#FFF', fontSize: 28, lineHeight: 32, fontWeight: '900', letterSpacing: -0.8 }, heroSubtitle: { color: '#FFF', fontSize: 13, lineHeight: 18, marginTop: 6, fontWeight: '600' }, sheet: { backgroundColor: '#FFF', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -4 }, sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }, sectionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E9F3FF', alignItems: 'center', justifyContent: 'center' }, sectionIconText: { color: '#1474E8', fontSize: 20 }, sectionTitle: { color: '#12213D', fontSize: 21, fontWeight: '900' }, sectionCopy: { color: '#66758A', fontSize: 12, marginTop: 2 }, label: { color: '#162644', fontSize: 12, fontWeight: '900', letterSpacing: 0.3, marginTop: 18, marginBottom: 10 }, optional: { color: '#738196', fontWeight: '600' }, inputWrap: { height: 50, borderWidth: 1, borderColor: '#BCC9D9', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, backgroundColor: '#FFF' }, inputIcon: { color: '#7E8EA3', fontSize: 20, marginRight: 10 }, input: { flex: 1, color: '#152542', fontSize: 15 }, helper: { color: '#738196', fontSize: 11, marginTop: 8 }, avatarRow: { flexDirection: 'row', gap: 8, paddingBottom: 4, marginBottom: 18 }, avatarChoice: { width: 58, height: 70, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#D5DFE9', position: 'relative', backgroundColor: '#EEF3F8' }, avatarChoiceActive: { borderColor: '#1976E8', borderWidth: 2 }, avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' }, check: { position: 'absolute', right: 2, bottom: 2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#1976E8', alignItems: 'center', justifyContent: 'center' }, checkText: { color: '#FFF', fontWeight: '900', fontSize: 12 }, primary: { height: 52, borderRadius: 14, backgroundColor: '#147BEA', alignItems: 'center', justifyContent: 'center', marginTop: 8 }, primaryPressed: { backgroundColor: '#0D63C4', transform: [{ scale: 0.99 }] }, primaryText: { color: '#FFF', fontSize: 16, fontWeight: '900' }, categoryRow: { gap: 8, paddingBottom: 10 }, categoryChip: { height: 34, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#CFD9E5', justifyContent: 'center', backgroundColor: '#F8FBFF' }, categoryChipActive: { backgroundColor: '#1976E8', borderColor: '#1976E8' }, categoryText: { color: '#52657D', fontSize: 11, fontWeight: '800' }, categoryTextActive: { color: '#FFF' }, logoGrid: { flexDirection: 'row', gap: 8, paddingBottom: 12, marginBottom: 2 }, logoChoice: { width: 58, height: 58, borderWidth: 1, borderColor: '#D8E1EB', borderRadius: 10, padding: 3, backgroundColor: '#F9FBFD' }, logoChoiceActive: { borderColor: '#1976E8', borderWidth: 2 }, logoImage: { width: '100%', height: '100%', borderRadius: 7, resizeMode: 'cover' }, uploadButton: { minHeight: 58, borderWidth: 1, borderColor: '#C9D5E2', borderRadius: 12, backgroundColor: '#F4F9FF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 }, uploadIcon: { color: '#1976E8', fontSize: 28, fontWeight: '700' }, uploadPreview: { width: 38, height: 38, borderRadius: 8 }, uploadTitle: { color: '#1A3154', fontWeight: '800', fontSize: 12 }, uploadCopy: { color: '#718199', fontSize: 10, marginTop: 3 }, summaryCard: { borderWidth: 1, borderColor: '#D7E1EB', borderRadius: 14, padding: 14, marginBottom: 12, backgroundColor: '#FFF' }, summaryLabel: { color: '#748197', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 10 }, profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, profileAvatar: { width: 58, height: 58, borderRadius: 29, resizeMode: 'cover' }, profileAvatarFallback: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#E8F2FF', alignItems: 'center', justifyContent: 'center' }, companyLogo: { width: 58, height: 58, borderRadius: 29, resizeMode: 'cover', borderWidth: 1, borderColor: '#DCE6F0' }, summaryCopy: { flex: 1 }, summaryName: { color: '#132443', fontSize: 17, fontWeight: '900' }, summaryRole: { color: '#718097', fontSize: 12, marginTop: 4 }, edit: { color: '#1C72DC', fontWeight: '800', fontSize: 12 }, promiseRow: { flexDirection: 'row', gap: 7, marginBottom: 12 }, promise: { flex: 1, borderWidth: 1, borderColor: '#DCE5EE', borderRadius: 12, padding: 9, minHeight: 112 }, promiseIcon: { color: '#1476E4', fontSize: 11, marginBottom: 6 }, promiseTitle: { color: '#142442', fontSize: 10, fontWeight: '900', lineHeight: 14 }, promiseCopy: { color: '#718097', fontSize: 8, lineHeight: 12, marginTop: 4 }, back: { alignSelf: 'center', padding: 12 }, backText: { color: '#1C72DC', fontWeight: '800' }, pageDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 6 }, pageDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C5D0DE' }, pageDotActive: { backgroundColor: '#1476E4', width: 12, height: 12 },
});
