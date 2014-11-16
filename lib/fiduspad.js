var fiduspad = fiduspad || { };

fiduspad.Fiduspad = (function(_super) {
  'use strict';
  fiduspad.utils.__extends(Fiduspad, _super);

  var ATTR = {
    FIDUS_COMMENT: 'comment',
  };


  function Fiduspad() {
    return Fiduspad.__super__.constructor.apply(this, arguments);
  }

  Fiduspad.prototype.comment = function comment() {
    this.richTextCodeMirror_.toggleAttribute(ATTR.FIDUS_COMMENT);
    this.codeMirror_.focus();
  };


  return Fiduspad;
})(firepad.Firepad);