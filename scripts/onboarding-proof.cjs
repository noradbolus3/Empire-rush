require('tsx/cjs');
const assert = require('node:assert/strict');
const React = require('react');
const Module = require('node:module');
const TestRenderer = require('react-test-renderer');
const { act } = TestRenderer;

for (const extension of ['.webp', '.png', '.jpg', '.jpeg']) {
  require.extensions[extension] = (module) => { module.exports = 'mock-asset'; };
}
const component = (name) => React.forwardRef(({ children, ...props }, ref) => React.createElement(name, { ...props, ref }, children));
const native = Object.fromEntries(['View','Text','Pressable','ScrollView','Image','TextInput','KeyboardAvoidingView','SafeAreaView'].map((name) => [name, component(name)]));
native.StyleSheet = { create: (styles) => styles, absoluteFill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 } };
native.Platform = { OS: 'android' };
native.Alert = { alert: () => undefined };
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'react-native') return { ...native, default: native };
  if (request === 'react-native-safe-area-context') return { SafeAreaView: native.SafeAreaView };
  if (request === 'expo-haptics') return { impactAsync: async () => undefined, notificationAsync: async () => undefined, ImpactFeedbackStyle: { Light: 'light' }, NotificationFeedbackType: { Success: 'success' } };
  if (request === 'expo-image-picker') return { requestMediaLibraryPermissionsAsync: async () => ({ granted: false }), launchImageLibraryAsync: async () => ({ canceled: true, assets: [] }) };
  return originalLoad.call(this, request, parent, isMain);
};

const Onboarding = require('../src/screens/FirstLaunchOnboarding').default;
const { migrateGameSave, GAME_SAVE_VERSION } = require('../src/engine/saveMigration');

const textOf = (renderer) => renderer.root.findAllByType(native.Text).map((node) => String(node.props.children ?? '')).join(' | ');
const findText = (renderer, value) => renderer.root.findAllByType(native.Text).find((node) => textOf({ root: { findAllByType: () => [node] } }) === value || String(node.props.children ?? '').includes(value));

let completed = null;
let renderer;
act(() => {
  renderer = TestRenderer.create(React.createElement(Onboarding, { onComplete: (profile) => { completed = profile; } }));
});
assert.match(textOf(renderer), /Welcome to BuildBoss/);
const input = renderer.root.findByType(native.TextInput);
act(() => input.props.onChangeText('Abhishek Verma'));
const continueButton = renderer.root.findAllByType(native.Pressable).find((node) => String(node.props.children?.props?.children ?? '').includes('Continue'));
assert.ok(continueButton, 'Step 1 Continue button is rendered');
act(() => continueButton.props.onPress());
assert.match(textOf(renderer), /Name Your Company/);
const companyInput = renderer.root.findByType(native.TextInput);
act(() => companyInput.props.onChangeText('Verma Global Group'));
assert.ok(renderer.root.findAllByType(native.Image).length >= 16, 'Company logo choices are rendered');
const secondContinue = renderer.root.findAllByType(native.Pressable).find((node) => String(node.props.children?.props?.children ?? '').includes('Continue'));
act(() => secondContinue.props.onPress());
assert.match(textOf(renderer), /All Set, Founder/);
const finishButton = renderer.root.findAllByType(native.Pressable).find((node) => String(node.props.children?.props?.children ?? '').includes('Enter Your Empire'));
assert.ok(finishButton, 'Final Enter Your Empire button is rendered');
act(() => finishButton.props.onPress());
assert.deepEqual(completed, {
  founderName: 'Abhishek Verma',
  avatarKey: 'founder',
  companyName: 'Verma Global Group',
  logoKey: 'logo-01',
  customLogoUri: null,
});

const legacy = migrateGameSave({ schemaVersion: 14, cash: 2500, retail: { owned: true } });
assert.equal(legacy.schemaVersion, GAME_SAVE_VERSION);
assert.equal(legacy.cash, 2500);
assert.equal(legacy.retail.owned, true);
assert.equal(legacy.onboardingComplete, false);

console.log(JSON.stringify({
  render: 'PASS',
  stepNavigation: 'PASS',
  profilePersistencePayload: completed,
  legacySavePreserved: 'PASS',
  schemaVersion: GAME_SAVE_VERSION,
}, null, 2));
