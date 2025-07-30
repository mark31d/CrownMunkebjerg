// Components/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from './SettingsContext';

const { width, height } = Dimensions.get('window');

/* ---- assets (PNG) ---- */
const BG         = require('../assets/bg.png');
const ICON_BACK  = require('../assets/ic_back.png');
const ICON_WM    = require('../assets/ic_settings.png');
const ICON_CHEVR = require('../assets/ic_chevron.png');

const MENU   = [3, 5, 10, 'All'];
const CARD_W = width * 0.84;

export default function SettingsScreen() {
  const nav = useNavigation();
  const { categoriesOn, setCategoriesOn, showLimit, setShowLimit } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentLabel =
    showLimit === 'all' || showLimit === 'All' ? 'All' : String(showLimit);

  const onPick = (v) => {
    setShowLimit(v === 'All' ? 'all' : v);
    setMenuOpen(false);
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* HEADER */}
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={['#E00000', '#7A0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn} hitSlop={12}>
              <Image source={ICON_BACK} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <Image source={ICON_WM} style={styles.headerWM} resizeMode="contain" />
          </LinearGradient>
        </View>

        {/* CARD */}
        <View style={styles.card}>
          {/* Categories */}
          <View style={styles.row}>
            <Text style={styles.label}>Categories:</Text>
            <View style={styles.segment}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setCategoriesOn(true)}
                style={[styles.segPart, categoriesOn && styles.segActive]}
              >
                <Text style={[styles.segText, categoriesOn && styles.segTextActive]}>On</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setCategoriesOn(false)}
                style={[styles.segPart, !categoriesOn && styles.segActive]}
              >
                <Text style={[styles.segText, !categoriesOn && styles.segTextActive]}>Off</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Show locations */}
          <View style={[styles.row, { marginTop: 26 }]}>
            <Text style={styles.label}>Show locations:</Text>
            <View style={styles.select}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setMenuOpen((v) => !v)}
                style={styles.selectInner}
              >
                <Text style={styles.selectText}>{currentLabel}</Text>
                <Image source={ICON_CHEVR} style={styles.chevr} resizeMode="contain" />
              </TouchableOpacity>
              {menuOpen && (
                <View style={styles.menu}>
                  {MENU.map((opt) => {
                    const isActive =
                      (opt === 'All' && (showLimit === 'all' || showLimit === 'All')) ||
                      opt === showLimit;
                    return (
                      <TouchableOpacity
                        key={String(opt)}
                        activeOpacity={0.8}
                        onPress={() => onPick(opt)}
                        style={[styles.menuItem, isActive && styles.menuItemActive]}
                      >
                        <Text style={[styles.menuText, isActive && styles.menuTextActive]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000' },
  bg:         { flex: 1 },
  headerWrap: { paddingTop: 28, alignItems: 'center' },
  header:     {
    width: CARD_W, height: 72, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',marginTop:30,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', zIndex: 3 },
  backBtn:    { position: 'absolute', left: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerWM:   { position: 'absolute', right: 12, width: 64, height: 64, zIndex: 0 },

  card: {
    width: CARD_W, alignSelf: 'center',
    marginTop: height * 0.16,
    borderRadius: 18, paddingVertical: 24, paddingHorizontal: 22,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },

  // РОВНАЯ СТРОКА: только текст + пилы/селект
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',      // baseline вместо center
    justifyContent: 'space-between',
  },
  label: { color: '#fff', fontSize: 20, fontWeight: '800' },

  // Segment (Categories)
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  segPart: {
    minWidth: 72, height: 36,
    paddingHorizontal: 12, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  segActive:      { backgroundColor: '#E00000' },
  segText:        { color: '#ddd', fontSize: 14, fontWeight: '700' },
  segTextActive:  { color: '#fff' },

  // Select (Show locations)
  select:     { alignItems: 'flex-end' },
  selectInner:{
    minWidth: 86, height: 36, borderRadius: 18,
    paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  chevr:      {
    width: 12, height: 12, marginLeft: 8,
    tintColor: '#E00000', transform: [{ rotate: '180deg' }],
  },

  // Dropdown menu
  menu: {
    position: 'absolute', top: 44, right: 0,
    width: 160, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  menuItem:       { paddingVertical: 12, paddingHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.12)' },
  menuItemActive: { backgroundColor: 'rgba(224,0,0,0.25)', borderLeftWidth: 3, borderLeftColor: '#E00000' },
  menuText:       { color: '#fff', fontSize: 16 },
  menuTextActive: { fontWeight: '800' },
});
