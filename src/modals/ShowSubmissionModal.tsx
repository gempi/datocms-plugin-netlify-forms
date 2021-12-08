import { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";

type PropTypes = {
  ctx: RenderModalCtx;
};

export default function ShowSubmissionModal({ ctx }: PropTypes) {
  const fields = ctx.parameters.ordered_human_fields as any;

  return (
    <Canvas ctx={ctx}>
      {fields.map((item: any) => (
        <div
          key={item.title}
          style={{
            marginBottom: "var(--spacing-m)",
          }}
        >
          <div
            style={{
              color: "var(--light-body-color)",
              fontSize: "var(--font-size-s)",
            }}
          >
            {item.title}
          </div>
          <div>{item.value}</div>
        </div>
      ))}
    </Canvas>
  );
}
