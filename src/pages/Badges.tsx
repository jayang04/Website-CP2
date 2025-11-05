import { useState, useEffect } from 'react';
import BadgesAchievements from '../components/BadgesAchievements';
import BadgeNotificationToast from '../components/BadgeNotificationToast';
import type { BadgeNotification } from '../types/badges';
import { cloudDashboardService } from '../services/cloudDataService';

interface BadgesPageProps {
  userId: string;
  onBack?: () => void;
}

export default function BadgesPage({ userId, onBack }: BadgesPageProps) {
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);
  const [currentStats, setCurrentStats] = useState({
    exercisesCompleted: 0,
    daysActive: 0,
    currentStreak: 0,
    progressPercentage: 0,
    phasesCompleted: 0,
    videosWatched: 0,
  });

  useEffect(() => {
    loadCurrentStats();
  }, [userId]);

  const loadCurrentStats = async () => {
    try {
      // Load real stats from cloud dashboard service
      const dashboardData = await cloudDashboardService.getDashboardData(userId);
      
      // Get all tracking data from localStorage
      const phasesCompleted = parseInt(localStorage.getItem(`phases_completed_${userId}`) || '0');
      const videosWatchedStr = localStorage.getItem(`videos_watched_${userId}`) || '[]';
      const videosWatched = JSON.parse(videosWatchedStr).length;
      
      setCurrentStats({
        exercisesCompleted: dashboardData.stats.exercisesCompleted,
        daysActive: dashboardData.stats.daysActive,
        currentStreak: 0, // TODO: Add currentStreak to UserStats type
        progressPercentage: dashboardData.stats.progressPercentage,
        phasesCompleted,
        videosWatched,
      });
    } catch (error) {
      console.error('Error loading stats for badges:', error);
      // Fallback to default stats if error
      setCurrentStats({
        exercisesCompleted: 0,
        daysActive: 0,
        currentStreak: 0,
        progressPercentage: 0,
        phasesCompleted: 0,
        videosWatched: 0,
      });
    }
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 z-40 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl shadow-lg font-semibold transition-all hover:scale-105 flex items-center gap-2"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      )}

      {/* Badges Component */}
      <BadgesAchievements 
        userId={userId} 
        currentStats={currentStats}
      />

      {/* Badge Notifications */}
      {notifications.map((notification, index) => (
        <BadgeNotificationToast
          key={notification.badge.id}
          notification={notification}
          onClose={() => removeNotification(index)}
        />
      ))}
    </div>
  );
}
