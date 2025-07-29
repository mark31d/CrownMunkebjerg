// Components/MapScreen.js
import React, { useEffect, useMemo, useRef, useState, useContext } from 'react';
import {
  View, Text, Image, StyleSheet, Dimensions, TouchableOpacity,
  Platform, Animated, Share, Linking, StyleSheet as RNStyleSheet,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SavedContext } from './SavedContext';
import VIBE_DETAILS from '../Components/vibeDetails';

const { width, height } = Dimensions.get('window');

/* ---------- ASSETS ---------- */
const ICON_BACK      = require('../assets/ic_back.png');
const ICON_WM        = require('../assets/ic_layers.png');             // водяной в хедере
const ICON_MARKER    = require('../assets/ic_location_red.png');       // пин на карте
const ICON_PINLINE   = require('../assets/ic_location_red.png');       // пин в координатах
const ICON_MAP       = require('../assets/ic_layers.png');             // Map action (чёрный tint)
const ICON_SHARE     = require('../assets/ic_share.png');              // Share action (чёрный tint)
const ICON_SAVE      = require('../assets/ic_bookmark_filled.png');           // Bookmark пустой
const ICON_SAVE_FIL  = require('../assets/ic_bookmark.png');    // Bookmark заполненный
const ICON_CHEVRON   = require('../assets/ic_chevron.png');

