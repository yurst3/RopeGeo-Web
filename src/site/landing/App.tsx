import { DocumentationPage } from './pages/documentation/DocumentationPage';
import { RopewikiScraperPage } from './pages/documentation/RopewikiScraperPage';
import { LandingPage } from './pages/landing/LandingPage';
import { PrivacyPolicyPage } from './pages/privacy/PrivacyPolicyPage';
import { getWebRoute } from './utils/routing';

export default function App() {
    const route = getWebRoute();

    if (route === 'privacy') {
        return <PrivacyPolicyPage />;
    }

    if (route === 'documentation') {
        return <DocumentationPage />;
    }

    if (route === 'documentation-ropewikiscraper') {
        return <RopewikiScraperPage />;
    }

    return <LandingPage />;
}
