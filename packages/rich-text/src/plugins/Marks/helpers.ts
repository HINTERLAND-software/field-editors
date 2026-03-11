import { MARKS } from '@contentful/rich-text-types';
import isHotkey from 'is-hotkey';

import { isMarkActive } from '../../internal/queries';
import { toggleMark } from '../../internal/transforms';
import { PlateEditor, HotkeyPlugin, KeyboardHandler } from '../../internal/types';
import { TEXT_COLOR_MARKS, TextColorMark } from './TextColor';

export const toggleMarkAndDeactivateConflictingMarks = (
  editor: PlateEditor,
  mark: MARKS | TextColorMark,
) => {
  const subs = [MARKS.SUPERSCRIPT, MARKS.SUBSCRIPT];
  const textColors: string[] = TEXT_COLOR_MARKS;

  let clear: string[] = [];
  if (subs.includes(mark as MARKS)) {
    clear = subs;
  } else if (textColors.includes(mark)) {
    clear = TEXT_COLOR_MARKS.filter((m) => m !== mark);
  }
  toggleMark(editor, { key: mark, clear });
};

export const buildMarkEventHandler =
  (type: MARKS): KeyboardHandler<HotkeyPlugin> =>
  (editor, { options: { hotkey } }) =>
  (event) => {
    if (editor.selection && hotkey && isHotkey(hotkey, event)) {
      event.preventDefault();

      const isActive = isMarkActive(editor, type);
      editor.tracking.onShortcutAction(isActive ? 'unmark' : 'mark', { markType: type });
      toggleMarkAndDeactivateConflictingMarks(editor, type);
    }
  };
