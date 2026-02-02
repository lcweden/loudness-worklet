import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { FileInput } from "#components";
import { PlusIcon } from "#icons";
import { Dashboard, Landing } from "#views";

function App() {
  const [getFiles, setFiles] = createSignal<FileList>();
  const [getIsGenerating, setIsGenerating] = createSignal(false);

  function handleDemoRequest() {
    document.startViewTransition(() => setIsGenerating(true));

    const context = new AudioContext();
    const osc = new OscillatorNode(context, { type: "sine", frequency: 440 });
    const gain = new GainNode(context, { gain: 0.075 });
    const dest = new MediaStreamAudioDestinationNode(context);

    osc.connect(gain);
    gain.connect(dest);

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });

    recorder.ondataavailable = (event: BlobEvent) => chunks.push(event.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const file = new File([blob], "demo.webm", { type: "audio/webm" });
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(file);

      setFiles(dataTransfer.files);
    };

    recorder.start();
    osc.start();

    setTimeout(() => {
      recorder.stop();
      osc.stop();
      context.close();
      document.startViewTransition(() => setIsGenerating(false));
    }, 5000);
  }

  return (
    <>
      <Show
        fallback={
          <Show
            fallback={<Landing ondemorequest={handleDemoRequest} />}
            when={getIsGenerating()}
          >
            <div class="flex h-dvh items-center justify-center">
              <div class="flex items-center gap-4">
                <span class="loading-spinner loading loading-sm" />
                <p class="text-sm">Generating demo audio</p>
              </div>
            </div>
          </Show>
        }
        keyed
        when={getFiles()}
      >
        {(files) => <Dashboard files={files} />}
      </Show>

      <Portal>
        <div class="fab">
          <FileInput
            accept="video/*,audio/*"
            class="btn btn-circle btn-shadow btn-primary btn-lg"
            disabled={getIsGenerating()}
            multiple={true}
            oninput={setFiles}
          >
            <PlusIcon />
          </FileInput>
        </div>
      </Portal>
    </>
  );
}

export { App };
