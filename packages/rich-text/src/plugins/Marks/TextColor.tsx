import * as React from 'react';

import { IconButton, Menu } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css, cx } from 'emotion';

import { useContentfulEditor } from '../../ContentfulEditorProvider';
import { focus } from '../../helpers/editor';
import { isMarkActive } from '../../internal/queries';
import { toggleMark } from '../../internal/transforms';
import { PlatePlugin, RenderLeafProps } from '../../internal/types';

const TEXT_COLORS = [
  { mark: 'textColorWhite', label: 'White', color: '#ffffff' },
  { mark: 'textColorPrimaryDark', label: 'Primary Dark', color: '#011f00' },
  { mark: 'textColorPrimaryMiddle', label: 'Primary Middle', color: '#023300' },
  { mark: 'textColorSecondaryDark', label: 'Secondary Dark', color: '#4bb616' },
  { mark: 'textColorSecondaryMiddle', label: 'Secondary Middle', color: '#81e151' },
  { mark: 'textColorSecondaryLight', label: 'Secondary Light', color: '#a0e87d' },
  { mark: 'textColorAccentMiddle', label: 'Accent Middle', color: '#fe996b' },
  { mark: 'textColorAccentDark', label: 'Accent Dark', color: '#f58273' },
] as const;

export type TextColorMark = (typeof TEXT_COLORS)[number]['mark'];

export const TEXT_COLOR_MARKS: TextColorMark[] = TEXT_COLORS.map((c) => c.mark);

const styles = {
  menuItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),
  colorSwatch: css({
    width: '16px',
    height: '16px',
    borderRadius: '2px',
    border: `1px solid ${tokens.gray300}`,
    flexShrink: 0,
  }),
  isActive: css({
    backgroundColor: tokens.blue100,
    color: tokens.blue600,
  }),
  toolbarBtn: css({
    height: '30px',
    width: '30px',
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),
  buttonContent: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    lineHeight: 1,
  }),
  colorIndicator: css({
    width: '14px',
    height: '3px',
    borderRadius: '1px',
    marginTop: '1px',
  }),
};

function TextColorLeaf({ color }: { color: string }) {
  return function TextColorComponent(props: RenderLeafProps) {
    return (
      <span {...props.attributes} style={{ color }}>
        {props.children}
      </span>
    );
  };
}

export const createTextColorPlugins = (): PlatePlugin[] =>
  TEXT_COLORS.map(({ mark, color }) => ({
    key: mark,
    type: mark,
    isLeaf: true,
    component: TextColorLeaf({ color }),
  }));

export const ToolbarTextColorDropdown = ({ isDisabled }: { isDisabled?: boolean }) => {
  const editor = useContentfulEditor();

  const activeColor = editor
    ? TEXT_COLORS.find(({ mark }) => isMarkActive(editor, mark))
    : undefined;

  const handleClick = React.useCallback(
    (mark: TextColorMark) => {
      if (!editor?.selection) return;

      const isActive = isMarkActive(editor, mark);
      editor.tracking.onToolbarAction(isActive ? 'unmark' : 'mark', { markType: mark });

      // Remove all other text color marks first
      const clear = TEXT_COLOR_MARKS.filter((m) => m !== mark);
      toggleMark(editor, { key: mark, clear });
      focus(editor);
    },
    [editor],
  );

  const handleRemove = React.useCallback(() => {
    if (!editor?.selection) return;
    for (const mark of TEXT_COLOR_MARKS) {
      if (isMarkActive(editor, mark)) {
        editor.tracking.onToolbarAction('unmark', { markType: mark });
        toggleMark(editor, { key: mark });
      }
    }
    focus(editor);
  }, [editor]);

  if (!editor) return null;

  return (
    <Menu>
      <Menu.Trigger>
        <span>
          <IconButton
            size="small"
            className={styles.toolbarBtn}
            variant={activeColor ? 'secondary' : 'transparent'}
            icon={
              <span className={styles.buttonContent}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>A</span>
                <span
                  className={styles.colorIndicator}
                  style={{
                    backgroundColor: activeColor?.color ?? tokens.gray500,
                  }}
                />
              </span>
            }
            aria-label="Text color"
            isDisabled={isDisabled}
            testId="text-color-toolbar-button"
          />
        </span>
      </Menu.Trigger>
      <Menu.List>
        {TEXT_COLORS.map(({ mark, label, color }) => {
          const isActive = isMarkActive(editor, mark);
          return (
            <Menu.Item
              key={mark}
              onClick={() => handleClick(mark)}
              disabled={isDisabled}
              className={cx({ [styles.isActive]: isActive })}
              testId={`${mark}-toolbar-button`}
            >
              <span className={styles.menuItem}>
                <span className={styles.colorSwatch} style={{ backgroundColor: color }} />
                {label}
              </span>
            </Menu.Item>
          );
        })}
        <Menu.Divider />
        <Menu.Item
          onClick={handleRemove}
          disabled={isDisabled || !activeColor}
          testId="text-color-remove-toolbar-button"
        >
          Remove color
        </Menu.Item>
      </Menu.List>
    </Menu>
  );
};
