import http from '../http-common';

class MessagesService {
  // conversation between two users (user1,user2)
  getConversation = (user1, user2) => http.get(`/messages/conversation?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
}

export default new MessagesService();
