// Components/Onboarding.js
import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BG         = require('../assets/bg.png');
const HOST_1     = require('../assets/host1.png');
const HOST_2     = require('../assets/host2.png');
const RAIL_RING  = require('../assets/onb_rail_ring.png'); // рельса + красное кольцо (одно PNG)
const ARROW_ICON = require('../assets/ic_arrow_white.png');

const SLIDES = [
  {
    key: '1',
    img: HOST_1,
    title:
      'Hi, My name is Gregor and I will discover the best of Munkebjerg for you - quiet forests, fjords, trails and entertainment.',
    text:
      'I have collected the most atmospheric places for you to make your adventure unforgettable.',
  },
  {
    key: '2',
    img: HOST_2,
    title: 'Choose. Explore. Save.',
    text:
      'Recommended places - only the most interesting\n' +
      'Interactive map - find everything nearby\n' +
      'Saved locations - your personal list\n' +
      'About Munkebjerg - a brief history and features',
  },
];

/* --- ПАРАМЕТРЫ PNG рельсы/кольца (проценты относительно самого PNG) --- */
const RING_CENTER_TOP_PCT_OF_IMG   = 0.165;
const RING_CENTER_RIGHT_PCT_OF_IMG = 0.486;

/* --- КНОПКА-СТРЕЛКА --- */
const FAB_INNER_D_PCT_OF_W = 0.17;           // диаметр круга от ширины экрана
const ARROW_SHIFT_DOWN_PCT_OF_SCREEN = 0.05; // базовый сдвиг ниже центра кольца
const ARROW_EXTRA_UP_PCT    = 0.005;         // дополнительный подъём стрелки
const ARROW_EXTRA_LEFT_PCT  = 0.02;          // дополнительный сдвиг стрелки влево

/* --- ГИД и карточка --- */
const HERO_WIDTH_PCT   = 0.72;
const HERO_HEIGHT_PCT  = 0.58;
const PERSON_BOTTOM_PAD_PCT = 0.346; // гид выше
const CARD_BOTTOM_PCT  = 0.045;      // карточка чуть ниже

