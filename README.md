# 🎯 Habit Streak Rewards

A modern, mobile-first Progressive Web App (PWA) for building lasting habits through gamification and rewards. Transform your daily routines into an engaging experience with streak tracking, milestone rewards, and a customizable reward wheel.

## ✨ Features

### 🔥 Streak Tracking
- **Smart Streak Calculation**: Choose between highest individual streak or combined milestone progress
- **Visual Progress**: Beautiful milestone indicators with customizable targets
- **Flexible Habits**: Support for boolean, time-based, and number-based habits
- **Streak Danger Alerts**: Intelligent notifications to help you maintain your streaks

### 🎁 Gamified Rewards
- **Reward Wheel**: Spin-to-win system with probability-based rewards
- **Customizable Milestones**: Set your own milestone days and reward probabilities
- **Three Reward Tiers**: Small, medium, and large rewards with different chances
- **Reward Management**: Add, edit, and organize your personal reward collection

### 📱 Progressive Web App
- **Offline First**: Works without internet connection
- **Mobile Optimized**: Touch-friendly interface designed for smartphones
- **Installable**: Add to home screen for native app experience
- **Push Notifications**: Stay motivated with timely streak reminders
- **Background Sync**: Automatic data synchronization when back online

### 🎨 Modern UX/UI
- **Dark/Light/System Theme**: Automatic theme switching based on preferences
- **Responsive Design**: Seamless experience across all devices
- **Smooth Animations**: Engaging transitions and micro-interactions
- **Accessibility**: Full keyboard navigation and screen reader support
- **German Localization**: Native German language support

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/habit-streak-rewards.git
   cd habit-streak-rewards
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
npm run preview
```

## 🎮 How to Use

### Getting Started
1. **Add Habits**: Create new habits or choose from pre-made templates
2. **Set Milestones**: Configure your milestone days and reward probabilities
3. **Add Rewards**: Create a collection of small, medium, and large rewards
4. **Track Daily**: Mark habits as complete each day to build streaks
5. **Earn Rewards**: Spin the wheel when you reach milestones!

### Habit Types
- **Boolean**: Simple yes/no completion (e.g., "Exercise", "Meditate")
- **Time-based**: Track minutes spent (e.g., "30 min reading", "20 min learning")
- **Number-based**: Count quantities (e.g., "8 glasses of water", "2000 calories")

### Reward System
- **Small Rewards (60-70%)**: Quick treats and short activities
- **Medium Rewards (25-35%)**: Meaningful purchases and experiences
- **Large Rewards (5-15%)**: Special treats and bigger goals

### Milestone Configuration
- **Default Milestones**: 7, 14, 30, 60, 100 days
- **Custom Probabilities**: Adjust reward chances for each milestone
- **Streak Modes**: 
  - **Highest**: Use your best performing habit
  - **All Combined**: Require all habits to reach milestone together

## 🛠️ Technical Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development with full IntelliSense
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

### PWA Features
- **Service Worker**: Offline caching and background sync
- **Web App Manifest**: Native app-like installation
- **IndexedDB**: Client-side database for offline data storage
- **Push Notifications**: Web Push API for background alerts

### State Management
- **Context API**: Centralized state management
- **Local Storage**: Persistent settings and preferences
- **Custom Hooks**: Reusable logic for habits, streaks, and rewards

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit validation
- **GitHub Actions**: Automated testing and deployment

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── RewardWheel.tsx  # Spinning wheel component
│   ├── HabitsList.tsx   # Habit management
│   └── ...
├── context/            # React Context providers
│   ├── AppContext.tsx   # Global app state
│   └── NotificationContext.tsx
├── hooks/              # Custom React hooks
│   ├── useHabits.ts    # Habit management logic
│   ├── useRewards.ts   # Reward system logic
│   └── ...
├── utils/              # Utility functions
│   ├── habitUtils.ts   # Habit calculations
│   ├── notifications.ts # Notification system
│   └── ...
├── types/              # TypeScript type definitions
└── styles/             # Global styles and themes
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=Habit Streak Rewards
VITE_APP_DESCRIPTION=Build lasting habits with gamified rewards
VITE_APP_THEME_COLOR=#3B82F6
```

### Customization
- **Themes**: Modify `src/styles/themes.ts` for custom color schemes
- **Milestones**: Adjust default milestones in `src/utils/habitUtils.ts`
- **Rewards**: Customize default rewards in the same file
- **Notifications**: Configure timing in `src/context/NotificationContext.tsx`

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### GitHub Pages
```bash
npm run build
npm run deploy
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for consistent formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Material Design and iOS Human Interface Guidelines
- **Icons**: Lucide React icon library
- **Fonts**: Inter font family for optimal readability
- **Community**: Thanks to all contributors and users who help improve the app

## 📞 Support

- **Documentation**: Check the [Wiki](https://github.com/yourusername/habit-streak-rewards/wiki) for detailed guides
- **Issues**: Report bugs or request features on [GitHub Issues](https://github.com/yourusername/habit-streak-rewards/issues)
- **Discussions**: Join our community discussions for tips and support

## 🎯 Roadmap

- [ ] **Social Features**: Share streaks and compete with friends
- [ ] **Advanced Analytics**: Detailed habit insights and trends
- [ ] **Cloud Sync**: Cross-device synchronization
- [ ] **Habit Templates**: Community-shared habit templates
- [ ] **Export/Import**: Backup and restore functionality
- [ ] **Integrations**: Connect with fitness trackers and calendars

---

**Happy Habit Building!** 🌟

*Made with ❤️ for building better habits and achieving your goals.*