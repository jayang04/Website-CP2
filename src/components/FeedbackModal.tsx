// Exercise Feedback Modal Component
// Collects user feedback after exercise sessions

import { useState } from 'react';
import type { ExerciseFeedback, DifficultyRating, PainLevel, FeedbackResponse } from '../types/feedback';
import FeedbackService from '../services/feedbackService';
import '../styles/FeedbackModal.css';

interface FeedbackModalProps {
  userId: string;
  exerciseId: string;
  exerciseName: string;
  sessionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (feedback: ExerciseFeedback, response: FeedbackResponse) => void;
}

export default function FeedbackModal({
  userId,
  exerciseId,
  exerciseName,
  sessionId,
  isOpen,
  onClose,
  onSubmit
}: FeedbackModalProps) {
  const [step, setStep] = useState<'questions' | 'response'>('questions');
  const [painExperienced, setPainExperienced] = useState<boolean | null>(null);
  const [painLevel, setPainLevel] = useState<PainLevel>(0);
  const [difficultyRating, setDifficultyRating] = useState<DifficultyRating | null>(null);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [feedbackResponse, setFeedbackResponse] = useState<FeedbackResponse | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (painExperienced === null || difficultyRating === null || completed === null) {
      alert('Please answer all questions');
      return;
    }

    const feedback: ExerciseFeedback = {
      sessionId,
      userId,
      exerciseId,
      exerciseName,
      painExperienced,
      painLevel: painExperienced ? painLevel : undefined,
      difficultyRating,
      completed,
      notes: notes.trim() || undefined,
      timestamp: new Date()
    };

    // Store feedback
    await FeedbackService.storeFeedback(feedback);

    // Generate response using decision tree
    const response = FeedbackService.generateFeedbackResponse(feedback);
    setFeedbackResponse(response);
    setStep('response');

    // Callback to parent
    if (onSubmit) {
      onSubmit(feedback, response);
    }
  };

  const handleClose = () => {
    // Reset state
    setPainExperienced(null);
    setPainLevel(0);
    setDifficultyRating(null);
    setCompleted(null);
    setNotes('');
    setFeedbackResponse(null);
    setStep('questions');
    onClose();
  };

  return (
    <div className="feedback-modal-overlay" onClick={handleClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        {step === 'questions' ? (
          <>
            {/* Header */}
            <div className="feedback-header">
              <h2>📝 Exercise Feedback</h2>
              <p className="feedback-exercise-name">{exerciseName}</p>
            </div>

            {/* Question 1: Completion */}
            <div className="feedback-question">
              <label className="feedback-label">
                Did you complete the full exercise session?
              </label>
              <div className="feedback-options">
                <button
                  className={`feedback-btn ${completed === true ? 'active' : ''}`}
                  onClick={() => setCompleted(true)}
                >
                  ✅ Yes, completed
                </button>
                <button
                  className={`feedback-btn ${completed === false ? 'active' : ''}`}
                  onClick={() => setCompleted(false)}
                >
                  ❌ No, didn't finish
                </button>
              </div>
            </div>

            {/* Question 2: Pain */}
            <div className="feedback-question">
              <label className="feedback-label">
                Did you experience any pain during your exercise session?
              </label>
              <div className="feedback-options">
                <button
                  className={`feedback-btn ${painExperienced === false ? 'active' : ''}`}
                  onClick={() => {
                    setPainExperienced(false);
                    setPainLevel(0);
                  }}
                >
                  😊 No pain
                </button>
                <button
                  className={`feedback-btn ${painExperienced === true ? 'active' : ''}`}
                  onClick={() => setPainExperienced(true)}
                >
                  😣 Yes, I felt pain
                </button>
              </div>
            </div>

            {/* Pain Level Scale (if pain experienced) */}
            {painExperienced && (
              <div className="feedback-question">
                <label className="feedback-label">
                  How would you rate your pain level? (1-10)
                </label>
                <div className="pain-scale">
                  <div className="pain-scale-labels">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value) as PainLevel)}
                    className="pain-slider"
                  />
                  <div className="pain-level-display">
                    Pain Level: <strong>{painLevel}/10</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Question 3: Difficulty */}
            <div className="feedback-question">
              <label className="feedback-label">
                Was the exercise too difficult for you to finish?
              </label>
              <div className="feedback-options difficulty-options">
                <button
                  className={`feedback-btn ${difficultyRating === 'easy' ? 'active' : ''}`}
                  onClick={() => setDifficultyRating('easy')}
                >
                  😄 Too easy
                </button>
                <button
                  className={`feedback-btn ${difficultyRating === 'moderate' ? 'active' : ''}`}
                  onClick={() => setDifficultyRating('moderate')}
                >
                  😊 Just right
                </button>
                <button
                  className={`feedback-btn ${difficultyRating === 'difficult' ? 'active' : ''}`}
                  onClick={() => setDifficultyRating('difficult')}
                >
                  😰 Challenging
                </button>
                <button
                  className={`feedback-btn ${difficultyRating === 'too-difficult' ? 'active' : ''}`}
                  onClick={() => setDifficultyRating('too-difficult')}
                >
                  😫 Too difficult
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="feedback-question">
              <label className="feedback-label">
                Any additional notes? (Optional)
              </label>
              <textarea
                className="feedback-textarea"
                placeholder="Share any thoughts about the exercise..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="feedback-actions">
              <button className="feedback-submit-btn" onClick={handleSubmit}>
                Submit Feedback
              </button>
              <button className="feedback-cancel-btn" onClick={handleClose}>
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Response Display */}
            <div className="feedback-response">
              <div className="response-icon">{feedbackResponse?.icon}</div>
              <h2 className="response-title">Thank You!</h2>
              <div className={`response-message ${feedbackResponse?.type}`}>
                {feedbackResponse?.message}
              </div>
              {feedbackResponse?.suggestedAction && (
                <div className="suggested-action">
                  <strong>💡 Suggested Action:</strong>
                  <p>{feedbackResponse.suggestedAction}</p>
                </div>
              )}
              <button className="feedback-close-btn" onClick={handleClose}>
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
