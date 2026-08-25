const PROPS = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none" as const,
  stroke: "white",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SOFT_PROPS = { ...PROPS, stroke: "var(--ink-soft)" };

export function SpeakIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <path d="M4 5h16v11H9l-5 4V5z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

export function ListenIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="6" rx="2" />
      <rect x="17" y="13" width="4" height="6" rx="2" />
    </svg>
  );
}

export function ReadIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <path d="M12 6c-1.8-1.2-4-1.5-6-1v13c2 0 4.2.3 6 1.5 1.8-1.2 4-1.5 6-1.5V5c-2-.5-4.2-.2-6 1z" />
      <path d="M12 6v13" />
    </svg>
  );
}

export function WriteIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" />
    </svg>
  );
}

export function QuizIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.4.9-1.4 2" />
      <circle cx="12" cy="17" r="0.6" fill={props.soft ? "var(--ink-soft)" : "white"} />
    </svg>
  );
}

export function GrammarDictIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z" />
      <path d="M4 18a2.5 2.5 0 0 1 2.5-2.5H20" />
    </svg>
  );
}

export function WordDictIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
    </svg>
  );
}

export function WordsIcon() {
  return (
    <svg {...PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

export function PatternsIcon() {
  return (
    <svg {...PROPS}>
      <path d="M4 6h16M4 12h10M4 18h13" />
    </svg>
  );
}

export function StepwiseIcon() {
  return (
    <svg {...PROPS}>
      <rect x="4" y="4" width="16" height="4" rx="1" />
      <rect x="4" y="10" width="16" height="4" rx="1" />
      <rect x="4" y="16" width="16" height="4" rx="1" />
    </svg>
  );
}

export function GroupsIcon() {
  return (
    <svg {...PROPS}>
      <rect x="3" y="4" width="8" height="8" rx="2" />
      <rect x="13" y="4" width="8" height="8" rx="2" />
      <rect x="3" y="14" width="8" height="8" rx="2" />
      <rect x="13" y="14" width="8" height="8" rx="2" />
    </svg>
  );
}

export function LongReadingIcon() {
  return (
    <svg {...PROPS}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M4 15l4-4 3 3 5-6 4 5" />
    </svg>
  );
}

export function ConversationIcon() {
  return (
    <svg {...PROPS}>
      <path d="M2 5h11v7H8l-3 3v-3H2V5z" />
      <path d="M13 9h9v6h-3v3l-3-3h-3V9z" />
    </svg>
  );
}

export function ImageIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M3 17l5-5 4 4 3-3 6 6" />
    </svg>
  );
}

export function MilestoneIcon(props: { soft?: boolean } = {}) {
  return (
    <svg {...(props.soft ? SOFT_PROPS : PROPS)}>
      <path d="M12 3l2.2 5.6 6 .5-4.6 3.9 1.5 5.8L12 15.9l-5.1 2.9 1.5-5.8-4.6-3.9 6-.5z" />
    </svg>
  );
}
