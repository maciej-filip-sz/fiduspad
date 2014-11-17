var fiduspad = fiduspad || { };

fiduspad.CommentStore = (function (){
  'use strict';

  function CommentStore() {
    this.lastCommentId_ = 0;
    this.store_ = {};

    return this;
  }

  // (CommentStore) Comment -> (CommentStore)
  CommentStore.prototype.save = function save(comment) {
    this.store_[comment.id] = comment;

    this.trigger('commentSaved', comment);
  };

  // (CommentStore) CommentId -> Comment
  CommentStore.prototype.get = function get(commentId) {
    return this.store_[commentId] || null;
  };

  // (CommentStore) CommentId -> (CommentStore)
  CommentStore.prototype.delete = function delete_(commentId) {
    var c = this.get(commentId);

    delete this.store_[commentId];

    this.trigger('commentDeleted', c);
  };

  // (CommentStore) -> (CommentStore) CommentId
  CommentStore.prototype.nextCommentId = function nextCommentId() {
    this.lastCommentId_ += 1;
    if (this.lastCommentId_ < 1) {
      throw new Error('CommentStore generated invalid CommentId.');
    }

    return this.lastCommentId_;
  };

  firepad.utils.makeEventEmitter(CommentStore);

  return CommentStore;
}());


fiduspad.Fiduspad = (function(_super) {
  'use strict';
  fiduspad.utils.__extends(Fiduspad, _super);

  // CONSTANTS
  // the separator is here for reference only
  var CLASSNAME_SEPARATOR = '-';

  var ATTR = {
    COMMENT_STYLE: 'comment',
    COMMENT_ID: 'cid',
  };

  // extracts commentId from a className
  var COMMENT_ID_REGEXP = new RegExp([
    ATTR.COMMENT_ID,
    CLASSNAME_SEPARATOR,
    '([0-9]+)',
  ].join(''));

  // DATA
  // Comment is {id: CommentId ...}
  // CommentId is Integer[1,]


  /**
   *  !!!
      Fires events:

        commentAdded  
        commentMousedown
        commentRemoved
   */
  function Fiduspad(commentStore) {
    Fiduspad.__super__.constructor.apply(
      this,
      Array.prototype.slice.call(arguments, 1)
    );
    this.addCommentStore_(commentStore);
    this.bubbleCommentMousedown();

    return this;
  }


  // Whenever a comment is clicked on, fire an event with the comment data
  // attached.
  // (Fiduspad) (CodeMirror) -> (Fiduspad) (CodeMirror)
  Fiduspad.prototype.bubbleCommentMousedown = function bubbleCommentMousedown() {
    this.codeMirror_.on(
      'mousedown',
      (function(cm, evt){
        var target = evt.originalTarget || evt.explicitOriginalTarget;
        var className = target.className;
        if (!className || !className.contains(ATTR.COMMENT_STYLE)) {
          return;
        }

        this.trigger(
          'commentMousedown',
          this.commentFromClassName(className)
        );
      }).bind(this)
    );
  };


  // Fetches the comment referred to in the given className.
  // (Fiduspad) String -> Comment
  Fiduspad.prototype.commentFromClassName = function commentFromClassName(className) {
    return this.commentStore.get(
      COMMENT_ID_REGEXP.exec(className)[1]
    );
  };


  // Sets up bubbling of CommentStore events.
  // (Fiduspad) CommentStore -> (Fiduspad) (CommentStore)
  Fiduspad.prototype.addCommentStore_ = function addCommentStore_(cs) {
    this.commentStore = cs;
    cs.on(
      'commentSaved',
      (function (c) {
        this.trigger('commentSaved', c);
      }).bind(this)
    );
    cs.on(
      'commentDeleted',
      (function (c) {
        this.trigger('commentDeleted', c);
      }).bind(this)
    );
  };


  // ...
  // !!!
  // ??? ({Attribute} -> ()) -> ???
  Fiduspad.prototype.comment_ = function comment_(fn) {
    // TODO: properly extend RichTextCodeMirror
    var cm = this.codeMirror_;
    var startCur = cm.getCursor('start');
    
    this.richTextCodeMirror_.updateTextAttributes(
      cm.indexFromPos(startCur),
      cm.indexFromPos(cm.getCursor('end')),
      fn
    );
    this.richTextCodeMirror_.updateCurrentAttributes_();

    cm.focus();
  };


  // Mark the current selection as a new comment.
  // Will not overwrite existing comments in selection.
  // May fail if selection is inside an existing comment.
  // ??? -> ??? CommentId
  Fiduspad.prototype.makeComment = function makeComment() {
    var added = false;
    var c = {
      id: this.commentStore.nextCommentId()
    };

    this.comment_(function (attributes) {
      // keep existing comments
      if (attributes[ATTR.COMMENT_ID]) {
        return;
      }
      attributes[ATTR.COMMENT_STYLE] = true;
      attributes[ATTR.COMMENT_ID] = c.id;
      added = true;
    });

    if (added) {
      this.commentStore.save(c);
    }

    return (added) ? c.id : null;
  };

  // ...
  // !!!
  // ??? CommentId -> ??? Boolean
  Fiduspad.prototype.removeComment = function removeComment(commentId) {
    var removed = false;

    this.comment_(function removeStyleMarkup(attributes) {
      if (commentId === attributes[ATTR.COMMENT_ID]) {
        delete attributes[ATTR.COMMENT_ID];
        delete attributes[ATTR.COMMENT_STYLE];
        removed = true;
      }
    });

    if (removed) {
      this.commentStore.delete(commentId);
    }

    return removed;
  };


  return Fiduspad;
})(firepad.Firepad);