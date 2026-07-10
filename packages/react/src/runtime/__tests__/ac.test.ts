import { ac, memoizedAc, getCache } from '../ac';

describe('ac', () => {
  const isEnabled: boolean = (() => false)();

  it.each([
    ['should handle empty array', [], undefined],
    ['should handle array with undefined', [undefined], undefined],
    ['should join single classes together', ['foo', 'bar'], 'foo bar'],
    ['should join multi classes together', ['foo baz', 'bar'], 'foo baz bar'],
    ['should remove undefined', ['foo', 'bar', undefined], 'foo bar'],
    [
      'should ensure the last atomic declaration of a single group wins',
      ['_aaaaaabbbb', '_aaaaaacccc'],
      '_aaaaaacccc',
    ],
    [
      'should ensure the last atomic declaration of a single group with short class name wins',
      ['_aaaaaabbbb', '_aaaaaacccc', '_aaaaaa_a'],
      'a',
    ],
    [
      'should ensure the last atomic declaration of many single groups wins',
      ['_aaaaaabbbb', '_aaaaaacccc', '_aaaaaadddd', '_aaaaaaeeee'],
      '_aaaaaaeeee',
    ],
    [
      'should ensure the last atomic declaration of many single groups with short class name wins',
      ['_aaaaaabbbb', '_aaaaaacccc', '_aaaaaa_a', '_aaaaaa_b'],
      'b',
    ],
    [
      'should ensure the last atomic declaration of a multi group wins',
      ['_aaaaaabbbb _aaaaaacccc'],
      '_aaaaaacccc',
    ],
    [
      'should ensure the last atomic declaration of a multi group with short class name wins',
      ['_aaaaaa_e', '_aaaaaabbbb _aaaaaacccc'],
      '_aaaaaacccc',
    ],
    [
      'should ensure the last atomic declaration of many multi groups wins',
      ['_aaaaaabbbb _aaaaaacccc _aaaaaadddd _aaaaaaeeee'],
      '_aaaaaaeeee',
    ],
    [
      'should ensure the last atomic declaration of many multi groups with short class name wins',
      ['_aaaaaabbbb', '_aaaaaa_a', '_bbbbbb_b', '_ddddddcccc'],
      'a b _ddddddcccc',
    ],
    [
      'should not remove any atomic declarations if there are no duplicate groups',
      ['_aaaaaabbbb', '_bbbbbcccc'],
      '_aaaaaabbbb _bbbbbcccc',
    ],
    [
      'should not remove any atomic declarations if there are short class name and no duplicate groups',
      ['_eeeeee_e', '_aaaaaabbbb', '_bbbbbcccc'],
      'e _aaaaaabbbb _bbbbbcccc',
    ],
    ['should not apply conditional class', [isEnabled && 'foo', 'bar'], 'bar'],
    [
      'should ignore non atomic declarations',
      ['hello_there', 'hello_world'],
      'hello_there hello_world',
    ],
    [
      'should ignore non atomic declarations when atomic declarations exist',
      ['hello_there', 'hello_world', '_aaaaaabbbb'],
      'hello_there hello_world _aaaaaabbbb',
    ],
    [
      'should ignore non atomic declarations when atomic declarations with short class name exist',
      ['hello_there', 'hello_world', '_aaaaaa_a'],
      'hello_there hello_world a',
    ],
  ])('%s', (_, params, result) => {
    expect(result).toEqual(ac(params)?.toString());
  });

  it('should ensure the last atomic declaration wins if calling ax multiple times with short class names', () => {
    expect(ac([ac(['_aaaaaa_b']), '_aaaaaa_c'])?.toString()).toEqual('c');
  });
});

describe('memoizedAc', () => {
  it('should cache correctly', () => {
    memoizedAc([memoizedAc(['_aaaaaa_b', '_aaaaaabbbb', 'hello_world']), '_bbbbbb_d', '_aaaaaa_e']);

    expect(getCache()).toMatchInlineSnapshot(`
      Map {
        "_aaaaaa_b _aaaaaabbbb hello_world" => AtomicGroups {
          "values": Map {
            "_aaaaaa" => "_aaaaaabbbb",
            "hello_world" => "hello_world",
          },
        },
        "_aaaaaabbbb hello_world _bbbbbb_d _aaaaaa_e" => AtomicGroups {
          "values": Map {
            "_aaaaaa" => "e",
            "hello_world" => "hello_world",
            "_bbbbbb" => "d",
          },
        },
      }
    `);
  });
  it('should not create a new ref', () => {
    expect(memoizedAc(['a'])).toBe(memoizedAc(['a']));
  });
});
