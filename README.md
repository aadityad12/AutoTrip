# Travel Planner App

A React Native travel planning application that helps users create personalized trip itineraries with AI assistance.

## Features

- **Intuitive Home Screen**: Beautiful welcome screen with travel-themed design
- **Trip Planning Form**: Collect user preferences including destination, budget, and duration
- **Voice Input**: Record voice descriptions of trip preferences
- **AI-Powered Planning**: Generate personalized itineraries (currently using mock data)
- **Timeline View**: Display trip events in chronological order with beautiful card design
- **Multiple Event Types**: Support for travel, accommodation, activities, and dining

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd travel-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
npm run ios     # For iOS simulator
npm run android # For Android emulator
npm run web     # For web browser
```

## Project Structure

```
travel-planner/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Welcome screen with travel button
│   │   ├── TripPlanningScreen.tsx  # Form for trip preferences and voice input
│   │   └── ResultsScreen.tsx       # Timeline view of trip itinerary
│   └── components/                 # Reusable components (future expansion)
├── App.tsx                         # Main app with navigation setup
└── package.json
```

## Key Components

### HomeScreen
- Beautiful background image with travel theme
- Prominent "Plan My Trip" button
- Feature highlights (personalized destinations, smart scheduling, budget optimization)

### TripPlanningScreen
- Form fields for destination, duration, and budget
- Voice recording functionality for additional preferences
- Loading state while processing trip data
- Integration with dummy API endpoint

### ResultsScreen
- Timeline-style layout showing trip events chronologically
- Color-coded event types with icons
- Start and end times for each activity
- Action buttons for planning another trip or returning home

## API Integration

The app currently uses mock data for demonstration purposes. To integrate with a real API:

1. Replace the dummy API call in `TripPlanningScreen.tsx`
2. Update the API endpoint URL
3. Modify the data structure as needed
4. Add proper error handling

## Voice Input

The app includes voice recording functionality using Expo AV:
- Requests microphone permissions
- Records high-quality audio
- Placeholder for speech-to-text integration

## Future Enhancements

- Real AI/ML backend integration
- Speech-to-text processing
- User authentication
- Trip saving and history
- Social sharing features
- Offline mode support
- Map integration
- Real-time booking integration

## Dependencies

- **React Navigation**: For screen navigation
- **Expo AV**: For audio recording
- **Expo Vector Icons**: For consistent iconography
- **React Native Safe Area Context**: For safe area handling

## License

This project is for educational/demonstration purposes.