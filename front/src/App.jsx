import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import PostPage from './pages/PostPage'
import ReviewsPage from './pages/ReviewsPage'
import ProfilePage from './pages/ProfilePage'
import OtherProfilePage from './pages/OtherProfilePage'
import SettingsPage from './pages/SettingsPage'
import GamePresentationPage from './pages/GamePresentationPage'
import FriendsPage from './pages/FriendsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

const App = () => {
	return (
		<Routes>
			<Route path="/" element={<LoginPage />} />
			<Route path="/home" element={<HomePage />} />
			<Route path="/games" element={<GamesPage />} />
			<Route path="/post" element={<PostPage />} />
			<Route path="/reviews" element={<ReviewsPage />} />
			<Route path="/profile" element={<ProfilePage />} />
			<Route path="/profile/:userId" element={<OtherProfilePage />} />
			<Route path="/settings" element={<SettingsPage />} />
			<Route path="/game/:id" element={<GamePresentationPage />} />
			<Route path="/friends" element={<FriendsPage />} />
			<Route path="/privacy" element={<PrivacyPolicyPage />} />
			<Route path="/terms" element={<TermsOfServicePage />} />
		</Routes>
	)
}

export default App