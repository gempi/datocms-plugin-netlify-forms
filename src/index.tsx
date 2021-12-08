import {
  connect,
  IntentCtx,
  RenderModalCtx,
  RenderPageCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import ConfigScreen from "./entrypoints/ConfigScreen";
import "datocms-react-ui/styles.css";
import SubmissionsPage from "./pages/SubmissionsPage";
import ShowSubmissionModal from "./modals/ShowSubmissionModal";

connect({
  renderConfigScreen(ctx) {
    return render(<ConfigScreen ctx={ctx} />);
  },
  mainNavigationTabs(ctx: IntentCtx) {
    return [
      {
        label: "Netlify forms",
        icon: "file-signature",
        pointsTo: {
          pageId: "form-submissions",
        },
        placement: ["before", "settings"],
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
        return render(<ShowSubmissionModal ctx={ctx} />);
    }
  },
});
