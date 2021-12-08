import { RenderPageCtx } from "datocms-plugin-sdk";
import { Button, Canvas, Spinner } from "datocms-react-ui";
import { useEffect, useState } from "react";
import { ValidParameters } from "../entrypoints/ConfigScreen";

type PropTypes = {
  ctx: RenderPageCtx;
};

export default function SubmissionsPage({ ctx }: PropTypes) {
  const parameters = ctx.plugin.attributes.parameters as ValidParameters;
  const site = parameters.site;
  const accessToken = parameters.accessToken;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessToken && site) {
      const getSubmissions = async () => {
        setLoading(true);
        const response = await window.fetch(
          `https://api.netlify.com/api/v1/sites/${site.value}/submissions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          const message = `An error has occured: ${response.status}`;
          ctx.alert(message);
        }

        const forms = await response.json();
        setSubmissions(forms);
        setLoading(false);
      };

      getSubmissions();
    }
  }, [site, accessToken, ctx]);

  const handleShowSubmissionModal = async (submission: any) => {
    const result: any = await ctx.openModal({
      id: "showSubmission",
      title: `Submission (${submission.id})`,
      width: "l",
      parameters: submission,
    });

    ctx.notice(result);
  };

  const handleOpenDeleteSubmissonModal = async (submission: any) => {
    const result: any = await ctx.openConfirm({
      title: "Delete record?",
      content:
        "Are you sure you want to delete this record? This operation is not reversible!",
      choices: [
        {
          label: "Yes, delete this record",
          value: "negative",
          intent: "negative",
        },
      ],
      cancel: {
        label: "Cancel",
        value: false,
      },
    });

    if (result) {
      const response = await window.fetch(
        `https://api.netlify.com/api/v1/submissions/${submission.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        ctx.alert(`An error has occured: ${response.status}`);
      } else {
        setSubmissions(
          submissions.filter((item: any) => item.id !== submission.id)
        );
        ctx.notice("Record successfully removed");
      }
    }
  };

  return (
    <Canvas ctx={ctx}>
      <div
        style={{
          paddingTop: "var(--spacing-l)",
          paddingLeft: "var(--spacing-xxl)",
          paddingRight: "var(--spacing-xxl)",
        }}
      >
        <h1 style={{ fontWeight: 500 }}>Form submissions</h1>
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: 1,
              borderBottomColor: "var(--darker-border-color)",
              borderBottomStyle: "solid",
              paddingTop: "var(--spacing-m)",
              paddingBottom: "var(--spacing-m)",
              fontWeight: 500,
            }}
          >
            <span style={{ width: "25%" }}>Name</span>
            <span style={{ width: "25%" }}>Form</span>
            <span style={{ width: "25%" }}>Date</span>
            <span style={{ width: "25%", flexGrow: 0 }}></span>
            <span></span>
          </div>

          {loading ? (
            <div style={{ height: "200px", position: "relative" }}>
              <Spinner size={48} placement="centered" />
            </div>
          ) : (
            submissions.map((item: any) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: 1,
                  borderBottomColor: "var(--darker-border-color)",
                  borderBottomStyle: "solid",
                  paddingTop: "var(--spacing-m)",
                  paddingBottom: "var(--spacing-m)",
                  alignItems: "center",
                }}
              >
                <span style={{ width: "25%", flexGrow: 0 }}>{item.name}</span>
                <span style={{ width: "25%", flexGrow: 0 }}>
                  {item.form_name}
                </span>
                <span style={{ width: "25%", flexGrow: 0 }}>
                  {new Intl.DateTimeFormat("en-US").format(
                    new Date(item.created_at)
                  )}
                </span>
                <span style={{ width: "25%", flexGrow: 0, textAlign: "right" }}>
                  <Button
                    buttonSize="xs"
                    type="button"
                    onClick={() => handleShowSubmissionModal(item)}
                    style={{ marginRight: "var(--spacing-m)" }}
                  >
                    Show
                  </Button>
                  <Button
                    buttonSize="xs"
                    type="reset"
                    buttonType="negative"
                    onClick={() => handleOpenDeleteSubmissonModal(item)}
                  >
                    Delete
                  </Button>
                </span>
              </div>
            ))
          )}

          {}
        </div>
      </div>
    </Canvas>
  );
}
