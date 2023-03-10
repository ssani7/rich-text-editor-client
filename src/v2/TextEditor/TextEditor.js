import React, { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'
import { io } from "socket.io-client"
import { useParams } from 'react-router-dom';


const TOOLBAR_OPTIONS = [
    ['bold', 'italic', 'underline'],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', "image"],

    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'font': [] }],
    // [{ 'header': 1 }, { 'header': 2 }],
    ['blockquote', 'code-block'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }, { 'direction': 'rtl' }],
    ['clean'],
    ['spanblock']
]

const TextEditor = () => {

    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const { id: documentID } = useParams()

    let Inline = Quill.import('blots/inline')
    const Parchment = Quill.imports.parchment;
    const Delta = Quill.imports.delta;


    class Icon extends Parchment.Embed {
        static create(value) {
            let node = super.create(value);
            if (value && value !== true) {
                console.log(value);
                const button = document.createElement('button');
                button.innerText = 'x';
                button.onclick = () => node.remove();
                button.contentEditable = 'false';
                node?.append(button);
                node?.append(value)
            }
            return node;
        }
    }

    Icon.blotName = 'icon';
    Icon.tagName = 'span';
    Quill.register(Icon);


    const spanBlockButton = document.querySelector('.ql-spanblock')

    const keypress = useCallback(() => {

        const selection = quill.getSelection();
        const delta = new Delta()

        let [line, offset] = quill.getLine(quill.getSelection().index);
        let index = quill.getIndex(line);

        const text = quill.getText(index, selection.index)
        quill.deleteText(index, selection.index);
        quill.insertText(index, " ", 'icon', text);
        console.log(quill.getContents(index, selection.indent));
    },
        [quill, Delta]
    )

    useEffect(() => {
        spanBlockButton?.addEventListener('click', keypress)
    }, [keypress, spanBlockButton])


    useEffect(() => {
        // const s = io("http://localhost:3001/")
        const s = io("https://rte-sani-server.glitch.me/")
        setSocket(s);



        return () => {
            s.disconnect();
        }
    }, [])

    useEffect(() => {
        if (!(socket && quill)) return

        socket.emit("get-document", documentID)

        socket.once("load-document", document => {
            quill.setContents(document)
            quill.enable()
        })


    }, [socket, quill, documentID])

    useEffect(() => {
        if (!(socket && quill)) return

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())
        }, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    useEffect(() => {
        if (!(socket && quill)) return

        const handler = (delta) => {
            quill.updateContents(delta)
        }
        socket.on("recieve-changes", handler)

        const qhandler = (delta, oldDelta, source) => {
            if (source !== "user") return
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", qhandler)

        return () => {
            socket.off("recieve-changes", handler)
            quill.off("text-change", qhandler)
        }
    }, [socket, quill])




    /* 
    useEffect(() => {
        if (!(socket && quill)) return
    const handler = (delta, oldDelta, source) => {
        if (source !== "user") return
        socket.emit("send-changes", delta)
    }
    quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
        }

    }, [socket, quill])
    */


    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return

        wrapper.innerHTML = ""
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } })
        q.disable()
        q.setText("Loading...")
        setQuill(q);
    }, [])



    return (
        <div className='container' ref={wrapperRef}>
        </div>
    );
};

export default TextEditor;