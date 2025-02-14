import * as React from "react";
import Button, { ButtonPill } from "./button";
import { i18nType } from "~/reducers/base/i18n";

/**
 * WhatsappLinkProps
 */
interface WhatsappLinkProps {
  mobileNumber?: string;
  i18n: i18nType;
}

/**
 * WhatsappLink
 * @param props props
 * @returns JSX.Element
 */
export const WhatsappLink: React.FC<WhatsappLinkProps> = (props) => {
  const { mobileNumber, i18n } = props;

  /**
   * handleOpenLinkClick
   */
  const handleOpenLinkClick = () => {
    onSubmit();
  };

  /**
   * onSubmit
   */
  const onSubmit = () => {
    if (mobileNumber) {
      // Regex expression to remove all characters which are NOT alphanumeric
      const number = mobileNumber.replace(/[^\w\s]/gi, "").replace(/ /g, "");

      const url = `https://web.whatsapp.com/send?phone=${number}`;

      window.open(url);
    }
  };

  return (
    <Button
      icon="whatsapp"
      buttonModifiers="whatsapp-me"
      onClick={handleOpenLinkClick}
    >
      {i18n.text.get("plugin.profile.whatsappIntegration.button.label")}
    </Button>
  );
};

/**
 * WhatsappLink
 * @param props props
 * @returns JSX.Element
 */
export const WhatsappButtonLink: React.FC<WhatsappLinkProps> = (props) => {
  const { mobileNumber, i18n } = props;

  /**
   * handleOpenLinkClick
   */
  const handleOpenLinkClick = () => {
    onSubmit();
  };

  /**
   * onSubmit
   */
  const onSubmit = () => {
    if (mobileNumber) {
      // Regex expression to remove all characters which are NOT alphanumeric
      const number = mobileNumber.replace(/[^\w\s]/gi, "").replace(/ /g, "");

      const url = `https://web.whatsapp.com/send?phone=${number}`;

      window.open(url);
    }
  };

  return (
    <ButtonPill
      aria-label={i18n.text.get(
        "plugin.profile.whatsappIntegration.button.label"
      )}
      icon="whatsapp"
      title={i18n.text.get("plugin.profile.whatsappIntegration.button.label")}
      buttonModifiers="whatsapp-me"
      onClick={handleOpenLinkClick}
    ></ButtonPill>
  );
};
