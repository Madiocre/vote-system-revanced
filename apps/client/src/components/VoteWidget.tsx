import { useState } from "react";
import VoteCard from "./VoteCard";

type VoteOption = {
  name: string;
  description: string;
  imageSrc: string;
  youtubeLink?: string;
  facebookLink?: string;
};
type VoteResult = { option: string; count: number };
type Tab = "vote" | "results";

export default function VotingWidget({
  options,
  initialHasVoted,
}: {
  options: VoteOption[];
  initialHasVoted: boolean;
}) {
  const [tab, setTab] = useState<Tab>("vote");
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [results, setResults] = useState<VoteResult[] | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [message, setMessage] = useState("");

  const showResults = async () => {
    setTab("results");
    if (results) return; // already have it for this page view
    setLoadingResults(true);
    try {
      const res = await fetch("/api/results");
      setResults(await res.json());
    } catch {
      setMessage("Couldn't load results, try again in a moment.");
    } finally {
      setLoadingResults(false);
    }
  };

  const handleVote = async (candidateId: string) => {
    setMessage("");
    try {
      // TODO (you): wire real Turnstile token in here, not a placeholder
      const res = await fetch(`/api/vote/${candidateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken: "TODO" }),
      });
      if (res.ok) {
        setHasVoted(true);
        setMessage("Thanks for voting! 🎉");
      } else if (res.status === 409) {
        setHasVoted(true);
        setMessage("Looks like you've already voted.");
      } else {
        setMessage("Vote didn't go through, try again.");
      }
    } catch {
      setMessage("Network error casting vote.");
    }
  };

  return (
    <div className="voting-widget">
      <nav className="navbar">
        <button className={tab === "vote" ? "active" : ""} onClick={() => setTab("vote")}>
          Vote
        </button>
        <button className={tab === "results" ? "active" : ""} onClick={showResults}>
          Results
        </button>
      </nav>

      {message && <p className="message">{message}</p>}

      {tab === "vote" ? (
        hasVoted ? (
          <p className="thanks-message">You have already voted. Thanks for participating! 🎉</p>
        ) : (
          <div className="card-grid">
            {options.map((option) => (
              <VoteCard key={option.name} {...option} onClick={() => handleVote(option.name)} />
            ))}
          </div>
        )
      ) : loadingResults ? (
        <p>Loading results...</p>
      ) : (
        <ResultsPanel results={results ?? []} />
      )}
    </div>
  );
}

function ResultsPanel({ results }: { results: VoteResult[] }) {
  const sorted = [...results].sort((a, b) => b.count - a.count);
  const max = Math.max(...sorted.map((r) => r.count), 1);
  const total = sorted.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="results-grid">
      {sorted.map((r) => (
        <div key={r.option} className="result-card">
          <div className="result-header">
            <span>{r.option}</span>
            <span>{r.count}</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="total-votes">Total votes: {total}</p>
    </div>
  );
}