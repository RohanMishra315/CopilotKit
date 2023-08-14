// This example is for an Editor with `ReactEditor` and `HistoryEditor`
import { Descendant } from "slate";
import { Editable, Slate } from "slate-react";
import { useCallback, useEffect, useRef } from "react";
import { useAutosuggestions } from "../../hooks/use-autosuggestions";
import { clearAutocompletionsFromEditor } from "../../lib/slatejs-edits/clear-autocompletions";
import { addAutocompletionsToEditor } from "../../lib/slatejs-edits/add-autocompletions";
import { useCopilotTextareaEditor } from "../../hooks/use-copilot-textarea-editor";
import { renderElement } from "./render-element";

export interface AutocompleteConfig {
  autocomplete: (
    textBefore: string,
    textAfter: string,
    abortSignal: AbortSignal
  ) => Promise<string>;
  debounceTime: number;
}

export interface CopilotTextareaProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  autocompleteConfig: AutocompleteConfig;
}

export function CopilotTextarea(props: CopilotTextareaProps): JSX.Element {
  const initialValue: Descendant[] = [
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ];

  const editor = useCopilotTextareaEditor();

  const renderElementMemoized = useCallback(renderElement, []);
  const {
    currentAutocompleteSuggestion,
    onChangeHandler: onChangeHandlerForAutocomplete,
  } = useAutosuggestions(props.autocompleteConfig);

  // sync autosuggestions state with the editor
  useEffect(() => {
    clearAutocompletionsFromEditor(editor);
    if (currentAutocompleteSuggestion) {
      addAutocompletionsToEditor(
        editor,
        currentAutocompleteSuggestion.text,
        currentAutocompleteSuggestion.point
      );
    }
  }, [currentAutocompleteSuggestion]);

  return (
    // Add the editable component inside the context.
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        onChangeHandlerForAutocomplete(editor);
      }}
    >
      <Editable
        className={props.className}
        renderElement={renderElementMemoized}
      />
    </Slate>
  );
}
