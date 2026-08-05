import { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, TextField, Form, FieldGroup, SelectField } from "datocms-react-ui";
import { useEffect, useState } from "react";
import { Form as FormHandler, Field } from "react-final-form";
import { getClient, Site } from "../utils/client";
import { ValidParameters } from "../types";

type PropTypes = {
  ctx: RenderConfigScreenCtx;
};

type Parameters = ValidParameters;

export default function ConfigScreen({ ctx }: PropTypes) {
  const parameters = ctx.plugin.attributes.parameters;
  const accessToken = parameters.accessToken as string;
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    const fetchSites = async () => {
      setSites([]);

      try {
        const sites = await getClient(accessToken).listSites();
        setSites(sites);
      } catch (error: unknown) {
        if (error instanceof Error) {
          ctx.alert(error.message);
        } else {
          ctx.alert("An unknown error occurred");
        }
      }
    };

    if (accessToken) fetchSites();
  }, [accessToken, ctx]);

  return (
    <Canvas ctx={ctx}>
      <FormHandler<Parameters>
        initialValues={ctx.plugin.attributes.parameters}
        validate={(values) => {
          const errors: Record<string, string> = {};

          if (!("accessToken" in values) || !values.accessToken) {
            errors.accessToken = "This field is required!";
          }

          return errors;
        }}
        onSubmit={async (values) => {
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
                    textInputProps={{ type: "password" }}
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

              {sites.length > 0 || parameters.site ? (
                <Field name="site">
                  {({ input, meta: { error } }) => (
                    <SelectField
                      id="site"
                      label="Site"
                      error={error}
                      selectInputProps={{
                        options: sites.map((site) => ({
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
