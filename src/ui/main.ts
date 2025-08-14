const btn = document.getElementById("btn") as HTMLButtonElement | null;
const msg = document.getElementById("msg") as HTMLParagraphElement | null;

if (btn) {
  btn.onclick = () => {
    parent.postMessage({ pluginMessage: { type: "hello" } }, "*");
  };
}

// Receive messages from code.ts
onmessage = (event: MessageEvent) => {
  const pluginMessage = (event.data && (event.data as any).pluginMessage) || null;
  if (pluginMessage?.type === "hello-from-code" && msg) {
    msg.textContent = pluginMessage.text as string;
  }
};

