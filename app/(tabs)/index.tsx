import React, { useRef, useEffect } from 'react';
import { StyleSheet, Pressable, Animated } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function TabOneScreen({ navigation }) {
  // Animated value for background color and button slide
  const backgroundColor = useRef(new Animated.Value(0)).current;
  const buttonSlide = useRef(new Animated.Value(100)).current;  // Start position of buttons (off-screen)

  // Start the background color animation loop
  useEffect(() => {
    // Pulsating background animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundColor, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundColor, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Slide-in button animation
    Animated.spring(buttonSlide, {
      toValue: 0, // Final position (fully on screen)
      friction: 4, // Slightly bouncy effect
      tension: 50, // Slightly bouncy effect
      useNativeDriver: true,
    }).start();
  }, [backgroundColor, buttonSlide]);

  const bgColorInterpolation = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', '#e3e6ff'], // White to light blue
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgColorInterpolation }]}>
      <Text style={styles.title}>Simon Says Game</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/* Play Button with sliding animation */}
      <Animated.View style={[styles.roundedButtonContainer, { transform: [{ translateY: buttonSlide }] }]}>
        <Pressable
          onPress={() => navigation.navigate('Game')}
          style={styles.roundedButton}
        >
          <Text style={styles.buttonText}>Play</Text>
        </Pressable>
      </Animated.View>


    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5265b7',
    textAlign: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  roundedButtonContainer: {
    marginVertical: 10,
  },
  roundedButton: {
    backgroundColor: '#5265b7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#d3d3d3',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
