import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function WaveBackground() {
  return (
    <>
      <View style={styles.topWave}>
        <Svg width={width} height={height * 0.35} viewBox="0 0 1440 320">
          <Path
            fill="#2563EB"
            d="M0,160 C360,0 1080,320 1440,160 L1440,0 L0,0 Z"
          />
        </Svg>
      </View>

      <View style={styles.bottomWave}>
        <Svg width={width} height={height * 0.35} viewBox="0 0 1440 320">
          <Path
            fill="#3B82F6"
            d="M0,160 C480,320 960,0 1440,160 L1440,320 L0,320 Z"
          />
        </Svg>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topWave: {
    position: 'absolute',
    top: -80, // mejora el cubrimiento visual
    left: 0,
    right: 0,
    height: height * 0.4,
    zIndex: 0,
  },
  bottomWave: {
    position: 'absolute',
    bottom: -80, // mejora el cubrimiento visual
    left: 0,
    right: 0,
    height: height * 0.4,
    zIndex: 0,
  },
});
