import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function GameScreen({ navigation }) {
  const [countdown, setCountdown] = useState(3);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [commandVisible, setCommandVisible] = useState(false);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isCheckingAction, setIsCheckingAction] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);
  const [commandDuration, setCommandDuration] = useState(1.5); // Initial command duration of 1.5 seconds

  const tapCountRef = useRef(0);
  const shakeDetectedRef = useRef(false);
  const longPressTimeoutRef = useRef(null);
  const isSimonSaysRef = useRef(false);
  const actionTimeoutRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdownInterval);
    } else if (countdown === 0) {
      setTimeout(() => {
        setIsGameStarted(true);
        startCommand('Tap Screen Once');
      }, 1000);
    }
  }, [countdown]);

  const startCommand = (command) => {
    setCommandVisible(true);
    setCurrentCommand(command);
    const simonSays = Math.random() < 0.8; // 80% chance of Simon Says
    isSimonSaysRef.current = simonSays;

    // Reset states before starting a new command
    tapCountRef.current = 0;
    shakeDetectedRef.current = false;
    longPressTimeoutRef.current = null;

    // Show the command and decrease the time for next round
    setTimeout(() => {
      setCommandVisible(false);
      setIsCheckingAction(true);
      actionTimeoutRef.current = setTimeout(() => {
        evaluateAction(command);
      }, 5000); // 5 seconds timeout for action
    }, commandDuration * 1000); // Use dynamic command duration (in milliseconds)
  };

  const evaluateAction = (command) => {
    const performedCorrectAction =
      (command === 'Tap Screen Once' && tapCountRef.current === 1) ||
      (command === 'Tap Screen Twice' && tapCountRef.current === 2) ||
      (command === 'Tap Screen Thrice' && tapCountRef.current === 3) ||
      (command === 'Shake the Device' && shakeDetectedRef.current) ||
      (command === 'Hold the Screen' && longPressTimeoutRef.current !== null);

    // Update message based on the action
    if (isSimonSaysRef.current) {
      if (performedCorrectAction) {
        setScore((prev) => prev + 1); // Increment score for correct action when Simon says
        setMessage('Perfect');
        // Reduce command duration by 0.25 seconds, but not below 0.25 seconds
        setCommandDuration((prev) => Math.max(prev - 0.25, 0.25));
      } else {
        setMessage('Game Over');
        setIsGameOver(true); // End the game if player loses
      }
    } else {
      if (!performedCorrectAction) {
        setScore((prev) => prev + 1); // Increment score for correct action when Simon doesn't say
        setMessage('Correct');
        // Reduce command duration by 0.25 seconds, but not below 0.25 seconds
        setCommandDuration((prev) => Math.max(prev - 0.25, 0.25));
      } else {
        setMessage('Lose');
        setIsGameOver(true); // End the game if player loses
      }
    }

    tapCountRef.current = 0;
    shakeDetectedRef.current = false;
    longPressTimeoutRef.current = null;
    setIsCheckingAction(false);

    // After 2 seconds, clear the message, wait 1 second, then start the next command
    setTimeout(() => {
      setMessage('');
      if (!isGameOver) { // Only proceed to next command if the game is not over
        setTimeout(() => {
          nextCommand();
        }, 1000); // 1 second pause before starting next command
      }
    }, 2000); // Message stays for 2 seconds
  };

  const nextCommand = () => {
    const commands = ['Tap Screen Once', 'Tap Screen Twice', 'Tap Screen Thrice', 'Shake the Device', 'Hold the Screen'];
    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    startCommand(randomCommand);
  };

  const handleTap = () => {
    if (isCheckingAction && currentCommand.startsWith('Tap Screen')) {
      // Count taps for 'Tap Screen Once', 'Tap Screen Twice', and 'Tap Screen Thrice'
      if (currentCommand === 'Tap Screen Once') {
        tapCountRef.current += 1;
      } else if (currentCommand === 'Tap Screen Twice') {
        tapCountRef.current += 1;
      } else if (currentCommand === 'Tap Screen Thrice') {
        tapCountRef.current += 1;
      }

      console.log(`Tap detected. Current tap count: ${tapCountRef.current}`);
    }
  };

  const handlePressIn = () => {
    if (isCheckingAction && currentCommand === 'Hold the Screen') {
      longPressTimeoutRef.current = setTimeout(() => {
        console.log('Long press detected!');
      }, 3000);
    }
  };

  const handlePressOut = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
      console.log('Long press canceled');
    }
  };

  useEffect(() => {
    let subscription;
    const THRESHOLD = 1.5;

    if (isCheckingAction && currentCommand === 'Shake the Device') {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        if (magnitude > THRESHOLD && !shakeDetectedRef.current) {
          shakeDetectedRef.current = true;
          console.log('Shake detected!');
          clearTimeout(actionTimeoutRef.current); // Immediate feedback after shake
          evaluateAction(currentCommand); // Immediate feedback
        }
      });
    }

    return () => subscription && subscription.remove();
  }, [isCheckingAction, currentCommand]);

  return (
    <Pressable
      style={styles.container}
      onPress={handleTap}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>

      {!isGameStarted ? (
        <Text style={styles.countdown}>{countdown === 0 ? 'Go!' : countdown}</Text>
      ) : (
        <>
          {commandVisible && (
            <View style={styles.commandContainer}>
              <Text style={styles.command}>
                {isSimonSaysRef.current ? `Simon Says: ${currentCommand}` : currentCommand}
              </Text>
            </View>
          )}
          {message && (
            <View style={styles.messageContainer}>
              <Text style={styles.message}>{message}</Text>
            </View>
          )}
        </>
      )}

      {/* Show "Back to Home" button if the game is over */}
      {isGameOver && (
        <Pressable style={styles.homeButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5265b7',
  },
  countdown: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  scoreContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  commandContainer: {
    position: 'absolute',
    top: '40%', // Centering vertically
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100, // Ensure the height is consistent
  },
  command: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  messageContainer: {
    position: 'absolute',
    top: '40%', // Centering vertically
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff', // Slightly transparent white
    borderRadius: 20,
    minHeight: 100, // Ensure the height is consistent with the command container
  },
  message: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5265b7',
  },
  homeButton: {
    position: 'absolute',
    bottom: 30,
    padding: 15,
    backgroundColor: '#5265b7',
    borderRadius: 10,
    opacity: 0.8,
  },
  homeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});