import { RenderPageCtx } from "datocms-plugin-sdk";
import {
  Button,
  Canvas,
  CaretDownIcon,
  CaretUpIcon,
  Dropdown,
  DropdownMenu,
  DropdownOption,
  DropdownSeparator,
  Spinner,
  Toolbar,
  ToolbarStack,
  ToolbarTitle,
} from "datocms-react-ui";
import { useEffect, useState } from "react";
import styles from "./style.module.css";
import { getClient } from "../../utils/client";
import { ValidParameters } from "../../types";

type PropTypes = {
  ctx: RenderPageCtx;
};

type Submission = {
  id: string;
  name: string;
  form_name: string;
  created_at: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US");

export default function SubmissionsPage({ ctx }: PropTypes) {
  const parameters = ctx.plugin.attributes.parameters as ValidParameters;
  const site = parameters.site;
  const accessToken = parameters.accessToken;

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [page, setPage] = useState<number>(1);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("ham");

  const client = getClient(accessToken);

  const getSubmissions = async () => {
    setLoading(true);
    const res = await client.submissionsBySite(site?.value ?? "", type, 10, page);
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

  const refreshSubmissions = async () => {
    // Resetting page triggers the effect when page > 1; refetch directly when already on page 1.
    if (page === 1) {
      await getSubmissions();
    } else {
      setPage(1);
    }
  };

  const handleShowSubmissionModal = async (submission: Submission) => {
    await ctx.openModal({
      id: "showSubmission",
      title: `Submission (${submission.id})`,
      width: "l",
      parameters: submission,
    });
  };

  const handleOpenDeleteSubmissionModal = async (submission: Submission) => {
    const result = await ctx.openConfirm({
      title: "Delete record?",
      content: "Are you sure you want to delete this record? This operation is not reversible!",
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
        await refreshSubmissions();
        ctx.notice("Record successfully removed");
      } catch (error: unknown) {
        if (error instanceof Error) {
          ctx.alert(error.message);
        } else {
          ctx.alert("An unknown error occurred");
        }
      }
    }
  };

  const handleOpenChangeSubmissionStateModal = async (
    submission: Submission,
    type: "ham" | "spam",
  ) => {
    const result = await ctx.openConfirm({
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
        await refreshSubmissions();
        ctx.notice("Record successfully changed");
      } catch (error: unknown) {
        if (error instanceof Error) {
          ctx.alert(error.message);
        } else {
          ctx.alert("An unknown error occurred");
        }
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
            <Button onClick={onClick} rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}>
              {type === "ham" ? "Verified" : "Spam"} submissions
            </Button>
          )}
        >
          <DropdownMenu>
            <DropdownOption onClick={() => setType("ham")}>Verified submissions</DropdownOption>
            <DropdownOption onClick={() => setType("spam")}>Spam submissions</DropdownOption>
          </DropdownMenu>
        </Dropdown>

        {loading ? (
          <div style={{ marginTop: "var(--spacing-xxl)", position: "relative" }}>
            <Spinner size={48} placement="centered" />
          </div>
        ) : submissions.length > 0 ? (
          <div>
            <div className={styles.rowHeader}>
              <div style={{ width: "25%" }}>Name</div>
              <div style={{ width: "20%" }}>Form</div>
              <div style={{ width: "20%" }}>Date</div>
              <div style={{ width: "120px" }}></div>
            </div>
            {submissions.map((item) => (
              <div
                key={item.id}
                className={styles.row}
                onClick={() => handleShowSubmissionModal(item)}
              >
                <div style={{ width: "25%" }}>{item.name}</div>
                <div style={{ width: "20%" }}>{item.form_name}</div>
                <div style={{ width: "20%", flexGrow: 0 }}>
                  {dateFormatter.format(new Date(item.created_at))}
                </div>

                <div style={{ width: "120px", textAlign: "right" }}>
                  <Dropdown
                    renderTrigger={({ open, onClick }) => (
                      <Button
                        buttonSize="xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          onClick();
                        }}
                        rightIcon={open ? <CaretUpIcon /> : <CaretDownIcon />}
                      >
                        Options
                      </Button>
                    )}
                  >
                    <DropdownMenu alignment="right">
                      <DropdownOption onClick={() => handleShowSubmissionModal(item)}>
                        Show
                      </DropdownOption>
                      <DropdownOption
                        onClick={() =>
                          handleOpenChangeSubmissionStateModal(
                            item,
                            type === "ham" ? "spam" : "ham",
                          )
                        }
                      >
                        {type === "ham" ? "Mark as spam" : "Mark as verified"}
                      </DropdownOption>
                      <DropdownSeparator />
                      <DropdownOption red onClick={() => handleOpenDeleteSubmissionModal(item)}>
                        Delete
                      </DropdownOption>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            ))}

            <div className={styles.pagination}>
              <div>
                <Button buttonSize="s" onClick={() => setPage(page - 1)} disabled={page === 1}>
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
