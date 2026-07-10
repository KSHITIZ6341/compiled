// eslint-disable-next-line import/no-extraneous-dependencies
import { styled } from '@compiled/react';
import { render } from '@testing-library/react';
import React from 'react';

import Style from '../runtime/style';

jest.mock('../runtime/is-server-environment', () => ({
  isServerEnvironment: () => false,
}));

describe('browser', () => {
  beforeEach(() => {
    // Reset style tags in head before each test so that it will remove styles
    // injected by test
    document.head.querySelectorAll('style').forEach((styleElement) => {
      styleElement.textContent = '';
    });
  });

  it('should not render styles inline', () => {
    const StyledDiv = styled.div`
      font-size: 12px;
    `;

    const { baseElement } = render(<StyledDiv>hello world</StyledDiv>);

    expect(baseElement.innerHTML).toMatchInlineSnapshot(
      `"<div><div class="_3UwI_E6Icq">hello world</div></div>"`
    );
  });

  it('should only render one style block to the head if its already been moved', () => {
    const StyledDiv = styled.div`
      font-size: 14px;
    `;

    render(
      <>
        <StyledDiv>hello world</StyledDiv>
        <StyledDiv>hello world</StyledDiv>
      </>
    );

    expect(document.head.innerHTML).toMatchInlineSnapshot(
      `"<style nonce="k0Mp1lEd">._3UwI_E0Ld3{font-size:14px}</style>"`
    );
  });

  it('should render style tags in buckets', () => {
    const StyledLink = styled.a`
      display: flex;
      font-size: 50px;
      color: purple;
      :hover {
        color: yellow;
      }
      :active {
        color: blue;
      }
      :link {
        color: red;
      }
      @supports (display: grid) {
        :active {
          color: black;
        }
        :focus {
          color: yellow;
        }
      }
      :focus {
        color: green;
      }
      :link,
      :focus-visible {
        color: white;
      }
      :visited {
        color: pink;
      }
      @media (max-width: 800px) {
        :active {
          color: black;
        }
        :focus {
          color: yellow;
        }
        :hover,
        :focus-visible {
          color: grey;
        }
      }
    `;

    render(<StyledLink href="https://atlassian.design">Atlassian Design System</StyledLink>);

    expect(document.head.innerHTML.split('</style>').join('</style>\n')).toMatchInlineSnapshot(`
      "<style nonce="k0Mp1lEd">._2Qfcr9G8Oh{display:flex}._3UwI_E15Yp{font-size:50px}._1Emim_mcKz{color:purple}._1ZrpKzS_pl:link{color:red}._1LQ9a7pI5g:focus-visible{color:white}._1ZrpKzpI5g:link{color:white}._22gsiY3sd8:visited{color:pink}._0SXJg7ai4l:focus{color:green}._0aTL7QRo7r:hover{color:yellow}._0yanZOaLVw:active{color:blue}</style>
      <style nonce="k0Mp1lEd">@media (max-width:800px){._3p9fKORo7r:focus{color:yellow}._15CSXZOXik:focus-visible{color:grey}._0lL788OXik:hover{color:grey}._2L8JiwHkrc:active{color:black}}@supports (display:grid){._2O7y4TRo7r:focus{color:yellow}._0rI57BHkrc:active{color:black}}</style>
      "
    `);
  });

  it('should inject at-rule-wrapped non-atomic rules into the catch-all bucket, not an at-rule bucket', () => {
    // cc-zzzzzz sorts AFTER cc-aaaaaa lexically, but must appear FIRST (source order)
    const baseMediaRule = '@media (min-width:1px){.cc-zzzzzz .panel{background:gray}}';
    const overrideMediaRule = '@media (min-width:1px){.cc-aaaaaa .panel{background:pink}}';
    const atomicMediaRule = '@media (min-width:1px){._bbbbbbbb{color:blue}}';

    // Two <Style> components — one per cssMapScoped variant, like real usage
    render(
      <>
        <Style>{[baseMediaRule]}</Style>
        <Style>{[overrideMediaRule, atomicMediaRule]}</Style>
      </>
    );

    // Non-atomic @media rules go to catch-all bucket in source order (cc-zzzzzz before cc-aaaaaa),
    // atomic @media rule goes to a separate at-rule bucket.
    const styleTexts = Array.from(document.head.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .filter((t) => t.length > 0);
    expect(styleTexts).toMatchInlineSnapshot(`
      [
        "@media (min-width:1px){.cc-zzzzzz .panel{background:gray}}@media (min-width:1px){.cc-aaaaaa .panel{background:pink}}",
        "@media (min-width:1px){._bbbbbbbb{color:blue}}",
      ]
    `);
  });
});
