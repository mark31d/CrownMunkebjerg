// App.js
import React from 'react';
import { StatusBar } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/* контекст для сохранённых локаций */
import { SavedProvider } from './Components/SavedContext';
import { SettingsProvider } from './Components/SettingsContext';
/* экраны */
import Loader              from './Components/Loader';
import Onboarding          from './Components/Onboarding';
import HomeScreen          from './Components/HomeScreen';
import RecommendedScreen   from './Components/RecommendedScreen';
import PlaceDetails        from './Components/PlaceDetails';
import MapScreen           from './Components/MapScreen';
import SavedScreen         from './Components/SavedScreen';
import AboutScreen         from './Components/AboutScreen';
import SettingsScreen      from './Components/SettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  // тема навигации с чёрным фоном
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#000',
      card: '#000',
      text: '#FFF',
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <NavigationContainer theme={theme}>
      <SettingsProvider>
        <SavedProvider>
          <Stack.Navigator
            initialRouteName="Loader"
            screenOptions={{ headerShown: false }}
          >
            {/* загрузка и онбординг */}
            <Stack.Screen name="Loader"      component={Loader} />
            <Stack.Screen name="Onboarding"  component={Onboarding} />

            {/* главное меню */}
            <Stack.Screen name="Home"        component={HomeScreen} />

            {/* Recommended: выбор вайба → список → детали */}
            <Stack.Screen name="Recommended"  component={RecommendedScreen} />
            <Stack.Screen name="PlaceDetails" component={PlaceDetails} />

            {/* интерактивная карта */}
            <Stack.Screen name="Map"          component={MapScreen} />

            {/* сохранённые локации */}
            <Stack.Screen name="Saved"        component={SavedScreen} />

            {/* информация о Мункебьере */}
            <Stack.Screen name="About"        component={AboutScreen} />

            {/* настройки */}
            <Stack.Screen name="Settings"     component={SettingsScreen} />
          </Stack.Navigator>
        </SavedProvider>
        </SettingsProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
