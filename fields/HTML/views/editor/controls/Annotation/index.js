import React, { useState } from 'react';
import { EditorState, Modifier } from 'draft-js';
import { getSelectionText, getSelectionEntity, getEntityRange } from "draftjs-utils";

import MiniEditor from '../../components/MiniEditor';
import '../../css/main.css';

export const AnnotationType = "ANNOTATION";
export default (props) => {
    const { editorState, onChange } = props;

    const getPreSelectedText = () => getSelectionText(editorState);;

    const onSave = (text, html) => {
        const currentEntity = editorState ? getSelectionEntity(editorState) : undefined;
        let selection = editorState.getSelection();

        if (currentEntity) {
            const entityRange = getEntityRange(editorState, currentEntity);
            const isBackward = selection.getIsBackward();
            if (isBackward) {
                selection = selection.merge({
                    anchorOffset: entityRange.end,
                    focusOffset: entityRange.start,
                });
            } else {
                selection = selection.merge({
                    anchorOffset: entityRange.start,
                    focusOffset: entityRange.end,
                });
            }
        }

        let contentState = editorState.getCurrentContent();
        contentState = contentState.createEntity(AnnotationType, 'IMMUTABLE', {
            text: text,
            body: html,
        });
        const entityKey = contentState.getLastCreatedEntityKey();

        contentState = Modifier.replaceText(
            contentState,
            selection,
            ' ',
            undefined,
            entityKey
        );

        const newEditorState = EditorState.push(
            editorState,
            contentState,
            'insert-characters'
        );

        onChange(newEditorState);
    };

    return (
        <MiniEditor
            config={prepareLayoutConfig()}
            getPreSelectedText={getPreSelectedText}
            onSave={onSave}
        />
    )

}

const prepareLayoutConfig = () => ({
    style: {
        icon: undefined,
        className: 'fa fa-pen-square',
        title: "Annotation"
    },
    title: {
        text: "Annotation",
    },
});
