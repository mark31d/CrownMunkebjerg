// Components/AboutScreen.js
import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* ---- ASSETS ---- */
const BG         = require('../assets/bg.png');
const ICON_BACK  = require('../assets/ic_back.png');
const ICON_WM    = require('../assets/ic_pin.png');     // водяной знак в хедере
const ICON_SHARE = require('../assets/ic_share.png');   // иконка на кнопке Share

/* ---- TEXT ---- */
const ABOUT_TEXT = `Munkebjerg is located on a picturesque hill amidst dense forests overlooking the Vejle Fjord. The area is known for its natural beauty, exclusive hotels, hiking trails and spas. The word “Munkebjerg” translates as “Monk’s Hill”, which hints at the ancient historical atmosphere.

It is an ideal destination for:
• nature holidays
• hiking
• recuperation
• peaceful relaxation with views

Interesting facts about Munkebjerg:

1. One of the steepest climbs in Denmark
Munkebjerg is famous for its sharp serpentine - this hill hosts the Hill Climb competition every year, where classic cars compete in the climb up.

2. Landscapes like in Norway
The fjords visible from Munkebjerg are often compared to Norwegian ones, although this is central Denmark. Many guests do not expect such a “mountainous” landscape in this part of the country.

3. Unique forest - Munkebjergskoven
A mix of deciduous and coniferous trees grows here, there are many wild animals, mushrooms, and at night you can hear owls.

4. Historic hotel on the top
The Munkebjerg Hotel was opened in the 1880s and is still considered an elite place. Politicians, artists and even members of the royal family often relax here.

5. Danish tradition "krolf"
Krolf is played on the hotel grounds - a hybrid of golf and croquet. This is a very Danish style of vacation, almost unknown to anyone outside the country.`;

export default function AboutScreen() {
  const nav = useNavigation();

  const onShare = async () => {
    try { await Share.share({ message: ABOUT_TEXT }); } catch {}
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* HEADER (как на других экранах) */}
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
            <Text style={styles.headerTitle}>About Munkebjerg</Text>
            <Image source={ICON_WM} style={styles.headerWM} resizeMode="contain" />
          </LinearGradient>
        </View>

        {/* CONTENT */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.text}>{ABOUT_TEXT}</Text>
          <TouchableOpacity onPress={onShare} activeOpacity={0.9} style={styles.shareBtn}>
          <LinearGradient
            colors={['#E00000', '#7A0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareGrad}
          />
          <Image source={ICON_SHARE} style={styles.shareIcon} resizeMode="contain" />
        </TouchableOpacity>
        </ScrollView>

        {/* SHARE — по центру внизу */}
      
      </ImageBackground>
    </View>
  );
}

/* ---- STYLES ---- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  // header как в Recommended / Map
  headerWrap: { paddingTop: 28, alignItems: 'center' },
  header: {
    width: width * 0.84,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:30,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', zIndex: 3 },
  backBtn: {
    position: 'absolute',
    left: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerWM: {
    position: 'absolute',
    right: 12,
    width: 64,
    height: 64,
    zIndex: 0,
  },

  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },

  text: {
    color: '#fff',
    opacity: 0.96,
    fontSize: 14.5,
    lineHeight: 22,
  },

  // SHARE bottom-center
  shareBtn: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: Platform.select({ ios: 24, android: 24 }),
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareGrad: { ...StyleSheet.absoluteFillObject, borderRadius: 34 },
  shareIcon: { width: 28, height: 28, tintColor: '#000' },
});
