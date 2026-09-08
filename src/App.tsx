import { useLanguage } from './i18n/useLanguage';
import { HomePage } from './pages/HomePage';
import { VotePage } from './pages/VotePage';
import { useAppRoute } from './router/useAppRoute';

function App() {
  const { route, navigate } = useAppRoute();
  const { lang, setLang, t } = useLanguage();
  const i18n = { lang, t, onLangChange: setLang };

  if (route === 'vote') return <VotePage onBack={() => navigate('home')} {...i18n} />;

  return <HomePage event={route === 'home' ? null : route} onNavigate={navigate} {...i18n} />;
}

export default App;
