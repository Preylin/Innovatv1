import { message } from "antd";

type MessageType = "success" | "error" | "warning" | "info" | "loading";

interface MessageOptions {
  content: string;
  duration?: number;
}

const DEFAULT_DURATION = 3;

function show(type: MessageType, options: MessageOptions) {
  message[type]({
    content: options.content,
    duration: options.duration ?? DEFAULT_DURATION,
  });
}

export const MessageAtom = {
  success: (content: string, duration?: number) =>
    show("success", { content, duration }),

  error: (content: string, duration?: number) =>
    show("error", { content, duration }),

  warning: (content: string, duration?: number) =>
    show("warning", { content, duration }),

  info: (content: string, duration?: number) =>
    show("info", { content, duration }),

  loading: (content: string, duration?: number) =>
    show("loading", { content, duration }),
};
