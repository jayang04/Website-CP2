import { useEffect, useState } from 'react';
import type { BadgeNotification } from '../types/badges';
import { getBadgeTierColor } from '../data/badgesData';

interface BadgeNotificationToastProps {
  notification: BadgeNotification;
  onClose: () => void;
}

export default function BadgeNotificationToast({ notification, onClose }: BadgeNotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tierColor = getBadgeTierColor(notification.badge.tier);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      {/* Confetti Effect for Gold/Platinum badges */}
      {notification.showConfetti && isVisible && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animation: `fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🎉', '✨', '⭐', '🎊', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      <div
        className={`fixed top-20 right-6 z-[9999] max-w-md transform transition-all duration-300 ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{ marginTop: '1rem' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-yellow-400">
          {/* Tier Color Bar */}
          <div className={`h-2 bg-gradient-to-r ${tierColor}`} />
          
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="text-6xl animate-bounce">
                {notification.badge.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 text-xl">🏆</span>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Achievement Unlocked!
                  </h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {notification.badge.name}
                </p>
                <p className="text-sm text-gray-600">
                  {notification.badge.description}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {/* Points Earned */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Points Earned
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-2xl font-bold text-yellow-600">
                  +{notification.badge.points}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
