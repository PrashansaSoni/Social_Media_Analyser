const express = require('express')
const router = express.Router()
const {
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  toggleLike,
  toggleRetweet,
  addComment,
  deletePost,
  searchPosts
} = require('../controllers/postController')
const auth = require('../middleware/auth')

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, createPost)

// @route   GET /api/posts/feed
// @desc    Get timeline/feed posts
// @access  Private
router.get('/feed', auth, getFeed)

// @route   GET /api/posts/search
// @desc    Search posts
// @access  Public
router.get('/search', searchPosts)

// @route   GET /api/posts/user/:userId
// @desc    Get user's posts
// @access  Public
router.get('/user/:userId', getUserPosts)

// @route   GET /api/posts/:postId
// @desc    Get a single post
// @access  Public
router.get('/:postId', getPost)

// @route   POST /api/posts/:postId/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:postId/like', auth, toggleLike)

// @route   POST /api/posts/:postId/retweet
// @desc    Retweet/Unretweet a post
// @access  Private
router.post('/:postId/retweet', auth, toggleRetweet)

// @route   POST /api/posts/:postId/comment
// @desc    Add comment to a post
// @access  Private
router.post('/:postId/comment', auth, addComment)

// @route   DELETE /api/posts/:postId
// @desc    Delete a post
// @access  Private
router.delete('/:postId', auth, deletePost)

module.exports = router
