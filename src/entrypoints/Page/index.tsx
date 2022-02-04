import { RenderPageCtx } from "datocms-plugin-sdk";
import {
  Button,
  Canvas,
  CaretDownIcon,
  CaretUpIcon,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  Spinner,
  Toolbar,
  ToolbarStack,
  ToolbarTitle,
} from "datocms-react-ui";
import { useEffect, useState } from "react";
import { ValidParameters } from "../ConfigScreen";
import styles from "./style.module.css";
import Client from "../../utils/client";

type PropTypes = {
  ctx: RenderPageCtx;
};

export default function SubmissionsPage({ ctx }: PropTypes) {
  const parameters = ctx.plugin.attributes.parameters as ValidParameters;
  const site = parameters.site;
  const accessToken = parameters.accessToken;

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("ham");

  const client = new Client({ accessToken });

  useEffect(() => {
    if (accessToken && site) {
      const getSubmissions = async () => {
        setLoading(true);
        const res = await client.submissionsBySite(site.value, type);
        const submissions = await res.json();

        setSubmissions(submissions);
        setLoading(false);
      };

      getSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, accessToken, type]);

  const handleShowSubmissionModal = async (submission: any) => {
    await ctx.openModal({
      id: "showSubmission",
      title: `Submission (${submission.id})`,
      width: "l",
      parameters: submission,
    });
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
      try {
        await client.deleteSubmissionById(submission.id);
        setSubmissions(
          submissions.filter((item: any) => item.id !== submission.id)
        );
        ctx.notice("Record successfully removed");
      } catch (error: any) {
        ctx.alert(error.message);
      }
    }
  };

  return (
    <Canvas ctx={ctx}>
      <Toolbar
        style={{
          paddingTop: "var(--spacing-m)",
          paddingBottom: "var(--spacing-m)",
        }}
      >
        <ToolbarStack stackSize="l">
          <ToolbarTitle>Form submissions</ToolbarTitle>
          <div style={{ flex: "1" }} />
          <div>
            {submissions.length} record{submissions.length > 1 ? "s" : ""}
          </div>
        </ToolbarStack>
      </Toolbar>

      <div
        style={{
          paddingTop: "var(--spacing-l)",
          paddingLeft: "var(--spacing-xxl)",
          paddingRight: "var(--spacing-xxl)",
        }}
      >
        <Dropdown
          renderTrigger={({ open, onClick }) => (
            <Button
              onClick={onClick}
              rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}
            >
              {type === "ham" ? "Verified" : "Spam"} submissions
            </Button>
          )}
        >
          <DropdownMenu>
            <DropdownOption onClick={() => setType("ham")}>
              Verified submissions
            </DropdownOption>
            <DropdownOption onClick={() => setType("spam")}>
              Spam submissions
            </DropdownOption>
          </DropdownMenu>
        </Dropdown>
        {loading ? (
          <div
            style={{ marginTop: "var(--spacing-xxl)", position: "relative" }}
          >
            <Spinner size={48} placement="centered" />
          </div>
        ) : submissions.length > 0 ? (
          <div>
            <div className={styles.rowHeader}>
              <div style={{ width: "25%" }}>Name</div>
              <div style={{ width: "25%" }}>Form</div>
              <div style={{ width: "25%" }}>Date</div>
              <div style={{ width: "25%" }}></div>
            </div>
            {submissions.map((item: any) => (
              <div key={item.id} className={styles.row}>
                <div style={{ width: "25%" }}>{item.name}</div>
                <div style={{ width: "25%" }}>{item.form_name}</div>
                <div style={{ width: "25%", flexGrow: 0 }}>
                  {new Intl.DateTimeFormat("en-US").format(
                    new Date(item.created_at)
                  )}
                </div>
                <div style={{ width: "25%", textAlign: "right" }}>
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No form submissions found!</p>
        )}
      </div>
    </Canvas>
  );
}