/* helper */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function Onboarding() {
  const nav = useNavigation();

  const [screen, setScreen] = useState(Dimensions.get('window'));
  const [cardH, setCardH]   = useState(0); // фиксированная высота карточки (макс. среди слайдов)

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
      setCardH(0); // пересчёт при смене ориентации/размера экрана
    });
    return () => sub?.remove?.();
  }, []);

  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      nav.replace('Home');
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length) setIndex(viewableItems[0].index ?? 0);
  }).current;
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  /* ---------- РАСЧЁТ РЕЛЬСЫ БЕЗ ИСКАЖЕНИЙ (масштаб по высоте экрана) ---------- */
  const railMetrics = useMemo(() => {
    const src   = Image.resolveAssetSource(RAIL_RING);
    const imgW  = src.width  || 74;
    const imgH  = src.height || 1000;
    const BLEED = 20; // запас по высоте, чтобы верх/низ не «резались»

    const scale     = (screen.height + BLEED) / imgH;
    const scaledH   = screen.height + BLEED;
    const scaledW   = imgW * scale;
    const topOffset = -BLEED / 2;

    // координаты центра кольца (в координатах ЭКРАНА)
    const ringTop   = topOffset + scaledH * RING_CENTER_TOP_PCT_OF_IMG;
    const ringRight = scaledW  * RING_CENTER_RIGHT_PCT_OF_IMG;

    const arrowShift = screen.height * ARROW_SHIFT_DOWN_PCT_OF_SCREEN;

    return { scaledW, scaledH, topOffset, ringTop, ringRight, arrowShift };
  }, [screen.height, screen.width]);

  /* ---------- АДАПТИВНАЯ ТИПОГРАФИКА (МЕНЬШЕ) ---------- */
  const typo = useMemo(() => {
    const title   = Math.round(clamp(screen.width * 0.048, 16, 24));
    const titleLH = Math.round(title * 1.28);
    const body    = Math.round(clamp(screen.width * 0.024, 12, 16));
    const bodyLH  = Math.round(body * 1.40);
    return { title, titleLH, body, bodyLH };
  }, [screen.width]);

  /* ---------- КАРТОЧКА: ширина и отступы ---------- */
  const CARD_W     = Math.min(screen.width * 0.84, 520);
  const CARD_RAD   = 12;
  const CARD_PAD_V = 20;
  const CARD_PAD_H = 22;

  const FAB_INNER_D = Math.round(screen.width * FAB_INNER_D_PCT_OF_W);

  // Обработчик измерения высоты карточки — берём максимум среди слайдов
  const onCardLayout = (e) => {
    const h = Math.round(e.nativeEvent.layout.height);
    if (h > 0) {
      setCardH((prev) => (prev >= h ? prev : h));
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* РЕЛЬСА + КОЛЬЦО справа без искажений */}
        <Image
          source={RAIL_RING}
          style={[
            styles.railRing,
            { width: railMetrics.scaledW, height: railMetrics.scaledH, top: railMetrics.topOffset },
          ]}
          resizeMode="contain"
        />

        {/* СЛАЙДЫ */}
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(it) => it.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef.current}
          renderItem={({ item }) => (
            <View style={{ width: screen.width, height: screen.height }}>
              {/* ГИД — меньше и выше */}
              <View
                style={[
                  styles.personWrap,
                  { paddingBottom: screen.height * PERSON_BOTTOM_PAD_PCT },
                ]}
              >
                <Image
                  source={item.img}
                  style={{
                    width:  screen.width  * HERO_WIDTH_PCT,
                    height: screen.height * HERO_HEIGHT_PCT,
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* Карточка под гидом — фиксируем единую высоту через cardH */}
              <View style={[styles.cardWrap, { bottom: screen.height * CARD_BOTTOM_PCT }]}>
                <View
                  onLayout={onCardLayout}
                  style={[
                    styles.card,
                    {
                      width: CARD_W,
                      borderRadius: CARD_RAD,
                      paddingVertical: CARD_PAD_V,
                      paddingHorizontal: CARD_PAD_H,
                      // Если cardH уже измерен, задаём одинаковую высоту всем карточкам
                      height: cardH > 0 ? cardH : undefined,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { fontSize: typo.title, lineHeight: typo.titleLH }]}>
                    {item.title}
                  </Text>
                  {!!item.text && (
                    <Text style={[styles.cardText, { fontSize: typo.body, lineHeight: typo.bodyLH }]}>
                      {item.text}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        />

        {/* КНОПКА СО СТРЕЛКОЙ — чуть выше и левее центра кольца */}
        <Pressable
          onPress={onNext}
          style={[
            styles.ringTouch,
            {
              top:
                railMetrics.ringTop +
                railMetrics.arrowShift -
                screen.height * ARROW_EXTRA_UP_PCT -
                FAB_INNER_D / 2,
              right:
                railMetrics.ringRight +
                screen.width * ARROW_EXTRA_LEFT_PCT -
                FAB_INNER_D / 2,
              width: FAB_INNER_D,
              height: FAB_INNER_D,
              borderRadius: FAB_INNER_D / 2,
            },
          ]}
          hitSlop={12}
        >
          <View style={styles.ringInner} />
          <Image
            source={ARROW_ICON}
            style={{ width: FAB_INNER_D * 0.44, height: FAB_INNER_D * 0.44 }}
            resizeMode="contain"
          />
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg:   { flex: 1 },

  // рельса поверх фона
  railRing: { position: 'absolute', right: 0, zIndex: 3 },

  // гид выше карточки
  personWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 2,
  },

  // карточка под гидом
  cardWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  cardTitle: {
    color: '#FFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  cardText: {
    marginTop: 10,
    color: '#EDEDED',
    textAlign: 'center',
    opacity: 0.9,
  },

  // активная область стрелки
  ringTouch: {
    position: 'absolute',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    borderRadius: 999,
    backgroundColor: '#0D0D0D',
  },
});
