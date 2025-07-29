// Components/PlaceDetails.js
import React, { useMemo, useContext } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SavedContext } from './SavedContext';

const { width, height } = Dimensions.get('window');

/* -------- ASSETS -------- */
const BG            = require('../assets/bg.png');                // если фон у вас jpg — верните .jpg
const ICON_BACK     = require('../assets/ic_back.png');
const ICON_PIN      = require('../assets/ic_location_red.png');
const ICON_MAP      = require('../assets/ic_layers.png');
const ICON_SHARE    = require('../assets/ic_share.png');
const ICON_SAVE     = require('../assets/ic_bookmark.png');

/* Хиро для каждого вайба (PNG) */
const HERO = {
  party:   require('../assets/vibe_party.png'),
  outdoor: require('../assets/vibe_outdoor.png'),
  play:    require('../assets/vibe_sport.png'),
  relax:   require('../assets/vibe_relax.png'),
};

/* Картинки для каждой локации (PNG) */
const ITEM_IMG = {
  party: {
    lobby:    require('../assets/party_lobby.png'),
    wine:     require('../assets/party_wine.png'),
    terrace:  require('../assets/party_terrace.png'),
  },
  outdoor: {
    stairs:   require('../assets/outdoor_stairs.png'),
    forest:   require('../assets/outdoor_forest.png'),
    strands:  require('../assets/outdoor_strandskov.png'),
  },
  play: {
    golf:     require('../assets/play_golf.png'),
    krolf:    require('../assets/play_krolf.png'),
    tennis:   require('../assets/play_tennis.png'),
  },
  relax: {
    spa:      require('../assets/relax_spa.png'),
    massage:  require('../assets/relax_massage.png'),
    yoga:     require('../assets/relax_yoga.png'),
  },
};

/* -------- ДАННЫЕ -------- */
const VIBE_DETAILS = {
  party: {
    title: '🎉 Party & Chill Vibe',
    intro: 'For parties, quiet conversations and an atmospheric vibe.',
    items: [
      { key: 'lobby',   title: 'Lobby Bar & Lounge',             desc: 'An elegant place with signature cocktails, jazz and a view of the forest.', lat: 55.68760, lng: 9.61365, image: ITEM_IMG.party.lobby },
      { key: 'wine',    title: 'Wine Hour (15:00–17:00)',        desc: 'Wine tasting with light snacks in a relaxed atmosphere.',                  lat: 55.68760, lng: 9.61360, image: ITEM_IMG.party.wine },
      { key: 'terrace', title: 'Panorama Restaurant Terrace',     desc: 'Wine, sunset and a view of the fjord - for romance and silence.',        lat: 55.68750, lng: 9.61360, image: ITEM_IMG.party.terrace },
    ],
  },
  outdoor: {
    title: '🚴 Outdoor Adventure Vibe',
    intro: 'For those looking for nature, activity and views.',
    items: [
      { key: 'stairs',  title: 'Munkebjerg Stairs (218 steps)',   desc: 'An iconic climb with a view of the fjord - test yourself!',               lat: 55.68770, lng: 9.61330, image: ITEM_IMG.outdoor.stairs },
      { key: 'forest',  title: 'Munkebjergskoven (forest trails)',desc: 'Dense forest with routes for running, cycling and walking.',              lat: 55.68765, lng: 9.61360, image: ITEM_IMG.outdoor.forest },
      { key: 'strands', title: 'Natura 2000 – Strandskov',        desc: 'Protected area with rare flora and bird watching.',                       lat: 55.68917, lng: 9.62611, image: ITEM_IMG.outdoor.strands },
    ],
  },
  play: {
    title: '🏌️‍♂️ Play & Compete Vibe',
    intro: 'Fun, sport and a bit of competition - for companies.',
    items: [
      { key: 'golf',    title: 'Vejle Golf Club (27 holes)',      desc: 'Professional course in the middle of the forest - for both playing and taking photos.', lat: 55.67670, lng: 9.60936, image: ITEM_IMG.play.golf },
      { key: 'krolf',   title: 'Krolf Golf (fun version)',        desc: 'Easy, fun outdoor game - no skills required.',                           lat: 55.68750, lng: 9.61370, image: ITEM_IMG.play.krolf },
      { key: 'tennis',  title: 'Tennis court (grass)',            desc: 'Classic outdoor tennis. Suitable even for beginners.',                   lat: 55.68755, lng: 9.61390, image: ITEM_IMG.play.tennis },
    ],
  },
  relax: {
    title: '🧘‍♀️ Relax & Recharge Vibe',
    intro: 'Silence, recovery and self-care.',
    items: [
      { key: 'spa',     title: 'Spa area (pool, sauna, jacuzzi)', desc: 'Deep relaxation with a view of the forest.',                              lat: 55.68770, lng: 9.61370, image: ITEM_IMG.relax.spa },
      { key: 'massage', title: 'Massage rooms',                   desc: 'Hot Stone, aromatherapy and other amenities.',                           lat: 55.68765, lng: 9.61365, image: ITEM_IMG.relax.massage },
      { key: 'yoga',    title: 'Yoga/meditation lawn',            desc: 'Nature, silence and air - for body and mind.',                           lat: 55.68800, lng: 9.61700, image: ITEM_IMG.relax.yoga },
    ],
  },
};

