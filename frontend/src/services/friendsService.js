import http from '../http-common';

class FriendsService {
  listFriends = (username) => http.get(`/friends/list?username=${encodeURIComponent(username)}`);
  searchUsers = (q) => http.get(`/friends/search?q=${encodeURIComponent(q)}`);
  sendRequest = (from, to) => http.post('/friends/request', { from, to });
  acceptRequest = (from, to) => http.post('/friends/accept', { from, to });
  listPending = (username) => http.get(`/friends/pending?username=${encodeURIComponent(username)}`);
}

export default new FriendsService();
