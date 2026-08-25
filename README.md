# Yadhavv Life Manager

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-green.svg)
![React Native](https://img.shields.io/badge/React_Native-Expo-black?logo=react)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Yadhavv Life Manager** is a premium, all-in-one lifestyle management Android application. Designed as a complete "LifeOS," it acts as a central command center for productivity, health, fitness, nutrition, and financial tracking.

The app uses a completely local, privacy-first Zustand architecture to ensure all your data remains securely on your device, while offering a visually stunning Reanimated interface.

---

## 🌟 Features

- **Home Command Center**: A bird's-eye view of your entire day, featuring daily scores, quick actions, and unified metric tracking.
- **Task Management**: Advanced to-do tracking with priority levels, deadlines, and daily progress rings.
- **Reminder & Alarm Center**: Powerful scheduling and alerts to keep your day on track.
- **Water Tracker**: Intelligent hydration tracking with quick-add presets and daily targets.
- **Weight Tracker**: Precision body-weight logging tailored for weight-gain or weight-loss journeys.
- **Gym & Workout**: Premium workout session tracking, set/rep logging, and historical progression.
- **Nutrition & Food Tracker**: Custom meal plan scheduling, macro tracking, and daily caloric intake monitoring.
- **Finance & Money Management**: A meticulous local financial system tracking SIPs, bank accounts, daily spending limits, budgets, and credit card utilization.
- **Premium Calendar**: A unified aggregation layer mapping all your tasks, routines, meals, and workouts into interactive Day, Week, and Month views.

---

## 🏗 Architecture

Yadhavv Life Manager is built with modern mobile technologies:

- **Framework**: React Native (via Expo prebuild workflow for native Android compilation)
- **State Management**: Zustand (11 isolated domain stores)
- **Local Storage**: AsyncStorage (fully offline, no cloud dependency)
- **Animations**: React Native Reanimated & React Native Gesture Handler
- **Date & Time**: date-fns for timezone-safe calendar and routine math
- **Styling**: Custom, highly-modular premium design system (`theme.ts`)

### Domain Stores
The application avoids duplicate data by utilizing a strict single-source-of-truth architecture. For example, the Calendar module reads dynamically from `useTaskStore`, `useRoutineStore`, and `useNutritionStore` via optimized selectors rather than copying data into a separate calendar database.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- Android Studio / Android SDK (for native compilation)
- Java JDK 17

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YADHAVASIVA/life-manager-.git
   cd life-manager-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Clean and prepare the native Android project**
   ```bash
   npm run android:clean
   ```
   *Note: This command clears any stale Gradle caches, runs `expo prebuild`, and sets up the native Android directory.*

4. **Run on a connected Android device or emulator**
   ```bash
   npm run android:run
   ```

5. **Build an APK (Optional)**
   ```bash
   npm run android:build
   ```

---

## 📱 Screenshots

*(Screenshots coming soon)*

---

## 🔒 Privacy

Yadhavv Life Manager is a **100% offline** application. There are no external databases, no analytics trackers, and no user accounts. Your financial data, health metrics, and daily routines never leave your device.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Designed and developed for peak daily performance.*
