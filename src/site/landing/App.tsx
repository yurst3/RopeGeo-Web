import { LandingPage } from './pages/landing/LandingPage';
import { PrivacyPolicyPage } from './pages/privacy/PrivacyPolicyPage';
import { getWebRoute } from './utils/routing';

export default function App() {
    return getWebRoute() === 'privacy' ? (
        <PrivacyPolicyPage />
    ) : (
        <LandingPage />
    );
}
