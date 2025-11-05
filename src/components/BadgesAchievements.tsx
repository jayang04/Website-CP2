import { useState, useEffect } from 'react';
import type { Badge, UserBadges } from '../types/badges';
import { badgeService } from '../services/badgeService';
import { getBadgeTierColor, getCategoryInfo } from '../data/badgesData';
import type { BadgeCategory } from '../types/badges';

interface BadgesAchievementsProps {
  userId: string;
  currentStats?: {
    exercisesCompleted?: number;
    daysActive?: number;
    currentStreak?: number;
    progressPercentage?: number;
  };
}

export default function BadgesAchievements({ userId, currentStats = {} }: BadgesAchievementsProps) {
  const [userBadges, setUserBadges] = useState<UserBadges | null>(null);
  const [badges, setBadges] = useState<Record<BadgeCategory, Badge[]>>({
    milestone: [],
    streak: [],
    progress: [],
    exercise: [],
    special: [],
  });
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  useEffect(() => {
    loadBadges();
  }, [userId, currentStats]);

  const loadBadges = async () => {
    const userBadgeData = await badgeService.getUserBadges(userId);
    setUserBadges(userBadgeData);
    
    const badgesByCategory = await badgeService.getBadgesByCategory(userId, currentStats);
    setBadges(badgesByCategory);
  };

  const getFilteredBadges = (): Badge[] => {
    let allBadges: Badge[] = [];
    
    if (selectedCategory === 'all') {
      allBadges = Object.values(badges).flat();
    } else {
      allBadges = badges[selectedCategory] || [];
    }

    if (showOnlyUnlocked) {
      allBadges = allBadges.filter(badge => badge.unlockedAt);
    }

    return allBadges;
  };

  const getLevelProgress = () => {
    if (!userBadges) return 0;
    const pointsInCurrentLevel = userBadges.totalPoints - (userBadges.level - 1) * 100;
    const pointsNeededForLevel = userBadges.nextLevelPoints - (userBadges.level - 1) * 100;
    return (pointsInCurrentLevel / pointsNeededForLevel) * 100;
  };

  const categories: Array<{ key: BadgeCategory | 'all'; label: string; icon: string }> = [
    { key: 'all', label: 'All', icon: '🏅' },
    { key: 'milestone', label: 'Milestones', icon: '🎯' },
    { key: 'streak', label: 'Streaks', icon: '🔥' },
    { key: 'progress', label: 'Progress', icon: '📈' },
    { key: 'exercise', label: 'Exercise', icon: '💪' },
    { key: 'special', label: 'Special', icon: '⭐' },
  ];

  const filteredBadges = getFilteredBadges();
  const unlockedCount = filteredBadges.filter(b => b.unlockedAt).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🏆</span>
            Badges & Achievements
          </h1>
          <p className="text-gray-600 text-lg">Track your progress and unlock achievements</p>
        </div>

        {/* User Stats Card */}
        {userBadges && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Level Section */}
              <div className="text-center md:text-left">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 mb-3">
                  <p className="text-sm font-semibold uppercase tracking-wide opacity-90 text-white">Your Level</p>
                  <p className="text-5xl font-bold text-white">{userBadges.level}</p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{userBadges.totalPoints} points</span>
                    <span>{userBadges.nextLevelPoints} points</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-500"
                      style={{ width: `${getLevelProgress()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Points */}
              <div className="text-center">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4">
                  <p className="text-6xl font-bold mb-1">⭐</p>
                  <p className="text-3xl font-bold text-white">{userBadges.totalPoints}</p>
                  <p className="text-sm opacity-90 text-white">Total Points</p>
                </div>
              </div>

              {/* Badges Unlocked */}
              <div className="text-center md:text-right">
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4">
                  <p className="text-6xl font-bold mb-1">🏅</p>
                  <p className="text-3xl font-bold text-white">
                    {userBadges.unlockedBadges.length}/{Object.values(badges).flat().length}
                  </p>
                  <p className="text-sm opacity-90 text-white">Badges Unlocked</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    selectedCategory === cat.key
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Toggle Unlocked Only */}
            <label className="flex items-center gap-3 cursor-pointer bg-gray-50 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={showOnlyUnlocked}
                onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Unlocked Only</span>
            </label>
          </div>

          {/* Count Display */}
          <div className="mt-4 text-center text-gray-600">
            Showing {filteredBadges.length} badges
            {showOnlyUnlocked && ` (${unlockedCount} unlocked)`}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map(badge => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎯</p>
            <p className="text-xl text-gray-600">No badges found</p>
            <p className="text-gray-500 mt-2">Try changing your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Badge Card Component
function BadgeCard({ badge }: { badge: Badge }) {
  const isUnlocked = !!badge.unlockedAt;
  const tierColor = getBadgeTierColor(badge.tier);
  const categoryInfo = getCategoryInfo(badge.category);

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
        isUnlocked 
          ? 'bg-white' 
          : 'bg-gray-50 opacity-75'
      }`}
    >
      {/* Tier Gradient Header */}
      <div className={`h-2 bg-gradient-to-r ${tierColor}`} />

      <div className="p-6">
        {/* Badge Icon & Status */}
        <div className="flex justify-between items-start mb-4">
          <div className={`text-6xl transition-all ${isUnlocked ? 'filter-none' : 'grayscale opacity-40'}`}>
            {badge.icon}
          </div>
          
          {isUnlocked ? (
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span>✓</span>
              <span>UNLOCKED</span>
            </div>
          ) : (
            <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
              LOCKED
            </div>
          )}
        </div>

        {/* Badge Info */}
        <div className="mb-4">
          <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-gray-900' : 'text-gray-600'}`}>
            {badge.name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {badge.description}
          </p>
        </div>

        {/* Progress Bar (for locked badges) */}
        {!isUnlocked && badge.progress !== undefined && badge.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-semibold">{badge.progress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${tierColor} transition-all duration-500`}
                style={{ width: `${badge.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${categoryInfo.color}`}>
              {categoryInfo.icon}
            </span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {categoryInfo.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 font-bold">
            <span>⭐</span>
            <span>{badge.points}</span>
          </div>
        </div>

        {/* Unlock Date */}
        {isUnlocked && badge.unlockedAt && (
          <div className="mt-3 text-xs text-gray-400 text-center">
            Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Shine Effect for Unlocked Badges */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shine pointer-events-none" />
      )}
    </div>
  );
}
