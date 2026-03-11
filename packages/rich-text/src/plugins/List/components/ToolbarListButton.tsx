import * as React from 'react';

import { Menu, Button } from '@contentful/f36-components';
import { ListBulletsIcon, ListNumbersIcon, CaretDownIcon } from '@contentful/f36-icons';
import { BLOCKS } from '@contentful/rich-text-types';
import { css } from 'emotion';

import { useContentfulEditor } from '../../../ContentfulEditorProvider';
import { focus } from '../../../helpers/editor';
import { isNodeTypeEnabled } from '../../../helpers/validations';
import { getBlockAbove, isElement } from '../../../internal/queries';
import { useSdkContext } from '../../../SdkProvider';
import { ToolbarButton } from '../../shared/ToolbarButton';
import { toggleList } from '../transforms/toggleList';
import { isListTypeActive } from '../utils';

const styles = {
  button: css({
    minWidth: '80px',
    justifyContent: 'space-between',
  }),
  menuItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  emoji: css({
    fontSize: '1.1em',
  }),
};

// Custom list style options with emojis
const LIST_STYLES = {
  none: { label: 'Checkmark', emoji: '☑️' },
  arrow: { label: 'Arrow', emoji: '➡️' },
  star: { label: 'Star', emoji: '⭐' },
  'cross-mark': { label: 'Cross Mark', emoji: '❌' },
  warning: { label: 'Warning', emoji: '⚠️' },
  'white-check-mark': { label: 'White Check', emoji: '✅' },
} as const;

type ListStyleKey = keyof typeof LIST_STYLES;

export interface ToolbarListButtonProps {
  isDisabled?: boolean;
}

export function ToolbarListButton(props: ToolbarListButtonProps) {
  const sdk = useSdkContext();
  const editor = useContentfulEditor();
  const [isOpen, setOpen] = React.useState(false);

  function handleClick(type: BLOCKS, listStyle?: string): () => void {
    return () => {
      if (!editor?.selection) return;

      toggleList(editor, { type, listStyle });

      focus(editor);
    };
  }

  function handleSelectStyle(style: ListStyleKey): (event: React.MouseEvent<HTMLButtonElement>) => void {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      if (!editor?.selection) return;

      setOpen(false);
      toggleList(editor, { type: BLOCKS.UL_LIST, listStyle: style });
      focus(editor);
    };
  }

  // Check if the current list has a specific style
  function isListStyleActive(style: string): boolean {
    if (!editor) return false;

    const isInUL = isListTypeActive(editor, BLOCKS.UL_LIST);
    if (!isInUL) return false;

    const listNode = getBlockAbove(editor, {
      match: { type: BLOCKS.UL_LIST },
      mode: 'lowest',
    });

    if (listNode && isElement(listNode[0])) {
      const nodeData = (listNode[0] as { data?: { listStyle?: string } }).data || {};
      return nodeData.listStyle === style;
    }

    return false;
  }

  // Get the currently active list style or null
  function getActiveListStyle(): ListStyleKey | null {
    for (const style of Object.keys(LIST_STYLES) as ListStyleKey[]) {
      if (isListStyleActive(style)) {
        return style;
      }
    }
    return null;
  }

  // Check if any custom list style is active
  function hasCustomListStyle(): boolean {
    return getActiveListStyle() !== null;
  }

  if (!editor) return null;

  const activeStyle = getActiveListStyle();
  const buttonLabel = activeStyle ? LIST_STYLES[activeStyle].emoji : '☑️';

  return (
    <React.Fragment>
      {isNodeTypeEnabled(sdk.field, BLOCKS.UL_LIST) && (
        <ToolbarButton
          title="UL"
          testId="ul-toolbar-button"
          onClick={handleClick(BLOCKS.UL_LIST)}
          isActive={isListTypeActive(editor, BLOCKS.UL_LIST) && !hasCustomListStyle()}
          isDisabled={props.isDisabled}
        >
          <ListBulletsIcon />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, BLOCKS.OL_LIST) && (
        <ToolbarButton
          title="OL"
          testId="ol-toolbar-button"
          onClick={handleClick(BLOCKS.OL_LIST)}
          isActive={isListTypeActive(editor, BLOCKS.OL_LIST)}
          isDisabled={props.isDisabled}
        >
          <ListNumbersIcon />
        </ToolbarButton>
      )}
      {isNodeTypeEnabled(sdk.field, BLOCKS.UL_LIST) && (
        <Menu isOpen={isOpen} onClose={() => setOpen(false)}>
          <Menu.Trigger>
            <Button
              size="small"
              testId="styled-list-toolbar-button"
              variant="transparent"
              endIcon={<CaretDownIcon />}
              isDisabled={props.isDisabled}
              onClick={() => setOpen(!isOpen)}
              className={styles.button}
            >
              <span className={styles.emoji}>{buttonLabel}</span>
            </Button>
          </Menu.Trigger>
          <Menu.List testId="dropdown-styled-list">
            {(Object.keys(LIST_STYLES) as ListStyleKey[]).map((style) => (
              <Menu.Item
                key={style}
                isInitiallyFocused={activeStyle === style}
                onClick={handleSelectStyle(style)}
                testId={`dropdown-option-${style}`}
                disabled={props.isDisabled}
              >
                <span className={styles.menuItem}>
                  <span className={styles.emoji}>{LIST_STYLES[style].emoji}</span>
                  {LIST_STYLES[style].label}
                </span>
              </Menu.Item>
            ))}
          </Menu.List>
        </Menu>
      )}
    </React.Fragment>
  );
}
