import { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas } from "datocms-react-ui";

import styles from "./SubmissionModal.module.css";
import { Submission } from "../utils/client";

type PropTypes = {
  ctx: RenderModalCtx;
};

const dateFormatter = new Intl.DateTimeFormat("en-US");

export default function ShowSubmissionModal({ ctx }: PropTypes) {
  const submission = ctx.parameters as Submission;
  const fields = submission.ordered_human_fields ?? [];

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
            <div>{dateFormatter.format(new Date(submission.created_at))}</div>
          </div>
        </>
      ) : (
        <span>No form fields found!</span>
      )}
    </Canvas>
  );
}
