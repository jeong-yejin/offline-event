import { HomePage } from './pages/HomePage';
import { VotePage } from './pages/VotePage';
import { useAppRoute } from './router/useAppRoute';

function App() {
  const { route, navigate } = useAppRoute();

  if (route === 'vote') return <VotePage onBack={() => navigate('home')} />;

  return <HomePage onVote={() => navigate('vote')} />;
}

export default App;
