import * as React from 'react';

import tokens from '@contentful/f36-tokens';
import { BLOCKS } from '@contentful/rich-text-types';
import { css, cx } from 'emotion';
import * as Slate from 'slate-react';

const baseStyle = css`
  padding: 0;
  margin: 0 0 1.25rem 1.25rem;
  direction: inherit;

  div:first-child {
    margin: 0;
    line-height: ${tokens.lineHeightDefault};
  }
`;

const checkmarkListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '☑️';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 1em;
    }
  }
`;

const arrowListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '➡️';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 1em;
    }
  }
`;

const crossMarkListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '❌';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 1em;
    }
  }
`;

const warningListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '⚠️';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 1em;
    }
  }
`;

const whiteCheckMarkListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '✅';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 1em;
    }
  }
`;

const starListStyle = css`
  list-style-type: none;
  padding-left: 0;

  li {
    position: relative;
    padding-left: 1.75rem;

    &::before {
      content: '⭐';
      position: absolute;
      left: 0;
      top: 0;
      font-size: 1em;
    }
  }
`;

const styles = {
  [BLOCKS.UL_LIST]: css`
    list-style-type: disc;
    ul {
      list-style-type: circle;
      ul {
        list-style-type: square;
      }
    }
  `,
  [BLOCKS.OL_LIST]: css`
    list-style-type: decimal;
    ol {
      list-style-type: upper-alpha;
      ol {
        list-style-type: lower-roman;
        ol {
          list-style-type: lower-alpha;
        }
      }
    }
  `,
};

// Map listStyle values to their CSS-in-JS styles
const listStyleMap: Record<string, ReturnType<typeof css>> = {
  none: checkmarkListStyle,
  arrow: arrowListStyle,
  star: starListStyle,
  'cross-mark': crossMarkListStyle,
  warning: warningListStyle,
  'white-check-mark': whiteCheckMarkListStyle,
};

function createList(Tag, block: BLOCKS) {
  return function List(props: Slate.RenderElementProps) {
    const listStyle = (props.element as any).data?.listStyle as string | undefined;
    const customStyle = listStyle ? listStyleMap[listStyle] : undefined;
    const inlineStyle =
      listStyle && !customStyle
        ? { listStyleType: listStyle as React.CSSProperties['listStyleType'] }
        : undefined;

    return (
      <Tag
        {...props.attributes}
        className={cx(baseStyle, customStyle || styles[block])}
        style={inlineStyle}
      >
        {props.children}
      </Tag>
    );
  };
}

export const ListUL = createList('ul', BLOCKS.UL_LIST);
export const ListOL = createList('ol', BLOCKS.OL_LIST);
