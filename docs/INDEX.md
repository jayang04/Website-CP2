# 📑 RehabMotion Documentation Index

**Quick navigation to all documentation files**

Last Updated: November 5, 2025

---

## 🏠 Start Here

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Main documentation hub with organized structure |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Complete setup and development guide |

---

## 🏆 Badge System (7 documents)

| Document | What's Inside | When to Use |
|----------|---------------|-------------|
| [📘 BADGE_QUICK_REFERENCE.md](./badges/BADGE_QUICK_REFERENCE.md) | Quick API reference, code examples, usage patterns | **Start here** for badge development |
| [🔧 BADGE_FIXES.md](./badges/BADGE_FIXES.md) | Bug fixes, updates history, known issues | Troubleshooting badge issues |
| [☁️ BADGE_CLOUD_MIGRATION_SUMMARY.md](./badges/BADGE_CLOUD_MIGRATION_SUMMARY.md) | Cloud storage migration summary | Understanding cloud migration |
| [📖 BADGE_SYSTEM_README.md](./badges/BADGE_SYSTEM_README.md) | System overview, architecture, concepts | Learning the badge system |
| [🔗 BADGES_INTEGRATION_GUIDE.md](./badges/BADGES_INTEGRATION_GUIDE.md) | Step-by-step integration guide | Adding badges to components |
| [📚 BADGES_SYSTEM_COMPLETE.md](./badges/BADGES_SYSTEM_COMPLETE.md) | Complete system documentation | Deep dive into badge system |
| [⭐ NEW_EXERCISE_BADGES.md](./badges/NEW_EXERCISE_BADGES.md) | Latest badge additions (Video badges) | See newest features |

**🎯 Recommended Reading Order:**
1. BADGE_QUICK_REFERENCE.md (basics)
2. BADGES_INTEGRATION_GUIDE.md (implementation)
3. BADGE_FIXES.md (troubleshooting)

---

## 🔥 Firebase & Cloud (2 documents)

| Document | What's Inside | When to Use |
|----------|---------------|-------------|
| [🔥 FIREBASE_FIRESTORE_SETUP.md](./firebase/FIREBASE_FIRESTORE_SETUP.md) | Firebase setup, Firestore config, security rules | **Start here** for Firebase setup |
| [☁️ CLOUD_STORAGE_MIGRATION.md](./firebase/CLOUD_STORAGE_MIGRATION.md) | Cloud migration details, architecture, testing | Understanding cloud storage |

**🎯 Recommended Reading Order:**
1. FIREBASE_FIRESTORE_SETUP.md (setup)
2. CLOUD_STORAGE_MIGRATION.md (migration details)

---

## ✨ Features (5 documents - Cleaned up!)

### 🎯 Personalized Plan System (Complete & Ready!)

| Document | What's Inside | When to Read |
|----------|---------------|--------------|
| [📖 README.md](./features/README.md) | **START HERE** - Navigation & overview | Main entry point |
| [⚡ QUICK_REFERENCE.md](./features/QUICK_REFERENCE.md) | Quick commands & checklist | Quick lookups |
| [� COMPLETE_SUMMARY.md](./features/COMPLETE_SUMMARY.md) | Full refactor documentation | Deep dive |
| [🎬 PERSONALIZED_PLAN_VIDEO_FIX.md](./features/PERSONALIZED_PLAN_VIDEO_FIX.md) | Latest video fix details | Recent changes |

**✅ What Was Done:**
- Removed ALL hardcoded databases (~1300 lines deleted)
- Single source of truth: `injuryPlans.ts`
- Fixed video mismatches completely
- Clean, maintainable architecture

**📚 Documentation Cleanup:**
- Removed 11 duplicate/outdated docs
- Kept only 5 essential files
- Created clear navigation

**🧪 Quick Test:**
```bash
npm run dev
# Medial Ankle Sprain + Pain 8 → Shows correct videos
# ACL + Pain 7 → Shows ACL videos (not ankle!)
```

---

## ✨ Other Features

