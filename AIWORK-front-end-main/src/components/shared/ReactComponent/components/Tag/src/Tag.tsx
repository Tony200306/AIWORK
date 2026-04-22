import classNames from "classnames";
import { FC, ReactNode } from "react";
import "./styles.css";

export interface Props {
  children?: ReactNode;
  className?: string;
  color?: string;
  bordered?: boolean;
  icon?: ReactNode;
  dotColor?: string;
  variant?: "default" | "pill";
  classNameContent?: string;
}

/**
 * Tag component - A custom tag component with pill variant and dot indicator support.
 *
 * @param {Props} props - The properties for the Tag component.
 * @param {ReactNode} [props.children] - The content of the tag.
 * @param {string} [props.className] - Custom CSS class for styling the tag.
 * @param {string} [props.color] - Background color of the tag.
 * @param {boolean} [props.bordered=true] - Whether the tag has a border.
 * @param {ReactNode} [props.icon] - Icon to be displayed in the tag.
 * @param {string} [props.dotColor] - Color of the dot indicator (e.g., '#52C41A' for green).
 * @param {string} [props.variant='default'] - Visual variant of the tag ('default' or 'pill').
 * @returns {ReactNode} The rendered Tag component.
 */
export const Tag: FC<Props> = ({
  bordered = true,
  children,
  className,
  classNameContent,
  color,
  icon,
  dotColor,
  variant = "default",
}) => {
  return (
    <span
      className={classNames(
        "YYTag__container",
        {
          YYTag__pill: variant === "pill",
          YYTag__withDot: !!dotColor,
          YYTag__bordered: bordered,
        },
        className
      )}
      style={{ backgroundColor: color }}
    >
      {dotColor && (
        <span className="YYTag__dot" style={{ backgroundColor: dotColor }} />
      )}
      {icon && <span className="YYTag__icon">{icon}</span>}
      {children && (
        <span className={classNames("YYTag__content", classNameContent)}>
          {children}
        </span>
      )}
    </span>
  );
};
