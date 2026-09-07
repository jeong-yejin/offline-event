type VoteCandidateLogoProps = {
  candidate: {
    logo: string;
    name: string;
  };
};

export function VoteCandidateLogo({ candidate }: VoteCandidateLogoProps) {
  return <img className="vote-card-logo" src={`/assets/sponsors/${candidate.logo}`} alt={`${candidate.name} logo`} />;
}