/* -------- УТИЛЫ -------- */
const fmt = (lat, lng) => `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;

export default function PlaceDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { toggle, saved } = useContext(SavedContext);

  const vibeKey = route.params?.vibeKey || 'outdoor';
  const data = useMemo(() => VIBE_DETAILS[vibeKey] || VIBE_DETAILS.outdoor, [vibeKey]);

  const onShare = async () => {
    const body =
      `${data.title}\n${data.intro}\n\n` +
      data.items.map(i => `• ${i.title}\n  ${i.desc}\n  📍 ${fmt(i.lat, i.lng)}`).join('\n\n');
    try { await Share.share({ message: body }); } catch {}
  };

  const onMapAll = () => {
    navigation.navigate('Map', {
      cluster: data.items.map(i => ({ title: i.title, coords: { lat: i.lat, lng: i.lng } })),
    });
  };

  const onSave = () => {
    const id = `vibe:${vibeKey}`;
    toggle({
      id,
      title: data.title,
      image: Image.resolveAssetSource(HERO[vibeKey])?.uri,
      coordsText: `${data.items.length} locations`,
      tags: ['vibe'],
    });
  };

  const isSaved = !!saved[`vibe:${vibeKey}`];

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* HEADER */}
        <View style={styles.headerWrap}>
          <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              {ICON_BACK ? (
                <Image source={ICON_BACK} style={{ width: 18, height: 18, tintColor: '#fff' }} />
              ) : (
                <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recommended places</Text>
            <Image source={ICON_PIN} style={styles.headerWM} resizeMode="contain" />
          </LinearGradient>
        </View>

        {/* CONTENT */}
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Хиро вайба */}
            <Image source={HERO[vibeKey]} style={styles.hero} />

            <View style={{ padding: 16 }}>
              <Text style={styles.vibeTitle}>{data.title}</Text>
              <Text style={styles.vibeIntro}>{data.intro}</Text>

              {/* Локации с их PNG */}
              {data.items.map((it) => (
                <View key={it.key} style={styles.item}>
                  {!!it.image && <Image source={it.image} style={styles.itemImg} />}
                  <Text style={styles.itemTitle}>{it.title}</Text>
                  <Text style={styles.itemDesc}>{it.desc}</Text>

                  <View style={styles.coordRow}>
                    <Image source={ICON_PIN} style={styles.coordPin} resizeMode="contain" />
                    <Text style={styles.coordText}>{fmt(it.lat, it.lng)}</Text>
                  </View>

                  <View style={styles.redLine} />
                </View>
              ))}

              <View style={styles.actions}>
                <Round onPress={onMapAll}  icon={ICON_MAP} />
                <Round onPress={onShare}   icon={ICON_SHARE} />
                <Round onPress={onSave}    icon={ICON_SAVE} dimmed={isSaved ? 1 : 0} />
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

/* ------- Круглая кнопка ------- */
function Round({ onPress, icon, dimmed }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.round}>
      <LinearGradient colors={['#E00000', '#7A0000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.roundGrad} />
      <Image source={icon} style={[styles.roundIcon, dimmed ? { opacity: 1 } : null]} resizeMode="contain" />
    </TouchableOpacity>
  );
}

/* -------- STYLES -------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  headerWrap: { paddingTop: 14, alignItems: 'center' },
  header: { width: width * 0.84, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  backBtn: { position: 'absolute', left: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  headerWM: {
    position: 'absolute', right: 12, width: 34, height: 34, opacity: 0.22, tintColor: '#000',
    ...(Platform.OS === 'ios' ? { blurRadius: 6 } : null),
  },

  scroll: { flex: 1, paddingHorizontal: 12, paddingTop: 12 },

  card: {
    borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.68)',
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.15)',
  },
  hero: { width: '100%', height: 220 },

  vibeTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  vibeIntro: { color: '#ddd', fontSize: 14, marginBottom: 10 },

  item: { marginTop: 10, marginBottom: 12 },
  itemImg: { width: '100%', height: 160, borderRadius: 12, marginBottom: 8, overflow: 'hidden' },
  itemTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  itemDesc: { color: '#ddd', fontSize: 14, lineHeight: 20 },

  coordRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  coordPin: { width: 16, height: 16, marginRight: 8 },
  coordText: { color: '#fff', fontSize: 14, opacity: 0.95 },

  redLine: { height: 3, width: 160, backgroundColor: '#E00000', borderRadius: 2, marginTop: 8 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingTop: 14 },
  round: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  roundGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  roundIcon: { width: 22, height: 22, tintColor: '#fff' },
});
