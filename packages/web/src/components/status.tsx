type StatusProps = {
  color:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "error"
    | "warning"
    | "info"
    | "success";
};

function Status(props: StatusProps) {
  const classList = {
    "status-neutral": props.color === "neutral",
    "status-primary": props.color === "primary",
    "status-secondary": props.color === "secondary",
    "status-accent": props.color === "accent",
    "status-error": props.color === "error",
    "status-warning": props.color === "warning",
    "status-info": props.color === "info",
    "status-success": props.color === "success",
  };

  return (
    <div class="inline-grid *:[grid-area:1/1]">
      <div class="status animate-ping" classList={classList} />
      <div class="status status-error" classList={classList} />
    </div>
  );
}

export { Status };
export type { StatusProps };
