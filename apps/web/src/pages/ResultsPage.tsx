import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResults, type EvaluationResult } from '../api/mockClient';

function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [results, setResults] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;

    getResults(attemptId)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  if (!results) {
    return <div className="error">Failed to load results</div>;
  }

  return (
    <div>
      <div className="overall-score">
        <h2>Overall Score</h2>
        <div className="score">{results.overallScore}</div>
        <p>out of 100</p>
      </div>

      {results.feedback && (
        <div className="card">
          <h2>Overall Feedback</h2>
          <p style={{ lineHeight: '1.6', color: '#555' }}>{results.feedback}</p>
        </div>
      )}

      <div className="card">
        <h2>Dimension Scores</h2>
        <div className="score-grid">
          {results.dimensions.map((dimension) => (
            <div key={dimension.name} className="score-card">
              <h3>{dimension.name.replace(/-/g, ' ')}</h3>
              <div className="score-value">
                {dimension.score}
                <span
                  style={{
                    fontSize: '1rem',
                    color: '#7f8c8d',
                    marginLeft: '0.5rem',
                  }}
                >
                  / 4
                </span>
              </div>
              <ul className="rationale">
                {dimension.rationale.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Link to="/attempt">
        <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
          Try Another Scenario
        </button>
      </Link>
    </div>
  );
}

export default ResultsPage;
