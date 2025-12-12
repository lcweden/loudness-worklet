import { A } from "@solidjs/router";
import githubIcon from "../assets/github-mark-white.svg?url";

function Home() {
  return (
    <div class="hero min-h-screen bg-base-100">
      <div class="hero-content text-center">
        <div class="flex max-w-xl flex-col items-center gap-12">
          <a
            class="btn btn-ghost btn-sm rounded-full font-light text-sm shadow"
            download="loudness.worklet.js"
            href="https://lcweden.github.io/loudness-worklet/loudness.worklet.js"
          >
            Download Javascript File
            <div class="badge badge-neutral badge-soft badge-sm rounded-full tabular-nums">
              v{__APP_VERSION__}
            </div>
          </a>
          <h1 class="text-balance font-semibold text-6xl tracking-tight">
            Loudness Meter
          </h1>
          <p class="text-pretty font-medium text-base-content/50 text-lg">
            Web based loudness meter using the Web Audio API, providing
            real-time loudness analysis, ITU-R BS.1770 compliance.
          </p>
          <div class="flex items-center justify-center gap-1">
            <a
              class="btn btn-neutral space-x-1"
              href={__REPO_URL__}
              target="_blank"
            >
              <img alt="GitHub" class="size-4" src={githubIcon} />
              <span>View on GitHub</span>
            </a>
            <A class="btn btn-ghost" href="/meter">
              Try Demo
            </A>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
