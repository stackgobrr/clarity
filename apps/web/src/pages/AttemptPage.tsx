import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getScenario, submitAttempt, type Scenario } from '../api/mockClient';

function AttemptPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getScenario()
      .then((data) => {
        setScenario(data);
        // Initialize empty answers
        const initialAnswers: Record<string, string> = {};
        data.questions.forEach((q) => {
          initialAnswers[q.questionId] = '';
        });
        setAnswers(initialAnswers);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all questions answered
    const unanswered = scenario?.questions.filter(
      (q) => !answers[q.questionId]?.trim()
    );
    if (unanswered && unanswered.length > 0) {
      alert(`Please answer all questions before submitting.`);
      return;
    }

    setSubmitting(true);
    try {
      const answerArray = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      const result = await submitAttempt(answerArray);
      navigate(`/results/${result.attemptId}`);
    } catch (error) {
      alert('Error submitting attempt. Please try again.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading scenario...</div>;
  }

  if (!scenario) {
    return <div className="error">Failed to load scenario</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="card">
        <h2>{scenario.title}</h2>
        <p style={{ lineHeight: '1.6', marginTop: '1rem', color: '#555' }}>
          {scenario.description}
        </p>
      </div>

      {scenario.questions.map((question, index) => (
        <div key={question.questionId} className="card">
          <div className="question-group">
            <label htmlFor={question.questionId}>
              Question {index + 1}: {question.text}
            </label>
            <textarea
              id={question.questionId}
              value={answers[question.questionId] || ''}
              onChange={(e) =>
                handleAnswerChange(question.questionId, e.target.value)
              }
              placeholder="Type your answer here..."
              rows={question.type === 'long' ? 8 : 5}
            />
            <small
              style={{
                color: '#7f8c8d',
                marginTop: '0.5rem',
                display: 'block',
              }}
            >
              Word count:{' '}
              {
                (answers[question.questionId] || '')
                  .split(/\s+/)
                  .filter(Boolean).length
              }
            </small>
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={submitting}
        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
      >
        {submitting ? 'Evaluating your answers...' : 'Submit for Evaluation'}
      </button>
    </form>
  );
}

export default AttemptPage;
