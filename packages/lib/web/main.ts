import { mount } from "svelte";

const { default: app } = await import("./app.svelte");
const target = document.getElementById("root")!;
const root = mount(app, { target });

export default root;