/* ---------- HELPERS ---------- */
const fmt = ({ lat, lng }) => `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;
const regionFrom = (lat, lng, km = 3) => ({
  latitude: lat,
  longitude: lng,
  latitudeDelta: km / 111,
  longitudeDelta: (km / 111) * (width / height),
});
const asImageSource = (img) => (typeof img === 'number' ? img : img ? { uri: img } : null);

const buildMarkersFromVibes = () => {
  const out = [];
  Object.entries(VIBE_DETAILS).forEach(([vibeKey, vibe]) => {
    (vibe.items || []).forEach((it, idx) => {
      out.push({
        id: `${vibeKey}:${idx}`,
        title: it.title,
        desc: it.desc,
        coords: { lat: it.lat, lng: it.lng },
        image: it.image,
      });
    });
  });
  return out;
};

export default function MapScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const { saved, toggle } = useContext(SavedContext);

  const cluster = route.params?.cluster || null;
  const focus   = route.params?.focus   || null;

  const allMarkers = useMemo(buildMarkersFromVibes, []);
  const markers    = useMemo(() => (cluster?.length ? cluster : allMarkers), [cluster, allMarkers]);

  /* ---------- bottom sheet state ---------- */
  const [spot, setSpot] = useState(null);
  const [open, setOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false); // чтобы корректно переоткрываться
  const sheetY = useRef(new Animated.Value(height)).current;

  const showSheet = (expand = true) => {
    setSheetVisible(true);
    setOpen(expand);
    Animated.spring(sheetY, {
      toValue: expand ? height * 0.16 : height * 0.34,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  };

  const hideSheet = () => {
    Animated.timing(sheetY, {
      toValue: height,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setSheetVisible(false);
      setOpen(false);
      setSpot(null); // очищаем выбор после закрытия
    });
  };

  /* ---------- старт: как на макете — выбранный пункт + полуоткрытый ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      const first = focus || cluster?.[0] || markers[0];
      if (first?.coords) {
        setSpot(first);
        setSheetVisible(true);
        mapRef.current?.animateToRegion(regionFrom(first.coords.lat, first.coords.lng, 1.6), 600);
        showSheet(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [markers.length]);

  /* ---------- actions ---------- */
  const onShare = async () => {
    if (!spot?.title || !spot?.coords) return;
    try { await Share.share({ message: `${spot.title}\n${fmt(spot.coords)}\n` }); } catch {}
  };

  const onSave = () => spot && toggle(spot);

  const openInMaps = () => {
    if (!spot?.coords) return;
    const q = `${spot.coords.lat},${spot.coords.lng}`;
    const url = Platform.select({
      ios:     `http://maps.apple.com/?q=${q}&ll=${q}`,
      android: `geo:${q}?q=${q}(${encodeURIComponent(spot.title || 'Place')})`,
    });
    url && Linking.openURL(url).catch(() => {});
  };

  /* ---------- chevron rotation ---------- */
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rot, { toValue: open ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [open]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  /* ==================== RENDER ==================== */
  return (
    <View style={styles.root}>
      {/* MAPKIT (iOS) */}
      {Platform.OS === 'ios' ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_DEFAULT}
          style={RNStyleSheet.absoluteFill}
          onPress={() => sheetVisible && hideSheet()}
          showsPointsOfInterest={false}
          showsCompass
          pitchEnabled
          rotateEnabled
        >
          {markers.map((m, idx) => (
            <Marker
              key={m.id || `${m.title}-${m.coords?.lat}-${idx}`}
              coordinate={{ latitude: m.coords.lat, longitude: m.coords.lng }}
              onPress={() => {
                setSpot(m);
                setSheetVisible(true);
                showSheet(false);
              }}
              tracksViewChanges={false}
            >
              {/* пин с contain */}
              <Image source={ICON_MARKER} style={styles.pinIcon} />
              {/* callout: тап — раскрыть */}
              <Callout tooltip onPress={() => { setSpot(m); showSheet(true); }}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>{m.title}</Text>
                  <Text style={styles.calloutCoords}>{fmt(m.coords)}</Text>
                  <Text style={styles.calloutHint}>Tap for details</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        // простой fallback на Android без Google
        <View style={[RNStyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', opacity: 0.9 }}>
            MapKit доступен только на iOS. Открыть локацию во внешнем приложении?
          </Text>
          <TouchableOpacity onPress={openInMaps} activeOpacity={0.9} style={{ marginTop: 16 }}>
            <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 20, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Open in Maps</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* HEADER в стиле Recommended */}
      <View style={styles.headerWrap}>
        <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity onPress={nav.goBack} style={styles.backBtn} hitSlop={12}>
            <Image source={ICON_BACK} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interactive map</Text>
          <Image source={ICON_WM} style={styles.headerWM} resizeMode="contain" />
        </LinearGradient>
      </View>

      {/* КАРТОЧКА как в Recommendations */}
      {sheetVisible && spot && (
        <Animated.View style={[styles.card, { transform: [{ translateY: sheetY }] }]}>
          {/* Закрыть */}
          <TouchableOpacity style={styles.close} onPress={hideSheet}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>✕</Text>
          </TouchableOpacity>

          {/* Фото */}
          {asImageSource(spot.image) && <Image source={asImageSource(spot.image)} style={styles.hero} />}

          {/* FAB с шевроном */}
          <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => showSheet(!open)}>
            <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabGrad}/>
            <Animated.Image source={ICON_CHEVRON} style={[styles.chevron, { transform: [{ rotate }] }]} resizeMode="contain" />
          </TouchableOpacity>

          {/* Контент */}
          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={2}>{spot.title}</Text>

            {spot.coords && (
              <View style={styles.coordRow}>
                <Image source={ICON_PINLINE} style={styles.coordPin} resizeMode="contain" />
                <Text style={styles.coordText}>{fmt(spot.coords)}</Text>
              </View>
            )}

            <View style={styles.redLine} />

            {open && (
              <>
                <Text style={styles.desc}>{spot.desc || ''}</Text>
                <View style={styles.actions}>
                  <Round icon={ICON_MAP}      onPress={openInMaps} />
                  <Round icon={ICON_SHARE}    onPress={onShare} />
                  <Round icon={saved[spot.id] ? ICON_SAVE_FIL : ICON_SAVE} onPress={onSave} />
                </View>
              </>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

/* Круглая кнопка с чёрными иконками (как в Recommended) */
function Round({ icon, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.round}>
      <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.roundGrad}/>
      <Image source={icon} style={styles.roundIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */
const CARD_RADIUS = 16;
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  /* header */
  headerWrap: { position: 'absolute', top: 28, left: 0, right: 0, alignItems: 'center' },
  header:     { width: width * 0.84, height: 72, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ color: '#fff', fontSize: 18, fontWeight: '800', zIndex: 3 },
  backBtn:    { position: 'absolute', left: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerWM:   { position: 'absolute', right: 12, width: 64, height: 64, zIndex: 0 },

  /* pin */
  pinIcon: { width: 36, height: 36, resizeMode: 'contain' },

  /* callout */
  callout: {
    minWidth: 180,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  calloutTitle:  { color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  calloutCoords: { color: '#ddd', fontSize: 12, marginBottom: 6 },
  calloutHint:   { color: '#E0E0E0', fontSize: 11, opacity: 0.9 },

  /* card like SpotCard */
  card: {
    position:'absolute', left:12, right:12, top:0,
    backgroundColor:'rgba(0,0,0,0.68)',
    borderRadius: CARD_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  hero: { width:'100%', height:210 },

  fab: {
    position:'absolute', right:14, top:180,
    width:48, height:48, borderRadius:24,
    alignItems:'center', justifyContent:'center', overflow:'hidden'
  },
  fabGrad: { ...StyleSheet.absoluteFillObject, borderRadius:24 },
  chevron: { width:20, height:20, tintColor:'#fff' },

  close:   { position:'absolute', right:14, top:12, zIndex:10, width:36, height:36, borderRadius:18,
             backgroundColor:'rgba(0,0,0,0.55)', alignItems:'center', justifyContent:'center' },

  body:    { padding:14, paddingBottom:12 },
  title:   { color:'#fff', fontSize:18, fontWeight:'800', marginBottom:8 },

  coordRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  coordPin:{ width:18, height:18, marginRight:8 },
  coordText:{ color:'#fff', fontSize:15, opacity:0.95 },

  redLine: { height:3, width:140, backgroundColor:'#E00000', borderRadius:2, marginTop:4, marginBottom:10 },
  desc:    { color:'#ddd', fontSize:14, lineHeight:20, marginBottom:12 },

  actions: { flexDirection:'row', justifyContent:'flex-end', gap:16, paddingTop:2, paddingRight:2 },
  round:   { width:48, height:48, borderRadius:24, overflow:'hidden', alignItems:'center', justifyContent:'center' },
  roundGrad:{ ...StyleSheet.absoluteFillObject, borderRadius:24 },
  roundIcon:{ width:22, height:22, tintColor:'#000' }, // чёрные иконки
});