| Document | What's Inside | When to Use |
|----------|---------------|-------------|
| [📖 COMPLETE_FEATURE_GUIDE.md](./features/COMPLETE_FEATURE_GUIDE.md) | All platform features overview | **Start here** for feature overview |
| [🏥 COMPLETE_REHAB_PLANS.md](./features/COMPLETE_REHAB_PLANS.md) | All rehab programs, exercises, phases | Understanding rehab programs |
| [💻 IMPLEMENTATION_SUMMARY.md](./features/IMPLEMENTATION_SUMMARY.md) | Technical implementation notes | Developer reference |
| [🔄 REFRESH_FIX.md](./features/REFRESH_FIX.md) | Refresh bug fixes, infinite loop solutions | Troubleshooting refresh issues |
| [🎯 PERSONALIZED_PLAN_EXERCISE_FIX.md](./features/PERSONALIZED_PLAN_EXERCISE_FIX.md) | Original personalized plan fix | Historical reference |
| [⚡ PERSONALIZED_PLAN_ENRICHMENT_SUMMARY.md](./features/PERSONALIZED_PLAN_ENRICHMENT_SUMMARY.md) | Quick summary of enrichment fix | **Quick reference** |
| [📚 PERSONALIZED_PLAN_ENRICHMENT_COMPLETE.md](./features/PERSONALIZED_PLAN_ENRICHMENT_COMPLETE.md) | Complete enrichment documentation | **Deep dive** into personalization fix |
| [🎥 MEDIAL_ANKLE_VIDEO_FIX.md](./features/MEDIAL_ANKLE_VIDEO_FIX.md) | Fixed video display for Medial Ankle Sprain | Video troubleshooting |

**🎯 Recommended Reading Order:**
1. COMPLETE_FEATURE_GUIDE.md (overview)
2. COMPLETE_REHAB_PLANS.md (rehab details)
3. PERSONALIZED_PLAN_ENRICHMENT_SUMMARY.md (personalization quick ref)
4. REFRESH_FIX.md (if encountering issues)

---

## 📖 Technical Guides (5 documents)

| Document | What's Inside | When to Use |
|----------|---------------|-------------|
| [📐 ANGLE_DETECTION_GUIDE.md](./guides/ANGLE_DETECTION_GUIDE.md) | Pose detection setup, TensorFlow.js, angle tracking | Implementing pose detection |
| [🎬 EXERCISE_MEDIA_GUIDE.md](./guides/EXERCISE_MEDIA_GUIDE.md) | Video management, media guidelines | Adding/managing videos |
| [🎨 PERSONALIZATION_GUIDE.md](./guides/PERSONALIZATION_GUIDE.md) | Personalization system, user preferences | Customization features |
| [🎨 LOGO_GUIDE.md](./guides/LOGO_GUIDE.md) | Branding guidelines, logo usage | Design reference |
| [🖥️ SERVER_README.md](./guides/SERVER_README.md) | Backend server setup, API endpoints | Server development |

**🎯 Use As Needed:** Based on specific feature implementation

---

## 🔍 Quick Search by Topic

### Authentication & Users
- [firebase/FIREBASE_FIRESTORE_SETUP.md](./firebase/FIREBASE_FIRESTORE_SETUP.md) - Firebase Auth setup
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - User management

### Badges & Achievements
- [badges/BADGE_QUICK_REFERENCE.md](./badges/BADGE_QUICK_REFERENCE.md) - Quick reference
- [badges/BADGE_SYSTEM_README.md](./badges/BADGE_SYSTEM_README.md) - System overview
- [badges/NEW_EXERCISE_BADGES.md](./badges/NEW_EXERCISE_BADGES.md) - Latest additions
- [badges/BADGE_FIXES.md](./badges/BADGE_FIXES.md) - Bug fixes

### Cloud Storage
- [firebase/CLOUD_STORAGE_MIGRATION.md](./firebase/CLOUD_STORAGE_MIGRATION.md) - Migration guide
- [badges/BADGE_CLOUD_MIGRATION_SUMMARY.md](./badges/BADGE_CLOUD_MIGRATION_SUMMARY.md) - Badge migration

### Database (Firestore)
- [firebase/FIREBASE_FIRESTORE_SETUP.md](./firebase/FIREBASE_FIRESTORE_SETUP.md) - Setup guide
- [firebase/CLOUD_STORAGE_MIGRATION.md](./firebase/CLOUD_STORAGE_MIGRATION.md) - Data structure

### Exercise Programs
- [features/COMPLETE_REHAB_PLANS.md](./features/COMPLETE_REHAB_PLANS.md) - All programs
- [guides/EXERCISE_MEDIA_GUIDE.md](./guides/EXERCISE_MEDIA_GUIDE.md) - Video setup

### Pose Detection & Angles
- [guides/ANGLE_DETECTION_GUIDE.md](./guides/ANGLE_DETECTION_GUIDE.md) - Setup & usage

### Personalization
- [guides/PERSONALIZATION_GUIDE.md](./guides/PERSONALIZATION_GUIDE.md) - Customization system

