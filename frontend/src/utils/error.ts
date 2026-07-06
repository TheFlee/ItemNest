export function getApiErrorMessage(error: any): string {
  const responseData = error?.response?.data;

  if (!responseData) {
    return "An unexpected error occurred.";
  }

  if (typeof responseData.detail === "string" && responseData.detail.trim()) {
    return responseData.detail;
  }

  if (typeof responseData.title === "string" && responseData.title.trim()) {
    const validationMessage = getValidationErrorsAsText(responseData.errors);

    if (validationMessage) {
      return `${responseData.title} ${validationMessage}`;
    }

    return responseData.title;
  }

  const validationMessage = getValidationErrorsAsText(responseData.errors);
  if (validationMessage) {
    return validationMessage;
  }

  return "Request failed.";
}

function getValidationErrorsAsText(
  errors: Record<string, string[]> | undefined
): string {
  if (!errors) {
    return "";
  }

  const messages = Object.values(errors)
    .flat()
    .filter((message) => typeof message === "string" && message.trim().length > 0);

  return messages.join(" ");
}