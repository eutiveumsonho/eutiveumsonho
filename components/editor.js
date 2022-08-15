import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./editor.module.css";

/*
 * Simple editor componnt that takes placeholder text as a prop
 */
export default function Editor(props) {
  return (
    <ReactQuill
      theme={"snow"}
      modules={modules}
      formats={formats}
      {...props}
      onChange={(value) => {
        if (props.onChange) {
          // See https://github.com/zenoamaro/react-quill/issues/311
          props.onChange(value.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;"));
        }
      }}
    />
  );
}

/*
 * Quill modules to attach to editor
 * See https://quilljs.com/docs/modules/ for complete options
 */
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];
