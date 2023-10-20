import {
  connect,
  IntentCtx,
  RenderModalCtx,
  RenderPageCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import ConfigScreen from "./entrypoints/ConfigScreen";
import "datocms-react-ui/styles.css";
import SubmissionsPage from "./entrypoints/Page";
import SubmissionModal from "./modals/SubmissionModal";

export const API_ENDPOINT = "https://api.netlify.com/api/v1";

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },

  mainNavigationTabs(ctx: IntentCtx) {
    return [
      {
        label: "Netlify Forms",
        icon: "file-signature",
        pointsTo: {
          pageId: "form-submissions",
        },
        placement: ["before", "configuration"],
      },
    ];
  },
  renderPage(pageId, ctx: RenderPageCtx) {
    switch (pageId) {
      case "form-submissions":
        return render(<SubmissionsPage ctx={ctx} />);
    }
  },
  renderModal(modalId: string, ctx: RenderModalCtx) {
    switch (modalId) {
      case "showSubmission":
        return render(<SubmissionModal ctx={ctx} />);
    }
  },
});
