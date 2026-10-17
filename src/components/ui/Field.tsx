import type { ReactNode } from "react";

// The fields of the cost calculator and the enquiry form. Every colour is a role token, so a field
// reads correctly on plaster, raised and ink: the edge rests on `border-control` (3.55:1 on plaster,
// 3.86:1 on raised, 6.81:1 on ink; WCAG 1.4.11), darkens to the text colour on hover and focus, and
// takes the error colour while aria-invalid.

/** A 48px text input or select. */
export const fieldControl =
  "block h-12 w-full rounded-hard border border-control bg-field px-4 text-body text-fg placeholder:text-fg-muted " +
  "transition-[border-color] duration-200 ease-instrument motion-reduce:transition-none " +
  "hover:border-fg focus:border-fg aria-invalid:border-error aria-invalid:hover:border-error";

/** The textarea: the same control, at least 128px tall, resizable vertically. */
export const fieldArea = fieldControl.replace("h-12", "min-h-32 py-4 resize-y");

/** A radio choice drawn as a card (wrap the input in this `label`). */
export const radioCard =
  "relative flex cursor-pointer items-start gap-4 rounded-hard border border-control p-4 transition-[border-color,background-color] duration-200 ease-instrument motion-reduce:transition-none hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-field has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-focus";

/** A radio or checkbox input: put it inside `<span className={choiceBox}>` so it centres on the first text line. */
export const choiceInput = "size-4 accent-ink focus-visible:outline-none";
export const choiceBox = "flex h-[1.3125rem] items-center";

/** The aria-describedby for a control: its help line and its error, when present. */
export const describedBy = (id: string, help?: string, error?: string) => [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

export type FieldProps = {
  /** The control's id: the label points at it, and the help and error lines are `${id}-help` and `${id}-error`. */
  id: string;
  label: string;
  /** A caption under the control. */
  help?: string;
  /** The error under the control; pass `describedBy(id, help, error)` and aria-invalid to the control. */
  error?: string;
  children: ReactNode;
};

/** A label, 8, the control, then its help and error lines (8 apart), all in the surface's colours. */
export function Field({ id, label, help, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-small font-medium text-fg">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {help ? (
        <p id={`${id}-help`} className="mt-2 text-caption text-fg-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-caption text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type PrefixInputProps = {
  id: string;
  /** Drawn inside the field at the left, e.g. "$"; aria-hidden (the label names the unit). */
  prefix: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputMode: "numeric" | "decimal";
  invalid?: boolean;
  describedBy?: string;
  name?: string;
};

/** A text input with a short prefix inside its left edge. */
export function PrefixInput({ id, prefix, value, onChange, onBlur, inputMode, invalid, describedBy: described, name }: PrefixInputProps) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-body text-fg-muted">
        {prefix}
      </span>
      <input
        id={id}
        name={name}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        enterKeyHint="done"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={described}
        className={`${fieldControl} pl-8`}
      />
    </div>
  );
}

export type SelectFieldProps = {
  id: string;
  options: readonly string[];
  /** A first, empty option ("Choose a type"). */
  placeholder?: string;
  describedBy?: string;
  /** Controlled use (the calculator): `value` with `onChange`. */
  value?: string;
  onChange?: (value: string) => void;
  /** Uncontrolled use inside a form read with FormData (the enquiry form). */
  defaultValue?: string;
  name?: string;
  invalid?: boolean;
};

/** A native select in the field style, with its chevron drawn at the right. */
export function SelectField({ id, options, placeholder, describedBy: described, value, onChange, defaultValue, name, invalid }: SelectFieldProps) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        aria-describedby={described}
        aria-invalid={invalid || undefined}
        className={`${fieldControl} appearance-none pr-12`}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 6l4 4 4-4" />
      </svg>
    </div>
  );
}
