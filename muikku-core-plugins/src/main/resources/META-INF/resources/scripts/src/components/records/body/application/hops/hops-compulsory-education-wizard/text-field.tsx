import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelAria?: string;
}

export const TextField: React.FC<InputProps> = ({
  label,
  labelAria,
  ...rest
}) => (
  <>
    <label className="hops__step__label" aria-label={labelAria}>
      {label}
    </label>
    <input {...rest} />
  </>
);
