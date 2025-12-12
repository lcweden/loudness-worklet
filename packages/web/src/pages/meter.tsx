import githubIcon from "../assets/github-mark-white.svg?url";
import { Drawer, DrawerToggle, Navbar } from "../components";
import { AudioPanel, Dashboard } from "../containers";
import { SquaresIcon } from "../icons";

function Meter() {
  return (
    <Drawer sidebar={<AudioPanel />}>
      <main class="flex h-full w-full flex-col">
        <Navbar
          class="sticky top-0 z-1 bg-linear-to-b from-base-100 via-80% via-base-100 to-transparent"
          end={
            <a
              class="btn btn-neutral btn-sm btn-square"
              href={__REPO_URL__}
              target="_blank"
            >
              <img alt="GitHub" class="size-5" src={githubIcon} />
            </a>
          }
          start={
            <DrawerToggle class="btn btn-square btn-sm">
              <SquaresIcon />
            </DrawerToggle>
          }
        />
        <div class="container mx-auto flex-1">
          <Dashboard />
        </div>
      </main>
    </Drawer>
  );
}

export default Meter;
