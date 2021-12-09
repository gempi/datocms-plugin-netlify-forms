import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import {
  Button,
  Canvas,
  TextField,
  Form,
  FieldGroup,
  SelectField,
} from "datocms-react-ui";
import { useEffect, useState } from "react";
import { Form as FormHandler, Field } from "react-final-form";
import { API_ENDPOINT } from "..";

type PropTypes = {
  ctx: RenderConfigScreenCtx;
};

export type ValidParameters = {
  accessToken: string;
  site: { label: string; value: string };
};

type Parameters = ValidParameters;

export default function ConfigScreen({ ctx }: PropTypes) {
  const parameters = ctx.plugin.attributes.parameters;
  const accessToken = parameters.accessToken;
  const [sites, setSites] = useState([]);

  return (
    <Canvas ctx={ctx}>
      <FormHandler<Parameters>
        initialValues={ctx.plugin.attributes.parameters}
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.accessToken) {
            errors.accessToken = "This field is required!";
          }
          return errors;
        }}
        onSubmit={async (values) => {
          const response = await window.fetch(`${API_ENDPOINT}/sites/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${values.accessToken}`,
            },
          });

          if (!response.ok) {
            const message = `An error has occured: ${response.status}`;
            ctx.alert(message);
          }

          const sites = await response.json();
          setSites(sites);

          await ctx.updatePluginParameters({
            ...values,
            ...(values.accessToken !== accessToken ? { site: null } : {}),
          });

          ctx.notice("Settings updated successfully!");
        }}
      >
        {({ handleSubmit, submitting, dirty }) => (
          <Form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field name="accessToken">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="accessToken"
                    label="Access token"
                    hint={
                      <>
                        You can generate a{" "}
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href="https://app.netlify.com/user/applications#personal-access-tokens"
                        >
                          personal access token
                        </a>{" "}
                        in your Netlify user settings.
                      </>
                    }
                    required
                    error={error}
                    {...input}
                  />
                )}
              </Field>

              {sites.length > 0 ? (
                <Field name="site">
                  {({ input, meta: { error } }) => (
                    <SelectField
                      id="site"
                      label="Site"
                      error={error}
                      selectInputProps={{
                        options: sites.map((site: any) => ({
                          label: site.name,
                          value: site.site_id,
                        })),
                      }}
                      {...input}
                    />
                  )}
                </Field>
              ) : null}
            </FieldGroup>
            <Button
              type="submit"
              fullWidth
              buttonSize="l"
              buttonType="primary"
              disabled={submitting || !dirty}
            >
              {!accessToken ? "Connect" : "Save settings"}
            </Button>
          </Form>
        )}
      </FormHandler>
    </Canvas>
  );
}
