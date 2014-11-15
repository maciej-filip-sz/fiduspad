var firepad = firepad || { };

firepad.FidusAttributeConstants = {
  FIDUS_COMMENT: 'comment',
};

firepad.FidusAnnotators = (function () {
  'use strict';

  var ATTR = firepad.FidusAttributeConstants;

  return {
    comment: function comment() {
      this.richTextCodeMirror_.toggleAttribute('comment');
      this.codeMirror_.focus();
    },
  };
}());