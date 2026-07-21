import "@routes/style.css";

export const prerender = true;
export const ssr = false;
export const load = async (props) => {
  const { url } = props;
  const { searchParams } = url;
  const file = searchParams.get("file");

  if (file && URL.canParse(file)) {
    return { input: file };
  }
};
