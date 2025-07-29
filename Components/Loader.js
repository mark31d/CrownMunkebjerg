// Components/Loader.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BG   = require('../assets/bg.png');
const LOGO = require('../assets/logo.png');

/** Время до перехода на онбординг */
const NAV_DELAY_MS = 2600;

/** Настройки мягкой анимации */
const DURATION_MS   = 900;                           // «вдох/выдох»
const EASE          = Easing.inOut(Easing.cubic);
const STAGGER_MS    = 150;                           // каскадный сдвиг старта
const SCALE_MIN     = 0.94;
const SCALE_MAX     = 1.10;
const OPACITY_MIN   = 0.6;
const OPACITY_MAX   = 1.0;
const DRIFT_MIN     = 2;                             // вертикальное «дыхание»
const DRIFT_MAX     = -2;
const BLUR_INACTIVE = 6;                             // размытие неактивных
const HOLD_ACTIVE_MS = 450;                          // ← задержка на чёткой иконке

/** Сколько иконок рендерим */
const ICONS_COUNT = 3;

export default function Loader() {
  const nav = useNavigation();
  const { width } = Dimensions.get('window');
  const ICON_SIZE = width * 0.18;

  /** Активная иконка (чёткая), остальные размыты */
  const [activeIdx, setActiveIdx] = useState(0);

  // Три независимых анимации
  const a0 = useRef(new Animated.Value(0)).current;
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;

  const loop0Ref = useRef(null);
  const loop1Ref = useRef(null);
  const loop2Ref = useRef(null);
  const navTimerRef = useRef(null);
  const rotateTimerRef = useRef(null);

  useEffect(() => {
    const startLoop = (val) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: DURATION_MS, easing: EASE, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: DURATION_MS, easing: EASE, useNativeDriver: true }),
        ])
      );

    // Каскадный запуск «дыхания»
    const t0 = setTimeout(() => { loop0Ref.current = startLoop(a0); loop0Ref.current.start(); }, 0);
    const t1 = setTimeout(() => { loop1Ref.current = startLoop(a1); loop1Ref.current.start(); }, STAGGER_MS);
    const t2 = setTimeout(() => { loop2Ref.current = startLoop(a2); loop2Ref.current.start(); }, STAGGER_MS * 2);

    // Ротация активной иконки с задержкой на чёткой
    rotateTimerRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % ICONS_COUNT);
    }, DURATION_MS + HOLD_ACTIVE_MS);

    // Автопереход на онбординг
    navTimerRef.current = setTimeout(() => nav.replace('Onboarding'), NAV_DELAY_MS);

    return () => {
      clearTimeout(t0); clearTimeout(t1); clearTimeout(t2);
      if (loop0Ref.current) loop0Ref.current.stop();
      if (loop1Ref.current) loop1Ref.current.stop();
      if (loop2Ref.current) loop2Ref.current.stop();
      if (rotateTimerRef.current) clearInterval(rotateTimerRef.current);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [a0, a1, a2, nav]);

  /** Общий стиль анимируемой иконки */
  const iconAnimStyle = (val) => ({
    width: ICON_SIZE,
    height: ICON_SIZE,
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [OPACITY_MIN, OPACITY_MAX] }),
    transform: [
      { scale: val.interpolate({ inputRange: [0, 1], outputRange: [SCALE_MIN, SCALE_MAX] }) },
      { translateY: val.interpolate({ inputRange: [0, 1], outputRange: [DRIFT_MIN, DRIFT_MAX] }) },
    ],
  });

  /** Отрисовка иконки с учётом blur у неактивных */
  const RenderIcon = ({ anim, index }) => (
    <Animated.Image
      source={LOGO}
      resizeMode="contain"
      blurRadius={activeIdx === index ? 0 : BLUR_INACTIVE}
      style={[styles.icon, iconAnimStyle(anim)]}
    />
  );

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.centerBox}>
        <RenderIcon anim={a0} index={0} />
        <RenderIcon anim={a1} index={1} />
        <RenderIcon anim={a2} index={2} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',   // строго по центру
    flexDirection: 'row',
  },
  icon: { marginHorizontal: 14 },
});
