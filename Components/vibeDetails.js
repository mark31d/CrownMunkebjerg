// data/vibeDetails.js

// Текст, координаты и картинки (PNG) для экранов вайбов.
// Картинки лежат в ../assets/ (без подпапок).

export const VIBE_DETAILS = {
  party: {
    hero:  require('../assets/vibe_party.png'),
    title: '🎉 Party & Chill Vibe',
    intro: 'For parties, quiet conversations and an atmospheric vibe.',
    items: [
      {
        title: 'Lobby Bar & Lounge',
        desc:  'An elegant place with signature cocktails, jazz and a view of the forest.',
        lat: 55.68760, lng: 9.61365,
        image: require('../assets/party_lobby.png'),
      },
      {
        title: 'Wine Hour (15:00–17:00)',
        desc:  'Wine tasting with light snacks in a relaxed atmosphere.',
        lat: 55.68760, lng: 9.61360,
        image: require('../assets/party_wine.png'),
      },
      {
        title: 'Panorama Restaurant Terrace',
        desc:  'Wine, sunset and a view of the fjord - for romance and silence.',
        lat: 55.68750, lng: 9.61360,
        image: require('../assets/party_terrace.png'),
      },
    ],
  },

  outdoor: {
    hero:  require('../assets/vibe_outdoor.png'),
    title: '🚴 Outdoor Adventure Vibe',
    intro: 'For those looking for nature, activity and views.',
    items: [
      {
        title: 'Munkebjerg Stairs (218 steps)',
        desc:  'An iconic climb with a view of the fjord - test yourself!',
        lat: 55.68770, lng: 9.61330,
        image: require('../assets/outdoor_stairs.png'),
      },
      {
        title: 'Munkebjergskoven (forest trails)',
        desc:  'Dense forest with routes for running, cycling and walking.',
        lat: 55.68765, lng: 9.61360,
        image: require('../assets/outdoor_forest.png'),
      },
      {
        title: 'Natura 2000 – Strandskov',
        desc:  'Protected area with rare flora and bird watching.',
        lat: 55.68917, lng: 9.62611,
        image: require('../assets/outdoor_strandskov.png'),
      },
    ],
  },

  play: {
    hero:  require('../assets/vibe_sport.png'),
    title: '🏌️‍♂️ Play & Compete Vibe',
    intro: 'Fun, sport and a bit of competition - for companies.',
    items: [
      {
        title: 'Vejle Golf Club (27 holes)',
        desc:  'Professional course in the middle of the forest - for both playing and taking photos.',
        lat: 55.67670, lng: 9.60936,
        image: require('../assets/play_golf.png'),
      },
      {
        title: 'Krolf Golf (fun version)',
        desc:  'Easy, fun outdoor game - no skills required.',
        lat: 55.68750, lng: 9.61370,
        image: require('../assets/play_krolf.png'),
      },
      {
        title: 'Tennis court (grass)',
        desc:  'Classic outdoor tennis. Suitable even for beginners.',
        lat: 55.68755, lng: 9.61390,
        image: require('../assets/play_tennis.png'),
      },
    ],
  },

  relax: {
    hero:  require('../assets/vibe_relax.png'),
    title: '🧘‍♀️ Relax & Recharge Vibe',
    intro: 'Silence, recovery and self-care.',
    items: [
      {
        title: 'Spa area (pool, sauna, jacuzzi)',
        desc:  'Deep relaxation with a view of the forest.',
        lat: 55.68770, lng: 9.61370,
        image: require('../assets/relax_spa.png'),
      },
      {
        title: 'Massage rooms',
        desc:  'Hot Stone, aromatherapy and other amenities.',
        lat: 55.68765, lng: 9.61365,
        image: require('../assets/relax_massage.png'),
      },
      {
        title: 'Yoga/meditation lawn',
        desc:  'Nature, silence and air - for body and mind.',
        lat: 55.68800, lng: 9.61700,
        image: require('../assets/relax_yoga.png'),
      },
    ],
  },
};

export default VIBE_DETAILS;
