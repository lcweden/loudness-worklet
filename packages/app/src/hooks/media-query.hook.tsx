import { createSignal, onMount } from "solid-js";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

function createMediaQuery() {
  const [getBreakpoint, setBreakpoint] = createSignal<Breakpoint>();
  const queries = [
    { media: "(width < 48rem) ", breakpoint: "sm" as Breakpoint },
    { media: "(width >= 48rem)", breakpoint: "md" as Breakpoint },
    { media: "(width >= 64rem)", breakpoint: "lg" as Breakpoint },
    { media: "(width >= 80rem)", breakpoint: "xl" as Breakpoint },
    { media: "(width >= 96rem)", breakpoint: "2xl" as Breakpoint },
  ];

  function handleMediaQueryChange(event: MediaQueryListEvent) {
    const query = queries.find((query) => query.media === event.media);

    if (query) {
      setBreakpoint(query.breakpoint);
    }
  }

  onMount(() => {
    for (const query of queries) {
      const { media, breakpoint } = query;
      const mediaQueryList = window.matchMedia(media);

      mediaQueryList.addEventListener("change", handleMediaQueryChange);

      if (mediaQueryList.matches) {
        setBreakpoint(breakpoint);
      }
    }
  });

  return { getBreakpoint };
}

export { createMediaQuery };
