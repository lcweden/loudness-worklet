import Github from "#assets/github-mark-white.svg?url";
import { Status, TextRotate } from "#components";

type Props = {
  ondemorequest: () => void;
};

function Landing(props: Props) {
  const npmInstallCommand = "npm install loudness-worklet";
  const spans = [
    "✅ Standards Compliant",
    "📊 Comprehensive Metrics",
    "🎵 Flexible Input Sources",
    "🚀 Zero Dependencies",
  ];

  function handleNPMInstallButtonClick() {
    navigator.clipboard.writeText(npmInstallCommand);
  }

  function handleDemoButtonClick() {
    props.ondemorequest();
  }

  return (
    <article class="hero min-h-dvh">
      <div class="hero-content text-center">
        <div class="max-w-md space-y-6 sm:max-w-lg">
          <button
            class="btn btn-sm space-x-2 rounded-full"
            onclick={handleNPMInstallButtonClick}
            type="button"
          >
            <Status color="info" />
            <p class="text-base-content font-mono font-light">
              {npmInstallCommand}
              <span class="badge badge-xs badge-soft badge-primary ml-2">v{__VERSION__}</span>
            </p>
          </button>
          <div>
            <h1 class="from-primary to-accent bg-linear-to-r bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
              Audio Loudness Measurement
            </h1>
            <h2 class="text-base-content/80 text-xl font-medium md:text-2xl">
              Loudness Meter for the Web Audio API
            </h2>
          </div>
          <p class="text-base-content/70 md:text-md mx-auto max-w-xl text-sm leading-relaxed">
            A lightweight, browser-based loudness meter providing real-time LUFS, LRA, and true-peak
            analysis. Validated with official ITU-R BS.2217 and EBU Tech 3341/3342 test suites.
          </p>

          <div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <button class="btn btn-wide btn-primary" onclick={handleDemoButtonClick} type="button">
              Try Demo
            </button>
            <a class="btn btn-wide btn-neutral" href={__REPO_URL__} target="_blank">
              <img alt="GitHub Logo" class="h-4 w-4" src={Github} />
              View on GitHub
            </a>
          </div>

          <TextRotate spans={spans} />
        </div>
      </div>
    </article>
  );
}

export { Landing };
