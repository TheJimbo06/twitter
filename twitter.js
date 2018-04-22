/**
 * Module that helps making request to the Twitter API
 * @type {Twitter}
 */
const TwitterModule = require('twitter');

/**
 * Twitter object with authentication data
 * @type {Twitter}
 */
const client = new TwitterModule({
  consumer_key:         '',
  consumer_secret:      '',
  access_token_key:     '',
  access_token_secret:  '',
});

/**
 * Class representing functionality of the project.
 * It consists of all methods for work with Twitter API.
 * @requires twitter
 */
class Twitter {
  /**
   * Returns a collection of up to 100 user IDs belonging to users who have retweeted
   * the Tweet specified by the id parameter.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  getRetweeters (options) {
    return this.execute('statuses/retweeters/ids', options);
  }


  /**
   * Returns a collection of the 100 most recent retweets of the Tweet specified by the id parameter.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  getRetweets (options) {
    return this.execute('statuses/retweets', options);
  }


  /**
   * Returns a single Tweet, specified by the id parameter.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  showTweet(options) {
    return this.execute('statuses/show', options);
  }


  /**
   * Returns a collection of the most recent Tweets posted by the user.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  showUserTweets(options) {
    return this.execute('statuses/user_timeline', options);
  }


  /**
   * Returns a collection of relevant Tweets matching a specified query.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  searchTweets(options) {
    return this.execute('search/tweets', options);
  }


  /**
   * Provides a simple, relevance-based search interface to public user accounts on Twitter.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  searchUsers(options) {
    return this.execute('users/search', options);
  }


  /**
   * Returns a variety of information about the user
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  showUser (options) {
    return this.execute('users/show', options);
  }


  /**
   * Execute custom request to the Twitter API with GET method
   * @param {String} path - The endpoint of the Twitter API
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  execute(path, options) {
    return client.get(path, options);
  }


  /**
   * Execute custom request to the Twitter API with POST method
   * @param {String} path - The endpoint of the Twitter API
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  executePost(path, options) {
    return client.post(path, options);
  }

  /**
   * Updates the authenticating user’s current status, also known as Tweeting.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  postStatus(options) {
    return this.executePost('statuses/update', options);
  }


  /**
   * Sends a new Direct Message to the specified user from the authenticating user.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  sendMessage(options) {
    return this.executePost('direct_messages/events/new', options);
  }

  /**
   * Returns a collection of the 100 most recent retweets of the Tweet specified by the id parameter.
   * @param {Object} options - Options for the request
   * @returns {Promise} - The JSON response wrapped in promise
   */
  uploadPhoto(options) {
    const _this = this;
    const path = 'media/upload';
    const mediaType  = options.media_type;
    const mediaData   = require('fs').readFileSync(options.path_to_photo);
    const mediaSize    = require('fs').statSync(options.path_to_photo).size;
    let mediaId;

    /**
     * Helper function for initialization uploading photo.
     * @returns {Promise} - Result of the init stage.
     */
    function initUpload() {
      return _this.executePost(path, {
        command: 'INIT',
        total_bytes: mediaSize,
        media_type: mediaType,
      })
    }

    /**
     * Helper function for uploading photo.
     * @returns {Promise} - Result of the uploading stage.
     */
    function appendUpload(mediaId) {
      return _this.executePost(path, {
        command      : 'APPEND',
        media_id     : mediaId,
        media        : mediaData,
        segment_index: 0
      });
    }

    /**
     * Helper function for finalize uploading photo.
     * @returns {Promise} - Result of finalize stage.
     */
    function finalizeUpload(mediaId) {
      return _this.executePost(path, {
        command : 'FINALIZE',
        media_id: mediaId,
      });
    }

    return initUpload()
      .then(response => {
        mediaId = response.media_id_string;
        return appendUpload(mediaId);
      })
      .then(response => finalizeUpload(mediaId))
      .catch(err => console.log(err));
  }
}

module.exports =  new Twitter();
