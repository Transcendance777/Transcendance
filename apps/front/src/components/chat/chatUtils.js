export const getAvatar = (user) => {
	if (user?.avatarUrl && user.avatarUrl !== 'default_avatar.png') return user.avatarUrl
	return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}&background=f5a623&color=fff&size=128&bold=true`
}

export const getOtherUser = (conversation, currentUserId) => (
	conversation.participants?.find(participant => participant.userId !== currentUserId)?.user
	|| conversation.participants?.[0]?.user
)
