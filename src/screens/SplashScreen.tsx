import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Colors, TextStyles, Spacing, Radius } from '@/constants/theme';
import { SafeScreen } from '@/components/layout/SafeScreen';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const reducedMotion = useReducedMotion();

  // Animation values
  const bgOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const headingOpacity = useSharedValue(0);
  const headingTranslateY = useSharedValue(15);
  const quoteOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaTranslateY = useSharedValue(20);
  const loginOpacity = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      bgOpacity.value = 1;
      logoOpacity.value = 1;
      logoTranslateY.value = 0;
      taglineOpacity.value = 1;
      headingOpacity.value = 1;
      headingTranslateY.value = 0;
      quoteOpacity.value = 1;
      ctaOpacity.value = 1;
      ctaTranslateY.value = 0;
      loginOpacity.value = 1;
      return;
    }

    // 0.0s Background appears
    bgOpacity.value = withTiming(1, { duration: 800 });

    // 0.2s LIFEOS logo fades in
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));

    // 0.4s Logo moves upward slightly
    logoTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 20, stiffness: 90 })
    );

    // 0.6s PLAN • FOCUS • ACHIEVE appears
    taglineOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));

    // 0.8s BUILD A STRONGER YOU appears
    headingOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    headingTranslateY.value = withDelay(
      800,
      withSpring(0, { damping: 20, stiffness: 90 })
    );

    // 1.0s Supporting message appears
    quoteOpacity.value = withDelay(1000, withTiming(1, { duration: 800 }));

    // 1.2s GET STARTED button appears
    ctaOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    ctaTranslateY.value = withDelay(
      1200,
      withSpring(0, { damping: 20, stiffness: 90 })
    );

    // 1.35s LOGIN appears
    loginOpacity.value = withDelay(1350, withTiming(1, { duration: 600 }));
  }, [reducedMotion]);

  // Styles
  const animatedBgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));
  const animatedTaglineStyle = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const animatedHeadingStyle = useAnimatedStyle(() => ({
    opacity: headingOpacity.value,
    transform: [{ translateY: headingTranslateY.value }],
  }));
  const animatedQuoteStyle = useAnimatedStyle(() => ({ opacity: quoteOpacity.value }));
  const animatedCtaStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ translateY: ctaTranslateY.value }],
  }));
  const animatedLoginStyle = useAnimatedStyle(() => ({ opacity: loginOpacity.value }));

  // Navigation handlers
  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  // Button animation
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.96, { duration: 150 });
    buttonOpacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    buttonOpacity.value = withTiming(1, { duration: 200 });
  };

  const animatedPrimaryButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]}>
        <LinearGradient
          colors={['#05050A', '#0A0A0F', '#151520', '#1C1A20']}
          style={StyleSheet.absoluteFill}
          locations={[0, 0.4, 0.8, 1]}
        />
        {/* Subtle gold atmospheric glow at the bottom */}
        <View style={styles.glow} />
      </Animated.View>

      <SafeScreen scrollable={false} style={styles.safeArea}>
        <View style={styles.content}>
          {/* Top Section - Brand */}
          <View style={styles.topSection}>
            <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
              <Text style={styles.logoText}>LIFEOS</Text>
            </Animated.View>
            <Animated.View style={[animatedTaglineStyle]}>
              <Text style={styles.tagline}>PLAN • FOCUS • ACHIEVE</Text>
            </Animated.View>
          </View>

          {/* Middle Section - Messaging */}
          <View style={styles.middleSection}>
            <Animated.View style={animatedHeadingStyle}>
              <Text style={styles.heading}>BUILD A{'\n'}STRONGER YOU</Text>
            </Animated.View>
            <Animated.View style={[styles.quoteContainer, animatedQuoteStyle]}>
              <Text style={styles.quoteText}>
                Small Daily Habits.{'\n'}Big Life Results.
              </Text>
            </Animated.View>
          </View>

          {/* Bottom Section - Actions */}
          <View style={styles.bottomSection}>
            <Animated.View style={[styles.ctaWrapper, animatedCtaStyle]}>
              <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleGetStarted}
                activeOpacity={1}
                style={styles.ctaTouchArea}
                accessibilityLabel="Get Started"
                accessibilityRole="button"
              >
                <Animated.View style={[styles.primaryButton, animatedPrimaryButtonStyle]}>
                  <Text style={styles.primaryButtonText}>GET STARTED</Text>
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[styles.loginWrapper, animatedLoginStyle]}>
              <TouchableOpacity
                onPress={handleLogin}
                activeOpacity={0.6}
                style={styles.loginButton}
                accessibilityLabel="Log In"
                accessibilityRole="button"
              >
                <Text style={styles.loginButtonText}>I ALREADY HAVE AN ACCOUNT</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05050A',
  },
  glow: {
    position: 'absolute',
    bottom: -height * 0.2,
    left: -width * 0.5,
    width: width * 2,
    height: height * 0.6,
    borderRadius: width,
    backgroundColor: 'rgba(201, 168, 76, 0.04)',
    transform: [{ scaleY: 0.5 }],
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  topSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoText: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.white,
  },
  tagline: {
    ...TextStyles.overline,
    color: Colors.primaryLight,
    letterSpacing: 4,
    fontWeight: '700',
    textAlign: 'center',
  },
  middleSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'System',
    fontSize: 42,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: 0.5,
    marginBottom: Spacing.lg,
  },
  quoteContainer: {
    marginTop: Spacing.md,
  },
  quoteText: {
    ...TextStyles.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  ctaWrapper: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  ctaTouchArea: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    ...TextStyles.label,
    color: Colors.textInverse,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loginWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  loginButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  loginButtonText: {
    ...TextStyles.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
