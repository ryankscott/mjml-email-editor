declare module "mjml-browser" {
  type MjmlResult = {
    html: string;
    errors: Array<{ formattedMessage?: string } | string>;
  };

  type MjmlOptions = {
    validationLevel?: "strict" | "soft" | "skip";
  };

  export default function mjml2html(
    mjml: string,
    options?: MjmlOptions
  ): MjmlResult;
}
