// Components/SavedScreen.js
import React, { useContext, useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Platform,
  Share,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SavedContext } from './SavedContext';

const { width, height } = Dimensions.get('window');

/* ---------- ASSETS ---------- */
const BG             = require('../assets/bg.png');
const ICON_BACK      = require('../assets/ic_back.png');
const ICON_WM        = require('../assets/ic_bookmark.png');          // водяной знак в хедере
const ICON_PINLINE   = require('../assets/ic_location_red.png');
const ICON_MAP       = require('../assets/ic_layers.png');
const ICON_SHARE     = require('../assets/ic_share.png');
const ICON_SAVE      = require('../assets/ic_bookmark_filled.png');          // контур
const ICON_SAVE_FILL = require('../assets/ic_bookmark.png');   // заливка
const ICON_CHEVRON   = require('../assets/ic_chevron.png');

/* ---------- helpers ---------- */
const fmt = (coords) =>
  coords ? `${coords.lat.toFixed(5)}° N, ${coords.lng.toFixed(5)}° E` : '';

export default function SavedScreen() {
  const nav = useNavigation();
  const { saved, toggle } = useContext(SavedContext);

  const items = useMemo(() => Object.values(saved || {}), [saved]);

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* HEADER как в Recommended */}
        <View style={styles.headerWrap}>
          <LinearGradient
            colors={['#E00000', '#7A0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn} hitSlop={12}>
              <Image source={ICON_BACK} style={{ resizeMode: 'contain', width: 28, height: 28 }} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Saved locations</Text>

            <Image source={ICON_WM} style={styles.headerWM} resizeMode="contain" />
          </LinearGradient>
        </View>

        {/* CONTENT */}
        {items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>You don't have any saved locations yet.</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((s, idx) => (
              <SavedCard
                key={s.id || idx}
                spot={s}
                onMap={() => nav.navigate('Map', { focus: s })}
                onShare={async () => {
                  const msg = `${s.title}\n${fmt(s.coords)}\n`;
                  try { await Share.share({ message: msg }); } catch {}
                }}
                onToggle={() => toggle(s)}
              />
            ))}
          </ScrollView>
        )}
      </ImageBackground>
    </View>
  );
}

/* ---------- Card ---------- */
function SavedCard({ spot, onMap, onShare, onToggle }) {
  const [open, setOpen] = useState(false);

  // поворот шеврона как в Recommended
  const rotateVal = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rotateVal, {
      toValue: open ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [open, rotateVal]);
  const rotate = rotateVal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.card}>
      {!!spot.image && (
        <Image
          source={typeof spot.image === 'number' ? spot.image : { uri: spot.image }}
          style={styles.hero}
        />
      )}

      {/* FAB со шевроном */}
      <TouchableOpacity onPress={() => setOpen(v => !v)} activeOpacity={0.9} style={styles.fab}>
        <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabGrad} />
        <Animated.Image source={ICON_CHEVRON} resizeMode="contain" style={[styles.chevron, { transform: [{ rotate }] }]} />
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{spot.title}</Text>

        {spot.coords && (
          <View style={styles.coordRow}>
            <Image source={ICON_PINLINE} style={styles.coordPin} resizeMode="contain" />
            <Text style={styles.coordText}>{fmt(spot.coords)}</Text>
          </View>
        )}

        <View style={styles.redLine} />
        {open && <Text style={styles.desc}>{spot.desc || ''}</Text>}

        {/* Actions — как в Recommended: чёрные иконки, bookmark заполнённый */}
        <View style={styles.actions}>
          <RoundIcon icon={ICON_MAP}   onPress={onMap}   tint="#000" />
          <RoundIcon icon={ICON_SHARE} onPress={onShare} tint="#000" />
          <RoundIcon icon={ICON_SAVE_FILL} onPress={onToggle} tint="#000" />
        </View>
      </View>
    </View>
  );
}

/* ---------- Small round button ---------- */
function RoundIcon({ icon, onPress, tint = '#000' }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.round}>
      <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.roundGrad} />
      <Image source={icon} style={[styles.roundIcon, { tintColor: tint }]} resizeMode="contain" />
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  // Хедер как в Recommended
  headerWrap: { paddingTop: 28, alignItems: 'center' },
  header: {
    width: width * 0.84,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', zIndex: 3 },
  backBtn: { position: 'absolute', left: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerWM: { position: 'absolute', right: 12, width: 64, height: 64, zIndex: 0 },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  emptyText: { color: '#fff', fontSize: 18, textAlign: 'center', opacity: 0.9 },

  list: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },

  // Карточка как spotCard в Recommended
  card: {
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 18,
    overflow: 'hidden',
  },
  hero: { width: '100%', height: 210 },

  fab: {
    position: 'absolute',
    right: 14,
    top: 180,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 22 },
  chevron: { width: 20, height: 20, tintColor: '#fff' },

  body: { padding: 14, paddingBottom: 12 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 8 },

  coordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  coordPin: { width: 18, height: 18, marginRight: 8 },
  coordText: { color: '#fff', fontSize: 15, opacity: 0.95 },

  redLine: { height: 3, width: 140, backgroundColor: '#E00000', borderRadius: 2, marginTop: 4, marginBottom: 10 },
  desc: { color: '#ddd', fontSize: 14, lineHeight: 20, marginBottom: 12 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingTop: 2, paddingRight: 2 },

  round: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  roundGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  roundIcon: { width: 22, height: 22 },
});
