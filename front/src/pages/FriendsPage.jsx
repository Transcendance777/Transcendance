import FriendsNavBar from '../components/FriendsNavBar'
import Background from '../components/Background'
import FriendsList from '../components/FriendsList'
import FriendsActivity from '../components/FriendsActivity'
import '../styles/FriendsPage.css'

const FriendsPage = () => {
	return (
		<div className="friends-page">
			<FriendsNavBar />
			<Background style={{ alignItems: "flex-start" }}>
				<div className="friends-content">
					<FriendsList />
					<FriendsActivity />
				</div>
			</Background>
		</div>
	)
}

export default FriendsPage