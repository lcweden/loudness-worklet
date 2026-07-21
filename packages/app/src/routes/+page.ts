import "@routes/style.css";
import type { PageLoad } from "./$types";

export const prerender = true;
export const ssr = false;
export const load: PageLoad = async (props) => {
  const { url } = props;
  const { searchParams } = url;
  const file = searchParams.get("file");

  if (file && URL.canParse(file)) {
    return { input: file };
  }
};
