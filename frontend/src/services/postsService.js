import http from '../http-common';

class PostsService {
  createPost = (data) => http.post('/posts', data);
  getFeed = (username) => http.get(`/posts/feed?username=${encodeURIComponent(username)}`);
  commentOnPost = (postId, payload) => http.post(`/posts/${postId}/comment`, payload);
  getUserPosts = (username) => http.get(`/posts/user?username=${encodeURIComponent(username)}`);
}

export default new PostsService();
