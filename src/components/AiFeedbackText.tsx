import type { ReactNode } from "react";

// AI添削フィードバック(見出し#/##・太字**...**・箇条書き-のみを使う、
// 限定的なMarkdownサブセット)を整形表示するための専用コンポーネント。
// 表・画像埋め込み等の一般的なMarkdown全体には対応しない
// (プロンプト側でこの書式のみを使うよう指示しているため)。

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i++;
      continue;
    }

    if (line.trim().startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("# ") &&
      !lines[i].startsWith("## ") &&
      !lines[i].trim().startsWith("- ")
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: paraLines.join("\n") });
  }

  return blocks;
}

// "**強調**" のみをインラインで解釈する(それ以外のMarkdown記法は対象外)。
function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: "var(--ink)" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AiFeedbackText({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === "h1") {
          return (
            <p
              key={i}
              style={{
                fontSize: 19.2,
                fontWeight: 800,
                color: "var(--ink)",
                marginTop: i === 0 ? 0 : 16,
                marginBottom: 8,
              }}
            >
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.type === "h2") {
          return (
            <p
              key={i}
              style={{
                fontSize: 16.8,
                fontWeight: 700,
                color: "var(--ink)",
                marginTop: i === 0 ? 0 : 14,
                marginBottom: 6,
              }}
            >
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.type === "ul") {
          return (
            <ul
              key={i}
              style={{
                margin: "4px 0 8px",
                paddingLeft: 20,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                listStyleType: "disc",
                listStylePosition: "outside",
              }}
            >
              {block.items.map((item, j) => (
                <li key={j} style={{ fontSize: 15.6, color: "var(--ink)", lineHeight: 1.7 }}>
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            style={{
              fontSize: 15.6,
              color: "var(--ink)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              marginTop: i === 0 ? 0 : 4,
              marginBottom: 8,
            }}
          >
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}
