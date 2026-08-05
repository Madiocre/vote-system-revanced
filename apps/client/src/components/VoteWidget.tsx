import { useEffect, useState } from "react";
import VoteCard from "./VoteCard";
import type { Candidate } from "../../../../packages/shared/candidate";

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string, opts: { sitekey: string; callback: (token: string) => void }) => void;
    };
  }
}

type CandidateResult = { candidateId: string; name: string; count: number };
type ResultsResponse = { updatedAt: number | null; results: CandidateResult[] };
type Tab = "vote" | "results";

export default function VotingWidget({
  candidates,
  initialHasVoted,
  apiUrl,
}: {
  candidates: Candidate[];
  initialHasVoted: boolean;
  apiUrl: string;
}) {
  const [tab, setTab] = useState<Tab>("vote");
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [results, setResults] = useState<CandidateResult[] | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const showResults = async () => {
    setTab("results");
    if (results) return;
    setLoadingResults(true);
    try {
      const res = await fetch(`${apiUrl}/api/results`);
      const data: ResultsResponse = await res.json();
      setResults(data.results);
    } catch {
      setMessage("Couldn't load results, try again in a moment.");
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.onload = () => {
      window.turnstile?.render("#turnstile-widget", {
        sitekey: "1x00000000000000000000AA", // Cloudflare's public test key — always passes
        callback: (token) => setTurnstileToken(token),
      });
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  const handleVote = async (candidateId: string) => {
    if (!turnstileToken) {
      setMessage("Please complete the verification check first.");
      return;
    }
    setMessage("");
    try {
      const res = await fetch(`${apiUrl}/api/vote/${candidateId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstileToken }),
      });
      if (res.ok) {
        document.cookie = "voted=1; path=/; max-age=2592000; samesite=strict";
        setHasVoted(true);
        setMessage("Thanks for voting! 🎉");
      } else if (res.status === 409) {
        document.cookie = "voted=1; path=/; max-age=2592000; samesite=strict";
        setHasVoted(true);
        setMessage("Looks like you've already voted. 🎉");
      } else {
        setMessage("Vote didn't go through, try again. 😞");
      }
    } catch {
      setMessage("Network error casting vote.");
    }
  };

  return (
    <div className="voting-widget">
      <div id="turnstile-widget" />
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
            {candidates.map((candidate) => (
              <VoteCard
                key={candidate.id}
                imageSrc={candidate.imageSrc ?? ""}
                name={candidate.name}
                description={candidate.description ?? ""}
                youtubeLink={candidate.youtubeLink ?? undefined}
                facebookLink={candidate.facebookLink ?? undefined}
                onClick={() => handleVote(candidate.id)}
              />
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

function ResultsPanel({ results }: { results: CandidateResult[] }) {
  const sorted = [...results].sort((a, b) => b.count - a.count);
  const max = Math.max(...sorted.map((r) => r.count), 1);
  const total = sorted.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="results-grid">
      {sorted.map((r) => (
        <div key={r.candidateId} className="result-card">
          <div className="result-header">
            <span>{r.name}</span>
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