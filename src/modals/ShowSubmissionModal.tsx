import { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";

import styles from "./ShowSubmissionModal.module.css";

type PropTypes = {
  ctx: RenderModalCtx;
};

export default function ShowSubmissionModal({ ctx }: PropTypes) {
  const fields = ctx.parameters.ordered_human_fields as any;

  return (
    <Canvas ctx={ctx}>
      {fields ? (
        fields.map((item: any) => (
          <div key={item.title} className={styles.item}>
            <div className={styles.itemTitle}>{item.title}</div>
            <div>{item.value}</div>
          </div>
        ))
      ) : (
        <span>No form fields found!</span>
      )}
    </Canvas>
  );
}
