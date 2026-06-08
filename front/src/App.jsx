import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import PostPage from './pages/PostPage'
import ReviewsPage from './pages/ReviewsPage'
import ProfilePage from './pages/ProfilePage'

const App = () => {
	return (
		<Routes>
			<Route path="/" element={<LoginPage />} />
			<Route path="/home" element={<HomePage />} />
			<Route path="/games" element={<GamesPage />} />
			<Route path="/post" element={<PostPage />} />
			<Route path="/reviews" element={<ReviewsPage />} />
			<Route path="/profile" element={<ProfilePage />} />
		</Routes>
	)
}

export default App