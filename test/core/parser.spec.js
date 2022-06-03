import { describe } from 'node-tdd';
import { expect } from 'chai';
import { Ref } from '../../src/core/ref.js';
import parser from '../../src/core/parser.js';
import Context from '../../src/core/context.js';
import generateParsedNeedle from '../helper/generate-parsed-needle.js';
import parsedNeedleToStringArray from '../helper/parsed-needle-to-string-array.js';

const parse = (input, ctx = {}) => parser.parse(input, Context(ctx));

const asString = (() => {
  const asStringRec = (input) => {
    if (Array.isArray(input)) {
      return `[${input.map((e) => asStringRec(e)).join(',')}]`;
    }
    if (input instanceof Set) {
      return `{${[...input].map((e) => asStringRec(e)).join(',')}}`;
    }
    if (input instanceof Ref) {
      return input;
    }
    return `${input.excluded === true ? '!' : ''}"${input.value}"`;
  };
  return (input) => asStringRec(parse(input));
})();

const checkError = (input, msg, useArraySelector = true) => {
  expect(() => parse(input, { useArraySelector })).to.throw(msg);
};

describe('Testing Parser', () => {
  it('Test Result Stabilizes', () => {
    const parsedNeedleToString = (obj) => parsedNeedleToStringArray(obj)
      .map((e) => (e.value === undefined ? e : e.value))
      .join(',');
    for (let idx = 0; idx < 1000; idx += 1) {
      const needle = parsedNeedleToString(generateParsedNeedle());
      const parsed = parse(needle);
      const needleOptimized = parsedNeedleToString(parsed);
      const parsedOptimized = parse(needleOptimized);
      expect(needleOptimized).to.deep.equal(parsedNeedleToString(parsedOptimized));
    }
  });

  describe('Complex Use Cases', () => {
    it('Testing Path Groups', () => {
      expect(asString('{a,b.c}')).to.equal('{"a",["b","c"]}');
    });

    it('Testing Nested Groups', () => {
      expect(asString('{a,{b,c}}')).to.deep.equal('{"a","b","c"}');
      expect(asString('{a,{b,{c}}}')).to.deep.equal('{"a","b","c"}');
    });

    it('Testing Array Group Content', () => {
      expect(asString('[{1,{0,1}}]')).to.deep.equal('{"[1]","[0]","[1]"}');
      expect(asString('[{{0,1},1}]')).to.deep.equal('{"[0]","[1]","[1]"}');
    });
  });

  describe('Testing Simple Use Cases', () => {
    it('Testing Empty', () => {
      expect(asString('')).to.deep.equal('""');
    });

    it('Testing Simple', () => {
      expect(asString('a')).to.deep.equal('"a"');
    });

    it('Testing Path', () => {
      expect(asString('a.b')).to.deep.equal('["a","b"]');
    });

    it('Testing Array', () => {
      expect(asString('a[0]')).to.deep.equal('["a","[0]"]');
    });

    it('Testing Or', () => {
      expect(asString('{a,b}')).to.deep.equal('{"a","b"}');
    });

    it('Testing Comma Outside Group', () => {
      expect(asString('a,b')).to.deep.equal('{"a","b"}');
      expect(asString('a.b,c.d')).to.deep.equal('{["a","b"],["c","d"]}');
    });

    it('Testing Or In Array', () => {
      expect(asString('[{0,1}]')).to.deep.equal('{"[0]","[1]"}');
    });

    it('Testing Array In Or', () => {
      expect(asString('{[0],[1]}')).to.deep.equal('{"[0]","[1]"}');
    });

    it('Testing Array in Path', () => {
      expect(asString('a.*.c[0]')).to.deep.equal('["a","*","c","[0]"]');
    });

    it('Testing Array After Or', () => {
      expect(asString('{a,b}[0]')).to.deep.equal('[{"a","b"},"[0]"]');
    });
  });

  describe('Testing Escaping', () => {
    it('Testing Path Escaped', () => {
      expect(asString('a\\.b')).to.deep.equal('"a\\.b"');
    });

    it('Testing Or Escaped', () => {
      expect(asString('{a\\,b}')).to.deep.equal('"a\\,b"');
    });

    it('Testing Escaped final Dot', () => {
      expect(asString('a.\\.')).to.deep.equal('["a","\\."]');
    });
  });

  describe('Testing Parentheses', () => {
    describe('Testing Parentheses Errors', () => {
      it('Testing Not Terminated', () => {
        checkError('(', 'Unterminated Parentheses: (');
      });

      it('Testing Not Previously Opened', () => {
        checkError(')', 'Unexpected Parentheses: ), char 0');
      });
    });

    it('Testing Escaped Inside', () => {
      expect(asString('(\\()')).to.deep.equal('"(\\()"');
    });
  });

  describe('Invalid Escape', () => {
    it('Testing Dangling', () => {
      checkError('\\', 'Dangling Escape: \\, char 0');
    });
  });

  describe('Invalid Dot Selector', () => {
    it('Testing Starts with Dot', () => {
      checkError('.a', 'Bad Path Separator: .a, char 0');
    });

    it('Testing Ends with Dot', () => {
      checkError('a.', 'Bad Terminator: a., char 2');
    });

    it('Testing Double Dot', () => {
      checkError('a..b', 'Bad Path Separator: a..b, char 2');
    });
  });

  describe('Array Selector', () => {
    it('Testing Empty Array', () => {
      checkError('[]', 'Bad Array Terminator: [], char 1');
    });

    it('Testing Invalid Array Content', () => {
      checkError('[a]', 'Bad Array Selector: [a], selector a');
    });

    it('Testing Invalid Array Group Content', () => {
      checkError('[{1,{0,1,a}}]', 'Bad Array Selector: [{1,{0,1,a}}], selector a');
    });

    it('Testing Only Opening Bracket', () => {
      checkError('[{1}', 'Non Terminated Array: [{1}');
    });

    it('Testing Starts with Bracket', () => {
      checkError('[a', 'Bad Array Selector: [a, selector a');
    });

    it('Testing Ends with Bracket', () => {
      checkError('a]', 'Bad Array Terminator: a], char 1');
    });

    it('Testing Nested Array Notation', () => {
      checkError('[[', 'Bad Array Start: [[, char 1');
    });

    it('Testing Double Nested Array In Group', () => {
      checkError('[{1,[2]}]', 'Bad Array Start: [{1,[2]}], char 4');
    });

    it('Testing Or In Array Escaped (Invalid Group)', () => {
      checkError('[{0\\,1}]', 'Bad Array Selector: [{0\\,1}], selector 0\\,1');
    });

    it('Testing Array Escaped', () => {
      checkError('a\\[0]', 'Bad Array Terminator: a\\[0], char 4');
    });

    it('Testing Array Selector Used When Not Allowed', () => {
      checkError('a[0]', 'Forbidden Array Selector: a[0], char 1', false);
    });
  });

  describe('Simple Group Selector', () => {
    it('Testing Starts with Curly Bracket', () => {
      checkError('{a', 'Non Terminated Group: {a');
    });

    it('Testing Ends with Curly Bracket', () => {
      checkError('a}', 'Unexpected Group Terminator: a}, char 1');
    });

    it('Testing Group Starts with Comma', () => {
      checkError('{,1,2}', 'Bad Group Separator: {,1,2}, char 1');
    });

    it('Testing Group Ends with Comma', () => {
      checkError('{1,2,}', 'Bad Group Terminator: {1,2,}, char 5');
    });

    it('Testing Group Starts After Element', () => {
      checkError('\\.{2,3}', 'Bad Group Start: \\.{2,3}, char 2');
    });

    it('Testing Group Starts After Group', () => {
      checkError('{1,2}{2,3}', 'Bad Group Start: {1,2}{2,3}, char 5');
    });
  });

  describe('Testing Exclusion', () => {
    it('Testing Basic Exclusion', () => {
      expect(asString('{a,!b.c}')).to.equal('{"a",[!"b","c"]}');
      expect(asString('{a,b.!c}')).to.equal('{"a",["b",!"c"]}');
      expect(asString('{!a,b.c}')).to.equal('{!"a",["b","c"]}');
      expect(asString('!{a,b.c}')).to.equal('{!"a",[!"b","c"]}');
      expect(asString('!a.!b')).to.equal('[!"a",!"b"]');
      expect(asString('[!0][!1]')).to.equal('[!"[0]",!"[1]"]');
      expect(asString('!{{a,b},{c,d}}')).to.equal('{!"a",!"b",!"c",!"d"}');
    });

    it('Testing Array Exclusion', () => {
      expect(asString('{[0],[!1][2]}')).to.equal('{"[0]",[!"[1]","[2]"]}');
      expect(asString('{[0],[1][!2]}')).to.equal('{"[0]",["[1]",!"[2]"]}');
      expect(asString('{[!0],[1][2]}')).to.equal('{!"[0]",["[1]","[2]"]}');
      expect(asString('{[0],![1][2]}')).to.equal('{"[0]",[!"[1]","[2]"]}');
      expect(asString('![1][{2,3}][4]')).to.equal('[!"[1]",{"[2]","[3]"},"[4]"]');
      expect(asString('!{[0][1],[1][2]}')).to.equal('{[!"[0]","[1]"],[!"[1]","[2]"]}');
    });

    it('Testing Exclusion in Path Group', () => {
      expect(asString('**.{*,!location}.lat'))
        .to.equal('["**",{"*",!"location"},"lat"]');
    });

    it('Testing Redundant Exclusion', () => {
      expect(asString('!a.!b')).to.equal('[!"a",!"b"]');
    });

    it('Nested Redundant Exclusions', () => {
      expect(asString('!{[1][2],*,{a,b},{a},{{a}},{a.!b}}'))
        .to.equal('{[!"[1]","[2]"],!"*",!"a",!"b",!"a",!"a",[!"a",!"b"]}');
    });

    it('Correct Across Exclusion Merging', () => {
      expect(asString('a,!a,a'))
        .to.equal('{"a",!"a","a"}');
    });

    describe('Testing Exclusion Errors', () => {
      it('Testing double exclusion', () => {
        checkError('!!text', 'Bad Exclusion: !!text, char 1');
      });

      it('Testing redundant exclusion', () => {
        checkError('!{!a,b}', 'Redundant Exclusion: !{!a,b}, char 2');
      });

      it('Testing redundant exclusion (deeply nested)', () => {
        checkError('!{a,{{!b}}}', '!{a,{{!b}}}, char 6');
      });

      it('Testing in-word exclusion', () => {
        checkError('test.te!st', 'Bad Exclusion: test.te!st, char 7');
      });

      it('Testing non terminated exclusion', () => {
        checkError('!', 'Bad Terminator: !, char 1');
      });
    });

    describe('Testing multi step recursion', () => {
      it('Testing basic two step (star)', () => {
        expect(asString('**{a.b}')).to.equal('[<**:1:{>,["a","b"],<}:1:**>]');
      });

      it('Testing basic two step (star and array)', () => {
        expect(asString('**{[0][1]}')).to.equal('[<**:1:{>,["[0]","[1]"],<}:1:**>]');
      });

      it('Testing basic two step (star and mixed in group)', () => {
        expect(asString('**{[0].a,[1].b}')).to.equal('[<**:1:{>,{["[0]","a"],["[1]","b"]},<}:1:**>]');
      });

      it('Testing basic two step (plus)', () => {
        expect(asString('++{a.b}')).to.equal('[<++:1:{>,["a","b"],<}:1:++>]');
      });

      it('Testing or group', () => {
        expect(asString('**{a.b,c.d}')).to.equal('[<**:1:{>,{["a","b"],["c","d"]},<}:1:**>]');
      });

      it('Testing star chain is not multi step recursion', () => {
        expect(asString('**.a.b')).to.equal('["**","a","b"]');
      });

      it('Testing complex', () => {
        expect(asString('**{a.**.b}')).to.equal('[<**:1:{>,["a","**","b"],<}:1:**>]');
      });

      it('Testing bad group start', () => {
        checkError('***{a.b}', 'Bad Group Start: ***{a.b}, char 3');
      });

      it('Testing multiple nested groups', () => {
        expect(asString('{{**{a},{b}},**{{c},{d}}}'))
          .to.equal('{[<**:1:{>,"a",<}:1:**>],"b",[<**:2:{>,{"c","d"},<}:2:**>]}');
      });

      it('Testing nested group inside nested group', () => {
        expect(asString('**{a.b,c.**{d.e}.f}'))
          .to.equal('[<**:1:{>,{["a","b"],["c",<**:2:{>,["d","e"],<}:2:**>,"f"]},<}:1:**>]');
      });

      it('Testing mixed groups', () => {
        expect(asString('nn.**{[{1,2}][0][*]}.a'))
          .to.equal('["nn",<**:1:{>,[{"[1]","[2]"},"[0]","[*]"],<}:1:**>,"a"]');
      });

      it('Testing redundant group nested', () => {
        expect(asString('{a.b.c.d,c.d.b.a}.**{c,d}.{a.b.c.d.a,d.c.b.a.d}'))
          .to.equal(
            '[{["a","b","c","d"],["c","d","b","a"]},'
          + '<**:1:{>,{"c","d"},<}:1:**>,'
          + '{["a","b","c","d","a"],["d","c","b","a","d"]}]'
          );
      });
    });
  });
});
