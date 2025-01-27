import { i18nType } from "~/reducers/base/i18n";
import { PurchaseType } from "~/reducers/main-function/profile";

/**
 * getErrorMessageContent
 * @param i18n i18n
 * @param order  order
 * @param message  message
 */
export function getErrorMessageContent(
  i18n: i18nType,
  order: PurchaseType,
  message?: string
) {
  /**
   * errorMessage which can come from backend or from localization properties
   */
  const errorMessage: string = message
    ? "<div><em>" + message + "</em></div>"
    : "";

  // Pretext is functioning as a empty place holder paragraph enabling user to place caret above of the prefilled content
  const pretext = "<p></p>";

  // Error message's prefilled content
  const content: string =
    '<div class="message-from-ceepos-error">' +
    "<div><b>" +
    order.product.Description +
    "</b></div>" +
    errorMessage +
    "<div><b>" +
    i18n.text.get("plugin.profile.purchases.orderId") +
    "</b>: " +
    order.id +
    "</div>" +
    "<div><b>" +
    i18n.text.get("plugin.profile.purchases.date.created") +
    "</b>: " +
    i18n.time.format(order.created) +
    "</div>" +
    "</div>";

  return pretext + content;
}

/**
 * errorMessageTitle
 * @param order order
 * @returns title
 */
export function getErrorMessageTitle(order: PurchaseType) {
  // Error message's prefilled title
  const title: string =
    order.product.Description + " - " + "[" + order.id + "]";
  return title;
}
