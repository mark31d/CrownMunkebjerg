// Components/HomeScreen.js
import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,            // ← прокрутка
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

/* ------- ASSETS ------- */
const BG    = require('../assets/bg.png');
const LOGO  = require('../assets/krown_logo.png');

const ICON_PIN      = require('../assets/ic_pin.png');
const ICON_LAYERS   = require('../assets/ic_layers.png');
const ICON_BOOKMARK = require('../assets/ic_bookmark.png');
const ICON_INFO     = require('../assets/ic_info.png');
const ICON_SETTINGS = require('../assets/ic_settings.png');
const ICON_ARROW    = require('../assets/ic_arrow_white.png'); // белая стрелка

/* ------- UI CONSTS ------- */
const BTN_H = 76;
const BTN_RADIUS = 20;
const BTN_GAP_V = 16;
const PAD_X = 22;

// размеры правых элементов
const ARROW_D = 38;               // диаметр кружка (чуть больше)
const ARROW_RIGHT = 14;           // отступ от правого края
const GHOST_SIZE = 48;            // размер «водяного» значка
const GHOST_GAP_FROM_ARROW = 12;  // расстояние между кружком и значком

/* ------- Кнопка ------- */
function AppButton({ text, icon, onPress }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.btnWrap}>
      <LinearGradient
        colors={['#FF0000', '#620303']} // требуемый градиент
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.btn}
      >
        {/* «водяной» значок — полностью виден, темнее и под стрелкой по zIndex */}
        <Image
          source={icon}
          style={styles.btnGhostIcon}
          resizeMode="contain"
        />

        <Text style={styles.btnText}>{text}</Text>

        {/* Кружок со стрелкой */}
        <View style={styles.btnArrowWrap}>
          <Image source={ICON_ARROW} style={styles.btnArrowIcon} resizeMode="contain" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ------- Экран ------- */
export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Шапка */}
          <View style={styles.header}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>GoMunkebjerg</Text>
          </View>

          {/* Кнопки */}
          <View style={styles.buttons}>
            <AppButton
              text="Recommended places"
              icon={ICON_PIN}
              onPress={() => navigation.navigate('Recommended')}
            />
            <AppButton
              text="Interactive map"
              icon={ICON_LAYERS}
              onPress={() => navigation.navigate('Map')}
            />
            <AppButton
              text="Saved locations"
              icon={ICON_BOOKMARK}
              onPress={() => navigation.navigate('Saved')}
            />
            <AppButton
              text="About Munkebjerg"
              icon={ICON_INFO}
              onPress={() => navigation.navigate('About')}
            />
            <AppButton
              text="Settings"
              icon={ICON_SETTINGS}
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

/* ------- Стили ------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },

  scrollContent: {
    paddingBottom: 28,                 // запас, чтобы видеть стрелку
    minHeight: height + 40,            // побуждает к скроллу на маленьких экранах
  },

  /* header */
  header: {
    alignItems: 'center',
    paddingTop: Platform.select({ ios: 8, android: 16 }),
    paddingBottom: 8,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.42,
    marginTop: height * 0.001,
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF',
  },

  /* buttons group */
  buttons: {
    marginTop: 22,
    paddingHorizontal: 15,
  },

  /* button */
  btnWrap: {
    marginBottom: BTN_GAP_V,
    borderRadius: BTN_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.28,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 6 },
    }),
  },
  btn: {
    height: BTN_H,
    borderRadius: BTN_RADIUS,
    paddingHorizontal: PAD_X,
    justifyContent: 'center',
  },
  btnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },

  // «водяной» значок справа — более чёрный и полностью виден
  btnGhostIcon: {
    position: 'absolute',
    right: ARROW_RIGHT + ARROW_D + GHOST_GAP_FROM_ARROW, // левее кружка
    width: GHOST_SIZE,
    height: GHOST_SIZE,
  
    
    zIndex: 1,
   
  },

  // круг со стрелкой
  btnArrowWrap: {
    position: 'absolute',
    right: ARROW_RIGHT,
    
    marginTop: -ARROW_D / 2,
    width: ARROW_D,
    height: ARROW_D,
    borderRadius: ARROW_D / 2,
    
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // поверх «водяного» значка
  },
  btnArrowIcon: {
    left:-40,
    top:10,
    width: 20,      // стрелка чуть крупнее
    height: ARROW_D * 0.54,
  },
});
