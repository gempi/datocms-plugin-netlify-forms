import { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";

import styles from "./SubmissionModal.module.css";

type PropTypes = {
  ctx: RenderModalCtx;
};

type Field = {
  title: string;
  value: string;
};

export default function ShowSubmissionModal({ ctx }: PropTypes) {
  const fields = ctx.parameters.ordered_human_fields as Field[];

  return (
    <Canvas ctx={ctx}>
      {fields.length > 0 ? (
        <>
          {fields.map((item) => (
            <div key={item.title} className={styles.item}>
              <div className={styles.itemTitle}>{item.title}</div>
              <div>{item.value}</div>
            </div>
          ))}
          <div className={styles.item}>
            <div className={styles.itemTitle}>Create date</div>
            <div>
              {new Intl.DateTimeFormat("en-US").format(new Date(ctx.parameters.created_at as Date))}
            </div>
          </div>
        </>
      ) : (
        <span>No form fields found!</span>
      )}
    </Canvas>
  );
}
