describe('Comment', function () {
  'use strict';
  var Fiduspad = fiduspad.Fiduspad;
  var TextOperation = firepad.TextOperation;
  var Pos = CodeMirror.Pos;
  var _cmDiv;

  function cmDiv() {
    if (!_cmDiv) {
      _cmDiv = document.createElement('div');
      //_cmDiv.style.display = 'none';
      document.body.appendChild(_cmDiv);
    }
    return _cmDiv;
  }

  function makeFidusPad(htmlContents) {
    var fp = new Fiduspad(
      new Firebase('https://firepad-test.firebaseio-demo.com').push(),
      new CodeMirror(cmDiv())
    );

    return fp;    
  }

  function getViewHTML(fp, lineNo) {
    return fp.codeMirror_.display.view[lineNo].node.innerHTML;
  }

  function setSelection(fp, selection) {
    return fp.codeMirror_.setSelection(selection.from, selection.to);
  }

  function getMarkedSpans(fp, lineNo) {
    return fp.codeMirror_.doc.children[0].lines[lineNo].markedSpans;
  }


  describe('display', function () {
    var cases = [
      { description: 'marks range with comment style',
        givenContents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        // Lorem |ipsum| dolor sit amet, consectetur adipiscing elit.
        givenSelection: {
          from: new Pos(0, 1+ 'Lorem '.length),   // !!! why is there an offset?
          to: new Pos(0, 1+ 'Lorem '.length + 'ipsum'.length),
        },
        expectedClassName: ' firepad-comment',    // !!! why are there leading spaces?
        expectedRange: {
          from: 1+ 'Lorem '.length,
          to: 1+ 'Lorem '.length + 'ipsum'.length
        },
        expectedHTML: [
          '<span style="padding-right: 0.1px; ">',
            'Lorem ',
            '<span class="  firepad-comment">ipsum</span>',
            ' dolor sit amet, consectetur adipiscing elit.',
          '</span>'
        ].join(''),
      },
    ];

    cases.forEach(function (c_) {
      it(c_.description, function (done) {
        var fp = makeFidusPad();
        fp.on('ready', function () {
          fp.setHtml(c_.givenContents);
          setSelection(fp, c_.givenSelection);
          fp.comment();

          var markedSpan = getMarkedSpans(fp, 0)[1];
          var actualRange = {
            from: markedSpan.from,
            to: markedSpan.to
          };
          var actualClassName = markedSpan.marker.className;

          expect(actualRange).toEqual(c_.expectedRange);
          expect(actualClassName).toBe(c_.expectedClassName);
          expect(getViewHTML(fp, 0)).toEqual(c_.expectedHTML);
          done();
        });
      });
    });
  });
});