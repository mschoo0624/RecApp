# 🏋️‍♂️ UIC FitConnect
#### Find your perfect UIC workout partner. Build accountability. Build community.
## 💡 Overview
UIC FitConnect is a community-driven fitness platform that helps University of Illinois at Chicago (UIC) students find workout partners, participate in wellness events, and connect with the campus fitness ecosystem — all while leveraging a fully free tech stack.

## ⚙️ Core Architecture
Google Assistant → Dialogflow Agent → Python Flask Webhook
                                         ├─ Firebase Realtime Database
                                         ├─ Google Calendar API
                                         └─ UIC Directory Verification

## 📲 Mobile App Features (React Native + Expo)
- UIC Email Authentication (Firebase)
- Profile setup (goals, schedule, experience)
- Matchmaking algorithm
- Real-time messaging (Socket.io)
- Group chat creation
- Chicago wellness event feed
- Event RSVP & notifications
- Initial onboarding survey

## 🖥️ Web Platform (React + Netlify/Vercel)
- Informational homepage with download links
- Training plans & fitness tips
- Chicago event feed
- Online coaching sign-ups
- SEO & analytics