### Troubleshooting
- [badges/BADGE_FIXES.md](./badges/BADGE_FIXES.md) - Badge issues
- [features/REFRESH_FIX.md](./features/REFRESH_FIX.md) - Refresh issues
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - General setup issues

### UI/UX & Design
- [guides/LOGO_GUIDE.md](./guides/LOGO_GUIDE.md) - Branding guidelines

### Videos & Media
- [guides/EXERCISE_MEDIA_GUIDE.md](./guides/EXERCISE_MEDIA_GUIDE.md) - Video management

---

## 📂 Document Count by Category

```
🏆 Badge System      → 7 documents
🔥 Firebase & Cloud  → 2 documents
✨ Features          → 4 documents
📖 Guides            → 5 documents
📦 Archive           → 3+ documents
─────────────────────────────────
📊 Total Active      → 19 documents
```

---

## 🎓 Learning Paths

### Path 1: New Developer Setup
1. [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
2. [firebase/FIREBASE_FIRESTORE_SETUP.md](./firebase/FIREBASE_FIRESTORE_SETUP.md)
3. [features/COMPLETE_FEATURE_GUIDE.md](./features/COMPLETE_FEATURE_GUIDE.md)

### Path 2: Badge System Developer
1. [badges/BADGE_QUICK_REFERENCE.md](./badges/BADGE_QUICK_REFERENCE.md)
2. [badges/BADGES_INTEGRATION_GUIDE.md](./badges/BADGES_INTEGRATION_GUIDE.md)
3. [badges/BADGE_CLOUD_MIGRATION_SUMMARY.md](./badges/BADGE_CLOUD_MIGRATION_SUMMARY.md)
4. [badges/BADGE_FIXES.md](./badges/BADGE_FIXES.md)

### Path 3: Feature Implementation
1. [features/COMPLETE_FEATURE_GUIDE.md](./features/COMPLETE_FEATURE_GUIDE.md)
2. [features/COMPLETE_REHAB_PLANS.md](./features/COMPLETE_REHAB_PLANS.md)
3. Relevant guides based on feature

### Path 4: Backend Developer
1. [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
2. [guides/SERVER_README.md](./guides/SERVER_README.md)
3. [firebase/FIREBASE_FIRESTORE_SETUP.md](./firebase/FIREBASE_FIRESTORE_SETUP.md)

---

## 🔗 External Resources

### Firebase
- [Firebase Console](https://console.firebase.google.com/project/capstone-project-2-d0caf)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)

### Development Tools
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Pose Detection
- [TensorFlow.js](https://www.tensorflow.org/js)
- [MediaPipe](https://developers.google.com/mediapipe)

---

## 📦 Archive

Older or obsolete documentation moved to `archive/` folder:

- OLD_README.md - Previous README version
- OLD_INDEX.md - Previous INDEX version  
- MARKDOWN_CLEANUP_PLAN.md - Cleanup planning docs
- QUICK_CLEANUP_GUIDE.md - Cleanup guide

---

## ✅ Documentation Health

| Metric | Status |
|--------|--------|
| **Organization** | ✅ Organized into 4 categories |
| **Discoverability** | ✅ README + INDEX for navigation |
| **Completeness** | ✅ 19 active documents |
| **Up-to-date** | ✅ Last updated Nov 5, 2025 |
| **Links** | ✅ All internal links working |

---

## 🎯 Quick Actions

**I want to...**

- **Set up development environment** → [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
- **Add badges to a component** → [badges/BADGE_QUICK_REFERENCE.md](./badges/BADGE_QUICK_REFERENCE.md)
- **Configure Firebase** → [firebase/FIREBASE_FIRESTORE_SETUP.md](./firebase/FIREBASE_FIRESTORE_SETUP.md)
- **Understand all features** → [features/COMPLETE_FEATURE_GUIDE.md](./features/COMPLETE_FEATURE_GUIDE.md)
- **Add exercise videos** → [guides/EXERCISE_MEDIA_GUIDE.md](./guides/EXERCISE_MEDIA_GUIDE.md)
- **Implement pose detection** → [guides/ANGLE_DETECTION_GUIDE.md](./guides/ANGLE_DETECTION_GUIDE.md)
- **Fix refresh issues** → [features/REFRESH_FIX.md](./features/REFRESH_FIX.md)
- **Understand cloud storage** → [firebase/CLOUD_STORAGE_MIGRATION.md](./firebase/CLOUD_STORAGE_MIGRATION.md)

---

**📍 Return to:** [README.md](./README.md) | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
