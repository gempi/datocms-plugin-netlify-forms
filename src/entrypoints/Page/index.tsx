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
  const [page, setPage] = useState<number>(1);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("ham");

  const client = new Client({ accessToken });

  const getSubmissions = async () => {
    setLoading(true);
    const res = await client.submissionsBySite(site.value, type, 10, page);
    const submissions = await res.json();

    const links = res.headers.get("link")?.split(",");
    const lastPage = links?.[links.length - 1].match(/&page=(\d+).*$/)?.[1];
    setNumberOfPages(Number(lastPage));

    setSubmissions(submissions);
    setLoading(false);
  };

  useEffect(() => {
    if (accessToken && site) {
      getSubmissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, accessToken, type, page]);

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
        await client.deleteSubmission(submission.id);
        await getSubmissions();
        setPage(1);
        ctx.notice("Record successfully removed");
      } catch (error: any) {
        ctx.alert(error.message);
      }
    }
  };

  const handleOpenChangeSubmissonStateModal = async (
    submission: any,
    type: "ham" | "spam"
  ) => {
    const result: any = await ctx.openConfirm({
      title: "Change record?",
      content: "Are you sure you want to change this record?",
      choices: [
        {
          label: "Yes, change this record",
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
        await client.changeSubmissionState(submission.id, type);
        await getSubmissions();
        setPage(1);
        ctx.notice("Record successfully changed");
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
              <div style={{ width: "20%" }}>Form</div>
              <div style={{ width: "20%" }}>Date</div>
              <div style={{ width: "35%" }}></div>
            </div>
            {submissions.map((item: any) => (
              <div key={item.id} className={styles.row}>
                <div style={{ width: "25%" }}>{item.name}</div>
                <div style={{ width: "20%" }}>{item.form_name}</div>
                <div style={{ width: "20%", flexGrow: 0 }}>
                  {new Intl.DateTimeFormat("en-US").format(
                    new Date(item.created_at)
                  )}
                </div>

                <div style={{ width: "35%", textAlign: "right" }}>
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
                    buttonType="muted"
                    onClick={() =>
                      handleOpenChangeSubmissonStateModal(
                        item,
                        type === "ham" ? "spam" : "ham"
                      )
                    }
                    style={{ marginRight: "var(--spacing-m)" }}
                  >
                    {type === "ham" ? "Mark as spam" : "Mark as verified"}
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

            <div className={styles.pagination}>
              <div>
                <Button
                  buttonSize="s"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Back
                </Button>
              </div>
              <div className={styles.pagination__page}>Page {page}</div>
              <div>
                <Button
                  buttonSize="s"
                  onClick={() => setPage(page + 1)}
                  disabled={page === numberOfPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p>No form submissions found!</p>
        )}
      </div>
    </Canvas>
  );
}
