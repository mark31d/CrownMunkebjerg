// Components/Onboarding.js

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
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
const RAIL_RING  = require('../assets/onb_rail_ring.png');
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

// константы для расчётов
const CARD_BOTTOM_PCT       = 0.045;   // отступ карточки от низа экрана
const CARD_PADDING_VERTICAL = 20;      // paddingVertical в styles.card
const HERO_WIDTH_PCT        = 0.72;    // ширина гида от ширины экрана
const HERO_HEIGHT_PCT       = 0.58;    // высота гида от высоты экрана
const IMAGE_TRIM            = 20;      // убирает прозрачный низ PNG
const GUIDE_EXTRA_DOWN_PX   = 15;      // насколько дополнительно опустить гида вниз
const FAB_PCT               = 0.17;    // диаметр кнопки-стрелки
const ARROW_SHIFT_DOWN_PCT  = 0.05;
const ARROW_EXTRA_UP_PCT    = 0.005;
const ARROW_EXTRA_LEFT_PCT  = 0.02;

export default function Onboarding() {
  const navigation = useNavigation();
  const [screen, setScreen] = useState(Dimensions.get('window'));
  const [cardH, setCardH]   = useState(0);
  const listRef            = useRef(null);
  const [index, setIndex]  = useState(0);

  // слушаем поворот/resize
  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setScreen(window);
      setCardH(0);
    });
    return () => sub?.remove();
  }, []);

  // настройка FlatList-видимости
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });
  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length) setIndex(viewableItems[0].index);
  }, []);

  // рельса + кольцо
  const { scaledW, scaledH, topOffset, ringTop, ringRight } = useMemo(() => {
    const src   = Image.resolveAssetSource(RAIL_RING);
    const imgW  = src.width  || 74;
    const imgH  = src.height || 1000;
    const BLEED = 20;
    const scale = (screen.height + BLEED) / imgH;
    return {
      scaledW:   imgW * scale,
      scaledH:   screen.height + BLEED,
      topOffset: -BLEED / 2,
      ringTop:   -BLEED / 2 + (screen.height + BLEED) * 0.165,
      ringRight: imgW * scale * 0.486,
    };
  }, [screen]);

  // типографика
  const { titleSize, titleLH, bodySize, bodyLH } = useMemo(() => {
    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));
    const t = Math.round(clamp(screen.width * 0.028, 16, 24));
    const b = Math.round(clamp(screen.width * 0.024, 12, 16));
    return {
      titleSize,   titleLH: Math.round(t * 1.28),
      bodySize:    b,       bodyLH:  Math.round(b * 1.40),
    };
  }, [screen]);

  // диаметр FAB
  const FAB_SIZE = Math.round(screen.width * FAB_PCT);

  // переход дальше
  const onNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        {/* Рельса + кольцо */}
        <Image
          source={RAIL_RING}
          style={{
            position: 'absolute',
            right:    0,
            zIndex:   3,
            width:    scaledW,
            height:   scaledH,
            top:      topOffset,
          }}
          resizeMode="contain"
        />

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={it => it.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfig={viewConfig.current}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => {
            // базовый отступ для стека карточка+гид
            const baseBottom = screen.height * CARD_BOTTOM_PCT;
            // низ гида = низ стека + высота карточки - её padding + дополнительное опускание
            const guideBottom = baseBottom + cardH - CARD_PADDING_VERTICAL - GUIDE_EXTRA_DOWN_PX;

            return (
              <View style={{ width: screen.width, height: screen.height }}>
                {/* Карточка (поверх гида) */}
                <View style={[styles.cardWrap, { bottom: baseBottom }]}>
                  <View
                    onLayout={e => {
                      const h = e.nativeEvent.layout.height;
                      if (h > cardH) setCardH(h);
                    }}
                    style={[
                      styles.card,
                      {
                        width:  Math.min(screen.width * 0.84, 520),
                        height: cardH > 0 ? cardH : undefined,
                      },
                    ]}
                  >
                    <Text style={[styles.cardTitle, { fontSize: titleSize, lineHeight: titleLH }]}>
                      {item.title}
                    </Text>
                    {!!item.text && (
                      <Text style={[styles.cardText, { fontSize: bodySize, lineHeight: bodyLH }]}>
                        {item.text}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Гид (с обрезкой PNG) */}
                <View style={[styles.personWrap, { bottom: guideBottom }]}>
                  <Image
                    source={item.img}
                    style={{
                      width:        screen.width * HERO_WIDTH_PCT,
                      height:       screen.height * HERO_HEIGHT_PCT,
                      marginBottom: -IMAGE_TRIM,
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            );
          }}
        />

        {/* Кнопка-стрелка */}
        <Pressable
          onPress={onNext}
          hitSlop={12}
          style={[
            styles.arrowWrap,
            {
              width:        FAB_SIZE,
              height:       FAB_SIZE,
              borderRadius: FAB_SIZE / 2,
              top:    ringTop + screen.height * ARROW_SHIFT_DOWN_PCT - screen.height * ARROW_EXTRA_UP_PCT - FAB_SIZE / 2,
              right:  ringRight + screen.width * ARROW_EXTRA_LEFT_PCT - FAB_SIZE / 2,
            },
          ]}
        >
          <View style={styles.innerCircle} />
          <Image
            source={ARROW_ICON}
            style={{ width: FAB_SIZE * 0.44, height: FAB_SIZE * 0.44 }}
            resizeMode="contain"
          />
        </Pressable>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000' },
  bg:         { flex: 1 },
  personWrap: {
    position:   'absolute',
    left:       0,
    right:      0,
    alignItems: 'center',
    zIndex:     1,  // гид за карточкой
  },
  cardWrap:   {
    position:   'absolute',
    left:       0,
    right:      0,
    alignItems: 'center',
    zIndex:     2,  // карточка поверх гида
  },
  card:       {
    backgroundColor:   'rgba(0,0,0,0.82)',
    borderWidth:       1,
    borderColor:       'rgba(255,255,255,0.22)',
    borderRadius:      12,
    paddingVertical:   CARD_PADDING_VERTICAL,
    paddingHorizontal: 22,
  },
  cardTitle:  {
    color:      '#FFF',
    fontWeight: '800',
    textAlign:  'center',
  },
  cardText:   {
    marginTop: 10,
    color:     '#EDEDED',
    textAlign: 'center',
    opacity:   0.9,
  },
  arrowWrap:  {
    position:   'absolute',
    zIndex:     4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle:{
    position:      'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    borderRadius:  999,
    backgroundColor:'#0D0D0D',
  },
});
