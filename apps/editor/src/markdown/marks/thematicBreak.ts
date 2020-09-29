import { DOMOutputSpecArray } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { Context, EditorCommand } from '@t/spec';
import { cls } from '@/utils/dom';
import Mark from '@/spec/mark';
import { resolveSelectionPos } from '../helper/pos';

const thematicBreakSyntax = '***';

export class ThematicBreak extends Mark {
  get name() {
    return 'thematicBreak';
  }

  get schema() {
    return {
      toDOM(): DOMOutputSpecArray {
        return ['span', { class: cls('thematic-break') }, 0];
      }
    };
  }

  private line({ schema }: Context): EditorCommand {
    return () => (state, dispatch) => {
      const [, to] = resolveSelectionPos(state.selection);
      const endOffset = state.doc.resolve(to).end();

      const tr = state.tr.insert(endOffset, [
        schema.nodes.paragraph.create(null, schema.text(thematicBreakSyntax)),
        schema.nodes.paragraph.create(null)
      ]);
      // add 3(`***` length) and 3(start, end block tag position)
      const selection = TextSelection.create(tr.doc, Math.min(endOffset + 6, tr.doc.content.size));

      dispatch!(tr.setSelection(selection));

      return true;
    };
  }

  commands(context: Context) {
    return { hr: this.line(context) };
  }

  keymaps(context: Context) {
    const commandResult = this.line(context)();

    return { 'Mod-l': commandResult, 'Mod-L': commandResult };
  }
}