/**
 * @jest-environment node
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { styled } from '@compiled/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { CC as CompiledRoot } from '@compiled/react/runtime';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

describe('SSR', () => {
  it('should render styles inline', () => {
    const StyledDiv = styled.div`
      font-size: 12px;
    `;

    const result = renderToStaticMarkup(<StyledDiv>hello world</StyledDiv>);

    expect(result).toMatchInlineSnapshot(
      `"<style data-cmpld="true" nonce="k0Mp1lEd">._3UwI_E6Icq{font-size:12px}</style><div class="_3UwI_E6Icq">hello world</div>"`
    );
  });

  it('should not render undefined into the output HTML when the interpolation is undefined', () => {
    const Interpolation = styled.div<{ fontSize?: number }>`
      font-size: ${(props) => props.fontSize}px;
    `;

    const result = renderToStaticMarkup(<Interpolation>hello world</Interpolation>);

    expect(result).not.toContain('undefined');
  });

  it('should only render one style block when wrapped in a compiled component when siblings', () => {
    const StyledDiv = styled.div`
      font-size: 12px;
    `;

    const result = renderToStaticMarkup(
      <CompiledRoot>
        <StyledDiv>hello world</StyledDiv>
        <StyledDiv>hello world</StyledDiv>
      </CompiledRoot>
    );

    expect(result).toMatchInlineSnapshot(
      `"<style data-cmpld="true" nonce="k0Mp1lEd">._3UwI_E6Icq{font-size:12px}</style><div class="_3UwI_E6Icq">hello world</div><div class="_3UwI_E6Icq">hello world</div>"`
    );
  });

  it('should render semantically higher in the tree so FOUC does not occur when wrapped in compiled component', () => {
    const StyledDiv = styled.div`
      font-size: 12px;
    `;

    const result = renderToStaticMarkup(
      <CompiledRoot>
        <div>
          <div>
            <div>
              <StyledDiv>hello world</StyledDiv>
            </div>
          </div>

          <StyledDiv>hello world</StyledDiv>
        </div>
      </CompiledRoot>
    );

    expect(result).toMatchInlineSnapshot(
      `"<div><div><div><style data-cmpld="true" nonce="k0Mp1lEd">._3UwI_E6Icq{font-size:12px}</style><div class="_3UwI_E6Icq">hello world</div></div></div><div class="_3UwI_E6Icq">hello world</div></div>"`
    );
  });

  it('should only render one style element when having a parent compiled component', () => {
    const StyledParent = styled.div`
      display: flex;
    `;
    const StyledDiv = styled.div`
      font-size: 12px;
    `;

    const result = renderToStaticMarkup(
      <StyledParent>
        <StyledDiv>hello world</StyledDiv>
        <StyledDiv>hello world</StyledDiv>
      </StyledParent>
    );

    expect(result).toMatchInlineSnapshot(
      `"<style data-cmpld="true" nonce="k0Mp1lEd">._2Qfcr9G8Oh{display:flex}</style><div class="_2Qfcr9G8Oh"><style data-cmpld="true" nonce="k0Mp1lEd">._3UwI_E6Icq{font-size:12px}</style><div class="_3UwI_E6Icq">hello world</div><div class="_3UwI_E6Icq">hello world</div></div>"`
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
      }
    `;

    const result = renderToStaticMarkup(
      <StyledLink href="https://atlassian.design">Atlassian Design System</StyledLink>
    );

    expect(result.split('</style>').join('</style>\n')).toMatchInlineSnapshot(`
      "<style data-cmpld="true" nonce="k0Mp1lEd">._2Qfcr9G8Oh{display:flex}._3UwI_E15Yp{font-size:50px}._1Emim_mcKz{color:purple}._1ZrpKzS_pl:link{color:red}._22gsiY3sd8:visited{color:pink}._0SXJg7ai4l:focus{color:green}._0aTL7QRo7r:hover{color:yellow}._0yanZOaLVw:active{color:blue}@media (max-width:800px){._3p9fKORo7r:focus{color:yellow}._2L8JiwHkrc:active{color:black}}@supports (display:grid){._2O7y4TRo7r:focus{color:yellow}._0rI57BHkrc:active{color:black}}</style>
      <a href="https://atlassian.design" class="_2Qfcr9G8Oh _3UwI_E15Yp _1Emim_mcKz _1ZrpKzS_pl _22gsiY3sd8 _0SXJg7ai4l _0aTL7QRo7r _0yanZOaLVw _3p9fKORo7r _2L8JiwHkrc _2O7y4TRo7r _0rI57BHkrc">Atlassian Design System</a>"
    `);
  });

  it('should not render escaped HTML characters in style tags', () => {
    const Interpolation = styled.div`
      & > span {
        color: blue;
      }
    `;

    const result = renderToStaticMarkup(
      <Interpolation>
        <span>hello world</span>
      </Interpolation>
    );

    expect(result).toMatchInlineSnapshot(
      `"<style data-cmpld="true" nonce="k0Mp1lEd">._3h_DQsaLVw>span{color:blue}</style><div class="_3h_DQsaLVw"><span>hello world</span></div>"`
    );
  });
});
